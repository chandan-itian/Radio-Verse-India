import { describe, it, expect } from "vitest";
import { isSafeStreamHost, checkStreamHealth } from "../lib/monitoring/health-monitor";

describe("Radio Health Monitor & SSRF Protection", () => {
  it("should allow safe public HTTP and HTTPS streams", () => {
    const check1 = isSafeStreamHost("https://air.pc.cdn.bitgravity.com/air/live/pbaudio001/playlist.m3u8");
    expect(check1.safe).toBe(true);

    const check2 = isSafeStreamHost("http://eu8.fastcast4u.com/proxy/clyedupq/stream");
    expect(check2.safe).toBe(true);
  });

  it("should reject non-HTTP/HTTPS protocols", () => {
    const check = isSafeStreamHost("ftp://stream.server.com/live");
    expect(check.safe).toBe(false);
    expect(check.reason).toContain("Only HTTP/HTTPS allowed");
  });

  it("should block loopback and localhost addresses (SSRF)", () => {
    expect(isSafeStreamHost("http://localhost:3000/stream").safe).toBe(false);
    expect(isSafeStreamHost("http://127.0.0.1:8000/audio").safe).toBe(false);
    expect(isSafeStreamHost("http://127.0.0.2:8000/audio").safe).toBe(false);
  });

  it("should block private network IP ranges (RFC 1918)", () => {
    // 10.0.0.0/8
    expect(isSafeStreamHost("http://10.0.1.5:8080/stream").safe).toBe(false);
    // 172.16.0.0/12
    expect(isSafeStreamHost("http://172.16.0.1:8000/stream").safe).toBe(false);
    expect(isSafeStreamHost("http://172.31.255.255:8000/stream").safe).toBe(false);
    // 192.168.0.0/16
    expect(isSafeStreamHost("http://192.168.1.1:8000/stream").safe).toBe(false);
    // 169.254.0.0/16 (AWS metadata / Link-local)
    expect(isSafeStreamHost("http://169.254.169.254/latest/meta-data").safe).toBe(false);
  });

  it("should block IPv6 local/private addresses", () => {
    expect(isSafeStreamHost("http://[::1]:8080/stream").safe).toBe(false);
  });

  it("should fail health check immediately on SSRF violation", async () => {
    const result = await checkStreamHealth("ep-test-ssrf", "http://127.0.0.1:9999/stream");
    expect(result.result).toBe("unavailable");
    expect(result.errorCode).toBe("SSRF_BLOCKED");
  });
});
