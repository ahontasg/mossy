import { describe, it, expect } from "vitest";
import { formatFeedEvent } from "./feedFormatter";

describe("formatFeedEvent", () => {
  it("formats focus_complete event", () => {
    expect(formatFeedEvent("Alex", "focus_complete", 30)).toBe("Alex completed a focus session (+30 XP)");
  });

  it("formats game_score event with metadata", () => {
    expect(formatFeedEvent("Alex", "game_score", 20, { score: 150, gameId: "memory" })).toBe(
      "Alex scored 150 in memory! (+20 XP)",
    );
  });

  it("formats challenge_complete event", () => {
    expect(formatFeedEvent("Jordan", "challenge_complete", 25)).toBe(
      "Jordan completed the Daily Challenge! (+25 XP)",
    );
  });

  it("formats chat event", () => {
    expect(formatFeedEvent("Alex", "chat", 10)).toBe("Alex chatted with their Mossy (+10 XP)");
  });

  it("formats quest_complete event", () => {
    expect(formatFeedEvent("Alex", "quest_complete", 50)).toBe("Alex completed a quest! (+50 XP)");
  });

  it("formats level_up event with level in metadata", () => {
    expect(formatFeedEvent("Jordan", "level_up", 0, { level: 10 })).toBe("Jordan reached Level 10!");
  });

  it("omits XP when zero", () => {
    expect(formatFeedEvent("Alex", "level_up", 0, { level: 5 })).toBe("Alex reached Level 5!");
  });
});
