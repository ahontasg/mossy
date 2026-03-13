import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  type FocusStatus,
  type FocusTimerState,
  defaultTimerState,
  startFocus,
  pauseTimer,
  resumeTimer,
  completeSegment,
  stopTimer,
  isSegmentComplete,
  DEFAULT_FOCUS_DURATION_MS,
  DEFAULT_SHORT_BREAK_MS,
  DEFAULT_LONG_BREAK_MS,
} from "../features/focus/lib/focusTimer";
import {
  FOCUS_SESSION_XP,
  FOCUS_STAT_BOOSTS,
  BREAK_STAT_BOOSTS,
} from "../features/focus/lib/focusRewards";
import { useCreatureStore } from "./creatureStore";
import { getLocalDate, isYesterday } from "../lib/time";

interface FocusStore extends FocusTimerState {
  // Stats
  todayFocusMinutes: number;
  totalFocusMinutes: number;
  focusStreak: number;
  lastFocusDate: string | null;
  completedSessionsToday: number;

  // Track the pre-pause status for resume
  statusBeforePause: FocusStatus | null;

  // Actions
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  tick: () => void;
  setDurations: (focus: number, shortBreak: number, longBreak: number) => void;
  hydrate: (data: PersistedFocusData) => void;
  resetDay: () => void;
}

export interface PersistedFocusData {
  status: FocusStatus;
  sessionIndex: number;
  remainingMs: number;
  startedAt: number | null;
  pausedAt: number | null;
  focusDurationMs: number;
  shortBreakMs: number;
  longBreakMs: number;
  todayFocusMinutes: number;
  totalFocusMinutes: number;
  focusStreak: number;
  lastFocusDate: string | null;
  completedSessionsToday: number;
  statusBeforePause: FocusStatus | null;
}

function recordFocusDay(streak: number, lastFocusDate: string | null): { focusStreak: number; lastFocusDate: string } {
  const today = getLocalDate();
  if (lastFocusDate === today) {
    return { focusStreak: streak, lastFocusDate: today };
  }
  if (lastFocusDate && isYesterday(lastFocusDate)) {
    return { focusStreak: streak + 1, lastFocusDate: today };
  }
  return { focusStreak: 1, lastFocusDate: today };
}

export const useFocusStore = create<FocusStore>()(
  subscribeWithSelector((set, get) => ({
    // Timer state defaults
    ...defaultTimerState(),

    // Focus stats
    todayFocusMinutes: 0,
    totalFocusMinutes: 0,
    focusStreak: 0,
    lastFocusDate: null,
    completedSessionsToday: 0,
    statusBeforePause: null,

    start: () => {
      const now = Date.now();
      const state = get();
      set({
        ...startFocus(state, now),
        statusBeforePause: null,
      });
    },

    pause: () => {
      const now = Date.now();
      const state = get();
      const currentStatus = state.status;
      set({
        ...pauseTimer(state, now),
        statusBeforePause: currentStatus,
      });
    },

    resume: () => {
      const now = Date.now();
      const state = get();
      const previousStatus = state.statusBeforePause ?? "focus";
      set({
        ...resumeTimer(state, previousStatus, now),
        statusBeforePause: null,
      });
    },

    stop: () => {
      set({
        ...stopTimer(get()),
        statusBeforePause: null,
      });
    },

    tick: () => {
      const state = get();
      if (state.status === "idle" || state.status === "paused") return;

      const now = Date.now();
      if (!isSegmentComplete(state, now)) return;

      const { next, focusCompleted } = completeSegment(state, now);

      const updates: Partial<FocusStore> = { ...next };

      if (focusCompleted) {
        const sessionMinutes = Math.round(state.focusDurationMs / 60_000);
        const { focusStreak: newStreak, lastFocusDate: newDate } = recordFocusDay(
          state.focusStreak,
          state.lastFocusDate,
        );
        updates.todayFocusMinutes = state.todayFocusMinutes + sessionMinutes;
        updates.totalFocusMinutes = state.totalFocusMinutes + sessionMinutes;
        updates.completedSessionsToday = state.completedSessionsToday + 1;
        updates.focusStreak = newStreak;
        updates.lastFocusDate = newDate;

        // Award XP and stat boosts to creature
        const creature = useCreatureStore.getState();
        creature.addXp(FOCUS_SESSION_XP);
        for (const [stat, amount] of Object.entries(FOCUS_STAT_BOOSTS)) {
          creature.focusCare(stat as keyof typeof FOCUS_STAT_BOOSTS, amount);
        }
        creature.recordCareDay();
      }

      // Break completion → stat boosts
      if (!focusCompleted && (state.status === "short_break" || state.status === "long_break")) {
        const creature = useCreatureStore.getState();
        for (const [stat, amount] of Object.entries(BREAK_STAT_BOOSTS)) {
          creature.focusCare(stat as keyof typeof BREAK_STAT_BOOSTS, amount);
        }
      }

      set(updates);
    },

    setDurations: (focus, shortBreak, longBreak) => {
      set({
        focusDurationMs: focus,
        shortBreakMs: shortBreak,
        longBreakMs: longBreak,
        // Reset remaining if idle
        ...(get().status === "idle" ? { remainingMs: focus } : {}),
      });
    },

    hydrate: (data: PersistedFocusData) => {
      // Check if we need to roll over the day
      const today = getLocalDate();
      const isNewDay = data.lastFocusDate !== today;

      set({
        status: data.status ?? "idle",
        sessionIndex: data.sessionIndex ?? 0,
        remainingMs: data.remainingMs ?? DEFAULT_FOCUS_DURATION_MS,
        startedAt: data.startedAt ?? null,
        pausedAt: data.pausedAt ?? null,
        focusDurationMs: data.focusDurationMs ?? DEFAULT_FOCUS_DURATION_MS,
        shortBreakMs: data.shortBreakMs ?? DEFAULT_SHORT_BREAK_MS,
        longBreakMs: data.longBreakMs ?? DEFAULT_LONG_BREAK_MS,
        todayFocusMinutes: isNewDay ? 0 : (data.todayFocusMinutes ?? 0),
        totalFocusMinutes: data.totalFocusMinutes ?? 0,
        focusStreak: data.focusStreak ?? 0,
        lastFocusDate: data.lastFocusDate ?? null,
        completedSessionsToday: isNewDay ? 0 : (data.completedSessionsToday ?? 0),
        statusBeforePause: data.statusBeforePause ?? null,
      });
    },

    resetDay: () => {
      set({
        todayFocusMinutes: 0,
        completedSessionsToday: 0,
      });
    },
  })),
);
