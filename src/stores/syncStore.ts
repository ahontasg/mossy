import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { supabase } from "../lib/supabase";
import type { QueuedCareEvent, CareEventType } from "../types";

const MAX_QUEUE_SIZE = 500;
const MAX_RETRY_COUNT = 3;
const STALENESS_MS = 24 * 60 * 60 * 1000; // 24 hours

interface SyncStore {
  queue: QueuedCareEvent[];
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncAt: number | null;

  enqueue: (event: Omit<QueuedCareEvent, "id" | "retryCount">) => void;
  processQueue: () => Promise<void>;
  setOnline: (online: boolean) => void;
  hydrate: (queue: QueuedCareEvent[]) => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

export const useSyncStore = create<SyncStore>()(
  subscribeWithSelector((set, get) => ({
    queue: [],
    isSyncing: false,
    isOnline: navigator.onLine,
    lastSyncAt: null,

    enqueue: (event) => {
      set((s) => {
        const newEvent: QueuedCareEvent = {
          ...event,
          id: generateId(),
          retryCount: 0,
        };
        let queue = [...s.queue, newEvent];
        // Evict oldest if over cap
        if (queue.length > MAX_QUEUE_SIZE) {
          queue = queue.slice(queue.length - MAX_QUEUE_SIZE);
        }
        return { queue };
      });
    },

    processQueue: async () => {
      const { queue, isSyncing, isOnline } = get();
      if (isSyncing || !isOnline || queue.length === 0) return;

      set({ isSyncing: true });
      const now = Date.now();
      const remaining: QueuedCareEvent[] = [];

      for (const event of queue) {
        // Drop stale events
        if (now - event.clientTimestamp > STALENESS_MS) continue;
        // Drop events that exceeded retry limit
        if (event.retryCount >= MAX_RETRY_COUNT) continue;

        try {
          const { error } = await supabase.rpc("submit_care_event", {
            p_event_type: event.eventType,
            p_xp_earned: event.xpEarned,
            p_metadata: event.metadata,
            p_client_timestamp: new Date(event.clientTimestamp).toISOString(),
            p_client_id: event.id,
          });
          if (error) throw error;
          // Success — don't add to remaining
        } catch {
          remaining.push({ ...event, retryCount: event.retryCount + 1 });
        }
      }

      set({ queue: remaining, isSyncing: false, lastSyncAt: Date.now() });
    },

    setOnline: (online) => {
      set({ isOnline: online });
      if (online) {
        get().processQueue();
      }
    },

    hydrate: (queue) => {
      // Filter out stale/over-retried on hydrate
      const now = Date.now();
      const valid = queue.filter(
        (e) => e.retryCount < MAX_RETRY_COUNT && now - e.clientTimestamp < STALENESS_MS,
      );
      set({ queue: valid });
    },
  })),
);

// XP values per event type (must match server validation)
export const CARE_EVENT_XP: Record<CareEventType, number> = {
  focus_complete: 30,
  game_score: 0,          // variable — set dynamically per game
  challenge_complete: 0,  // variable — set dynamically per score
  chat: 10,
  quest_complete: 0,      // variable — from quest template
  level_up: 0,
};
