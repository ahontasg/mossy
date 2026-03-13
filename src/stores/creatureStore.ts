import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  CareAction,
  CreatureStats,
  CreatureState,
  GrowthStage,
  Mood,
  StreakData,
  ReturnMoment,
} from "../types";
import { getLocalDate, getISOWeek, isToday, isYesterday } from "../lib/time";

export const STAT_FLOOR = 10;

export const DEFAULT_STATS: CreatureStats = {
  hunger: 75,
  hydration: 75,
  happiness: 75,
  energy: 75,
};

const DECAY_RATES: Record<keyof CreatureStats, number> = {
  hunger: 1,
  hydration: 1.5,
  happiness: 0.5,
  energy: 0.8,
};

export function isDormant(stats: CreatureStats): boolean {
  return (
    stats.hunger <= STAT_FLOOR &&
    stats.hydration <= STAT_FLOOR &&
    stats.happiness <= STAT_FLOOR &&
    stats.energy <= STAT_FLOOR
  );
}

function deriveMood(stats: CreatureStats): Mood {
  const avg = (stats.hunger + stats.hydration + stats.happiness + stats.energy) / 4;
  if (avg >= 75) return "happy";
  if (avg >= 55) return "content";
  if (avg >= 35) return "neutral";
  if (avg >= 15) return "sad";
  return "critical";
}

function deriveGrowthStage(level: number): GrowthStage {
  if (level >= 20) return "elder";
  if (level >= 10) return "mature";
  if (level >= 5) return "young";
  return "sprout";
}

function clampStat(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  lastCareDate: null,
  shieldAvailable: true,
  shieldLastGrantedWeek: null,
};

interface CreatureStore {
  stats: CreatureStats;
  xp: number;
  level: number;
  growthStage: GrowthStage;
  mood: Mood;
  lastCareAction: { type: CareAction; timestamp: number } | null;
  lastSave: number;
  lastLevelUp: number | null;
  lastXpGain: { amount: number; timestamp: number } | null;
  streak: StreakData;
  returnMoment: ReturnMoment | null;

  feed: () => void;
  water: () => void;
  pet: () => void;
  sunlight: () => void;
  addXp: (amount: number) => void;
  decayStats: () => void;
  applyOfflineDecay: (ticks: number) => void;
  hydrate: (data: CreatureState) => void;
  recordCareDay: () => void;
  refreshShield: () => void;
  setReturnMoment: (moment: ReturnMoment) => void;
  dismissReturnMoment: () => void;
}

function addXpAndLevel(
  currentXp: number,
  currentLevel: number,
  xpGain: number,
) {
  let xp = currentXp + xpGain;
  let level = currentLevel;
  let threshold = level * 50;
  const startLevel = currentLevel;
  while (xp >= threshold) {
    xp -= threshold;
    level += 1;
    threshold = level * 50;
  }
  return { xp, level, growthStage: deriveGrowthStage(level), didLevelUp: level > startLevel };
}

function applyCareAction(
  s: Pick<CreatureStore, "stats" | "xp" | "level">,
  statKey: keyof CreatureStats,
  boost: number,
  xpGain: number,
  actionType: CareAction,
) {
  const stats = { ...s.stats, [statKey]: clampStat(s.stats[statKey] + boost) };
  const { xp, level, growthStage, didLevelUp } = addXpAndLevel(s.xp, s.level, xpGain);
  const now = Date.now();
  return {
    stats,
    xp,
    level,
    growthStage,
    mood: deriveMood(stats),
    lastCareAction: { type: actionType, timestamp: now },
    lastXpGain: { amount: xpGain, timestamp: now },
    ...(didLevelUp ? { lastLevelUp: now } : {}),
  };
}

function applyDecay(stats: CreatureStats, ticks: number) {
  return {
    hunger: clampStat(stats.hunger - DECAY_RATES.hunger * ticks, STAT_FLOOR),
    hydration: clampStat(stats.hydration - DECAY_RATES.hydration * ticks, STAT_FLOOR),
    happiness: clampStat(stats.happiness - DECAY_RATES.happiness * ticks, STAT_FLOOR),
    energy: clampStat(stats.energy - DECAY_RATES.energy * ticks, STAT_FLOOR),
  };
}

function recordCareDay(streak: StreakData): StreakData {
  const today = getLocalDate();
  if (streak.lastCareDate && isToday(streak.lastCareDate)) {
    return streak; // already recorded today
  }
  if (streak.lastCareDate && isYesterday(streak.lastCareDate)) {
    return { ...streak, currentStreak: streak.currentStreak + 1, lastCareDate: today };
  }
  // Gap > 1 day: try shield or reset
  if (streak.shieldAvailable && streak.currentStreak > 0) {
    return {
      ...streak,
      currentStreak: streak.currentStreak + 1,
      lastCareDate: today,
      shieldAvailable: false,
    };
  }
  return { ...streak, currentStreak: 1, lastCareDate: today };
}

function refreshShield(streak: StreakData): StreakData {
  const currentWeek = getISOWeek();
  if (streak.shieldLastGrantedWeek === currentWeek) return streak;
  return { ...streak, shieldAvailable: true, shieldLastGrantedWeek: currentWeek };
}

export const useCreatureStore = create<CreatureStore>()(
  subscribeWithSelector((set) => ({
    stats: { ...DEFAULT_STATS },
    xp: 0,
    level: 1,
    growthStage: "sprout" as GrowthStage,
    mood: "happy" as Mood,
    lastCareAction: null,
    lastSave: Date.now(),
    lastLevelUp: null,
    lastXpGain: null,
    streak: { ...DEFAULT_STREAK },
    returnMoment: null,

    feed: () => set((s) => applyCareAction(s, "hunger", 25, 10, "feed")),
    water: () => set((s) => applyCareAction(s, "hydration", 30, 10, "water")),
    pet: () => set((s) => applyCareAction(s, "happiness", 20, 5, "pet")),
    sunlight: () => set((s) => applyCareAction(s, "energy", 20, 15, "sunlight")),

    addXp: (amount: number) => {
      set((s) => {
        const { xp, level, growthStage, didLevelUp } = addXpAndLevel(s.xp, s.level, amount);
        const now = Date.now();
        return {
          xp,
          level,
          growthStage,
          lastXpGain: { amount, timestamp: now },
          ...(didLevelUp ? { lastLevelUp: now } : {}),
        };
      });
    },

    decayStats: () => {
      set((s) => {
        const stats = applyDecay(s.stats, 1);
        return { stats, mood: deriveMood(stats) };
      });
    },

    applyOfflineDecay: (ticks: number) => {
      set((s) => {
        const stats = applyDecay(s.stats, ticks);
        return { stats, mood: deriveMood(stats) };
      });
    },

    hydrate: (data: CreatureState) => {
      const stats = {
        ...data.stats,
        energy: data.stats.energy ?? DEFAULT_STATS.energy,
      };
      set({
        stats,
        xp: data.xp,
        level: data.level,
        growthStage: deriveGrowthStage(data.level),
        mood: deriveMood(stats),
        lastSave: data.lastSave,
      });
    },

    recordCareDay: () => {
      set((s) => ({ streak: recordCareDay(s.streak) }));
    },

    refreshShield: () => {
      set((s) => ({ streak: refreshShield(s.streak) }));
    },

    setReturnMoment: (moment: ReturnMoment) => {
      set({ returnMoment: moment });
    },

    dismissReturnMoment: () => {
      set({ returnMoment: null });
    },
  })),
);
