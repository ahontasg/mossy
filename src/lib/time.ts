import type { TimeOfDay } from "../types";

export function getTimeOfDay(hour?: number): TimeOfDay {
  const h = hour ?? new Date().getHours();
  if (h >= 6 && h < 10) return "morning";
  if (h >= 10 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

export interface TimeTheme {
  tint: string;
  tintOpacity: number;
  bg: string;
  accent: string;
  ambient: string;
}

export const TIME_THEMES: Record<TimeOfDay, TimeTheme> = {
  morning: {
    tint: "oklch(0.92 0.04 85)",
    tintOpacity: 0.08,
    bg: "oklch(0.95 0.03 85)",
    accent: "oklch(0.75 0.10 85)",
    ambient: "oklch(0.90 0.05 85)",
  },
  afternoon: {
    tint: "transparent",
    tintOpacity: 0,
    bg: "oklch(0.95 0.03 145)",
    accent: "oklch(0.68 0.14 145)",
    ambient: "oklch(0.90 0.05 145)",
  },
  evening: {
    tint: "oklch(0.80 0.08 40)",
    tintOpacity: 0.12,
    bg: "oklch(0.90 0.04 40)",
    accent: "oklch(0.70 0.10 40)",
    ambient: "oklch(0.85 0.06 40)",
  },
  night: {
    tint: "oklch(0.35 0.06 260)",
    tintOpacity: 0.2,
    bg: "oklch(0.25 0.04 260)",
    accent: "oklch(0.50 0.08 260)",
    ambient: "oklch(0.30 0.05 260)",
  },
};
