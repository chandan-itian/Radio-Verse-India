import { StationFilterParams, StationItem } from "@/types/station";
import { CURATED_STATIONS, CATEGORIES_LIST } from "./curated-stations";
import { searchRadioBrowser } from "./radio-browser";
import db from "./db";

export async function getStationById(idOrSlug: string): Promise<StationItem | null> {
  // 1. Check curated stations first
  const curatedMatch = CURATED_STATIONS.find(
    (s) => s.id === idOrSlug || s.slug === idOrSlug || s.externalId === idOrSlug
  );
  if (curatedMatch) return curatedMatch;

  // 2. Check Database
  try {
    const dbStation = await db.station.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }, { externalId: idOrSlug }],
      },
      include: {
        endpoints: true,
        categories: {
          include: { category: true },
        },
      },
    });

    if (dbStation) {
      return {
        id: dbStation.id,
        externalSource: dbStation.externalSource as any,
        externalId: dbStation.externalId,
        name: dbStation.name,
        slug: dbStation.slug,
        language: dbStation.language,
        countryCode: dbStation.countryCode,
        state: dbStation.state,
        logoUrl: dbStation.logoUrl,
        homepageUrl: dbStation.homepageUrl,
        description: dbStation.description,
        status: dbStation.status as any,
        isFeatured: dbStation.isFeatured,
        categories: dbStation.categories.map((c) => c.category.slug),
        endpoints: dbStation.endpoints.map((ep) => ({
          id: ep.id,
          streamUrl: ep.streamUrl,
          streamType: ep.streamType as any,
          codec: ep.codec,
          bitrate: ep.bitrate,
          authorizationStatus: ep.authorizationStatus as any,
          verificationStatus: ep.verificationStatus as any,
          priority: ep.priority,
        })),
      };
    }
  } catch (err) {
    console.error("DB lookup error in getStationById:", err);
  }

  // 3. Radio Browser direct lookup if id begins with rb-
  if (idOrSlug.startsWith("rb-")) {
    const rbUuid = idOrSlug.replace("rb-", "");
    try {
      const res = await fetch(`https://de1.api.radio-browser.info/json/stations/byuuid/${rbUuid}`, {
        headers: { "User-Agent": "RadioVerseIndia/2.0" },
      });
      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw) && raw[0]) {
          const { normalizeRadioBrowserStation } = await import("./radio-browser");
          return normalizeRadioBrowserStation(raw[0]);
        }
      }
    } catch {
      // ignore
    }
  }

  return null;
}

export async function getStations(params: StationFilterParams = {}): Promise<{
  stations: StationItem[];
  total: number;
}> {
  const { query, language, state, category, sortBy = "popular", page = 1, limit = 24 } = params;

  // Filter Curated stations locally
  let filteredCurated = [...CURATED_STATIONS];

  if (query) {
    const q = query.toLowerCase();
    filteredCurated = filteredCurated.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q) ||
        (s.state && s.state.toLowerCase().includes(q)) ||
        s.categories.some((c) => c.toLowerCase().includes(q))
    );
  }

  if (language && language !== "all") {
    filteredCurated = filteredCurated.filter(
      (s) => s.language.toLowerCase() === language.toLowerCase()
    );
  }

  if (state && state !== "all") {
    filteredCurated = filteredCurated.filter(
      (s) => s.state && s.state.toLowerCase() === state.toLowerCase()
    );
  }

  if (category && category !== "all") {
    filteredCurated = filteredCurated.filter((s) =>
      s.categories.some((c) => c.toLowerCase() === category.toLowerCase())
    );
  }

  // Fetch online Radio Browser stations to supplement
  let rbStations: StationItem[] = [];
  try {
    rbStations = await searchRadioBrowser({
      query,
      language: language !== "all" ? language : undefined,
      state: state !== "all" ? state : undefined,
      tag: category !== "all" ? category : undefined,
      limit: limit,
    });
  } catch {
    rbStations = [];
  }

  // Deduplicate by name and stream URL
  const seenNames = new Set<string>();
  const seenUrls = new Set<string>();
  const combined: StationItem[] = [];

  for (const st of [...filteredCurated, ...rbStations]) {
    const nameKey = st.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const primaryUrl = st.endpoints[0]?.streamUrl;
    if (seenNames.has(nameKey) || (primaryUrl && seenUrls.has(primaryUrl))) {
      continue;
    }
    seenNames.add(nameKey);
    if (primaryUrl) seenUrls.add(primaryUrl);
    combined.push(st);
  }

  // Sort
  if (sortBy === "name") {
    combined.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "recent") {
    // Curated with high priority
    combined.sort((a, b) => (b.externalSource === "curated" ? 1 : 0) - (a.externalSource === "curated" ? 1 : 0));
  } else {
    // "popular" -> featured first, then source curated
    combined.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      if (a.externalSource === "curated" && b.externalSource !== "curated") return -1;
      if (a.externalSource !== "curated" && b.externalSource === "curated") return 1;
      return 0;
    });
  }

  const offset = (page - 1) * limit;
  const paginated = combined.slice(offset, offset + limit);

  return {
    stations: paginated,
    total: combined.length,
  };
}

export function getFeaturedStations(): StationItem[] {
  return CURATED_STATIONS.filter((s) => s.isFeatured);
}

export function getAllCategories() {
  return CATEGORIES_LIST;
}
