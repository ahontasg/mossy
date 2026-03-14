import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { GameId, GameResult } from "../types";
import {
  GAME_XP,
  GAME_NEW_RECORD_BONUS_XP,
  GAME_STAT_BOOSTS,
} from "../features/games/lib/gameRewards";
import { useCreatureStore } from "./creatureStore";
import { getLocalDate } from "../lib/time";

export type { GameId, GameResult };

export interface PersistedGameData {
  tokens: number;
  highScores: Record<GameId, number>;
  gamesPlayedToday: number;
  lastPlayDate: string | null;
}

interface GameStore {
  tokens: number;
  highScores: Record<GameId, number>;
  gamesPlayedToday: number;
  lastPlayDate: string | null;
  lastGameResult: GameResult | null;

  earnToken: () => void;
  spendToken: () => boolean;
  recordGameResult: (gameId: GameId, score: number) => void;
  hydrate: (data: Partial<PersistedGameData>) => void;
  resetDay: () => void;
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    tokens: 0,
    highScores: { memory: 0, mossy_says: 0 },
    gamesPlayedToday: 0,
    lastPlayDate: null,
    lastGameResult: null,

    earnToken: () => {
      set((s) => ({ tokens: s.tokens + 1 }));
    },

    spendToken: () => {
      const { tokens } = get();
      if (tokens > 0) {
        set({ tokens: tokens - 1 });
        return true;
      }
      return false;
    },

    recordGameResult: (gameId: GameId, score: number) => {
      const state = get();
      const prevHigh = state.highScores[gameId] ?? 0;
      const isNewRecord = score > prevHigh;
      const today = getLocalDate();

      // Update store state
      set({
        highScores: isNewRecord
          ? { ...state.highScores, [gameId]: score }
          : state.highScores,
        lastGameResult: {
          gameId,
          score,
          isNewRecord,
          timestamp: Date.now(),
        },
        gamesPlayedToday: state.gamesPlayedToday + 1,
        lastPlayDate: today,
      });

      // Award XP
      const xp = GAME_XP + (isNewRecord ? GAME_NEW_RECORD_BONUS_XP : 0);
      const creature = useCreatureStore.getState();
      creature.addXp(xp);

      // Apply stat boosts
      for (const [stat, amount] of Object.entries(GAME_STAT_BOOSTS)) {
        creature.focusCare(stat, amount!);
      }

      // Record care day (achievement store subscription handles its own recordCareDay)
      creature.recordCareDay();
    },

    hydrate: (data: Partial<PersistedGameData>) => {
      set({
        tokens: data.tokens ?? 0,
        highScores: data.highScores ?? { memory: 0, mossy_says: 0 },
        gamesPlayedToday: data.gamesPlayedToday ?? 0,
        lastPlayDate: data.lastPlayDate ?? null,
      });
    },

    resetDay: () => {
      set({ gamesPlayedToday: 0 });
    },
  })),
);
