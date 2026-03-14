import { describe, it, expect, beforeEach, vi } from "vitest";
import { useGameStore } from "./gameStore";

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

// Mock achievementStore
vi.mock("./achievementStore", () => {
  const store = {
    getState: vi.fn(() => ({
      recordCareDay: vi.fn(),
    })),
  };
  return { useAchievementStore: store };
});

beforeEach(() => {
  useGameStore.setState({
    tokens: 0,
    highScores: { memory: 0, mossy_says: 0 },
    gamesPlayedToday: 0,
    lastPlayDate: null,
    lastGameResult: null,
  });
});

describe("gameStore tokens", () => {
  it("earnToken increments tokens by 1", () => {
    useGameStore.getState().earnToken();
    expect(useGameStore.getState().tokens).toBe(1);

    useGameStore.getState().earnToken();
    expect(useGameStore.getState().tokens).toBe(2);
  });

  it("spendToken decrements and returns true when tokens > 0", () => {
    useGameStore.setState({ tokens: 3 });
    const result = useGameStore.getState().spendToken();
    expect(result).toBe(true);
    expect(useGameStore.getState().tokens).toBe(2);
  });

  it("spendToken returns false when tokens === 0", () => {
    const result = useGameStore.getState().spendToken();
    expect(result).toBe(false);
    expect(useGameStore.getState().tokens).toBe(0);
  });
});

describe("gameStore.recordGameResult", () => {
  it("updates high score when score is higher", () => {
    useGameStore.getState().recordGameResult("memory", 500);
    expect(useGameStore.getState().highScores.memory).toBe(500);

    useGameStore.getState().recordGameResult("memory", 700);
    expect(useGameStore.getState().highScores.memory).toBe(700);
  });

  it("does not lower high score", () => {
    useGameStore.setState({ highScores: { memory: 800, mossy_says: 0 } });
    useGameStore.getState().recordGameResult("memory", 300);
    expect(useGameStore.getState().highScores.memory).toBe(800);
  });

  it("sets isNewRecord correctly", () => {
    useGameStore.getState().recordGameResult("memory", 100);
    expect(useGameStore.getState().lastGameResult?.isNewRecord).toBe(true);

    useGameStore.getState().recordGameResult("memory", 50);
    expect(useGameStore.getState().lastGameResult?.isNewRecord).toBe(false);
  });

  it("increments gamesPlayedToday", () => {
    useGameStore.getState().recordGameResult("mossy_says", 5);
    expect(useGameStore.getState().gamesPlayedToday).toBe(1);

    useGameStore.getState().recordGameResult("mossy_says", 3);
    expect(useGameStore.getState().gamesPlayedToday).toBe(2);
  });

  it("sets lastPlayDate", () => {
    useGameStore.getState().recordGameResult("memory", 100);
    expect(useGameStore.getState().lastPlayDate).not.toBeNull();
  });
});

describe("gameStore.resetDay", () => {
  it("resets gamesPlayedToday to 0", () => {
    useGameStore.setState({ gamesPlayedToday: 5 });
    useGameStore.getState().resetDay();
    expect(useGameStore.getState().gamesPlayedToday).toBe(0);
  });
});

describe("gameStore.hydrate", () => {
  it("restores persisted data", () => {
    useGameStore.getState().hydrate({
      tokens: 7,
      highScores: { memory: 450, mossy_says: 12 },
      gamesPlayedToday: 3,
      lastPlayDate: "2026-03-12",
    });

    const state = useGameStore.getState();
    expect(state.tokens).toBe(7);
    expect(state.highScores.memory).toBe(450);
    expect(state.highScores.mossy_says).toBe(12);
    expect(state.gamesPlayedToday).toBe(3);
  });

  it("handles partial data gracefully", () => {
    useGameStore.getState().hydrate({ tokens: 2 });
    expect(useGameStore.getState().tokens).toBe(2);
    // Other fields remain at defaults
    expect(useGameStore.getState().highScores.memory).toBe(0);
  });
});
