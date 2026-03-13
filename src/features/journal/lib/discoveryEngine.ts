import type {
  SpecimenDefinition,
  SpecimenRarity,
  DiscoveryCondition,
  CreatureStats,
  TimeOfDay,
  Season,
  GrowthStage,
} from "../../../types";

export interface DiscoveryContext {
  timeOfDay: TimeOfDay;
  season: Season;
  stats: CreatureStats;
  level: number;
  growthStage: GrowthStage;
  streak: number;
}

const GROWTH_ORDER: GrowthStage[] = ["sprout", "young", "mature", "elder"];

function meetsCondition(cond: DiscoveryCondition, ctx: DiscoveryContext): boolean {
  switch (cond.type) {
    case "time_of_day":
      return ctx.timeOfDay === cond.key;
    case "season":
      return ctx.season === cond.key;
    case "min_stat":
      return ctx.stats[cond.key as keyof CreatureStats] >= (cond.value ?? 0);
    case "min_avg_stats": {
      const avg =
        (ctx.stats.hunger + ctx.stats.hydration + ctx.stats.happiness + ctx.stats.energy) / 4;
      return avg >= (cond.value ?? 0);
    }
    case "min_level":
      return ctx.level >= (cond.value ?? 0);
    case "growth_stage":
      return GROWTH_ORDER.indexOf(ctx.growthStage) >= GROWTH_ORDER.indexOf(cond.key as GrowthStage);
    case "streak":
      return ctx.streak >= (cond.value ?? 0);
    case "random":
      return true; // always eligible
    default:
      return false;
  }
}

export function getEligibleSpecimens(
  specimens: SpecimenDefinition[],
  discoveredIds: Set<string>,
  ctx: DiscoveryContext,
): SpecimenDefinition[] {
  return specimens.filter((s) => {
    if (discoveredIds.has(s.id)) return false;
    if (s.season && s.season !== ctx.season) return false;
    return s.conditions.every((c) => meetsCondition(c, ctx));
  });
}

const RARITY_WEIGHTS: Record<SpecimenRarity, number> = {
  common: 70,
  uncommon: 20,
  rare: 8,
  legendary: 2,
};

export function rollForDiscovery(
  eligible: SpecimenDefinition[],
  luckBonus: number = 0,
  directBonus: number = 0,
): SpecimenDefinition | null {
  if (eligible.length === 0) return null;

  // Base 15% chance + luck bonus (0-10% from avg stats / 10) + direct bonus (e.g. focus boost)
  const rollChance = 0.15 + Math.min(0.10, luckBonus / 100) + directBonus;
  if (Math.random() > rollChance) return null;

  // Build weighted pool from eligible specimens
  const weighted: { specimen: SpecimenDefinition; weight: number }[] = eligible.map((s) => ({
    specimen: s,
    weight: RARITY_WEIGHTS[s.rarity],
  }));

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) return entry.specimen;
  }

  return weighted[weighted.length - 1].specimen;
}
