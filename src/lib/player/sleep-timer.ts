import { create } from "zustand";
import { audioDriver } from "./audio-driver";

const STORAGE_KEY = "radioverse_sleep_deadline_v1";

interface SleepTimerStore {
  deadline: number | null; // Absolute Unix timestamp ms
  remainingSeconds: number;
  isActive: boolean;
  isFadingOut: boolean;

  setTimer: (minutes: number) => void;
  cancelTimer: () => void;
  checkStatus: () => void;
}

export const useSleepTimer = create<SleepTimerStore>((set, get) => {
  let intervalId: any = null;

  const clearIntervalTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const startWatcher = () => {
    clearIntervalTimer();
    intervalId = setInterval(() => {
      get().checkStatus();
    }, 1000);
  };

  return {
    deadline: null,
    remainingSeconds: 0,
    isActive: false,
    isFadingOut: false,

    setTimer: (minutes: number) => {
      if (minutes <= 0 || minutes > 360) return;
      const targetDeadline = Date.now() + minutes * 60 * 1000;

      try {
        localStorage.setItem(STORAGE_KEY, String(targetDeadline));
      } catch {
        // ignore
      }

      set({
        deadline: targetDeadline,
        remainingSeconds: Math.round((targetDeadline - Date.now()) / 1000),
        isActive: true,
        isFadingOut: false,
      });

      startWatcher();
    },

    cancelTimer: () => {
      clearIntervalTimer();
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      set({
        deadline: null,
        remainingSeconds: 0,
        isActive: false,
        isFadingOut: false,
      });
    },

    checkStatus: () => {
      let deadline = get().deadline;

      // On first run or page refresh, check localStorage
      if (!deadline && typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            deadline = parseInt(stored, 10);
            if (!isNaN(deadline) && deadline > Date.now()) {
              set({ deadline, isActive: true });
              startWatcher();
            } else {
              localStorage.removeItem(STORAGE_KEY);
              return;
            }
          }
        } catch {
          return;
        }
      }

      if (!deadline) return;

      const diffMs = deadline - Date.now();
      const remaining = Math.max(0, Math.round(diffMs / 1000));

      if (remaining <= 0) {
        // Timer Expired
        get().cancelTimer();
        audioDriver.stop();
        return;
      }

      // Check if within 10 seconds for smooth fade-out
      if (remaining <= 10 && !get().isFadingOut) {
        set({ isFadingOut: true });
        audioDriver.fadeOut(remaining * 1000);
      }

      set({ remainingSeconds: remaining, isActive: true });
    },
  };
});
