import type { SpecimenDefinition } from "../../../types";

const _ = null;
const g = "oklch(0.60 0.12 145)"; // green
const dg = "oklch(0.40 0.10 145)"; // dark green
const lg = "oklch(0.78 0.11 145)"; // light green
const bl = "oklch(0.65 0.12 230)"; // blue
const lb = "oklch(0.80 0.08 230)"; // light blue
const pk = "oklch(0.75 0.12 340)"; // pink
const rd = "oklch(0.60 0.16 25)";  // red
const yl = "oklch(0.85 0.14 90)";  // yellow
const or = "oklch(0.75 0.14 60)";  // orange
const br = "oklch(0.50 0.08 55)";  // brown
const pr = "oklch(0.60 0.14 300)"; // purple
const wh = "oklch(0.95 0.01 90)";  // white
const gy = "oklch(0.70 0.02 260)"; // grey
const tl = "oklch(0.70 0.12 175)"; // teal
const gd = "oklch(0.80 0.14 85)";  // gold
const ic = "oklch(0.88 0.04 240)"; // icy blue
const lv = "oklch(0.68 0.10 310)"; // lavender

export const SPECIMENS: SpecimenDefinition[] = [
  // ── COMMON (21) ──
  {
    id: "tiny_pebble",
    name: "Tiny Pebble",
    description: "A smooth little stone that somehow rolled into the pot.",
    rarity: "common",
    pattern: [[_, gy, _], [gy, gy, gy], [_, gy, _]],
    conditions: [{ type: "random" }],
  },
  {
    id: "morning_dewdrop",
    name: "Morning Dewdrop",
    description: "A perfect sphere of dew, caught in early light.",
    rarity: "common",
    pattern: [[_, lb, _], [lb, bl, lb], [_, lb, _]],
    conditions: [{ type: "time_of_day", key: "morning" }],
  },
  {
    id: "clover_leaf",
    name: "Clover Leaf",
    description: "A small three-leaf clover. Lucky, maybe?",
    rarity: "common",
    pattern: [[_, g, _], [g, dg, g], [_, dg, _]],
    conditions: [{ type: "min_stat", key: "happiness", value: 50 }],
  },
  {
    id: "tiny_mushroom",
    name: "Tiny Mushroom",
    description: "A wee mushroom cap, sprouted overnight.",
    rarity: "common",
    pattern: [[_, br, _], [br, wh, br], [_, wh, _]],
    conditions: [{ type: "min_stat", key: "hydration", value: 60 }],
  },
  {
    id: "moss_ball",
    name: "Moss Ball",
    description: "A perfectly round ball of soft moss.",
    rarity: "common",
    pattern: [[_, g, _], [g, lg, g], [_, g, _]],
    conditions: [{ type: "min_level", value: 2 }],
  },
  {
    id: "dandelion_seed",
    name: "Dandelion Seed",
    description: "A fluffy seed, ready to drift on the wind.",
    rarity: "common",
    pattern: [[wh, _, wh], [_, wh, _], [_, gy, _]],
    conditions: [{ type: "season", key: "spring" }],
  },
  {
    id: "earthworm",
    name: "Earthworm",
    description: "A friendly worm wriggling through the soil.",
    rarity: "common",
    pattern: [[pk, _, _], [_, pk, _], [_, _, pk]],
    conditions: [{ type: "min_stat", key: "hunger", value: 50 }],
  },
  {
    id: "ladybug",
    name: "Ladybug",
    description: "A tiny red beetle with black spots.",
    rarity: "common",
    pattern: [[_, rd, _], [rd, dg, rd], [_, rd, _]],
    conditions: [{ type: "season", key: "summer" }],
  },
  {
    id: "acorn",
    name: "Acorn",
    description: "A small acorn, fallen from a nearby oak.",
    rarity: "common",
    pattern: [[_, br, _], [br, or, br], [_, or, _]],
    conditions: [{ type: "season", key: "autumn" }],
  },
  {
    id: "icicle_shard",
    name: "Icicle Shard",
    description: "A tiny sliver of ice, slowly melting.",
    rarity: "common",
    pattern: [[_, ic, _], [_, ic, _], [_, lb, _]],
    conditions: [{ type: "season", key: "winter" }],
  },
  {
    id: "sunset_petal",
    name: "Sunset Petal",
    description: "A warm-hued petal, caught on the evening breeze.",
    rarity: "common",
    pattern: [[_, or, _], [or, yl, or], [_, _, _]],
    conditions: [{ type: "time_of_day", key: "evening" }],
  },
  {
    id: "snail_shell",
    name: "Snail Shell",
    description: "An abandoned spiral shell, wonderfully patterned.",
    rarity: "common",
    pattern: [[_, br, _], [br, yl, br], [br, br, _]],
    conditions: [{ type: "min_level", value: 3 }],
  },
  {
    id: "pine_needle",
    name: "Pine Needle",
    description: "A single fragrant pine needle.",
    rarity: "common",
    pattern: [[_, _, _], [dg, dg, dg], [_, _, _]],
    conditions: [{ type: "random" }],
  },
  {
    id: "rain_droplet",
    name: "Rain Droplet",
    description: "A lingering raindrop that refuses to evaporate.",
    rarity: "common",
    pattern: [[_, bl, _], [bl, lb, bl], [_, _, _]],
    conditions: [{ type: "min_stat", key: "hydration", value: 70 }],
  },
  {
    id: "tiny_feather",
    name: "Tiny Feather",
    description: "A small, downy feather that floated down softly.",
    rarity: "common",
    pattern: [[_, wh, _], [wh, gy, _], [_, wh, _]],
    conditions: [{ type: "time_of_day", key: "afternoon" }],
  },
  {
    id: "berry_seed",
    name: "Berry Seed",
    description: "A dark seed from some wild berry.",
    rarity: "common",
    pattern: [[_, _, _], [_, pr, _], [_, _, _]],
    conditions: [{ type: "min_stat", key: "hunger", value: 60 }],
  },
  {
    id: "lichen_patch",
    name: "Lichen Patch",
    description: "A colorful crust of lichen, very slowly growing.",
    rarity: "common",
    pattern: [[lg, g, _], [g, dg, lg], [_, lg, _]],
    conditions: [{ type: "growth_stage", key: "young" }],
  },
  {
    id: "crystal_grain",
    name: "Crystal Grain",
    description: "A sparkling grain of quartz, catching the light.",
    rarity: "common",
    pattern: [[_, wh, _], [wh, wh, wh], [_, wh, _]],
    conditions: [{ type: "min_stat", key: "energy", value: 60 }],
  },
  {
    id: "fallen_bark",
    name: "Fallen Bark",
    description: "A small piece of tree bark, rough and textured.",
    rarity: "common",
    pattern: [[br, br, _], [_, br, br], [br, _, _]],
    conditions: [{ type: "streak", value: 2 }],
  },
  {
    id: "pollen_dust",
    name: "Pollen Dust",
    description: "A dusting of golden pollen, sneeze-worthy.",
    rarity: "common",
    pattern: [[yl, _, yl], [_, yl, _], [yl, _, yl]],
    conditions: [{ type: "season", key: "spring" }],
  },
  {
    id: "afternoon_shadow",
    name: "Afternoon Shadow",
    description: "A shadow that lingers just a bit too long.",
    rarity: "common",
    pattern: [[_, _, gy], [_, gy, _], [gy, _, _]],
    conditions: [{ type: "time_of_day", key: "afternoon" }],
  },

  // ── UNCOMMON (6) ──
  {
    id: "four_leaf_clover",
    name: "Four-Leaf Clover",
    description: "Extraordinarily lucky! Someone should make a wish.",
    rarity: "uncommon",
    pattern: [[_, g, _], [g, g, g], [_, g, _], [_, dg, _]],
    conditions: [{ type: "streak", value: 7 }],
  },
  {
    id: "blue_butterfly",
    name: "Blue Butterfly",
    description: "A delicate blue butterfly, resting momentarily.",
    rarity: "uncommon",
    pattern: [[bl, _, bl], [lb, bl, lb], [_, _, _]],
    conditions: [{ type: "min_avg_stats", value: 60 }, { type: "season", key: "summer" }],
  },
  {
    id: "golden_beetle",
    name: "Golden Beetle",
    description: "A tiny beetle with an iridescent golden shell.",
    rarity: "uncommon",
    pattern: [[_, gd, _], [gd, yl, gd], [_, gd, _]],
    conditions: [{ type: "min_level", value: 5 }, { type: "min_stat", key: "energy", value: 70 }],
  },
  {
    id: "moonstone_chip",
    name: "Moonstone Chip",
    description: "A fragment of moonstone, glowing faintly.",
    rarity: "uncommon",
    pattern: [[_, lb, _], [lb, wh, lb], [_, lb, _]],
    conditions: [{ type: "time_of_day", key: "night" }],
  },
  {
    id: "lavender_sprig",
    name: "Lavender Sprig",
    description: "A fragrant sprig of wild lavender.",
    rarity: "uncommon",
    pattern: [[lv, _, lv], [_, lv, _], [_, dg, _]],
    conditions: [{ type: "min_avg_stats", value: 65 }, { type: "time_of_day", key: "evening" }],
  },
  {
    id: "frost_fern",
    name: "Frost Fern",
    description: "A tiny fern made entirely of frost crystals.",
    rarity: "uncommon",
    pattern: [[_, ic, _], [ic, wh, ic], [ic, _, ic]],
    conditions: [{ type: "season", key: "winter" }, { type: "min_stat", key: "hydration", value: 70 }],
  },

  // ── RARE (3) ──
  {
    id: "firefly",
    name: "Firefly",
    description: "A glowing firefly, pulsing with warm light in the darkness.",
    rarity: "rare",
    pattern: [
      [_, _, _, _],
      [_, yl, gd, _],
      [_, gd, yl, _],
      [_, _, _, _],
    ],
    conditions: [{ type: "time_of_day", key: "night" }, { type: "min_avg_stats", value: 70 }],
  },
  {
    id: "frost_crystal",
    name: "Frost Crystal",
    description: "A perfectly formed ice crystal, delicate and intricate.",
    rarity: "rare",
    pattern: [
      [_, ic, _, ic, _],
      [ic, _, ic, _, ic],
      [_, ic, wh, ic, _],
      [ic, _, ic, _, ic],
      [_, ic, _, ic, _],
    ],
    conditions: [{ type: "season", key: "winter" }, { type: "min_stat", key: "hydration", value: 80 }],
    season: "winter",
  },
  {
    id: "ancient_amber",
    name: "Ancient Amber",
    description: "A droplet of tree resin, hardened over millenia. Something tiny is trapped inside.",
    rarity: "rare",
    pattern: [
      [_, or, or, _],
      [or, gd, gd, or],
      [or, gd, br, or],
      [_, or, or, _],
    ],
    conditions: [{ type: "min_level", value: 8 }, { type: "season", key: "autumn" }],
    season: "autumn",
  },

  // ── LEGENDARY (2) ──
  {
    id: "ghost_mushroom",
    name: "Ghost Mushroom",
    description: "A translucent mushroom that glows with an eerie bioluminescence. Exceedingly rare.",
    rarity: "legendary",
    pattern: [
      [_, _, wh, wh, _, _],
      [_, wh, lb, lb, wh, _],
      [wh, lb, wh, wh, lb, wh],
      [_, _, wh, wh, _, _],
      [_, _, gy, gy, _, _],
      [_, _, gy, gy, _, _],
    ],
    conditions: [
      { type: "time_of_day", key: "night" },
      { type: "min_level", value: 10 },
      { type: "min_avg_stats", value: 80 },
    ],
  },
  {
    id: "aurora_moss",
    name: "Aurora Moss",
    description: "A patch of moss that shimmers with all the colors of the northern lights. A living wonder.",
    rarity: "legendary",
    pattern: [
      [_, tl, _, pr, _, _],
      [tl, g, tl, lv, pr, _],
      [_, tl, g, tl, lv, pr],
      [_, _, tl, g, tl, _],
      [_, _, _, tl, _, _],
    ],
    conditions: [
      { type: "min_level", value: 15 },
      { type: "streak", value: 14 },
      { type: "min_avg_stats", value: 75 },
    ],
  },
];

export const SPECIMEN_MAP = new Map(SPECIMENS.map((s) => [s.id, s]));
