import { describe, it, expect } from "vitest";
import {
  trackCareAction,
  trackChatMessage,
  trackChatTime,
  trackStatCheck,
  trackLevelUp,
  trackStreakChange,
  trackSpecimenDiscovery,
} from "./questTracker";
import { QUEST_TEMPLATE_MAP } from "../data/questTemplates";
import type { ActiveQuest } from "../../../types";

function makeQuest(templateId: string, progress = 0): ActiveQuest {
  return { templateId, progress, completed: false, completedAt: null, thresholdMetSince: null };
}

describe("trackCareAction", () => {
  it("increments care_count quests for matching action", () => {
    const quests = [makeQuest("water_3")];
    const result = trackCareAction(quests, QUEST_TEMPLATE_MAP, "water");
    expect(result[0].progress).toBe(1);
    expect(result[0].completed).toBe(false);
  });

  it("completes care_count quest at target", () => {
    const quests = [{ ...makeQuest("water_3"), progress: 2 }];
    const result = trackCareAction(quests, QUEST_TEMPLATE_MAP, "water");
    expect(result[0].progress).toBe(3);
    expect(result[0].completed).toBe(true);
    expect(result[0].completedAt).not.toBeNull();
  });

  it("does not increment for wrong action", () => {
    const quests = [makeQuest("water_3")];
    const result = trackCareAction(quests, QUEST_TEMPLATE_MAP, "feed");
    expect(result[0].progress).toBe(0);
  });

  it("increments care_any_count for any action", () => {
    const quests = [makeQuest("any_5")];
    const result = trackCareAction(quests, QUEST_TEMPLATE_MAP, "pet");
    expect(result[0].progress).toBe(1);
  });

  it("skips completed quests", () => {
    const quests = [{ ...makeQuest("water_3"), completed: true, progress: 3, completedAt: 1000 }];
    const result = trackCareAction(quests, QUEST_TEMPLATE_MAP, "water");
    expect(result[0].progress).toBe(3);
  });
});

describe("trackChatMessage", () => {
  it("updates chat_count quest progress", () => {
    const quests = [makeQuest("chat_3")];
    const result = trackChatMessage(quests, QUEST_TEMPLATE_MAP, 2);
    expect(result[0].progress).toBe(2);
  });

  it("completes at target", () => {
    const quests = [makeQuest("chat_3")];
    const result = trackChatMessage(quests, QUEST_TEMPLATE_MAP, 3);
    expect(result[0].completed).toBe(true);
  });
});

describe("trackChatTime", () => {
  it("completes chat_time quest when time matches", () => {
    const quests = [makeQuest("chat_night")];
    const result = trackChatTime(quests, QUEST_TEMPLATE_MAP, "night");
    expect(result[0].completed).toBe(true);
    expect(result[0].progress).toBe(1);
  });

  it("does not complete chat_time quest when time does not match", () => {
    const quests = [makeQuest("chat_night")];
    const result = trackChatTime(quests, QUEST_TEMPLATE_MAP, "morning");
    expect(result[0].completed).toBe(false);
    expect(result[0].progress).toBe(0);
  });

  it("does not re-complete already completed chat_time quest", () => {
    const quests = [{ ...makeQuest("chat_morning"), completed: true, progress: 1, completedAt: 1000 }];
    const result = trackChatTime(quests, QUEST_TEMPLATE_MAP, "morning");
    expect(result[0].completedAt).toBe(1000);
  });
});

describe("trackStatCheck", () => {
  it("starts timer when stats meet threshold", () => {
    const quests = [makeQuest("stats_60_30m")];
    const stats = { hunger: 70, hydration: 70, happiness: 70, energy: 70 };
    const result = trackStatCheck(quests, QUEST_TEMPLATE_MAP, stats, 1000);
    expect(result[0].thresholdMetSince).toBe(1000);
  });

  it("resets timer when stats drop below threshold", () => {
    const quests = [{ ...makeQuest("stats_60_30m"), thresholdMetSince: 1000 }];
    const stats = { hunger: 50, hydration: 70, happiness: 70, energy: 70 };
    const result = trackStatCheck(quests, QUEST_TEMPLATE_MAP, stats, 2000);
    expect(result[0].thresholdMetSince).toBeNull();
    expect(result[0].progress).toBe(0);
  });

  it("completes when duration met", () => {
    const quests = [{ ...makeQuest("stats_60_30m"), thresholdMetSince: 0 }];
    const stats = { hunger: 70, hydration: 70, happiness: 70, energy: 70 };
    const result = trackStatCheck(quests, QUEST_TEMPLATE_MAP, stats, 30 * 60_000);
    expect(result[0].completed).toBe(true);
  });
});

describe("trackLevelUp", () => {
  it("updates reach_level progress", () => {
    const quests = [makeQuest("reach_5")];
    const result = trackLevelUp(quests, QUEST_TEMPLATE_MAP, 4);
    expect(result[0].progress).toBe(4);
    expect(result[0].completed).toBe(false);
  });

  it("completes at target level", () => {
    const quests = [makeQuest("reach_5")];
    const result = trackLevelUp(quests, QUEST_TEMPLATE_MAP, 5);
    expect(result[0].completed).toBe(true);
  });
});

describe("trackStreakChange", () => {
  it("updates streak_reach progress", () => {
    const quests = [makeQuest("streak_7")];
    const result = trackStreakChange(quests, QUEST_TEMPLATE_MAP, 5);
    expect(result[0].progress).toBe(5);
    expect(result[0].completed).toBe(false);
  });

  it("completes at target streak", () => {
    const quests = [makeQuest("streak_3")];
    const result = trackStreakChange(quests, QUEST_TEMPLATE_MAP, 3);
    expect(result[0].completed).toBe(true);
  });
});

describe("trackSpecimenDiscovery", () => {
  it("updates discover_specimen progress", () => {
    const quests = [makeQuest("discover_1")];
    const result = trackSpecimenDiscovery(quests, QUEST_TEMPLATE_MAP, 1);
    expect(result[0].completed).toBe(true);
  });
});
