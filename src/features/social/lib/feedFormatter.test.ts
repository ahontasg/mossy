import { describe, it, expect } from "vitest";
import { formatFeedEvent } from "./feedFormatter";

describe("formatFeedEvent", () => {
  it("formats feed event", () => {
    expect(formatFeedEvent("Alex", "feed", 10)).toBe("Alex fed their Mossy (+10 XP)");
  });

  it("formats water event", () => {
    expect(formatFeedEvent("Alex", "water", 10)).toBe("Alex watered their Mossy (+10 XP)");
  });

  it("formats pet event", () => {
    expect(formatFeedEvent("Jordan", "pet", 5)).toBe("Jordan pet their Mossy (+5 XP)");
  });

  it("formats sunlight event", () => {
    expect(formatFeedEvent("Sam", "sunlight", 15)).toBe("Sam gave their Mossy some sun (+15 XP)");
  });

  it("formats chat event", () => {
    expect(formatFeedEvent("Alex", "chat", 5)).toBe("Alex chatted with their Mossy (+5 XP)");
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
