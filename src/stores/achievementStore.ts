import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { CareAction, CareHistoryEntry, UnlockedAchievement } from "../types";
import { getLocalDate } from "../lib/time";

const MAX_HISTORY_DAYS = 120;

export interface PersistedAchievementData {
  unlocked: UnlockedAchievement[];
  totalFocusSessions: number;
  totalChats: number;
  careHistory: CareHistoryEntry[];
}

interface AchievementStore {
  unlocked: UnlockedAchievement[];
  totalFocusSessions: number;
  totalChats: number;
  careHistory: CareHistoryEntry[];
  lastUnlock: UnlockedAchievement | null;

  recordFocusSession: () => void;
  recordChat: () => void;
  recordCareDay: (action: CareAction) => void;
  unlock: (id: string) => void;
  hydrate: (data: PersistedAchievementData) => void;
  getUnlockedIds: () => Set<string>;
}

export const useAchievementStore = create<AchievementStore>()(
  subscribeWithSelector((set, get) => ({
    unlocked: [],
    totalFocusSessions: 0,
    totalChats: 0,
    careHistory: [],
    lastUnlock: null,

    recordFocusSession: () => {
      set((s) => {
        const today = getLocalDate();
        let history = [...s.careHistory];
        const todayEntry = history.find((e) => e.date === today);
        if (todayEntry) {
          history = history.map((e) =>
            e.date === today ? { ...e, actions: [...e.actions, "focus_complete" as CareAction] } : e,
          );
        } else {
          history = [...history, { date: today, actions: ["focus_complete" as CareAction] }];
        }
        if (history.length > MAX_HISTORY_DAYS) {
          history = history.slice(history.length - MAX_HISTORY_DAYS);
        }
        return {
          totalFocusSessions: s.totalFocusSessions + 1,
          careHistory: history,
        };
      });
    },

    recordChat: () => {
      set((s) => ({ totalChats: s.totalChats + 1 }));
    },

    recordCareDay: (action: CareAction) => {
      set((s) => {
        const today = getLocalDate();
        let history = [...s.careHistory];
        const todayEntry = history.find((e) => e.date === today);
        if (todayEntry) {
          history = history.map((e) =>
            e.date === today ? { ...e, actions: [...e.actions, action] } : e,
          );
        } else {
          history = [...history, { date: today, actions: [action] }];
        }
        if (history.length > MAX_HISTORY_DAYS) {
          history = history.slice(history.length - MAX_HISTORY_DAYS);
        }
        return { careHistory: history };
      });
    },

    unlock: (id: string) => {
      const now = Date.now();
      const entry: UnlockedAchievement = { id, unlockedAt: now };
      set((s) => ({
        unlocked: [...s.unlocked, entry],
        lastUnlock: entry,
      }));
    },

    hydrate: (data: PersistedAchievementData) => {
      set({
        unlocked: data.unlocked ?? [],
        totalFocusSessions: data.totalFocusSessions ?? 0,
        totalChats: data.totalChats ?? 0,
        careHistory: data.careHistory ?? [],
      });
    },

    getUnlockedIds: () => {
      return new Set(get().unlocked.map((u) => u.id));
    },
  })),
);
