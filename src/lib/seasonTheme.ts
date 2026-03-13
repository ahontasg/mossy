import type { Season } from "../types";

/** Per-season CSS custom property overrides applied after time-of-day theme */
export const SEASON_CSS: Record<Season, Record<string, string>> = {
  spring: {
    "--season-tint": "oklch(0.88 0.06 340)",
    "--season-tint-opacity": "0.06",
  },
  summer: {
    "--season-tint": "oklch(0.90 0.06 90)",
    "--season-tint-opacity": "0.05",
  },
  autumn: {
    "--season-tint": "oklch(0.80 0.08 55)",
    "--season-tint-opacity": "0.08",
  },
  winter: {
    "--season-tint": "oklch(0.75 0.04 240)",
    "--season-tint-opacity": "0.10",
  },
};

export function applySeasonCSS(season: Season) {
  const root = document.documentElement;
  const props = SEASON_CSS[season];
  for (const [key, value] of Object.entries(props)) {
    root.style.setProperty(key, value);
  }
}
