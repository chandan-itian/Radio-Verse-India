import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAudioStore } from "../lib/player/audio-store";
import { StationItem } from "../types/station";

const mockStation1: StationItem = {
  id: "test-st-1",
  externalSource: "curated",
  name: "AIR Vividh Bharati",
  slug: "air-vividh-bharati",
  language: "hindi",
  countryCode: "IN",
  status: "active",
  isFeatured: true,
  categories: ["hindi", "retro"],
  endpoints: [
    {
      id: "ep-1",
      streamUrl: "https://air.pc.cdn.bitgravity.com/air/live/pbaudio001/playlist.m3u8",
      streamType: "hls",
      authorizationStatus: "verified_playable",
      verificationStatus: "healthy",
      priority: 1,
    },
  ],
};

const mockStation2: StationItem = {
  id: "test-st-2",
  externalSource: "curated",
  name: "Radio Mirchi Hindi",
  slug: "radio-mirchi-hindi",
  language: "hindi",
  countryCode: "IN",
  status: "active",
  isFeatured: true,
  categories: ["bollywood"],
  endpoints: [
    {
      id: "ep-2",
      streamUrl: "https://eu8.fastcast4u.com/proxy/clyedupq/stream",
      streamType: "mp3",
      authorizationStatus: "verified_playable",
      verificationStatus: "healthy",
      priority: 1,
    },
  ],
};

describe("Singleton Audio Engine", () => {
  beforeEach(() => {
    useAudioStore.setState({
      currentStation: null,
      playerState: "idle",
      queue: [],
      queueIndex: -1,
      volume: 0.8,
      isMuted: false,
    });
  });

  it("should initialize with default idle state", () => {
    const state = useAudioStore.getState();
    expect(state.playerState).toBe("idle");
    expect(state.currentStation).toBeNull();
  });

  it("should set current station and queue when play is called", () => {
    const store = useAudioStore.getState();
    store.play(mockStation1, [mockStation1, mockStation2]);

    const updated = useAudioStore.getState();
    expect(updated.currentStation?.id).toBe("test-st-1");
    expect(updated.queue.length).toBe(2);
    expect(updated.queueIndex).toBe(0);
  });

  it("should navigate to next station in queue", () => {
    const store = useAudioStore.getState();
    store.play(mockStation1, [mockStation1, mockStation2]);
    store.next();

    const updated = useAudioStore.getState();
    expect(updated.currentStation?.id).toBe("test-st-2");
    expect(updated.queueIndex).toBe(1);
  });

  it("should cycle back to first station when next is called at end of queue", () => {
    const store = useAudioStore.getState();
    store.play(mockStation2, [mockStation1, mockStation2]);
    store.next();

    const updated = useAudioStore.getState();
    expect(updated.currentStation?.id).toBe("test-st-1");
  });

  it("should handle volume changes and clamp between 0 and 1", () => {
    const store = useAudioStore.getState();
    store.setVolume(0.5);
    expect(useAudioStore.getState().volume).toBe(0.5);

    store.setVolume(1.5);
    expect(useAudioStore.getState().volume).toBe(1);

    store.setVolume(-0.2);
    expect(useAudioStore.getState().volume).toBe(0);
  });

  it("should toggle mute state correctly", () => {
    const store = useAudioStore.getState();
    expect(useAudioStore.getState().isMuted).toBe(false);

    store.toggleMute();
    expect(useAudioStore.getState().isMuted).toBe(true);

    store.toggleMute();
    expect(useAudioStore.getState().isMuted).toBe(false);
  });
});
