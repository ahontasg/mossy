import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type {
  CareAction,
  CreatureStats,
  CreatureState,
  GrowthStage,
  Mood,
} from "../types";

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

interface CreatureStore {
  stats: CreatureStats;
  xp: number;
  level: number;
  growthStage: GrowthStage;
  mood: Mood;
  lastCareAction: { type: CareAction; timestamp: number } | null;
  lastSave: number;

  feed: () => void;
  water: () => void;
  pet: () => void;
  sunlight: () => void;
  addXp: (amount: number) => void;
  decayStats: () => void;
  applyOfflineDecay: (ticks: number) => void;
  hydrate: (data: CreatureState) => void;
}

function addXpAndLevel(
  currentXp: number,
  currentLevel: number,
  xpGain: number,
) {
  let xp = currentXp + xpGain;
  let level = currentLevel;
  let threshold = level * 50;
  while (xp >= threshold) {
    xp -= threshold;
    level += 1;
    threshold = level * 50;
  }
  return { xp, level, growthStage: deriveGrowthStage(level) };
}

function applyCareAction(
  s: Pick<CreatureStore, "stats" | "xp" | "level">,
  statKey: keyof CreatureStats,
  boost: number,
  xpGain: number,
  actionType: CareAction,
) {
  const stats = { ...s.stats, [statKey]: clampStat(s.stats[statKey] + boost) };
  const { xp, level, growthStage } = addXpAndLevel(s.xp, s.level, xpGain);
  return {
    stats,
    xp,
    level,
    growthStage,
    mood: deriveMood(stats),
    lastCareAction: { type: actionType, timestamp: Date.now() },
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

export const useCreatureStore = create<CreatureStore>()(
  subscribeWithSelector((set) => ({
    stats: { ...DEFAULT_STATS },
    xp: 0,
    level: 1,
    growthStage: "sprout" as GrowthStage,
    mood: "happy" as Mood,
    lastCareAction: null,
    lastSave: Date.now(),

    feed: () => set((s) => applyCareAction(s, "hunger", 25, 10, "feed")),
    water: () => set((s) => applyCareAction(s, "hydration", 30, 10, "water")),
    pet: () => set((s) => applyCareAction(s, "happiness", 20, 5, "pet")),
    sunlight: () => set((s) => applyCareAction(s, "energy", 20, 15, "sunlight")),

    addXp: (amount: number) => {
      set((s) => {
        const { xp, level, growthStage } = addXpAndLevel(s.xp, s.level, amount);
        return { xp, level, growthStage };
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
  })),
);
