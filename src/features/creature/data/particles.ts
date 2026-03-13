import type { CareAction } from "../../../types";

export type PixelColor = string | null;

/** A particle's pixel pattern — small grid of colors */
export type ParticlePattern = PixelColor[][];

export interface ParticleConfig {
  pattern: ParticlePattern;
  count: number;
  ttl: number; // ticks
  dx: number; // cells per tick
  dy: number; // cells per tick (negative = up)
  spread: number; // horizontal spawn range in cells
  startRow: number; // spawn row
}

// Water: single blue pixel, falls down
const waterPattern: ParticlePattern = [["oklch(0.65 0.12 230)"]];

// Sparkle: cross pattern, gold
const sparkleColor = "oklch(0.85 0.14 90)";
const sparklePattern: ParticlePattern = [
  [null, sparkleColor, null],
  [sparkleColor, sparkleColor, sparkleColor],
  [null, sparkleColor, null],
];

// Heart: 3x3 pixel heart, pink
const heartColor = "oklch(0.75 0.15 350)";
const heartPattern: ParticlePattern = [
  [heartColor, null, heartColor],
  [heartColor, heartColor, heartColor],
  [null, heartColor, null],
];

// Sunray: single yellow pixel, descends
const sunrayPattern: ParticlePattern = [["oklch(0.85 0.14 90)"]];

// Spore: single dim green pixel, slow upward drift
const sporePattern: ParticlePattern = [["oklch(0.55 0.08 145)"]];

// ZZZ: 3x3 Z shape, grey
const zzzColor = "oklch(0.70 0.02 260)";
const zzzPattern: ParticlePattern = [
  [zzzColor, zzzColor, zzzColor],
  [null, zzzColor, null],
  [zzzColor, zzzColor, zzzColor],
];

// Level-up sparkle: bright gold/white, all directions
const levelupColor = "oklch(0.92 0.12 90)";
const levelupPattern: ParticlePattern = [
  [null, levelupColor, null],
  [levelupColor, "oklch(0.95 0.02 90)", levelupColor],
  [null, levelupColor, null],
];

export type ParticleType = CareAction | "zzz" | "spore" | "levelup" | "discovery" | "petal" | "firefly" | "leaf" | "snowflake";

export const PARTICLE_CONFIGS: Record<ParticleType, ParticleConfig> = {
  feed: {
    pattern: sparklePattern,
    count: 4,
    ttl: 8,
    dx: 0,
    dy: -1,
    spread: 4,
    startRow: 3,
  },
  water: {
    pattern: waterPattern,
    count: 6,
    ttl: 10,
    dx: 0,
    dy: 1,
    spread: 6,
    startRow: 1,
  },
  pet: {
    pattern: heartPattern,
    count: 3,
    ttl: 8,
    dx: 0,
    dy: -1,
    spread: 3,
    startRow: 3,
  },
  sunlight: {
    pattern: sunrayPattern,
    count: 4,
    ttl: 8,
    dx: 0,
    dy: 1,
    spread: 8,
    startRow: 0,
  },
  zzz: {
    pattern: zzzPattern,
    count: 3,
    ttl: 10,
    dx: 1,
    dy: -1,
    spread: 2,
    startRow: 3,
  },
  spore: {
    pattern: sporePattern,
    count: 2,
    ttl: 16,
    dx: 0,
    dy: -0.5,
    spread: 6,
    startRow: 5,
  },
  levelup: {
    pattern: levelupPattern,
    count: 8,
    ttl: 6,
    dx: 0,
    dy: -1.5,
    spread: 8,
    startRow: 4,
  },
  discovery: {
    pattern: [
      [null, "oklch(0.80 0.14 175)", null],
      ["oklch(0.80 0.14 175)", "oklch(0.90 0.08 175)", "oklch(0.80 0.14 175)"],
      [null, "oklch(0.80 0.14 175)", null],
    ],
    count: 6,
    ttl: 8,
    dx: 0,
    dy: -1.2,
    spread: 8,
    startRow: 4,
  },
  petal: {
    pattern: [["oklch(0.82 0.10 340)"]],
    count: 1,
    ttl: 18,
    dx: 0.3,
    dy: -0.3,
    spread: 10,
    startRow: 12,
  },
  firefly: {
    pattern: [["oklch(0.88 0.12 85)"]],
    count: 1,
    ttl: 24,
    dx: 0.2,
    dy: -0.15,
    spread: 12,
    startRow: 8,
  },
  leaf: {
    pattern: [
      ["oklch(0.70 0.10 60)", null],
      [null, "oklch(0.65 0.08 55)"],
    ],
    count: 1,
    ttl: 16,
    dx: 0.4,
    dy: 0.5,
    spread: 10,
    startRow: 1,
  },
  snowflake: {
    pattern: [
      [null, "oklch(0.92 0.02 240)", null],
      ["oklch(0.92 0.02 240)", "oklch(0.95 0.01 240)", "oklch(0.92 0.02 240)"],
      [null, "oklch(0.92 0.02 240)", null],
    ],
    count: 1,
    ttl: 20,
    dx: -0.1,
    dy: 0.4,
    spread: 12,
    startRow: 0,
  },
};
