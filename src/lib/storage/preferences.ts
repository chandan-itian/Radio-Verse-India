import { StationItem } from "@/types/station";

const STORAGE_KEYS = {
  FAVORITES: "radioverse_favorites_v1",
  HISTORY: "radioverse_history_v1",
  LAST_STATION: "radioverse_last_station_v1",
  VOLUME: "radioverse_volume_v1",
  THEME: "radioverse_theme_v1",
  AUTO_RESUME: "radioverse_auto_resume_v1",
};

export interface StoredPreferenceState {
  favorites: StationItem[];
  history: Array<{ station: StationItem; playedAt: number }>;
}

export function getLocalFavorites(): StationItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalFavorites(favorites: StationItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  } catch (err) {
    console.warn("Error saving favorites:", err);
  }
}

export function addLocalFavorite(station: StationItem): StationItem[] {
  const current = getLocalFavorites();
  const exists = current.some((s) => s.id === station.id || s.slug === station.slug);
  if (exists) return current;
  const updated = [station, ...current];
  saveLocalFavorites(updated);
  return updated;
}

export function removeLocalFavorite(stationId: string): StationItem[] {
  const current = getLocalFavorites();
  const updated = current.filter((s) => s.id !== stationId && s.slug !== stationId);
  saveLocalFavorites(updated);
  return updated;
}

export function getLocalHistory(): Array<{ station: StationItem; playedAt: number }> {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addLocalHistory(station: StationItem) {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalHistory();
    // Remove if already in history, then prepend
    const filtered = current.filter((h) => h.station.id !== station.id);
    const updated = [{ station, playedAt: Date.now() }, ...filtered].slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEYS.LAST_STATION, JSON.stringify(station));
  } catch (err) {
    console.warn("Error saving history:", err);
  }
}

export function clearLocalHistory() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.LAST_STATION);
  } catch {
    // ignore
  }
}

export function clearAllLocalData() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.LAST_STATION);
  } catch {
    // ignore
  }
}

export function getLastPlayedStation(): StationItem | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LAST_STATION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getSavedVolume(): { volume: number; muted: boolean } {
  if (typeof window === "undefined") return { volume: 0.85, muted: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VOLUME);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        volume: typeof parsed.volume === "number" ? parsed.volume : 0.85,
        muted: Boolean(parsed.muted),
      };
    }
  } catch {
    // ignore
  }
  return { volume: 0.85, muted: false };
}

export function saveVolume(volume: number, muted: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.VOLUME, JSON.stringify({ volume, muted }));
  } catch {
    // ignore
  }
}
