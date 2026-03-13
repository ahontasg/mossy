export type FocusStatus = "idle" | "focus" | "short_break" | "long_break" | "paused";

export interface FocusTimerState {
  status: FocusStatus;
  sessionIndex: number; // 0-3 in cycle
  remainingMs: number;
  startedAt: number | null;
  pausedAt: number | null;
  focusDurationMs: number;
  shortBreakMs: number;
  longBreakMs: number;
}

export const DEFAULT_FOCUS_DURATION_MS = 25 * 60 * 1000;
export const DEFAULT_SHORT_BREAK_MS = 5 * 60 * 1000;
export const DEFAULT_LONG_BREAK_MS = 15 * 60 * 1000;
export const SESSIONS_PER_CYCLE = 4;

export function defaultTimerState(): FocusTimerState {
  return {
    status: "idle",
    sessionIndex: 0,
    remainingMs: DEFAULT_FOCUS_DURATION_MS,
    startedAt: null,
    pausedAt: null,
    focusDurationMs: DEFAULT_FOCUS_DURATION_MS,
    shortBreakMs: DEFAULT_SHORT_BREAK_MS,
    longBreakMs: DEFAULT_LONG_BREAK_MS,
  };
}

/** Calculate remaining ms using timestamp-based math (no drift). */
export function computeRemainingMs(state: FocusTimerState, now: number): number {
  if (state.status === "idle") return state.remainingMs;
  if (state.status === "paused") return state.remainingMs;
  if (state.startedAt === null) return state.remainingMs;

  const elapsed = now - state.startedAt;
  return Math.max(0, state.remainingMs - elapsed);
}

/** Check if the current timer segment has completed. */
export function isSegmentComplete(state: FocusTimerState, now: number): boolean {
  return computeRemainingMs(state, now) <= 0 && state.status !== "idle" && state.status !== "paused";
}

/** Get the duration for the current status. */
export function getDurationForStatus(state: FocusTimerState): number {
  switch (state.status) {
    case "focus":
      return state.focusDurationMs;
    case "short_break":
      return state.shortBreakMs;
    case "long_break":
      return state.longBreakMs;
    default:
      return state.focusDurationMs;
  }
}

/** Start a new focus session. */
export function startFocus(state: FocusTimerState, now: number): FocusTimerState {
  return {
    ...state,
    status: "focus",
    remainingMs: state.focusDurationMs,
    startedAt: now,
    pausedAt: null,
  };
}

/** Pause the current timer. */
export function pauseTimer(state: FocusTimerState, now: number): FocusTimerState {
  if (state.status === "idle" || state.status === "paused") return state;
  const remaining = computeRemainingMs(state, now);
  return {
    ...state,
    status: "paused",
    remainingMs: remaining,
    startedAt: null,
    pausedAt: now,
  };
}

/** Resume from paused state. Returns to the status that was active before pause. */
export function resumeTimer(state: FocusTimerState, previousStatus: FocusStatus, now: number): FocusTimerState {
  if (state.status !== "paused") return state;
  return {
    ...state,
    status: previousStatus,
    startedAt: now,
    pausedAt: null,
  };
}

/** Transition to the next segment after a timer completes. Returns new state + whether a focus session completed. */
export function completeSegment(state: FocusTimerState, now: number): { next: FocusTimerState; focusCompleted: boolean } {
  if (state.status === "focus") {
    // Focus done → go to break
    const nextIndex = state.sessionIndex + 1;
    const isLongBreak = nextIndex >= SESSIONS_PER_CYCLE;
    const breakDuration = isLongBreak ? state.longBreakMs : state.shortBreakMs;
    const breakStatus: FocusStatus = isLongBreak ? "long_break" : "short_break";

    return {
      next: {
        ...state,
        status: breakStatus,
        sessionIndex: isLongBreak ? 0 : nextIndex,
        remainingMs: breakDuration,
        startedAt: now,
        pausedAt: null,
      },
      focusCompleted: true,
    };
  }

  if (state.status === "short_break" || state.status === "long_break") {
    // Break done → go to focus
    return {
      next: {
        ...state,
        status: "focus",
        remainingMs: state.focusDurationMs,
        startedAt: now,
        pausedAt: null,
      },
      focusCompleted: false,
    };
  }

  return { next: state, focusCompleted: false };
}

/** Stop the timer entirely and reset to idle. */
export function stopTimer(state: FocusTimerState): FocusTimerState {
  return {
    ...state,
    status: "idle",
    remainingMs: state.focusDurationMs,
    startedAt: null,
    pausedAt: null,
  };
}

/** Format milliseconds into "MM:SS" display string. */
export function formatTimeDisplay(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
