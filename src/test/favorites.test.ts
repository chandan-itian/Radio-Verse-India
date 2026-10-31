import { describe, it, expect, beforeEach } from "vitest";
import {
  getLocalFavorites,
  addLocalFavorite,
  removeLocalFavorite,
  getLocalHistory,
  addLocalHistory,
  clearAllLocalData,
} from "../lib/storage/preferences";
import { StationItem } from "../types/station";

const mockStation: StationItem = {
  id: "st-fav-1",
  externalSource: "curated",
  name: "AIR FM Gold Delhi",
  slug: "air-fm-gold-delhi",
  language: "hindi",
  countryCode: "IN",
  status: "active",
  isFeatured: true,
  categories: ["news", "retro"],
  endpoints: [],
};

describe("Smart Favorites & Preferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return empty array when no favorites exist", () => {
    expect(getLocalFavorites()).toEqual([]);
  });

  it("should save and retrieve favorite stations", () => {
    const updated = addLocalFavorite(mockStation);
    expect(updated.length).toBe(1);
    expect(updated[0].id).toBe("st-fav-1");

    const retrieved = getLocalFavorites();
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].name).toBe("AIR FM Gold Delhi");
  });

  it("should prevent duplicate favorites", () => {
    addLocalFavorite(mockStation);
    const secondAdd = addLocalFavorite(mockStation);
    expect(secondAdd.length).toBe(1);
    expect(getLocalFavorites().length).toBe(1);
  });

  it("should remove station from favorites", () => {
    addLocalFavorite(mockStation);
    expect(getLocalFavorites().length).toBe(1);

    const remaining = removeLocalFavorite(mockStation.id);
    expect(remaining.length).toBe(0);
    expect(getLocalFavorites().length).toBe(0);
  });

  it("should record listening history and avoid duplicates", () => {
    addLocalHistory(mockStation);
    const history = getLocalHistory();
    expect(history.length).toBe(1);
    expect(history[0].station.id).toBe("st-fav-1");
    expect(history[0].playedAt).toBeGreaterThan(0);
  });

  it("should gracefully recover from corrupted JSON in localStorage", () => {
    localStorage.setItem("radioverse_favorites_v1", "INVALID_MALFORMED_JSON{{{");
    const favs = getLocalFavorites();
    expect(favs).toEqual([]);
  });
});
