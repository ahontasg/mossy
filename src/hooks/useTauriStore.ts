import { load } from "@tauri-apps/plugin-store";
import { useCreatureStore } from "../stores/creatureStore";
import type { CreatureState } from "../types";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let storeInstance: Awaited<ReturnType<typeof load>> | null = null;
let decayInterval: ReturnType<typeof setInterval> | null = null;

async function saveToStore() {
  if (!storeInstance) return;
  const { stats, xp, level, growthStage } = useCreatureStore.getState();
  await storeInstance.set("creature", {
    stats,
    xp,
    level,
    growthStage,
    lastSave: Date.now(),
  } satisfies CreatureState);
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

  const data = await storeInstance.get<CreatureState>("creature");
  if (data) {
    const elapsed = Date.now() - data.lastSave;
    const ticks = Math.min(120, Math.floor(elapsed / 30_000));

    useCreatureStore.getState().hydrate(data);
    if (ticks > 0) {
      useCreatureStore.getState().applyOfflineDecay(ticks);
    }
  }

  // Subscribe to stat changes → debounced save
  useCreatureStore.subscribe(
    (s) => s.stats,
    () => debouncedSave(),
    { equalityFn: (a, b) => a === b },
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
