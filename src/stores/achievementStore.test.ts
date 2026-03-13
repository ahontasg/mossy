import { describe, it, expect, beforeEach } from "vitest";
import { useAchievementStore } from "./achievementStore";

function resetStore() {
  useAchievementStore.setState({
    unlocked: [],
    totalFocusSessions: 0,
    totalChats: 0,
    careHistory: [],
    lastUnlock: null,
  });
}

describe("achievementStore", () => {
  beforeEach(resetStore);

  describe("recordFocusSession", () => {
    it("increments totalFocusSessions", () => {
      useAchievementStore.getState().recordFocusSession();
      expect(useAchievementStore.getState().totalFocusSessions).toBe(1);
    });

    it("adds to careHistory for today", () => {
      useAchievementStore.getState().recordFocusSession();
      useAchievementStore.getState().recordFocusSession();
      const history = useAchievementStore.getState().careHistory;
      expect(history).toHaveLength(1);
      expect(history[0].actions).toHaveLength(2);
      expect(history[0].actions).toContain("focus_complete");
    });

    it("trims history beyond 120 days", () => {
      const oldHistory = Array.from({ length: 120 }, (_, i) => ({
        date: `2025-01-${String(i + 1).padStart(2, "0")}`,
        actions: ["focus_complete" as const],
      }));
      useAchievementStore.setState({ careHistory: oldHistory });

      useAchievementStore.getState().recordFocusSession();
      expect(useAchievementStore.getState().careHistory.length).toBeLessThanOrEqual(120);
    });
  });

  describe("recordChat", () => {
    it("increments totalChats", () => {
      useAchievementStore.getState().recordChat();
      useAchievementStore.getState().recordChat();
      expect(useAchievementStore.getState().totalChats).toBe(2);
    });
  });

  describe("unlock", () => {
    it("adds achievement and sets lastUnlock", () => {
      useAchievementStore.getState().unlock("first_sprout");
      const { unlocked, lastUnlock } = useAchievementStore.getState();
      expect(unlocked).toHaveLength(1);
      expect(unlocked[0].id).toBe("first_sprout");
      expect(lastUnlock).not.toBeNull();
      expect(lastUnlock!.id).toBe("first_sprout");
    });
  });

  describe("getUnlockedIds", () => {
    it("returns set of unlocked IDs", () => {
      useAchievementStore.getState().unlock("first_sprout");
      useAchievementStore.getState().unlock("streak_7");
      const ids = useAchievementStore.getState().getUnlockedIds();
      expect(ids.has("first_sprout")).toBe(true);
      expect(ids.has("streak_7")).toBe(true);
      expect(ids.has("elder_moss")).toBe(false);
    });
  });

  describe("hydrate", () => {
    it("restores persisted data", () => {
      useAchievementStore.getState().hydrate({
        unlocked: [{ id: "first_chat", unlockedAt: 1000 }],
        totalFocusSessions: 50,
        totalChats: 10,
        careHistory: [{ date: "2026-03-12", actions: ["focus_complete", "chat"] }],
      });
      expect(useAchievementStore.getState().totalFocusSessions).toBe(50);
      expect(useAchievementStore.getState().totalChats).toBe(10);
      expect(useAchievementStore.getState().unlocked).toHaveLength(1);
      expect(useAchievementStore.getState().careHistory).toHaveLength(1);
    });
  });
});
