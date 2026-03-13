import { load } from "@tauri-apps/plugin-store";
import { useFocusStore, type PersistedFocusData } from "../stores/focusStore";
import { useCreatureStore } from "../stores/creatureStore";
import { getLocalDate } from "../lib/time";

let storeInstance: Awaited<ReturnType<typeof load>> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const unsubs: (() => void)[] = [];

async function saveToStore() {
  if (!storeInstance) return;
  const s = useFocusStore.getState();
  await storeInstance.set("focus", {
    status: s.status,
    sessionIndex: s.sessionIndex,
    remainingMs: s.remainingMs,
    startedAt: s.startedAt,
    pausedAt: s.pausedAt,
    focusDurationMs: s.focusDurationMs,
    shortBreakMs: s.shortBreakMs,
    longBreakMs: s.longBreakMs,
    todayFocusMinutes: s.todayFocusMinutes,
    totalFocusMinutes: s.totalFocusMinutes,
    focusStreak: s.focusStreak,
    lastFocusDate: s.lastFocusDate,
    completedSessionsToday: s.completedSessionsToday,
    statusBeforePause: s.statusBeforePause,
  } satisfies PersistedFocusData);
  await storeInstance.save();
}

function debouncedSave() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(saveToStore, 2000);
}

export async function initFocusPersistence() {
  storeInstance = await load("mossy-data.json", { defaults: {}, autoSave: false });

  const data = await storeInstance.get<PersistedFocusData>("focus");
  if (data) {
    useFocusStore.getState().hydrate(data);
  }

  // Sync isFocusing state to creature store for decay multiplier
  unsubs.push(
    useFocusStore.subscribe(
      (s) => s.status,
      (status) => {
        const focusing = status === "focus";
        useCreatureStore.getState().setFocusing(focusing);
      },
    ),
  );

  // Set initial focusing state
  useCreatureStore.getState().setFocusing(useFocusStore.getState().status === "focus");

  // Day-rollover check: reset daily focus stats at midnight while running
  unsubs.push(
    useCreatureStore.subscribe(
      (s) => s.stats,
      () => {
        const today = getLocalDate();
        const { lastFocusDate } = useFocusStore.getState();
        if (lastFocusDate && lastFocusDate !== today) {
          useFocusStore.getState().resetDay();
        }
      },
    ),
  );

  // Trigger discovery roll on focus session completion (with boosted luck)
  unsubs.push(
    useFocusStore.subscribe(
      (s) => s.completedSessionsToday,
      (sessions, prevSessions) => {
        if (sessions > prevSessions) {
          // Lazy import to avoid circular dependency
          import("./useJournalStore").then(({ attemptDiscovery }) => attemptDiscovery());
        }
      },
    ),
  );

  // Persist on any meaningful state changes
  unsubs.push(
    useFocusStore.subscribe(
      (s) => s.completedSessionsToday,
      () => debouncedSave(),
    ),
  );
  unsubs.push(
    useFocusStore.subscribe(
      (s) => s.status,
      () => debouncedSave(),
    ),
  );
  unsubs.push(
    useFocusStore.subscribe(
      (s) => s.totalFocusMinutes,
      () => debouncedSave(),
    ),
  );
  unsubs.push(
    useFocusStore.subscribe(
      (s) => s.focusStreak,
      () => debouncedSave(),
    ),
  );
}

export function cleanupFocusPersistence() {
  for (const unsub of unsubs) unsub();
  unsubs.length = 0;
  if (debounceTimer) clearTimeout(debounceTimer);
}
