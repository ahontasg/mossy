import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { supabase } from "../lib/supabase";
import type { FeedItem, CareEventType } from "../types";

const MAX_ITEMS = 20;

interface FeedStore {
  items: FeedItem[];
  isLoading: boolean;

  fetchRecent: (teamId: string) => Promise<void>;
  subscribe: (teamId: string) => () => void;
  addItem: (item: FeedItem) => void;
}

export const useFeedStore = create<FeedStore>()(
  subscribeWithSelector((set, get) => ({
    items: [],
    isLoading: false,

    fetchRecent: async (teamId) => {
      set({ isLoading: true });
      // Get team member IDs first
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .eq("team_id", teamId);

      if (!profiles || profiles.length === 0) {
        set({ isLoading: false });
        return;
      }

      const memberIds = profiles.map((p) => p.id);
      const nameMap = new Map(profiles.map((p) => [p.id, p.display_name]));

      const { data: events } = await supabase
        .from("care_events")
        .select("*")
        .in("user_id", memberIds)
        .order("server_timestamp", { ascending: false })
        .limit(MAX_ITEMS);

      if (events) {
        const items: FeedItem[] = events.map((e) => ({
          id: e.id,
          displayName: nameMap.get(e.user_id) ?? "Unknown",
          eventType: e.event_type as CareEventType,
          xpEarned: e.xp_earned,
          metadata: (e.metadata as Record<string, unknown>) ?? {},
          serverTimestamp: e.server_timestamp,
        }));
        set({ items, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    },

    subscribe: (teamId) => {
      const channel = supabase
        .channel(`team-feed-${teamId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "care_events",
          },
          async (payload: { new: Record<string, unknown> }) => {
            const event = payload.new;
            const userId = event.user_id as string;
            // Look up display name
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name, team_id")
              .eq("id", userId)
              .single();

            if (profile?.team_id !== teamId) return;

            get().addItem({
              id: event.id as string,
              displayName: profile?.display_name ?? "Unknown",
              eventType: event.event_type as CareEventType,
              xpEarned: event.xp_earned as number,
              metadata: (event.metadata as Record<string, unknown>) ?? {},
              serverTimestamp: event.server_timestamp as string,
            });
          },
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    },

    addItem: (item) => {
      set((s) => {
        const items = [item, ...s.items].slice(0, MAX_ITEMS);
        return { items };
      });
    },
  })),
);
