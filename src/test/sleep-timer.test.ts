import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSleepTimer } from "../lib/player/sleep-timer";

describe("Sleep Timer Subsystem", () => {
  beforeEach(() => {
    localStorage.clear();
    useSleepTimer.getState().cancelTimer();
  });

  it("should set timer and calculate future deadline", () => {
    const timer = useSleepTimer.getState();
    const now = Date.now();
    timer.setTimer(15);

    const state = useSleepTimer.getState();
    expect(state.isActive).toBe(true);
    expect(state.deadline).toBeGreaterThanOrEqual(now + 15 * 60 * 1000 - 100);
    expect(state.remainingSeconds).toBeGreaterThan(14 * 60);
  });

  it("should persist deadline timestamp in localStorage", () => {
    const timer = useSleepTimer.getState();
    timer.setTimer(30);

    const stored = localStorage.getItem("radioverse_sleep_deadline_v1");
    expect(stored).not.toBeNull();
    const parsed = parseInt(stored!, 10);
    expect(parsed).toBeGreaterThan(Date.now());
  });

  it("should cancel timer and clean up storage", () => {
    const timer = useSleepTimer.getState();
    timer.setTimer(45);
    expect(useSleepTimer.getState().isActive).toBe(true);

    timer.cancelTimer();
    const state = useSleepTimer.getState();
    expect(state.isActive).toBe(false);
    expect(state.deadline).toBeNull();
    expect(state.remainingSeconds).toBe(0);
    expect(localStorage.getItem("radioverse_sleep_deadline_v1")).toBeNull();
  });

  it("should recover active timer state after tab refresh from localStorage", () => {
    // Simulate deadline set 10 minutes into the future
    const futureDeadline = Date.now() + 10 * 60 * 1000;
    localStorage.setItem("radioverse_sleep_deadline_v1", String(futureDeadline));

    // Reset Zustand store state
    useSleepTimer.setState({ deadline: null, isActive: false, remainingSeconds: 0 });

    // Call checkStatus to simulate page mount recovery
    useSleepTimer.getState().checkStatus();

    const state = useSleepTimer.getState();
    expect(state.isActive).toBe(true);
    expect(state.deadline).toBe(futureDeadline);
    expect(state.remainingSeconds).toBeGreaterThan(9 * 60);
  });
});
