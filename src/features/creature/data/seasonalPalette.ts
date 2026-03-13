import type { Season } from "../../../types";

/** Per-season color remapping: original oklch color → seasonal replacement */
export const SEASON_COLOR_MAP: Record<Season, Map<string, string>> = {
  spring: new Map([
    // Brighter greens
    ["oklch(0.58 0.14 145)", "oklch(0.62 0.16 140)"],
    ["oklch(0.68 0.14 145)", "oklch(0.72 0.15 140)"],
    ["oklch(0.78 0.11 145)", "oklch(0.82 0.12 138)"],
  ]),
  summer: new Map([
    // More saturated
    ["oklch(0.58 0.14 145)", "oklch(0.60 0.17 145)"],
    ["oklch(0.68 0.14 145)", "oklch(0.70 0.17 145)"],
    ["oklch(0.78 0.11 145)", "oklch(0.80 0.14 145)"],
  ]),
  autumn: new Map([
    // Shift toward amber/brown
    ["oklch(0.58 0.14 145)", "oklch(0.55 0.12 100)"],
    ["oklch(0.68 0.14 145)", "oklch(0.65 0.12 90)"],
    ["oklch(0.78 0.11 145)", "oklch(0.75 0.10 85)"],
    ["oklch(0.87 0.07 145)", "oklch(0.84 0.07 80)"],
  ]),
  winter: new Map([
    // Muted, desaturated, icy hints
    ["oklch(0.58 0.14 145)", "oklch(0.56 0.06 170)"],
    ["oklch(0.68 0.14 145)", "oklch(0.66 0.06 180)"],
    ["oklch(0.78 0.11 145)", "oklch(0.78 0.05 200)"],
    ["oklch(0.87 0.07 145)", "oklch(0.88 0.03 220)"],
  ]),
};
