import { describe, it, expect } from "vitest";
import {
  defaultTimerState,
  computeRemainingMs,
  isSegmentComplete,
  startFocus,
  pauseTimer,
  resumeTimer,
  completeSegment,
  stopTimer,
  formatTimeDisplay,
  DEFAULT_FOCUS_DURATION_MS,
  DEFAULT_SHORT_BREAK_MS,
  DEFAULT_LONG_BREAK_MS,
} from "./focusTimer";

describe("focusTimer", () => {
  describe("defaultTimerState", () => {
    it("returns idle state with default durations", () => {
      const state = defaultTimerState();
      expect(state.status).toBe("idle");
      expect(state.sessionIndex).toBe(0);
      expect(state.focusDurationMs).toBe(DEFAULT_FOCUS_DURATION_MS);
      expect(state.shortBreakMs).toBe(DEFAULT_SHORT_BREAK_MS);
      expect(state.longBreakMs).toBe(DEFAULT_LONG_BREAK_MS);
    });
  });

  describe("computeRemainingMs", () => {
    it("returns remainingMs for idle/paused state", () => {
      const state = { ...defaultTimerState(), remainingMs: 5000 };
      expect(computeRemainingMs(state, Date.now())).toBe(5000);
    });

    it("computes remaining based on startedAt timestamp", () => {
      const now = 10_000;
      const state = {
        ...defaultTimerState(),
        status: "focus" as const,
        remainingMs: 25 * 60 * 1000,
        startedAt: 5_000,
      };
      // 5 seconds elapsed
      expect(computeRemainingMs(state, now)).toBe(25 * 60 * 1000 - 5_000);
    });

    it("never goes below 0", () => {
      const state = {
        ...defaultTimerState(),
        status: "focus" as const,
        remainingMs: 1000,
        startedAt: 0,
      };
      expect(computeRemainingMs(state, 5000)).toBe(0);
    });
  });

  describe("isSegmentComplete", () => {
    it("returns true when remaining is 0", () => {
      const state = {
        ...defaultTimerState(),
        status: "focus" as const,
        remainingMs: 1000,
        startedAt: 0,
      };
      expect(isSegmentComplete(state, 2000)).toBe(true);
    });

    it("returns false for idle", () => {
      expect(isSegmentComplete(defaultTimerState(), Date.now())).toBe(false);
    });
  });

  describe("startFocus", () => {
    it("transitions to focus status with correct remaining", () => {
      const state = defaultTimerState();
      const result = startFocus(state, 1000);
      expect(result.status).toBe("focus");
      expect(result.startedAt).toBe(1000);
      expect(result.remainingMs).toBe(DEFAULT_FOCUS_DURATION_MS);
    });
  });

  describe("pauseTimer", () => {
    it("transitions to paused with remaining snapshot", () => {
      const state = {
        ...defaultTimerState(),
        status: "focus" as const,
        remainingMs: 10_000,
        startedAt: 0,
      };
      const result = pauseTimer(state, 3000);
      expect(result.status).toBe("paused");
      expect(result.remainingMs).toBe(7000);
      expect(result.startedAt).toBeNull();
    });

    it("no-ops for idle", () => {
      const state = defaultTimerState();
      expect(pauseTimer(state, 1000)).toBe(state);
    });
  });

  describe("resumeTimer", () => {
    it("resumes with correct status", () => {
      const state = {
        ...defaultTimerState(),
        status: "paused" as const,
        remainingMs: 5000,
        pausedAt: 1000,
      };
      const result = resumeTimer(state, "focus", 2000);
      expect(result.status).toBe("focus");
      expect(result.startedAt).toBe(2000);
      expect(result.remainingMs).toBe(5000);
    });
  });

  describe("completeSegment", () => {
    it("focus complete → short break (not 4th session)", () => {
      const state = {
        ...defaultTimerState(),
        status: "focus" as const,
        sessionIndex: 0,
      };
      const { next, focusCompleted } = completeSegment(state, 1000);
      expect(focusCompleted).toBe(true);
      expect(next.status).toBe("short_break");
      expect(next.sessionIndex).toBe(1);
      expect(next.remainingMs).toBe(DEFAULT_SHORT_BREAK_MS);
    });

    it("focus complete → long break (4th session)", () => {
      const state = {
        ...defaultTimerState(),
        status: "focus" as const,
        sessionIndex: 3,
      };
      const { next, focusCompleted } = completeSegment(state, 1000);
      expect(focusCompleted).toBe(true);
      expect(next.status).toBe("long_break");
      expect(next.sessionIndex).toBe(0); // reset cycle
      expect(next.remainingMs).toBe(DEFAULT_LONG_BREAK_MS);
    });

    it("break complete → focus", () => {
      const state = {
        ...defaultTimerState(),
        status: "short_break" as const,
      };
      const { next, focusCompleted } = completeSegment(state, 1000);
      expect(focusCompleted).toBe(false);
      expect(next.status).toBe("focus");
      expect(next.remainingMs).toBe(DEFAULT_FOCUS_DURATION_MS);
    });
  });

  describe("stopTimer", () => {
    it("resets to idle", () => {
      const state = {
        ...defaultTimerState(),
        status: "focus" as const,
        startedAt: 1000,
        sessionIndex: 2,
      };
      const result = stopTimer(state);
      expect(result.status).toBe("idle");
      expect(result.startedAt).toBeNull();
    });
  });

  describe("formatTimeDisplay", () => {
    it("formats minutes and seconds", () => {
      expect(formatTimeDisplay(25 * 60 * 1000)).toBe("25:00");
      expect(formatTimeDisplay(5 * 60 * 1000)).toBe("05:00");
      expect(formatTimeDisplay(90_000)).toBe("01:30");
      expect(formatTimeDisplay(0)).toBe("00:00");
    });

    it("rounds up partial seconds", () => {
      expect(formatTimeDisplay(500)).toBe("00:01");
    });
  });
});
