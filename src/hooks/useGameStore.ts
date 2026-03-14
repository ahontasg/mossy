import { load } from "@tauri-apps/plugin-store";
import { useGameStore, type PersistedGameData } from "../stores/gameStore";
import { useFocusStore } from "../stores/focusStore";
import { getLocalDate } from "../lib/time";

let storeInstance: Awaited<ReturnType<typeof load>> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const unsubs: (() => void)[] = [];

async function saveToStore() {
  if (!storeInstance) return;
  const s = useGameStore.getState();
  await storeInstance.set("games", {
    tokens: s.tokens,
    highScores: s.highScores,
    gamesPlayedToday: s.gamesPlayedToday,
    lastPlayDate: s.lastPlayDate,
  } satisfies PersistedGameData);
  await storeInstance.save();
}

function debouncedSave() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(saveToStore, 2000);
}

export async function initGamePersistence() {
  storeInstance = await load("mossy-data.json", { defaults: {}, autoSave: false });

  const data = await storeInstance.get<PersistedGameData>("games");
  if (data) {
    useGameStore.getState().hydrate(data);
  }

  // Day rollover: reset daily game count if it's a new day
  const { lastPlayDate } = useGameStore.getState();
  if (lastPlayDate && lastPlayDate !== getLocalDate()) {
    useGameStore.getState().resetDay();
  }

  // Earn a game token when a focus session is completed
  unsubs.push(
    useFocusStore.subscribe(
      (s) => s.completedSessionsToday,
      (sessions, prevSessions) => {
        if (sessions > prevSessions) {
          useGameStore.getState().earnToken();
        }
      },
    ),
  );

  // Persist on meaningful state changes
  unsubs.push(
    useGameStore.subscribe(
      (s) => s.tokens,
      () => debouncedSave(),
    ),
  );
  unsubs.push(
    useGameStore.subscribe(
      (s) => s.highScores,
      () => debouncedSave(),
    ),
  );
  unsubs.push(
    useGameStore.subscribe(
      (s) => s.gamesPlayedToday,
      () => debouncedSave(),
    ),
  );
}

export function cleanupGamePersistence() {
  for (const unsub of unsubs) unsub();
  unsubs.length = 0;
  if (debounceTimer) clearTimeout(debounceTimer);
}
