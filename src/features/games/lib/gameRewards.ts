import type { CreatureStats } from "../../../types";

/** XP awarded for completing a game. */
export const GAME_XP = 15;

/** Bonus XP for setting a new high score. */
export const GAME_NEW_RECORD_BONUS_XP = 10;

/** Stat boosts applied when a game is completed. */
export const GAME_STAT_BOOSTS: Partial<Record<keyof CreatureStats, number>> = {
  happiness: 15,
  hunger: 10,
};

/** Minimum discovered specimens needed to play Memory Match (6 pairs = 12 cards). */
export const MIN_SPECIMENS_FOR_MEMORY = 6;
