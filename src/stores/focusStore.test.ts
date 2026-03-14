import { describe, it, expect, beforeEach, vi } from "vitest";
import { useFocusStore, type PersistedFocusData } from "./focusStore";
import { getLocalDate } from "../lib/time";

// Mock creatureStore
vi.mock("./creatureStore", () => {
  const store = {
    getState: vi.fn(() => ({
      addXp: vi.fn(),
      focusCare: vi.fn(),
      recordCareDay: vi.fn(),
    })),
  };
  return { useCreatureStore: store };
});

beforeEach(() => {
  useFocusStore.setState({
    todayFocusMinutes: 0,
    totalFocusMinutes: 0,
    completedSessionsToday: 0,
    focusStreak: 0,
    lastFocusDate: null,
    status: "idle",
    sessionIndex: 0,
    statusBeforePause: null,
  });
});

describe("focusStore.resetDay", () => {
  it("zeroes todayFocusMinutes and completedSessionsToday", () => {
    useFocusStore.setState({
      todayFocusMinutes: 120,
      completedSessionsToday: 5,
    });

    useFocusStore.getState().resetDay();

    const state = useFocusStore.getState();
    expect(state.todayFocusMinutes).toBe(0);
    expect(state.completedSessionsToday).toBe(0);
  });

  it("preserves totalFocusMinutes and focusStreak", () => {
    useFocusStore.setState({
      todayFocusMinutes: 120,
      completedSessionsToday: 5,
      totalFocusMinutes: 500,
      focusStreak: 7,
    });

    useFocusStore.getState().resetDay();

    const state = useFocusStore.getState();
    expect(state.totalFocusMinutes).toBe(500);
    expect(state.focusStreak).toBe(7);
  });
});

describe("focusStore.hydrate", () => {
  it("resets daily stats when lastFocusDate is from a previous day", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDate(yesterday);

    const data: PersistedFocusData = {
      status: "idle",
      sessionIndex: 0,
      remainingMs: 25 * 60_000,
      startedAt: null,
      pausedAt: null,
      focusDurationMs: 25 * 60_000,
      shortBreakMs: 5 * 60_000,
      longBreakMs: 15 * 60_000,
      todayFocusMinutes: 100,
      totalFocusMinutes: 300,
      focusStreak: 3,
      lastFocusDate: yesterdayStr,
      completedSessionsToday: 4,
      statusBeforePause: null,
    };

    useFocusStore.getState().hydrate(data);

    const state = useFocusStore.getState();
    expect(state.todayFocusMinutes).toBe(0);
    expect(state.completedSessionsToday).toBe(0);
    expect(state.totalFocusMinutes).toBe(300);
    expect(state.focusStreak).toBe(3);
  });

  it("keeps daily stats when lastFocusDate is today", () => {
    const today = getLocalDate();

    const data: PersistedFocusData = {
      status: "idle",
      sessionIndex: 2,
      remainingMs: 25 * 60_000,
      startedAt: null,
      pausedAt: null,
      focusDurationMs: 25 * 60_000,
      shortBreakMs: 5 * 60_000,
      longBreakMs: 15 * 60_000,
      todayFocusMinutes: 50,
      totalFocusMinutes: 200,
      focusStreak: 2,
      lastFocusDate: today,
      completedSessionsToday: 2,
      statusBeforePause: null,
    };

    useFocusStore.getState().hydrate(data);

    const state = useFocusStore.getState();
    expect(state.todayFocusMinutes).toBe(50);
    expect(state.completedSessionsToday).toBe(2);
  });
});
