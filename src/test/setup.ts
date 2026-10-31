import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock HTMLAudioElement for jsdom
class MockAudio {
  src = "";
  volume = 1;
  muted = false;
  paused = true;

  play = vi.fn().mockImplementation(() => {
    this.paused = false;
    return Promise.resolve();
  });
  pause = vi.fn().mockImplementation(() => {
    this.paused = true;
  });
  load = vi.fn();
  canPlayType = vi.fn().mockReturnValue("");
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  removeAttribute = vi.fn();
}

// @ts-ignore
global.Audio = MockAudio;

// Mock MediaMetadata
class MockMediaMetadata {
  title = "";
  artist = "";
  album = "";
  artwork = [];
  constructor(init: any) {
    Object.assign(this, init);
  }
}
// @ts-ignore
global.MediaMetadata = MockMediaMetadata;

// Mock MediaSession
Object.defineProperty(global.navigator, "mediaSession", {
  value: {
    metadata: null,
    playbackState: "none",
    setActionHandler: vi.fn(),
  },
  writable: true,
});
