import { load } from "@tauri-apps/plugin-store";
import { useSyncStore, CARE_EVENT_XP } from "../stores/syncStore";
import { useAuthStore } from "../stores/authStore";
import { useCreatureStore } from "../stores/creatureStore";
import { useFocusStore } from "../stores/focusStore";
import { useChatStore } from "../stores/chatStore";
import { useQuestStore } from "../stores/questStore";
import { isSupabaseConfigured } from "../lib/supabase";
import type { QueuedCareEvent, CareEventType } from "../types";

let storeInstance: Awaited<ReturnType<typeof load>> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let syncInterval: ReturnType<typeof setInterval> | null = null;
const unsubs: (() => void)[] = [];

async function saveToStore() {
  if (!storeInstance) return;
  const { queue } = useSyncStore.getState();
  await storeInstance.set("syncQueue", queue);
  await storeInstance.save();
}

function debouncedSave() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(saveToStore, 2000);
}

function isSignedIn(): boolean {
  return useAuthStore.getState().status === "signed_in";
}

function enqueueIfSignedIn(eventType: CareEventType, xpEarned: number, metadata: Record<string, unknown> = {}) {
  if (!isSignedIn()) return;
  useSyncStore.getState().enqueue({
    eventType,
    xpEarned,
    metadata,
    clientTimestamp: Date.now(),
  });
}

export async function initSyncPersistence() {
  if (!isSupabaseConfigured()) return;

  storeInstance = await load("mossy-data.json", { defaults: {}, autoSave: false });

  // Hydrate queue from store
  const data = await storeInstance.get<QueuedCareEvent[]>("syncQueue");
  if (data) {
    useSyncStore.getState().hydrate(data);
  }

  // Subscribe to focus session completions
  unsubs.push(
    useFocusStore.subscribe(
      (s) => s.completedSessionsToday,
      (sessions, prevSessions) => {
        if (sessions > prevSessions) {
          enqueueIfSignedIn("focus_complete", CARE_EVENT_XP.focus_complete);
        }
      },
    ),
  );

  // Subscribe to chat messages (new assistant messages = chat event)
  let chatInitialized = false;
  unsubs.push(
    useChatStore.subscribe(
      (s) => s.messages,
      (messages, prevMessages) => {
        if (!chatInitialized) { chatInitialized = true; return; }
        const newAssistant = messages.filter(
          (m) => m.role === "assistant" && !prevMessages.some((p) => p.id === m.id),
        );
        for (let i = 0; i < newAssistant.length; i++) {
          enqueueIfSignedIn("chat", CARE_EVENT_XP.chat);
        }
      },
    ),
  );

  // Subscribe to quest completions
  unsubs.push(
    useQuestStore.subscribe(
      (s) => s.lastCompletion,
      (completion) => {
        if (completion) {
          enqueueIfSignedIn("quest_complete", completion.rewardXp, {
            templateId: completion.templateId,
          });
        }
      },
    ),
  );

  // Subscribe to level changes
  unsubs.push(
    useCreatureStore.subscribe(
      (s) => s.level,
      (level, prevLevel) => {
        if (level > prevLevel) {
          enqueueIfSignedIn("level_up", 0, { level });
        }
      },
    ),
  );

  // Persist queue changes
  unsubs.push(
    useSyncStore.subscribe(
      (s) => s.queue,
      () => debouncedSave(),
      { equalityFn: (a, b) => a === b },
    ),
  );

  // Online/offline listeners
  const handleOnline = () => useSyncStore.getState().setOnline(true);
  const handleOffline = () => useSyncStore.getState().setOnline(false);
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
  unsubs.push(() => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  });

  // 30-second sync interval
  syncInterval = setInterval(() => {
    if (isSignedIn()) {
      useSyncStore.getState().processQueue();
    }
  }, 30_000);

  // Initial sync attempt
  if (isSignedIn()) {
    useSyncStore.getState().processQueue();
  }
}

export function cleanupSyncPersistence() {
  for (const unsub of unsubs) unsub();
  unsubs.length = 0;
  if (debounceTimer) clearTimeout(debounceTimer);
  if (syncInterval) clearInterval(syncInterval);
}
