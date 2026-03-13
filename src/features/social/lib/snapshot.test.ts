import { describe, it, expect, beforeEach } from "vitest";
import "../../../test/mocks/tauri";
import { generateSnapshot } from "./snapshot";
import { useCreatureStore } from "../../../stores/creatureStore";
import { useJournalStore } from "../../../stores/journalStore";
import { useQuestStore } from "../../../stores/questStore";
import { useAchievementStore } from "../../../stores/achievementStore";

beforeEach(() => {
  useCreatureStore.setState({
    level: 5,
    xp: 30,
    streak: { currentStreak: 3, lastCareDate: "2026-03-13", shieldAvailable: true, shieldLastGrantedWeek: null },
  });
  useJournalStore.setState({
    discovered: [
      { specimenId: "crystal_cap_mushroom", discoveredAt: Date.now(), discoveredDate: "2026-03-13" },
      { specimenId: "moss_mite", discoveredAt: Date.now(), discoveredDate: "2026-03-12" },
    ],
  });
  useQuestStore.setState({
    date: "2026-03-13",
    quests: [
      { templateId: "q1", progress: 3, completed: true, completedAt: Date.now(), thresholdMetSince: null },
      { templateId: "q2", progress: 1, completed: false, completedAt: null, thresholdMetSince: null },
      { templateId: "q3", progress: 0, completed: false, completedAt: null, thresholdMetSince: null },
    ],
  });
  // Build care history with recent dates (last 12 calendar days, some gaps)
  const today = new Date();
  const recentDates: string[] = [];
  for (let i = 0; i < 23; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    recentDates.push(d.toISOString().slice(0, 10));
  }
  useAchievementStore.setState({
    careHistory: recentDates.map((date) => ({
      date,
      actions: ["feed" as const],
    })),
    totalCareActions: 50,
    totalChats: 10,
    unlocked: [],
  });
});

describe("generateSnapshot", () => {
  it("includes day count and level", () => {
    const text = generateSnapshot();
    expect(text).toContain("Mossy Day 23");
    expect(text).toContain("Lvl 5");
  });

  it("includes care rhythm bar", () => {
    const text = generateSnapshot();
    expect(text).toContain("Care Rhythm");
  });

  it("includes most recent discovery", () => {
    const text = generateSnapshot();
    // Last discovered is moss_mite (index 1) — no, the array has crystal_cap first, moss_mite second
    expect(text).toContain("Moss Mite");
  });

  it("includes specimen count", () => {
    const text = generateSnapshot();
    expect(text).toContain("2/32 specimens discovered");
  });

  it("includes streak", () => {
    const text = generateSnapshot();
    expect(text).toContain("3-day streak");
  });

  it("includes quest progress", () => {
    const text = generateSnapshot();
    expect(text).toContain("1/3 quests done today");
  });

  it("omits streak when zero", () => {
    useCreatureStore.setState({
      streak: { currentStreak: 0, lastCareDate: null, shieldAvailable: true, shieldLastGrantedWeek: null },
    });
    const text = generateSnapshot();
    expect(text).not.toContain("streak");
  });

  it("omits quests when none completed", () => {
    useQuestStore.setState({
      quests: [
        { templateId: "q1", progress: 0, completed: false, completedAt: null, thresholdMetSince: null },
      ],
    });
    const text = generateSnapshot();
    expect(text).not.toContain("quests done");
  });
});
