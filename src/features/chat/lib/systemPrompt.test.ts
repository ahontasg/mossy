import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "./systemPrompt";
import type { CreatureStats, Mood } from "../../../types";

describe("buildSystemPrompt", () => {
  const fullStats: CreatureStats = {
    hunger: 75,
    hydration: 75,
    happiness: 75,
    energy: 75,
  };

  it("includes mood and level", () => {
    const prompt = buildSystemPrompt(fullStats, "happy", 5);
    expect(prompt).toContain("Level 5");
    expect(prompt).toContain("mood: happy");
  });

  it("mentions low stats when below threshold", () => {
    const lowStats: CreatureStats = {
      hunger: 20,
      hydration: 20,
      happiness: 75,
      energy: 75,
    };
    const prompt = buildSystemPrompt(lowStats, "neutral", 1);
    expect(prompt).toContain("hungry");
    expect(prompt).toContain("thirsty");
    expect(prompt).not.toContain("lonely");
    expect(prompt).not.toContain("tired");
  });

  it("does not mention low stats when all are above threshold", () => {
    const prompt = buildSystemPrompt(fullStats, "happy", 10);
    expect(prompt).not.toContain("hungry");
    expect(prompt).not.toContain("thirsty");
    expect(prompt).not.toContain("lonely");
    expect(prompt).not.toContain("tired");
  });

  it("includes character instructions", () => {
    const prompt = buildSystemPrompt(fullStats, "content", 3);
    expect(prompt).toContain("Mossy");
    expect(prompt).toContain("moss creature");
    expect(prompt).toContain("helpful assistant");
  });

  it("includes focus line when focusContext has todayFocusMinutes > 0", () => {
    const prompt = buildSystemPrompt(fullStats, "happy", 5, undefined, {
      todayFocusMinutes: 45,
      completedSessionsToday: 2,
      focusStreak: 3,
      status: "idle",
    });
    expect(prompt).toContain("Focus today: 45m, 2 sessions");
    expect(prompt).toContain("Streak: 3 days");
  });

  it("omits focus line when focusContext is not provided", () => {
    const prompt = buildSystemPrompt(fullStats, "happy", 5);
    expect(prompt).not.toContain("Focus today");
  });

  it("omits focus line when todayFocusMinutes is 0", () => {
    const prompt = buildSystemPrompt(fullStats, "happy", 5, undefined, {
      todayFocusMinutes: 0,
      completedSessionsToday: 0,
      focusStreak: 1,
      status: "idle",
    });
    expect(prompt).not.toContain("Focus today");
  });

  it("includes assistant capabilities line", () => {
    const prompt = buildSystemPrompt(fullStats, "happy", 5);
    expect(prompt).toContain("helpful assistant");
    expect(prompt).toContain("timers, reminders, and notes");
  });

  it("stays within reasonable token budget", () => {
    const allLowStats: CreatureStats = { hunger: 10, hydration: 10, happiness: 10, energy: 10 };
    const prompt = buildSystemPrompt(allLowStats, "critical" as Mood, 20);
    const estimatedTokens = prompt.length / 4;
    expect(estimatedTokens).toBeLessThan(200);
  });
});
