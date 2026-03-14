import type { TimeOfDay } from "../types";

/** Returns local date as YYYY-MM-DD string */
export function getLocalDate(date?: Date): string {
  const d = date ?? new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Returns ISO week as YYYY-Www string */
export function getISOWeek(date?: Date): string {
  const d = date ?? new Date();
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number (Mon=1, Sun=7)
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/** Check if dateStr (YYYY-MM-DD) is yesterday relative to refDate */
export function isYesterday(dateStr: string, refDate?: Date): boolean {
  const ref = refDate ?? new Date();
  const yesterday = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - 1);
  return getLocalDate(yesterday) === dateStr;
}

/** Check if dateStr (YYYY-MM-DD) is today relative to refDate */
export function isToday(dateStr: string, refDate?: Date): boolean {
  const ref = refDate ?? new Date();
  return getLocalDate(ref) === dateStr;
}

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
    tint: "oklch(0.94 0.03 75)",
    tintOpacity: 0.08,
    bg: "oklch(0.96 0.025 75)",
    accent: "oklch(0.65 0.11 50)",
    ambient: "oklch(0.91 0.03 75)",
  },
  afternoon: {
    tint: "transparent",
    tintOpacity: 0,
    bg: "oklch(0.95 0.02 80)",
    accent: "oklch(0.62 0.12 45)",
    ambient: "oklch(0.90 0.02 80)",
  },
  evening: {
    tint: "oklch(0.85 0.06 55)",
    tintOpacity: 0.12,
    bg: "oklch(0.90 0.04 55)",
    accent: "oklch(0.60 0.10 45)",
    ambient: "oklch(0.85 0.05 55)",
  },
  night: {
    tint: "oklch(0.25 0.03 40)",
    tintOpacity: 0.2,
    bg: "oklch(0.20 0.02 40)",
    accent: "oklch(0.45 0.08 45)",
    ambient: "oklch(0.25 0.03 40)",
  },
};
