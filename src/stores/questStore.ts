import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { ActiveQuest } from "../types";
import { useCreatureStore } from "./creatureStore";

interface QuestStore {
  date: string;
  quests: ActiveQuest[];
  lastCompletion: { templateId: string; rewardXp: number; timestamp: number } | null;
  setQuests: (date: string, quests: ActiveQuest[]) => void;
  updateQuests: (quests: ActiveQuest[]) => void;
  completeQuest: (templateId: string, rewardXp: number) => void;
  hydrate: (date: string, quests: ActiveQuest[]) => void;
}

export const useQuestStore = create<QuestStore>()(
  subscribeWithSelector((set) => ({
    date: "",
    quests: [],
    lastCompletion: null,

    setQuests: (date: string, quests: ActiveQuest[]) => {
      set({ date, quests });
    },

    updateQuests: (quests: ActiveQuest[]) => {
      set({ quests });
    },

    completeQuest: (templateId: string, rewardXp: number) => {
      const now = Date.now();
      set({ lastCompletion: { templateId, rewardXp, timestamp: now } });
      useCreatureStore.getState().addXp(rewardXp);
    },

    hydrate: (date: string, quests: ActiveQuest[]) => {
      set({ date, quests });
    },
  })),
);
