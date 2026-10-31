import { describe, it, expect, beforeEach } from "vitest";
import {
  getAllStations,
  addCustomStation,
  deleteStation,
  filterStations,
  getAllStationsHealth,
  recheckStationHealth,
} from "@/lib/stations-store";

describe("Station Search & Filtering Engine", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should retrieve all Indian curated stations by default", () => {
    const stations = getAllStations();
    expect(stations.length).toBeGreaterThanOrEqual(20);
    const vividh = stations.find((s) => s.name.includes("Vividh Bharati"));
    expect(vividh).toBeDefined();
    expect(vividh?.endpoints[0]?.streamUrl).toBeTruthy();
  });

  it("should accurately filter stations by search query", () => {
    const all = getAllStations();

    // Search by name
    const mirchiResults = filterStations(all, { query: "Mirchi" });
    expect(mirchiResults.length).toBeGreaterThan(0);
    mirchiResults.forEach((s) => {
      const match =
        s.name.toLowerCase().includes("mirchi") ||
        s.slug.toLowerCase().includes("mirchi") ||
        s.description?.toLowerCase().includes("mirchi");
      expect(match).toBe(true);
    });

    // Search by Hindi retro
    const retroResults = filterStations(all, { query: "retro" });
    expect(retroResults.length).toBeGreaterThan(0);

    // Search by state
    const delhiResults = filterStations(all, { query: "Delhi" });
    expect(delhiResults.length).toBeGreaterThan(0);
    delhiResults.forEach((s) => {
      const match =
        (s.state && s.state.toLowerCase().includes("delhi")) ||
        s.name.toLowerCase().includes("delhi");
      expect(match).toBe(true);
    });
  });

  it("should filter by language and state dropdowns", () => {
    const all = getAllStations();

    const punjabi = filterStations(all, { language: "punjabi" });
    expect(punjabi.length).toBeGreaterThan(0);
    punjabi.forEach((s) => expect(s.language).toBe("punjabi"));

    const bihar = filterStations(all, { state: "Bihar" });
    expect(bihar.length).toBeGreaterThan(0);
    bihar.forEach((s) => expect(s.state).toBe("Bihar"));
  });

  it("should handle empty search gracefully and return all stations", () => {
    const all = getAllStations();
    const result = filterStations(all, { query: "" });
    expect(result.length).toBe(all.length);
  });
});

describe("Admin Manual Station Addition & Catalog Persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should allow admin to manually add a new station with custom stream URL", () => {
    const initialCount = getAllStations().length;

    const newStation = addCustomStation({
      name: "Radio City Hindi 91.1",
      language: "hindi",
      state: "Maharashtra",
      streamUrl: "https://stream.example.com/radiocity.mp3",
      streamType: "mp3",
      categories: ["bollywood", "hindi"],
      description: "Rag Rag Mein Daude City",
      isFeatured: true,
    });

    expect(newStation.id).toMatch(/^custom-/);
    expect(newStation.name).toBe("Radio City Hindi 91.1");
    expect(newStation.endpoints[0].streamUrl).toBe("https://stream.example.com/radiocity.mp3");

    // Must be in getAllStations
    const updated = getAllStations();
    expect(updated.length).toBe(initialCount + 1);
    expect(updated[0].name).toBe("Radio City Hindi 91.1");

    // Must be searchable by the search engine
    const searchMatch = filterStations(updated, { query: "Radio City" });
    expect(searchMatch.length).toBeGreaterThanOrEqual(1);
    expect(searchMatch[0].name).toBe("Radio City Hindi 91.1");
  });

  it("should allow deleting a custom station", () => {
    const added = addCustomStation({
      name: "Temporary FM",
      language: "hindi",
      streamUrl: "https://stream.example.com/temp.mp3",
    });

    expect(getAllStations().find((s) => s.id === added.id)).toBeDefined();

    deleteStation(added.id);
    expect(getAllStations().find((s) => s.id === added.id)).toBeUndefined();
  });
});

describe("Admin Health Telemetry Across All Indian Stations", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should monitor all Indian stations and show healthy status", () => {
    const health = getAllStationsHealth();
    expect(health.summary.totalStations).toBeGreaterThanOrEqual(20);
    expect(health.summary.healthyCount).toBe(health.summary.totalStations);
    expect(health.summary.degradedCount).toBe(0);
    expect(health.summary.unavailableCount).toBe(0);
    expect(health.checks.length).toBe(health.summary.totalStations);

    health.checks.forEach((chk) => {
      expect(chk.result).toBe("healthy");
      expect(chk.httpStatus).toBeGreaterThanOrEqual(200);
      expect(chk.responseTimeMs).toBeGreaterThan(0);
      expect(chk.stationName).toBeTruthy();
    });
  });

  it("should allow rechecking a single station and update telemetry", async () => {
    const health = getAllStationsHealth();
    const target = health.checks[0];

    const updated = await recheckStationHealth(target.stationId);
    expect(updated.stationId).toBe(target.stationId);
    expect(updated.result).toBe("healthy");
    expect(updated.responseTimeMs).toBeGreaterThan(0);
  });
});
