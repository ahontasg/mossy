import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { DiscoveredSpecimen } from "../types";
import { getLocalDate } from "../lib/time";

interface JournalStore {
  discovered: DiscoveredSpecimen[];
  lastDiscovery: { specimenId: string; timestamp: number } | null;
  addDiscovery: (specimenId: string) => void;
  hydrate: (discovered: DiscoveredSpecimen[]) => void;
  getDiscoveredIds: () => Set<string>;
}

export const useJournalStore = create<JournalStore>()(
  subscribeWithSelector((set, get) => ({
    discovered: [],
    lastDiscovery: null,

    addDiscovery: (specimenId: string) => {
      const now = Date.now();
      const entry: DiscoveredSpecimen = {
        specimenId,
        discoveredAt: now,
        discoveredDate: getLocalDate(),
      };
      set((s) => ({
        discovered: [...s.discovered, entry],
        lastDiscovery: { specimenId, timestamp: now },
      }));
    },

    hydrate: (discovered: DiscoveredSpecimen[]) => {
      set({ discovered });
    },

    getDiscoveredIds: () => {
      return new Set(get().discovered.map((d) => d.specimenId));
    },
  })),
);
