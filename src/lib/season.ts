import type { Season } from "../types";

/** Returns season based on month (Northern hemisphere) */
export function getSeason(date?: Date): Season {
  const month = (date ?? new Date()).getMonth(); // 0-11
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}
