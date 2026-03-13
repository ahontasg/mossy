import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { supabase } from "../lib/supabase";
import type { LeaderboardEntry, LeaderboardPeriod } from "../types";
import { useAuthStore } from "./authStore";

const CACHE_TTL_MS = 60_000; // 60 seconds

interface LeaderboardStore {
  entries: LeaderboardEntry[];
  period: LeaderboardPeriod;
  isLoading: boolean;
  lastFetchedAt: number | null;

  setPeriod: (period: LeaderboardPeriod) => void;
  fetchLeaderboard: () => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardStore>()(
  subscribeWithSelector((set, get) => ({
    entries: [],
    period: "weekly",
    isLoading: false,
    lastFetchedAt: null,

    setPeriod: (period) => {
      set({ period, lastFetchedAt: null });
      get().fetchLeaderboard();
    },

    fetchLeaderboard: async () => {
      const { lastFetchedAt, isLoading, period } = get();
      if (isLoading) return;
      if (lastFetchedAt && Date.now() - lastFetchedAt < CACHE_TTL_MS) return;

      const { team, userId } = useAuthStore.getState();
      if (!team) return;

      set({ isLoading: true });

      const view = period === "weekly" ? "leaderboard_weekly" : "leaderboard_monthly";
      const xpField = period === "weekly" ? "weekly_xp" : "monthly_xp";

      const { data, error } = await supabase
        .from(view)
        .select("*")
        .eq("team_id", team.id);

      if (error || !data) {
        set({ isLoading: false });
        return;
      }

      const entries: LeaderboardEntry[] = data
        .map((row: Record<string, unknown>) => ({
          userId: row.user_id as string,
          displayName: row.display_name as string,
          xp: (row[xpField] as number) ?? 0,
          activeDays: (row.active_days as number) ?? 0,
          specimens: (row.specimens as number) ?? 0,
          isCurrentUser: row.user_id === userId,
        }))
        .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.xp - a.xp);

      set({ entries, isLoading: false, lastFetchedAt: Date.now() });
    },
  })),
);
