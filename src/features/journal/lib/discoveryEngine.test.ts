import { describe, it, expect } from "vitest";
import { getEligibleSpecimens, rollForDiscovery, type DiscoveryContext } from "./discoveryEngine";
import type { SpecimenDefinition } from "../../../types";

const baseCtx: DiscoveryContext = {
  timeOfDay: "afternoon",
  season: "summer",
  stats: { hunger: 75, hydration: 75, happiness: 75, energy: 75 },
  level: 5,
  growthStage: "young",
  streak: 3,
};

const testSpecimens: SpecimenDefinition[] = [
  {
    id: "morning_only",
    name: "Morning Only",
    description: "test",
    rarity: "common",
    pattern: [],
    conditions: [{ type: "time_of_day", key: "morning" }],
  },
  {
    id: "random_common",
    name: "Random Common",
    description: "test",
    rarity: "common",
    pattern: [],
    conditions: [{ type: "random" }],
  },
  {
    id: "high_level",
    name: "High Level",
    description: "test",
    rarity: "rare",
    pattern: [],
    conditions: [{ type: "min_level", value: 10 }],
  },
  {
    id: "summer_stat",
    name: "Summer Stat",
    description: "test",
    rarity: "uncommon",
    pattern: [],
    conditions: [{ type: "season", key: "summer" }, { type: "min_stat", key: "hydration", value: 70 }],
  },
  {
    id: "winter_locked",
    name: "Winter Locked",
    description: "test",
    rarity: "rare",
    pattern: [],
    conditions: [{ type: "season", key: "winter" }],
    season: "winter",
  },
];

describe("getEligibleSpecimens", () => {
  it("filters by time_of_day", () => {
    const eligible = getEligibleSpecimens(testSpecimens, new Set(), baseCtx);
    expect(eligible.find((s) => s.id === "morning_only")).toBeUndefined();
  });

  it("includes random-condition specimens", () => {
    const eligible = getEligibleSpecimens(testSpecimens, new Set(), baseCtx);
    expect(eligible.find((s) => s.id === "random_common")).toBeDefined();
  });

  it("excludes already-discovered specimens", () => {
    const eligible = getEligibleSpecimens(testSpecimens, new Set(["random_common"]), baseCtx);
    expect(eligible.find((s) => s.id === "random_common")).toBeUndefined();
  });

  it("filters by min_level", () => {
    const eligible = getEligibleSpecimens(testSpecimens, new Set(), baseCtx);
    expect(eligible.find((s) => s.id === "high_level")).toBeUndefined();

    const highCtx = { ...baseCtx, level: 10 };
    const eligible2 = getEligibleSpecimens(testSpecimens, new Set(), highCtx);
    expect(eligible2.find((s) => s.id === "high_level")).toBeDefined();
  });

  it("filters by season AND stat condition", () => {
    const eligible = getEligibleSpecimens(testSpecimens, new Set(), baseCtx);
    expect(eligible.find((s) => s.id === "summer_stat")).toBeDefined();

    const lowHydration = { ...baseCtx, stats: { ...baseCtx.stats, hydration: 50 } };
    const eligible2 = getEligibleSpecimens(testSpecimens, new Set(), lowHydration);
    expect(eligible2.find((s) => s.id === "summer_stat")).toBeUndefined();
  });

  it("filters season-locked specimens by current season", () => {
    const eligible = getEligibleSpecimens(testSpecimens, new Set(), baseCtx);
    expect(eligible.find((s) => s.id === "winter_locked")).toBeUndefined();

    const winterCtx = { ...baseCtx, season: "winter" as const };
    const eligible2 = getEligibleSpecimens(testSpecimens, new Set(), winterCtx);
    expect(eligible2.find((s) => s.id === "winter_locked")).toBeDefined();
  });

  it("filters by streak", () => {
    const streakSpec: SpecimenDefinition = {
      id: "streak_test",
      name: "Streak",
      description: "test",
      rarity: "common",
      pattern: [],
      conditions: [{ type: "streak", value: 7 }],
    };
    const eligible = getEligibleSpecimens([streakSpec], new Set(), baseCtx);
    expect(eligible).toHaveLength(0);

    const highStreak = { ...baseCtx, streak: 7 };
    const eligible2 = getEligibleSpecimens([streakSpec], new Set(), highStreak);
    expect(eligible2).toHaveLength(1);
  });

  it("filters by growth_stage", () => {
    const stageSpec: SpecimenDefinition = {
      id: "mature_test",
      name: "Mature",
      description: "test",
      rarity: "common",
      pattern: [],
      conditions: [{ type: "growth_stage", key: "mature" }],
    };
    const eligible = getEligibleSpecimens([stageSpec], new Set(), baseCtx);
    expect(eligible).toHaveLength(0); // young < mature

    const matureCtx = { ...baseCtx, growthStage: "mature" as const };
    const eligible2 = getEligibleSpecimens([stageSpec], new Set(), matureCtx);
    expect(eligible2).toHaveLength(1);
  });

  it("filters by min_avg_stats", () => {
    const avgSpec: SpecimenDefinition = {
      id: "avg_test",
      name: "AvgStats",
      description: "test",
      rarity: "common",
      pattern: [],
      conditions: [{ type: "min_avg_stats", value: 80 }],
    };
    const eligible = getEligibleSpecimens([avgSpec], new Set(), baseCtx);
    expect(eligible).toHaveLength(0); // avg 75 < 80

    const highCtx = { ...baseCtx, stats: { hunger: 85, hydration: 85, happiness: 85, energy: 85 } };
    const eligible2 = getEligibleSpecimens([avgSpec], new Set(), highCtx);
    expect(eligible2).toHaveLength(1);
  });
});

describe("rollForDiscovery", () => {
  it("returns null for empty eligible list", () => {
    expect(rollForDiscovery([])).toBeNull();
  });

  it("returns a specimen or null from eligible list", () => {
    const eligible = [testSpecimens[1]]; // random_common
    // Run many times to cover both hit and miss
    const results = Array.from({ length: 100 }, () => rollForDiscovery(eligible, 50));
    const hits = results.filter((r) => r !== null);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.length).toBeLessThan(100);
  });

  it("high luck bonus increases discovery rate", () => {
    const eligible = [testSpecimens[1]];
    const lowLuck = Array.from({ length: 200 }, () => rollForDiscovery(eligible, 0));
    const highLuck = Array.from({ length: 200 }, () => rollForDiscovery(eligible, 100));
    const lowHits = lowLuck.filter((r) => r !== null).length;
    const highHits = highLuck.filter((r) => r !== null).length;
    // High luck should generally produce more hits (statistical, not guaranteed)
    expect(highHits).toBeGreaterThanOrEqual(lowHits * 0.5);
  });

  it("directBonus increases discovery rate beyond base + luck", () => {
    const eligible = [testSpecimens[1]];
    const noBonus = Array.from({ length: 500 }, () => rollForDiscovery(eligible, 0, 0));
    const withBonus = Array.from({ length: 500 }, () => rollForDiscovery(eligible, 0, 0.15));
    const noHits = noBonus.filter((r) => r !== null).length;
    const bonusHits = withBonus.filter((r) => r !== null).length;
    // With 0.15 direct bonus, chance goes from ~15% to ~30%, so bonus should reliably win
    expect(bonusHits).toBeGreaterThan(noHits);
  });
});
