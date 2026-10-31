import { create } from "zustand";
import { StationItem, PlayerState } from "@/types/station";
import { audioDriver } from "./audio-driver";
import {
  addLocalHistory,
  getSavedVolume,
  saveVolume,
  getLastPlayedStation,
} from "../storage/preferences";

export interface AudioStore {
  currentStation: StationItem | null;
  playerState: PlayerState;
  errorMessage?: string;
  volume: number;
  isMuted: boolean;
  queue: StationItem[];
  queueIndex: number;
  isExpanded: boolean;
  isInitialized: boolean;

  // Actions
  init: () => void;
  play: (station: StationItem, queue?: StationItem[]) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  retry: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setExpanded: (expanded: boolean) => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  currentStation: null,
  playerState: "idle",
  errorMessage: undefined,
  volume: 0.85,
  isMuted: false,
  queue: [],
  queueIndex: -1,
  isExpanded: false,
  isInitialized: false,

  init: () => {
    if (get().isInitialized || typeof window === "undefined") return;

    const savedVol = getSavedVolume();
    audioDriver.setVolume(savedVol.volume);
    audioDriver.setMuted(savedVol.muted);

    audioDriver.init({
      onStateChange: (state, errorMessage) => {
        set({ playerState: state, errorMessage });
      },
      onVolumeChange: (volume, isMuted) => {
        set({ volume, isMuted });
        saveVolume(volume, isMuted);
      },
    });

    // Check last played station
    const last = getLastPlayedStation();

    set({
      volume: savedVol.volume,
      isMuted: savedVol.muted,
      currentStation: last,
      isInitialized: true,
    });
  },

  play: (station: StationItem, customQueue?: StationItem[]) => {
    get().init();
    const queue = customQueue || get().queue;
    let idx = queue.findIndex((s) => s.id === station.id);

    let updatedQueue = queue;
    if (idx === -1) {
      updatedQueue = [...queue, station];
      idx = updatedQueue.length - 1;
    }

    set({
      currentStation: station,
      queue: updatedQueue,
      queueIndex: idx,
      errorMessage: undefined,
    });

    addLocalHistory(station);
    audioDriver.playStation(station);
  },

  pause: () => {
    audioDriver.pause();
  },

  resume: () => {
    const { currentStation, playerState } = get();
    if (!currentStation) return;
    if (playerState === "paused") {
      audioDriver.resume();
    } else {
      audioDriver.playStation(currentStation);
    }
  },

  stop: () => {
    audioDriver.stop();
  },

  togglePlay: () => {
    const { playerState, currentStation } = get();
    if (playerState === "playing") {
      get().pause();
    } else if (currentStation) {
      get().resume();
    }
  },

  next: () => {
    const { queue, queueIndex } = get();
    if (queue.length === 0) return;
    const nextIdx = (queueIndex + 1) % queue.length;
    const nextStation = queue[nextIdx];
    if (nextStation) {
      get().play(nextStation, queue);
    }
  },

  prev: () => {
    const { queue, queueIndex } = get();
    if (queue.length === 0) return;
    const prevIdx = (queueIndex - 1 + queue.length) % queue.length;
    const prevStation = queue[prevIdx];
    if (prevStation) {
      get().play(prevStation, queue);
    }
  },

  retry: () => {
    const { currentStation } = get();
    if (currentStation) {
      audioDriver.playStation(currentStation);
    }
  },

  setVolume: (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    audioDriver.setVolume(clamped);
    set({ volume: clamped, isMuted: clamped === 0 });
    saveVolume(clamped, clamped === 0);
  },

  toggleMute: () => {
    const nextMuted = !get().isMuted;
    audioDriver.setMuted(nextMuted);
    set({ isMuted: nextMuted });
    saveVolume(get().volume, nextMuted);
  },

  setExpanded: (expanded: boolean) => {
    set({ isExpanded: expanded });
  },
}));
