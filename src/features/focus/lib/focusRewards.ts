import type { CreatureStats } from "../../../types";

/** XP awarded for completing a focus session. */
export const FOCUS_SESSION_XP = 30;

/** Stat boosts on focus session completion. */
export const FOCUS_STAT_BOOSTS: Partial<Record<keyof CreatureStats, number>> = {
  energy: 27,
  hunger: 12,
};

/** Stat boosts on break completion (taking a break on time). */
export const BREAK_STAT_BOOSTS: Partial<Record<keyof CreatureStats, number>> = {
  hydration: 22,
  hunger: 12,
};

/** Stat boosts on chat interaction. */
export const CHAT_STAT_BOOSTS: Partial<Record<keyof CreatureStats, number>> = {
  happiness: 10,
};

/** Luck bonus for specimen discovery after focus session (0-1 scale, added to base roll). */
export const FOCUS_DISCOVERY_LUCK_BONUS = 0.15;

/** Decay rate multiplier during active focus (0.5 = half speed). */
export const FOCUS_DECAY_MULTIPLIER = 0.5;
