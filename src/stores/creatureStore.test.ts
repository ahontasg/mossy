import { describe, it, expect, beforeEach } from "vitest";
import { useCreatureStore, DEFAULT_STATS, DEFAULT_STREAK } from "./creatureStore";

function resetStore() {
  useCreatureStore.setState({
    stats: { ...DEFAULT_STATS },
    xp: 0,
    level: 1,
    growthStage: "sprout",
    mood: "happy",
    lastSave: Date.now(),
    lastLevelUp: null,
    lastXpGain: null,
    streak: { ...DEFAULT_STREAK },
    returnMoment: null,
    isFocusing: false,
  });
}

describe("creatureStore", () => {
  beforeEach(resetStore);

  describe("focusCare", () => {
    it("increases a stat by the given amount", () => {
      useCreatureStore.setState({ stats: { hunger: 50, hydration: 75, happiness: 75, energy: 75 } });
      useCreatureStore.getState().focusCare("hunger", 25);
      expect(useCreatureStore.getState().stats.hunger).toBe(75);
    });

    it("caps stats at 100", () => {
      useCreatureStore.setState({ stats: { hunger: 90, hydration: 75, happiness: 75, energy: 75 } });
      useCreatureStore.getState().focusCare("hunger", 25);
      expect(useCreatureStore.getState().stats.hunger).toBe(100);
    });

    it("updates mood after stat change", () => {
      useCreatureStore.setState({ stats: { hunger: 80, hydration: 80, happiness: 80, energy: 80 } });
      useCreatureStore.getState().focusCare("energy", 10);
      expect(useCreatureStore.getState().mood).toBe("happy");
    });

    it("ignores invalid stat keys", () => {
      const before = { ...useCreatureStore.getState().stats };
      useCreatureStore.getState().focusCare("invalid", 50);
      expect(useCreatureStore.getState().stats).toEqual(before);
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

    it("decay halves during focus", () => {
      useCreatureStore.getState().setFocusing(true);
      useCreatureStore.getState().decayStats();
      const { stats } = useCreatureStore.getState();
      expect(stats.hunger).toBe(74.5); // 75 - 1*0.5
      expect(stats.hydration).toBe(74.25); // 75 - 1.5*0.5
      expect(stats.happiness).toBe(74.75); // 75 - 0.5*0.5
      expect(stats.energy).toBe(74.6); // 75 - 0.8*0.5
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
      useCreatureStore.getState().focusCare("hunger", 5); // triggers mood recalc
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
      useCreatureStore.getState().addXp(10); // +10 xp → 55, threshold is 50
      expect(useCreatureStore.getState().level).toBe(2);
      expect(useCreatureStore.getState().xp).toBe(5);
    });

    it("can multi-level up on large xp gains", () => {
      useCreatureStore.setState({ xp: 40, level: 1 });
      useCreatureStore.getState().addXp(15);
      expect(useCreatureStore.getState().level).toBe(2);
      expect(useCreatureStore.getState().xp).toBe(5);
    });

    it("growth stage transitions at level thresholds", () => {
      useCreatureStore.setState({ xp: 0, level: 1 });
      expect(useCreatureStore.getState().growthStage).toBe("sprout");

      useCreatureStore.setState({ xp: 0, level: 5 });
      useCreatureStore.getState().addXp(1);
      expect(useCreatureStore.getState().growthStage).toBe("young");

      useCreatureStore.setState({ xp: 0, level: 10 });
      useCreatureStore.getState().addXp(1);
      expect(useCreatureStore.getState().growthStage).toBe("mature");

      useCreatureStore.setState({ xp: 0, level: 20 });
      useCreatureStore.getState().addXp(1);
      expect(useCreatureStore.getState().growthStage).toBe("elder");
    });
  });

  describe("xp gain tracking", () => {
    it("sets lastXpGain on addXp", () => {
      useCreatureStore.getState().addXp(30);
      const state = useCreatureStore.getState();
      expect(state.lastXpGain).not.toBeNull();
      expect(state.lastXpGain!.amount).toBe(30);
    });

    it("sets lastLevelUp on level up", () => {
      useCreatureStore.setState({ xp: 45, level: 1 });
      useCreatureStore.getState().addXp(10); // → 55, threshold 50 → level up
      expect(useCreatureStore.getState().lastLevelUp).not.toBeNull();
    });

    it("does not set lastLevelUp when no level up", () => {
      useCreatureStore.setState({ xp: 0, level: 1 });
      useCreatureStore.getState().addXp(10); // threshold 50 → no level up
      expect(useCreatureStore.getState().lastLevelUp).toBeNull();
    });
  });

  describe("streak", () => {
    it("starts streak on first care day", () => {
      useCreatureStore.getState().recordCareDay();
      expect(useCreatureStore.getState().streak.currentStreak).toBe(1);
      expect(useCreatureStore.getState().streak.lastCareDate).not.toBeNull();
    });

    it("no-ops if already recorded today", () => {
      useCreatureStore.getState().recordCareDay();
      useCreatureStore.getState().recordCareDay();
      expect(useCreatureStore.getState().streak.currentStreak).toBe(1);
    });

    it("increments on consecutive days", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
      useCreatureStore.setState({
        streak: { currentStreak: 3, lastCareDate: yStr, shieldAvailable: true, shieldLastGrantedWeek: null },
      });
      useCreatureStore.getState().recordCareDay();
      expect(useCreatureStore.getState().streak.currentStreak).toBe(4);
    });

    it("resets on gap > 1 day without shield", () => {
      useCreatureStore.setState({
        streak: { currentStreak: 5, lastCareDate: "2020-01-01", shieldAvailable: false, shieldLastGrantedWeek: null },
      });
      useCreatureStore.getState().recordCareDay();
      expect(useCreatureStore.getState().streak.currentStreak).toBe(1);
    });

    it("uses shield on gap > 1 day when available", () => {
      useCreatureStore.setState({
        streak: { currentStreak: 5, lastCareDate: "2020-01-01", shieldAvailable: true, shieldLastGrantedWeek: null },
      });
      useCreatureStore.getState().recordCareDay();
      expect(useCreatureStore.getState().streak.currentStreak).toBe(6);
      expect(useCreatureStore.getState().streak.shieldAvailable).toBe(false);
    });

    it("refreshShield grants shield on new week", () => {
      useCreatureStore.setState({
        streak: { currentStreak: 3, lastCareDate: "2026-03-10", shieldAvailable: false, shieldLastGrantedWeek: "2020-W01" },
      });
      useCreatureStore.getState().refreshShield();
      expect(useCreatureStore.getState().streak.shieldAvailable).toBe(true);
    });

    it("refreshShield no-ops on same week", () => {
      const d = new Date();
      const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const dayNum = tmp.getUTCDay() || 7;
      tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
      const currentWeek = `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;

      useCreatureStore.setState({
        streak: { currentStreak: 3, lastCareDate: "2026-03-10", shieldAvailable: false, shieldLastGrantedWeek: currentWeek },
      });
      useCreatureStore.getState().refreshShield();
      expect(useCreatureStore.getState().streak.shieldAvailable).toBe(false);
    });
  });

  describe("setFocusing", () => {
    it("sets isFocusing flag", () => {
      useCreatureStore.getState().setFocusing(true);
      expect(useCreatureStore.getState().isFocusing).toBe(true);
      useCreatureStore.getState().setFocusing(false);
      expect(useCreatureStore.getState().isFocusing).toBe(false);
    });
  });

  describe("return moment", () => {
    it("sets and dismisses return moment", () => {
      const moment = {
        durationHours: 5.2,
        statsBefore: { hunger: 75, hydration: 75, happiness: 75, energy: 75 },
        statsAfter: { hunger: 50, hydration: 40, happiness: 60, energy: 45 },
      };
      useCreatureStore.getState().setReturnMoment(moment);
      expect(useCreatureStore.getState().returnMoment).toEqual(moment);

      useCreatureStore.getState().dismissReturnMoment();
      expect(useCreatureStore.getState().returnMoment).toBeNull();
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
