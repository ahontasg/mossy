import { describe, it, expect, beforeEach } from "vitest";
import { useQuestStore } from "./questStore";
import { useCreatureStore } from "./creatureStore";

function resetStore() {
  useQuestStore.setState({
    date: "",
    quests: [],
    lastCompletion: null,
  });
  useCreatureStore.setState({ xp: 0, level: 1 });
}

describe("questStore", () => {
  beforeEach(resetStore);

  describe("setQuests", () => {
    it("sets date and quests", () => {
      useQuestStore.getState().setQuests("2026-03-13", [
        { templateId: "water_3", progress: 0, completed: false, completedAt: null, thresholdMetSince: null },
      ]);
      expect(useQuestStore.getState().date).toBe("2026-03-13");
      expect(useQuestStore.getState().quests).toHaveLength(1);
    });
  });

  describe("updateQuests", () => {
    it("updates quests in place", () => {
      useQuestStore.getState().setQuests("2026-03-13", [
        { templateId: "water_3", progress: 0, completed: false, completedAt: null, thresholdMetSince: null },
      ]);
      useQuestStore.getState().updateQuests([
        { templateId: "water_3", progress: 2, completed: false, completedAt: null, thresholdMetSince: null },
      ]);
      expect(useQuestStore.getState().quests[0].progress).toBe(2);
    });
  });

  describe("completeQuest", () => {
    it("awards XP and sets lastCompletion", () => {
      useQuestStore.getState().completeQuest("water_3", 25);
      expect(useQuestStore.getState().lastCompletion).not.toBeNull();
      expect(useQuestStore.getState().lastCompletion!.rewardXp).toBe(25);
      expect(useCreatureStore.getState().xp).toBe(25);
    });
  });

  describe("hydrate", () => {
    it("restores date and quests", () => {
      useQuestStore.getState().hydrate("2026-03-12", [
        { templateId: "feed_3", progress: 1, completed: false, completedAt: null, thresholdMetSince: null },
      ]);
      expect(useQuestStore.getState().date).toBe("2026-03-12");
      expect(useQuestStore.getState().quests[0].progress).toBe(1);
    });
  });
});
