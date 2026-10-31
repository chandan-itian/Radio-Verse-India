import { StreamVerificationStatus } from "@/types/station";
import db from "../db";

export interface HealthCheckResult {
  endpointId: string;
  result: StreamVerificationStatus;
  httpStatus?: number;
  responseTimeMs: number;
  errorCode?: string;
  diagnosticSummary: string;
}

/**
 * Validates whether a host is safe from SSRF attacks.
 * Blocks private IP ranges, loopback, link-local, and non-routable domains.
 */
export function isSafeStreamHost(urlString: string): { safe: boolean; reason?: string } {
  try {
    const url = new URL(urlString);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { safe: false, reason: "Unsupported protocol. Only HTTP/HTTPS allowed." };
    }

    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");

    // Block localhost and common local domain names
    if (
      hostname === "localhost" ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".lan")
    ) {
      return { safe: false, reason: "Localhost and internal domain names are forbidden." };
    }

    // Check IPv4 addresses
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    if (match) {
      const b1 = parseInt(match[1], 10);
      const b2 = parseInt(match[2], 10);
      const b3 = parseInt(match[3], 10);
      const b4 = parseInt(match[4], 10);

      if (b1 > 255 || b2 > 255 || b3 > 255 || b4 > 255) {
        return { safe: false, reason: "Invalid IP address." };
      }

      // 127.0.0.0/8 - Loopback
      if (b1 === 127) {
        return { safe: false, reason: "Loopback addresses are forbidden." };
      }
      // 0.0.0.0/8 - Current network
      if (b1 === 0) {
        return { safe: false, reason: "Invalid network 0.0.0.0/8." };
      }
      // 10.0.0.0/8 - Private Class A
      if (b1 === 10) {
        return { safe: false, reason: "Private network 10.0.0.0/8 is forbidden." };
      }
      // 172.16.0.0/12 - Private Class B
      if (b1 === 172 && b2 >= 16 && b2 <= 31) {
        return { safe: false, reason: "Private network 172.16.0.0/12 is forbidden." };
      }
      // 192.168.0.0/16 - Private Class C
      if (b1 === 192 && b2 === 168) {
        return { safe: false, reason: "Private network 192.168.0.0/16 is forbidden." };
      }
      // 169.254.0.0/16 - Link-local
      if (b1 === 169 && b2 === 254) {
        return { safe: false, reason: "Link-local 169.254.0.0/16 is forbidden." };
      }
    }

    // Check IPv6 loopback & private
    if (hostname === "::1" || hostname.startsWith("fe80:") || hostname.startsWith("fc00:")) {
      return { safe: false, reason: "IPv6 private and loopback addresses are forbidden." };
    }

    return { safe: true };
  } catch (err: any) {
    return { safe: false, reason: `Malformed URL: ${err.message}` };
  }
}

/**
 * Validates a live stream endpoint without downloading the continuous audio stream.
 */
export async function checkStreamHealth(
  endpointId: string,
  streamUrl: string,
  timeoutMs = 6000
): Promise<HealthCheckResult> {
  const startTime = Date.now();

  // 1. SSRF Safety check
  const safety = isSafeStreamHost(streamUrl);
  if (!safety.safe) {
    return {
      endpointId,
      result: "unavailable",
      responseTimeMs: Date.now() - startTime,
      errorCode: "SSRF_BLOCKED",
      diagnosticSummary: safety.reason || "Address blocked by security policy",
    };
  }

  // 2. Fetch stream headers with early abort
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(streamUrl, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "RadioVerseIndia-HealthMonitor/2.0",
        Range: "bytes=0-1024", // Request tiny byte range so live stream does not hold socket open
        Accept: "*/*",
      },
    });

    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;
    const httpStatus = res.status;
    const contentType = (res.headers.get("content-type") || "").toLowerCase();

    // Live streams usually respond with 200 OK or 206 Partial Content
    if (httpStatus >= 200 && httpStatus < 300) {
      const isAudio =
        contentType.includes("audio") ||
        contentType.includes("mpegurl") ||
        contentType.includes("application/x-mpegurl") ||
        contentType.includes("application/vnd.apple.mpegurl") ||
        contentType.includes("application/octet-stream") ||
        contentType.includes("video/mp2t") ||
        contentType.includes("icecast");

      if (isAudio || streamUrl.endsWith(".m3u8") || streamUrl.endsWith(".mp3") || streamUrl.endsWith(".aac")) {
        const isDegraded = responseTimeMs > 4000;
        return {
          endpointId,
          result: isDegraded ? "degraded" : "healthy",
          httpStatus,
          responseTimeMs,
          diagnosticSummary: `Stream reachable in ${responseTimeMs}ms with content-type: ${contentType || "audio/stream"}`,
        };
      }

      return {
        endpointId,
        result: "degraded",
        httpStatus,
        responseTimeMs,
        errorCode: "UNEXPECTED_CONTENT_TYPE",
        diagnosticSummary: `HTTP ${httpStatus} returned unexpected content-type: "${contentType}"`,
      };
    }

    if (httpStatus === 401 || httpStatus === 403) {
      return {
        endpointId,
        result: "unavailable",
        httpStatus,
        responseTimeMs,
        errorCode: "STREAM_FORBIDDEN",
        diagnosticSummary: `Broadcaster returned HTTP ${httpStatus} Forbidden/Unauthorized`,
      };
    }

    return {
      endpointId,
      result: "unavailable",
      httpStatus,
      responseTimeMs,
      errorCode: `HTTP_${httpStatus}`,
      diagnosticSummary: `Upstream server returned HTTP ${httpStatus}`,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;

    if (err.name === "AbortError") {
      return {
        endpointId,
        result: "unavailable",
        responseTimeMs,
        errorCode: "TIMEOUT",
        diagnosticSummary: `Stream server did not respond within ${timeoutMs}ms`,
      };
    }

    return {
      endpointId,
      result: "unavailable",
      responseTimeMs,
      errorCode: "NETWORK_ERROR",
      diagnosticSummary: err.message || "Failed to establish network connection",
    };
  }
}

/**
 * Runs a health check and commits the result to database
 */
export async function runAndSaveHealthCheck(
  endpointId: string,
  streamUrl: string
): Promise<HealthCheckResult> {
  const result = await checkStreamHealth(endpointId, streamUrl);

  try {
    await db.streamHealthCheck.create({
      data: {
        endpointId,
        result: result.result,
        httpStatus: result.httpStatus,
        responseTimeMs: result.responseTimeMs,
        errorCode: result.errorCode,
        diagnosticSummary: result.diagnosticSummary,
      },
    });

    await db.streamEndpoint.update({
      where: { id: endpointId },
      data: {
        verificationStatus: result.result,
      },
    });
  } catch (err) {
    // If endpoint is not in DB (e.g. curated in-memory or RB), log and return
    console.warn("Could not persist health check to DB:", err);
  }

  return result;
}
