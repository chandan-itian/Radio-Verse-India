import { StationItem, StreamEndpointItem, StreamType } from "@/types/station";
import { slugify } from "./utils";

interface RadioBrowserRawStation {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage?: string;
  favicon?: string;
  tags?: string;
  countrycode?: string;
  state?: string;
  language?: string;
  votes?: number;
  clickcount?: number;
  codec?: string;
  bitrate?: number;
  lastcheckok?: number;
}

// In-memory server list with fallback defaults
let cachedServers: string[] = [
  "de1.api.radio-browser.info",
  "at1.api.radio-browser.info",
  "nl1.api.radio-browser.info",
];
let lastServerFetchTime = 0;

// Simple cache for search results
const searchCache = new Map<string, { timestamp: number; data: StationItem[] }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getActiveServers(): Promise<string[]> {
  const now = Date.now();
  if (cachedServers.length > 0 && now - lastServerFetchTime < 60 * 60 * 1000) {
    return cachedServers;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://all.api.radio-browser.info/json/servers", {
      signal: controller.signal,
      headers: { "User-Agent": "RadioVerseIndia/2.0" },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const servers = (await res.json()) as Array<{ name: string }>;
      if (Array.isArray(servers) && servers.length > 0) {
        cachedServers = servers.map((s) => s.name);
        lastServerFetchTime = now;
      }
    }
  } catch {
    // Retain fallback servers on error
  }

  return cachedServers;
}

function detectStreamType(url: string, codec?: string): StreamType {
  const lowerUrl = url.toLowerCase();
  const lowerCodec = (codec || "").toLowerCase();

  if (lowerUrl.includes(".m3u8") || lowerCodec.includes("hls") || lowerCodec === "unknown") {
    if (lowerUrl.includes(".m3u8")) return "hls";
  }
  if (lowerCodec.includes("aac") || lowerUrl.includes(".aac")) return "aac";
  if (lowerCodec.includes("mp3") || lowerUrl.includes(".mp3")) return "mp3";

  return "unknown";
}

export function normalizeRadioBrowserStation(raw: RadioBrowserRawStation): StationItem | null {
  const streamUrl = raw.url_resolved || raw.url;
  if (!streamUrl || (!streamUrl.startsWith("http://") && !streamUrl.startsWith("https://"))) {
    return null;
  }

  const cleanName = raw.name.trim();
  if (!cleanName || cleanName.length < 2) return null;

  const rawTags = (raw.tags || "")
    .toLowerCase()
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const streamType = detectStreamType(streamUrl, raw.codec);

  const endpoint: StreamEndpointItem = {
    id: `rb-ep-${raw.stationuuid}`,
    streamUrl,
    streamType,
    codec: raw.codec || (streamType === "hls" ? "AAC" : "MP3"),
    bitrate: raw.bitrate && raw.bitrate > 0 ? raw.bitrate : 128,
    authorizationStatus: raw.lastcheckok === 1 ? "verified_playable" : "unverified",
    verificationStatus: raw.lastcheckok === 1 ? "healthy" : "unknown",
    priority: 1,
  };

  const stationSlug = `${slugify(cleanName)}-${raw.stationuuid.substring(0, 8)}`;

  return {
    id: `rb-${raw.stationuuid}`,
    externalSource: "radio-browser",
    externalId: raw.stationuuid,
    name: cleanName,
    slug: stationSlug,
    language: (raw.language || "hindi").toLowerCase().split(",")[0].trim(),
    countryCode: (raw.countrycode || "IN").toUpperCase(),
    state: raw.state?.trim() || null,
    logoUrl: raw.favicon && raw.favicon.startsWith("http") ? raw.favicon : null,
    homepageUrl: raw.homepage && raw.homepage.startsWith("http") ? raw.homepage : null,
    description: raw.tags ? `Tags: ${raw.tags.split(",").slice(0, 4).join(", ")}` : null,
    status: "active",
    isFeatured: (raw.votes || 0) > 100 || (raw.clickcount || 0) > 200,
    categories: rawTags.slice(0, 5),
    endpoints: [endpoint],
  };
}

export async function searchRadioBrowser(params: {
  query?: string;
  language?: string;
  state?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}): Promise<StationItem[]> {
  const cacheKey = JSON.stringify(params);
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const servers = await getActiveServers();
  const server = servers[0] || "de1.api.radio-browser.info";

  const searchParams = new URLSearchParams();
  searchParams.set("countrycode", "IN");
  searchParams.set("limit", String(params.limit || 24));
  searchParams.set("offset", String(params.offset || 0));
  searchParams.set("hidebroken", "true");
  searchParams.set("order", "clickcount");
  searchParams.set("reverse", "true");

  if (params.query) {
    searchParams.set("name", params.query.trim());
  }
  if (params.language) {
    searchParams.set("language", params.language.toLowerCase().trim());
  }
  if (params.state) {
    searchParams.set("state", params.state.trim());
  }
  if (params.tag) {
    searchParams.set("tag", params.tag.toLowerCase().trim());
  }

  const url = `https://${server}/json/stations/search?${searchParams.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "RadioVerseIndia/2.0 (Live Internet Radio Streaming)",
      },
      next: { revalidate: 300 }, // Next.js cache 5 mins
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return [];
    }

    const rawList = (await res.json()) as RadioBrowserRawStation[];
    const normalized: StationItem[] = [];

    for (const raw of rawList) {
      const item = normalizeRadioBrowserStation(raw);
      if (item) {
        normalized.push(item);
      }
    }

    searchCache.set(cacheKey, { timestamp: Date.now(), data: normalized });
    return normalized;
  } catch (err) {
    console.warn("Radio Browser fetch error, falling back gracefully:", err);
    return [];
  }
}
