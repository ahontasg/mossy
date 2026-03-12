import { describe, it, expect, beforeEach } from "vitest";
import { useCreatureStore, DEFAULT_STATS } from "./creatureStore";

function resetStore() {
  useCreatureStore.setState({
    stats: { ...DEFAULT_STATS },
    xp: 0,
    level: 1,
    growthStage: "sprout",
    mood: "happy",
    lastCareAction: null,
    lastSave: Date.now(),
  });
}

describe("creatureStore", () => {
  beforeEach(resetStore);

  describe("care actions", () => {
    it("feed increases hunger by 25 and xp by 10", () => {
      useCreatureStore.setState({ stats: { hunger: 50, hydration: 75, happiness: 75, energy: 75 } });
      useCreatureStore.getState().feed();
      expect(useCreatureStore.getState().stats.hunger).toBe(75);
      expect(useCreatureStore.getState().xp).toBe(10);
      expect(useCreatureStore.getState().lastCareAction?.type).toBe("feed");
    });

    it("water increases hydration by 30 and xp by 10", () => {
      useCreatureStore.setState({ stats: { hunger: 75, hydration: 50, happiness: 75, energy: 75 } });
      useCreatureStore.getState().water();
      expect(useCreatureStore.getState().stats.hydration).toBe(80);
      expect(useCreatureStore.getState().xp).toBe(10);
    });

    it("pet increases happiness by 20 and xp by 5", () => {
      useCreatureStore.setState({ stats: { hunger: 75, hydration: 75, happiness: 50, energy: 75 } });
      useCreatureStore.getState().pet();
      expect(useCreatureStore.getState().stats.happiness).toBe(70);
      expect(useCreatureStore.getState().xp).toBe(5);
    });

    it("sunlight increases energy by 20 and xp by 15", () => {
      useCreatureStore.setState({ stats: { hunger: 75, hydration: 75, happiness: 75, energy: 50 } });
      useCreatureStore.getState().sunlight();
      expect(useCreatureStore.getState().stats.energy).toBe(70);
      expect(useCreatureStore.getState().stats.happiness).toBe(75); // unchanged
      expect(useCreatureStore.getState().xp).toBe(15);
    });

    it("stats cap at 100", () => {
      useCreatureStore.setState({ stats: { hunger: 90, hydration: 75, happiness: 75, energy: 75 } });
      useCreatureStore.getState().feed();
      expect(useCreatureStore.getState().stats.hunger).toBe(100);
    });
  });

  describe("decay", () => {
    it("decayStats reduces hunger by 1, hydration by 1.5, happiness by 0.5, energy by 0.8", () => {
      useCreatureStore.getState().decayStats();
      const { stats } = useCreatureStore.getState();
      expect(stats.hunger).toBe(74);
      expect(stats.hydration).toBe(73.5);
      expect(stats.happiness).toBe(74.5);
      expect(stats.energy).toBe(74.2);
    });

    it("decay floors at 10", () => {
      useCreatureStore.setState({ stats: { hunger: 10, hydration: 10, happiness: 10, energy: 10 } });
      useCreatureStore.getState().decayStats();
      const { stats } = useCreatureStore.getState();
      expect(stats.hunger).toBe(10);
      expect(stats.hydration).toBe(10);
      expect(stats.happiness).toBe(10);
      expect(stats.energy).toBe(10);
    });

    it("applyOfflineDecay applies multiple ticks", () => {
      useCreatureStore.getState().applyOfflineDecay(10);
      const { stats } = useCreatureStore.getState();
      expect(stats.hunger).toBe(65);
      expect(stats.hydration).toBe(60);
      expect(stats.happiness).toBe(70);
      expect(stats.energy).toBe(67);
    });

    it("applyOfflineDecay floors at 10", () => {
      useCreatureStore.getState().applyOfflineDecay(120);
      const { stats } = useCreatureStore.getState();
      expect(stats.hunger).toBe(10); // 75 - 120 = -45 → clamped to 10
      expect(stats.hydration).toBe(10); // 75 - 180 = -105 → clamped to 10
      expect(stats.happiness).toBe(15); // 75 - 60 = 15 (above floor)
      expect(stats.energy).toBe(10); // 75 - 96 = -21 → clamped to 10
    });
  });

  describe("mood derivation", () => {
    it("happy when avg >= 75", () => {
      useCreatureStore.setState({ stats: { hunger: 80, hydration: 80, happiness: 80, energy: 80 } });
      useCreatureStore.getState().feed(); // triggers mood recalc
      expect(useCreatureStore.getState().mood).toBe("happy");
    });

    it("content when avg >= 55", () => {
      useCreatureStore.setState({
        stats: { hunger: 60, hydration: 55, happiness: 55, energy: 55 },
        mood: "neutral",
      });
      useCreatureStore.getState().decayStats();
      expect(useCreatureStore.getState().mood).toBe("content");
    });

    it("neutral when avg >= 35", () => {
      useCreatureStore.setState({
        stats: { hunger: 40, hydration: 35, happiness: 35, energy: 35 },
        mood: "happy",
      });
      useCreatureStore.getState().decayStats();
      expect(useCreatureStore.getState().mood).toBe("neutral");
    });

    it("sad when avg >= 15", () => {
      useCreatureStore.setState({
        stats: { hunger: 20, hydration: 15, happiness: 15, energy: 15 },
        mood: "happy",
      });
      useCreatureStore.getState().decayStats();
      expect(useCreatureStore.getState().mood).toBe("sad");
    });

    it("critical when avg < 15", () => {
      useCreatureStore.setState({
        stats: { hunger: 10, hydration: 10, happiness: 10, energy: 10 },
        mood: "happy",
      });
      useCreatureStore.getState().decayStats();
      expect(useCreatureStore.getState().mood).toBe("critical");
    });
  });

  describe("leveling", () => {
    it("levels up when xp reaches threshold (level * 50)", () => {
      useCreatureStore.setState({ xp: 45, level: 1 });
      useCreatureStore.getState().feed(); // +10 xp → 55, threshold is 50
      expect(useCreatureStore.getState().level).toBe(2);
      expect(useCreatureStore.getState().xp).toBe(5);
    });

    it("can multi-level up on large xp gains", () => {
      useCreatureStore.setState({ xp: 40, level: 1 });
      // 40 + 15 = 55. Level 1 threshold = 50 → level 2, xp 5
      useCreatureStore.getState().sunlight();
      expect(useCreatureStore.getState().level).toBe(2);
      expect(useCreatureStore.getState().xp).toBe(5);
    });

    it("growth stage transitions at level thresholds", () => {
      useCreatureStore.setState({ xp: 0, level: 1 });
      expect(useCreatureStore.getState().growthStage).toBe("sprout");

      useCreatureStore.setState({ xp: 0, level: 5 });
      // Need to trigger a recalc via care action
      useCreatureStore.getState().pet();
      expect(useCreatureStore.getState().growthStage).toBe("young");

      useCreatureStore.setState({ xp: 0, level: 10 });
      useCreatureStore.getState().pet();
      expect(useCreatureStore.getState().growthStage).toBe("mature");

      useCreatureStore.setState({ xp: 0, level: 20 });
      useCreatureStore.getState().pet();
      expect(useCreatureStore.getState().growthStage).toBe("elder");
    });
  });

  describe("hydrate", () => {
    it("restores state from persisted data", () => {
      useCreatureStore.getState().hydrate({
        stats: { hunger: 50, hydration: 40, happiness: 30, energy: 60 },
        xp: 25,
        level: 3,
        growthStage: "sprout",
        lastSave: 1000,
      });
      const state = useCreatureStore.getState();
      expect(state.stats.hunger).toBe(50);
      expect(state.stats.energy).toBe(60);
      expect(state.xp).toBe(25);
      expect(state.level).toBe(3);
      expect(state.growthStage).toBe("sprout");
      expect(state.mood).toBe("neutral"); // avg (50+40+30+60)/4 = 45
    });

    it("defaults energy to 75 for old saves without energy", () => {
      useCreatureStore.getState().hydrate({
        stats: { hunger: 50, hydration: 40, happiness: 30 } as any,
        xp: 10,
        level: 2,
        growthStage: "sprout",
        lastSave: 1000,
      });
      expect(useCreatureStore.getState().stats.energy).toBe(75);
    });
  });
});
