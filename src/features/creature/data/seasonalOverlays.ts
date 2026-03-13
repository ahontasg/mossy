import type { Season } from "../../../types";
import type { Frame } from "./frames";

function emptyFrame(): Frame {
  return Array.from({ length: 16 }, () => Array(16).fill(null) as (string | null)[]);
}

function makeOverlay(pixels: [number, number, string][]): Frame {
  const frame = emptyFrame();
  for (const [row, col, color] of pixels) {
    frame[row][col] = color;
  }
  return frame;
}

const pink = "oklch(0.82 0.10 340)";
const yellow = "oklch(0.85 0.12 90)";
const bloom = "oklch(0.78 0.12 330)";
const amber = "oklch(0.68 0.10 55)";
const brown = "oklch(0.55 0.06 50)";
const ice = "oklch(0.88 0.04 240)";

export const SEASONAL_OVERLAYS: Record<Season, Frame> = {
  spring: makeOverlay([
    // Flower buds on canopy
    [1, 8, pink],
    [2, 10, yellow],
    [1, 11, pink],
  ]),
  summer: makeOverlay([
    // Full blooms — brighter, more pixels
    [1, 7, bloom],
    [1, 8, pink],
    [0, 8, yellow],
    [1, 11, bloom],
    [2, 11, pink],
    [2, 12, yellow],
  ]),
  autumn: makeOverlay([
    // Amber/brown hanging leaves
    [1, 3, amber],
    [2, 2, brown],
    [1, 12, amber],
    [2, 13, brown],
    [0, 9, amber],
  ]),
  winter: makeOverlay([
    // Frost crystals on edges
    [3, 3, ice],
    [4, 2, ice],
    [3, 11, ice],
    [4, 12, ice],
    [5, 13, ice],
  ]),
};
