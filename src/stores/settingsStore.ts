import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface SettingsStore {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  subscribeWithSelector((set) => ({
    soundEnabled: false,
    setSoundEnabled: (enabled: boolean) => set({ soundEnabled: enabled }),
  })),
);
