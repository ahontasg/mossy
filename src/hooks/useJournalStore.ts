import { load } from "@tauri-apps/plugin-store";
import { useJournalStore } from "../stores/journalStore";
import { useCreatureStore } from "../stores/creatureStore";
import { useFocusStore } from "../stores/focusStore";
import { SPECIMENS } from "../features/journal/data/specimens";
import { getEligibleSpecimens, rollForDiscovery, type DiscoveryContext } from "../features/journal/lib/discoveryEngine";
import { FOCUS_DISCOVERY_LUCK_BONUS } from "../features/focus/lib/focusRewards";
import { getTimeOfDay } from "../lib/time";
import { getSeason } from "../lib/season";
import type { DiscoveredSpecimen } from "../types";

let storeInstance: Awaited<ReturnType<typeof load>> | null = null;
let discoveryInterval: ReturnType<typeof setInterval> | null = null;

interface PersistedJournal {
  discovered: DiscoveredSpecimen[];
}

export async function initJournalPersistence() {
  storeInstance = await load("mossy-data.json", { defaults: {}, autoSave: false });

  const data = await storeInstance.get<PersistedJournal>("journal");
  if (data?.discovered) {
    useJournalStore.getState().hydrate(data.discovered);
  }

  // Persist immediately on discovery (infrequent event)
  useJournalStore.subscribe(
    (s) => s.discovered,
    async (discovered) => {
      if (!storeInstance) return;
      await storeInstance.set("journal", { discovered } satisfies PersistedJournal);
      await storeInstance.save();
    },
    { equalityFn: (a, b) => a === b },
  );

  // Discovery roll every 5 minutes
  discoveryInterval = setInterval(attemptDiscovery, 5 * 60_000);
}

export function attemptDiscovery() {
  const { stats, level, growthStage, streak } = useCreatureStore.getState();
  const ctx: DiscoveryContext = {
    timeOfDay: getTimeOfDay(),
    season: getSeason(),
    stats,
    level,
    growthStage,
    streak: streak.currentStreak,
  };

  const discoveredIds = useJournalStore.getState().getDiscoveredIds();
  const eligible = getEligibleSpecimens(SPECIMENS, discoveredIds, ctx);

  const avgStats = (stats.hunger + stats.hydration + stats.happiness + stats.energy) / 4;
  const focusBonus = useFocusStore.getState().completedSessionsToday > 0 ? FOCUS_DISCOVERY_LUCK_BONUS : 0;
  const result = rollForDiscovery(eligible, avgStats / 10, focusBonus);

  if (result) {
    useJournalStore.getState().addDiscovery(result.id);
  }
}

export function cleanupJournalPersistence() {
  if (discoveryInterval) clearInterval(discoveryInterval);
}
