import { load } from "@tauri-apps/plugin-store";
import { useCreatureStore, DEFAULT_STREAK } from "../stores/creatureStore";
import type { CreatureState, StreakData } from "../types";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let storeInstance: Awaited<ReturnType<typeof load>> | null = null;
let decayInterval: ReturnType<typeof setInterval> | null = null;

interface PersistedCreature extends CreatureState {
  streak?: StreakData;
}

async function saveToStore() {
  if (!storeInstance) return;
  const { stats, xp, level, growthStage, streak } = useCreatureStore.getState();
  await storeInstance.set("creature", {
    stats,
    xp,
    level,
    growthStage,
    lastSave: Date.now(),
    streak,
  } satisfies PersistedCreature);
  await storeInstance.save();
}

function debouncedSave() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(saveToStore, 2000);
}

export async function saveImmediate() {
  if (debounceTimer) clearTimeout(debounceTimer);
  await saveToStore();
}

export async function initPersistence() {
  storeInstance = await load("mossy-data.json", { defaults: {}, autoSave: false });

  const data = await storeInstance.get<PersistedCreature>("creature");
  if (data) {
    const elapsed = Date.now() - data.lastSave;
    const ticks = Math.min(120, Math.floor(elapsed / 30_000));

    // Snapshot stats before decay for return overlay
    const statsBefore = { ...data.stats, energy: data.stats.energy ?? 75 };

    useCreatureStore.getState().hydrate(data);

    // Hydrate streak with backward-compat defaults
    const streak = data.streak ?? { ...DEFAULT_STREAK };
    useCreatureStore.setState({ streak });
    useCreatureStore.getState().refreshShield();

    if (ticks > 0) {
      useCreatureStore.getState().applyOfflineDecay(ticks);

      // Show return overlay if away > 1hr (120 ticks at 30s = 1hr)
      const ONE_HOUR_MS = 3_600_000;
      if (elapsed >= ONE_HOUR_MS) {
        const statsAfter = { ...useCreatureStore.getState().stats };
        useCreatureStore.getState().setReturnMoment({
          durationHours: Math.round(elapsed / ONE_HOUR_MS * 10) / 10,
          statsBefore,
          statsAfter,
        });
      }
    }
  }

  // Subscribe to stat changes → debounced save
  useCreatureStore.subscribe(
    (s) => s.stats,
    () => debouncedSave(),
    { equalityFn: (a, b) => a === b },
  );

  // Also persist on streak changes
  useCreatureStore.subscribe(
    (s) => s.streak,
    () => debouncedSave(),
    { equalityFn: (a, b) => a === b },
  );

  // Record care day on care actions
  useCreatureStore.subscribe(
    (s) => s.lastCareAction,
    (action) => {
      if (action) {
        useCreatureStore.getState().recordCareDay();
      }
    },
  );

  // Start decay timer
  decayInterval = setInterval(() => {
    useCreatureStore.getState().decayStats();
  }, 30_000);
}

export function cleanupPersistence() {
  if (decayInterval) clearInterval(decayInterval);
  if (debounceTimer) clearTimeout(debounceTimer);
}
