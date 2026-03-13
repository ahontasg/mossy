import { describe, it, expect } from "vitest";
import {
  trackFocusSession,
  trackChatMessage,
  trackChatTime,
  trackLevelUp,
  trackStreakChange,
  trackSpecimenDiscovery,
} from "./questTracker";
import { QUEST_TEMPLATE_MAP } from "../data/questTemplates";
import type { ActiveQuest } from "../../../types";

function makeQuest(templateId: string, progress = 0): ActiveQuest {
  return { templateId, progress, completed: false, completedAt: null, thresholdMetSince: null };
}

describe("trackFocusSession", () => {
  it("increments focus_sessions quests", () => {
    const quests = [makeQuest("focus_2")];
    const result = trackFocusSession(quests, QUEST_TEMPLATE_MAP, 1, 25);
    expect(result[0].progress).toBe(1);
    expect(result[0].completed).toBe(false);
  });

  it("completes focus_sessions quest at target", () => {
    const quests = [makeQuest("focus_2")];
    const result = trackFocusSession(quests, QUEST_TEMPLATE_MAP, 2, 50);
    expect(result[0].progress).toBe(2);
    expect(result[0].completed).toBe(true);
    expect(result[0].completedAt).not.toBeNull();
  });

  it("tracks focus_minutes quests", () => {
    const quests = [makeQuest("focus_30m")];
    const result = trackFocusSession(quests, QUEST_TEMPLATE_MAP, 1, 25);
    expect(result[0].progress).toBe(25);
    expect(result[0].completed).toBe(false);
  });

  it("completes focus_minutes quest at target", () => {
    const quests = [makeQuest("focus_30m")];
    const result = trackFocusSession(quests, QUEST_TEMPLATE_MAP, 2, 50);
    expect(result[0].progress).toBe(30);
    expect(result[0].completed).toBe(true);
  });

  it("tracks focus_cycle quests", () => {
    const quests = [makeQuest("focus_4")];
    const result = trackFocusSession(quests, QUEST_TEMPLATE_MAP, 3, 75);
    expect(result[0].progress).toBe(3);
    expect(result[0].completed).toBe(false);
  });

  it("completes focus_cycle quest at 4 sessions", () => {
    const quests = [makeQuest("focus_4")];
    const result = trackFocusSession(quests, QUEST_TEMPLATE_MAP, 4, 100);
    expect(result[0].progress).toBe(4);
    expect(result[0].completed).toBe(true);
  });

  it("skips completed quests", () => {
    const quests = [{ ...makeQuest("focus_2"), completed: true, progress: 2, completedAt: 1000 }];
    const result = trackFocusSession(quests, QUEST_TEMPLATE_MAP, 3, 75);
    expect(result[0].progress).toBe(2);
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
