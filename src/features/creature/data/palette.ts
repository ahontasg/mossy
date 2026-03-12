/** Pixel art color palette — flat fills only, no gradients */
export const PALETTE = {
  moss900: "oklch(0.26 0.06 145)",
  moss700: "oklch(0.40 0.10 145)",
  moss500: "oklch(0.58 0.14 145)",
  moss400: "oklch(0.68 0.14 145)",
  moss300: "oklch(0.78 0.11 145)",
  moss200: "oklch(0.87 0.07 145)",
  soil: "#8B6914",
  pot: "#A0785A",
  potDark: "#876548",
  white: "#FFFFFF",
  transparent: null,
} as const;

export type PaletteKey = keyof typeof PALETTE;
