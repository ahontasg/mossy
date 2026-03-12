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

export const PARTICLE_CONFIGS: Record<CareAction | "zzz" | "spore", ParticleConfig> = {
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
};
