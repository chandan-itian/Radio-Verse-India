import Hls from "hls.js";
import { StationItem, PlayerState } from "@/types/station";

export interface AudioDriverCallbacks {
  onStateChange: (state: PlayerState, errorMessage?: string) => void;
  onVolumeChange: (volume: number, muted: boolean) => void;
  onStationChange?: (station: StationItem) => void;
}

class AudioDriver {
  private audio: HTMLAudioElement | null = null;
  private hls: Hls | null = null;
  private currentStation: StationItem | null = null;
  private callbacks: AudioDriverCallbacks | null = null;
  private retryCount = 0;
  private maxRetries = 3;
  private retryTimeoutId: any = null;
  private currentPlayId = 0; // Incremented on each play request to discard stale async requests
  private isExplicitlyPaused = false;

  public init(callbacks: AudioDriverCallbacks) {
    this.callbacks = callbacks;
    if (typeof window === "undefined") return;

    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = "none";
      this.setupAudioListeners();
    }
  }

  private setupAudioListeners() {
    if (!this.audio) return;

    this.audio.addEventListener("loadstart", () => {
      this.callbacks?.onStateChange("connecting");
    });

    this.audio.addEventListener("waiting", () => {
      this.callbacks?.onStateChange("buffering");
    });

    this.audio.addEventListener("playing", () => {
      this.retryCount = 0;
      this.isExplicitlyPaused = false;
      this.callbacks?.onStateChange("playing");
      this.updateMediaSessionState("playing");
    });

    this.audio.addEventListener("pause", () => {
      if (this.isExplicitlyPaused) {
        this.callbacks?.onStateChange("paused");
        this.updateMediaSessionState("paused");
      }
    });

    this.audio.addEventListener("ended", () => {
      this.callbacks?.onStateChange("ended");
      this.updateMediaSessionState("none");
    });

    this.audio.addEventListener("error", (e) => {
      console.warn("Audio element error event:", e);
      this.handlePlaybackFailure("Audio element playback error");
    });

    this.audio.addEventListener("volumechange", () => {
      if (this.audio) {
        this.callbacks?.onVolumeChange(this.audio.volume, this.audio.muted);
      }
    });
  }

  public async playStation(station: StationItem) {
    if (typeof window === "undefined") return;
    this.currentPlayId++;
    const playId = this.currentPlayId;

    this.isExplicitlyPaused = false;
    this.currentStation = station;
    this.retryCount = 0;
    this.clearRetryTimeout();

    // Notify state connecting
    this.callbacks?.onStateChange("connecting");

    // Clean up previous stream
    this.cleanupCurrentStream();

    const endpoint = station.endpoints[0];
    if (!endpoint || !endpoint.streamUrl) {
      this.callbacks?.onStateChange("error", "No valid stream URL configured for this station");
      return;
    }

    const streamUrl = endpoint.streamUrl;
    const isHls = endpoint.streamType === "hls" || streamUrl.includes(".m3u8");

    // Ensure audio element exists
    if (!this.audio) {
      this.audio = new Audio();
      this.setupAudioListeners();
    }

    this.updateMediaSessionMetadata(station);

    try {
      if (isHls && !this.audio.canPlayType("application/vnd.apple.mpegurl")) {
        // Use HLS.js for browsers without native HLS (Chrome/Firefox/Edge on PC/Android)
        if (Hls.isSupported()) {
          const hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 30,
          });
          this.hls = hlsInstance;

          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(this.audio);

          hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              console.warn("HLS.js fatal error:", data.type, data.details);
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  hlsInstance.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hlsInstance.recoverMediaError();
                  break;
                default:
                  this.handlePlaybackFailure(`Stream error: ${data.details}`);
                  break;
              }
            }
          });

          hlsInstance.on(Hls.Events.MANIFEST_PARSED, async () => {
            if (playId !== this.currentPlayId) return; // Stale request
            try {
              await this.audio?.play();
            } catch (err: any) {
              this.handlePlayPromiseError(err);
            }
          });
        } else {
          this.handlePlaybackFailure("HLS streaming is not supported in this browser");
        }
      } else {
        // Native stream (MP3, AAC, or Safari native HLS)
        this.audio.src = streamUrl;
        this.audio.load();

        if (playId !== this.currentPlayId) return; // Stale request
        await this.audio.play();
      }
    } catch (err: any) {
      if (playId === this.currentPlayId) {
        this.handlePlayPromiseError(err);
      }
    }
  }

  private handlePlayPromiseError(err: any) {
    if (err.name === "NotAllowedError" || err.name === "AbortError") {
      this.callbacks?.onStateChange("error", "Autoplay was blocked by browser policy. Please click play.");
    } else {
      this.handlePlaybackFailure(err.message || "Playback failed");
    }
  }

  private handlePlaybackFailure(msg: string) {
    if (this.isExplicitlyPaused) return;

    if (this.retryCount < this.maxRetries && this.currentStation) {
      this.retryCount++;
      const backoffMs = Math.min(1000 * Math.pow(2, this.retryCount), 6000);
      this.callbacks?.onStateChange("reconnecting", `Reconnecting (Attempt ${this.retryCount}/${this.maxRetries})...`);

      this.retryTimeoutId = setTimeout(() => {
        if (this.currentStation && !this.isExplicitlyPaused) {
          this.playStation(this.currentStation);
        }
      }, backoffMs);
    } else {
      this.callbacks?.onStateChange("error", msg);
      this.updateMediaSessionState("none");
    }
  }

  public pause() {
    this.isExplicitlyPaused = true;
    this.clearRetryTimeout();
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
    this.callbacks?.onStateChange("paused");
  }

  public resume() {
    this.isExplicitlyPaused = false;
    if (this.audio) {
      this.audio.play().catch((err) => {
        this.handlePlayPromiseError(err);
      });
    } else if (this.currentStation) {
      this.playStation(this.currentStation);
    }
  }

  public stop() {
    this.isExplicitlyPaused = true;
    this.clearRetryTimeout();
    this.cleanupCurrentStream();
    this.callbacks?.onStateChange("idle");
    this.updateMediaSessionState("none");
  }

  public setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
      if (this.audio.muted && volume > 0) {
        this.audio.muted = false;
      }
    }
  }

  public setMuted(muted: boolean) {
    if (this.audio) {
      this.audio.muted = muted;
    }
  }

  public getVolume(): number {
    return this.audio?.volume ?? 1;
  }

  public isMuted(): boolean {
    return this.audio?.muted ?? false;
  }

  public fadeOut(durationMs = 8000): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audio) {
        resolve();
        return;
      }
      const initialVolume = this.audio.volume;
      const steps = 20;
      const stepDuration = durationMs / steps;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        if (this.audio) {
          const ratio = Math.max(0, (steps - currentStep) / steps);
          this.audio.volume = initialVolume * ratio;
        }

        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          this.stop();
          if (this.audio) {
            this.audio.volume = initialVolume; // Reset volume for next play
          }
          resolve();
        }
      }, stepDuration);
    });
  }

  private cleanupCurrentStream() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute("src");
      this.audio.load();
    }
  }

  private clearRetryTimeout() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
  }

  private updateMediaSessionMetadata(station: StationItem) {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;

    try {
      const artwork = station.logoUrl
        ? [
            { src: station.logoUrl, sizes: "96x96", type: "image/png" },
            { src: station.logoUrl, sizes: "192x192", type: "image/png" },
            { src: station.logoUrl, sizes: "512x512", type: "image/png" },
          ]
        : [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }];

      navigator.mediaSession.metadata = new MediaMetadata({
        title: station.name,
        artist: "RadioVerse India",
        album: `${station.language.toUpperCase()} • LIVE RADIO`,
        artwork,
      });

      navigator.mediaSession.setActionHandler("play", () => this.resume());
      navigator.mediaSession.setActionHandler("pause", () => this.pause());
      navigator.mediaSession.setActionHandler("stop", () => this.stop());
    } catch (e) {
      console.warn("MediaSession error:", e);
    }
  }

  private updateMediaSessionState(state: "playing" | "paused" | "none") {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state;
    } catch {
      // ignore
    }
  }

  public destroy() {
    this.stop();
    this.audio = null;
  }
}

export const audioDriver = new AudioDriver();
