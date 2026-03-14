import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type PanelId =
  | "home"
  | "chat"
  | "focus"
  | "journal"
  | "quests"
  | "achievements"
  | "notes"
  | "social"
  | "leaderboard"
  | "settings";

interface UiState {
  activePanel: PanelId;
  setPanel: (panel: PanelId) => void;
  goHome: () => void;
}

export const useUiStore = create<UiState>()(
  subscribeWithSelector((set) => ({
    activePanel: "home",
    setPanel: (panel) => set({ activePanel: panel }),
    goHome: () => set({ activePanel: "home" }),
  })),
);
