import { load } from "@tauri-apps/plugin-store";
import { useAchievementStore, type PersistedAchievementData } from "../stores/achievementStore";
import { useCreatureStore } from "../stores/creatureStore";
import { useFocusStore } from "../stores/focusStore";
import { useChatStore } from "../stores/chatStore";
import { useJournalStore } from "../stores/journalStore";
import { useGameStore } from "../stores/gameStore";
import { ACHIEVEMENTS, type AchievementContext } from "../features/achievements/data/achievements";
import { getTimeOfDay } from "../lib/time";
import type { TimeOfDay } from "../types";

let storeInstance: Awaited<ReturnType<typeof load>> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const unsubs: (() => void)[] = [];

async function saveToStore() {
  if (!storeInstance) return;
  const { unlocked, totalFocusSessions, totalChats, careHistory } = useAchievementStore.getState();
  await storeInstance.set("achievements", {
    unlocked,
    totalFocusSessions,
    totalChats,
    careHistory,
  } satisfies PersistedAchievementData);
  await storeInstance.save();
}

function debouncedSave() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(saveToStore, 2000);
}

function buildContext(focusTimeOfDay?: TimeOfDay): AchievementContext {
  const { level, growthStage, stats } = useCreatureStore.getState();
  const { totalChats } = useAchievementStore.getState();
  const { focusStreak, completedSessionsToday, totalFocusMinutes } = useFocusStore.getState();
  const discoveredCount = useJournalStore.getState().discovered.length;

  return {
    level,
    growthStage,
    focusStreak,
    completedSessionsToday,
    totalFocusMinutes,
    totalChats,
    discoveredCount,
    timeOfDay: getTimeOfDay(),
    lastFocusTimeOfDay: focusTimeOfDay,
    allStatsAbove75:
      stats.hunger >= 75 &&
      stats.hydration >= 75 &&
      stats.happiness >= 75 &&
      stats.energy >= 75,
  };
}

function checkAchievements(focusTimeOfDay?: TimeOfDay) {
  const ctx = buildContext(focusTimeOfDay);
  const unlockedIds = useAchievementStore.getState().getUnlockedIds();

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.has(achievement.id)) continue;
    if (achievement.condition(ctx)) {
      useAchievementStore.getState().unlock(achievement.id);
    }
  }
}

export async function initAchievementPersistence() {
  storeInstance = await load("mossy-data.json", { defaults: {}, autoSave: false });

  const data = await storeInstance.get<PersistedAchievementData>("achievements");
  if (data) {
    useAchievementStore.getState().hydrate(data);
  }

  // Check achievements on startup (catch up)
  checkAchievements();

  // Subscribe to focus session completions
  unsubs.push(
    useFocusStore.subscribe(
      (s) => s.completedSessionsToday,
      (sessions, prevSessions) => {
        if (sessions > prevSessions) {
          useAchievementStore.getState().recordFocusSession();
          checkAchievements(getTimeOfDay());
        }
      },
    ),
  );

  // Subscribe to chat messages (count user messages as chats)
  unsubs.push(
    useChatStore.subscribe(
      (s) => s.messages,
      (messages, prevMessages) => {
        const newUserMsgs = messages.filter(
          (m) => m.role === "user" && !prevMessages.some((p) => p.id === m.id),
        );
        for (let i = 0; i < newUserMsgs.length; i++) {
          useAchievementStore.getState().recordChat();
        }
        if (newUserMsgs.length > 0) checkAchievements();
      },
    ),
  );

  // Subscribe to level changes
  unsubs.push(
    useCreatureStore.subscribe(
      (s) => s.level,
      () => checkAchievements(),
    ),
  );

  // Subscribe to focus streak changes
  unsubs.push(
    useFocusStore.subscribe(
      (s) => s.focusStreak,
      () => checkAchievements(),
    ),
  );

  // Subscribe to discoveries
  unsubs.push(
    useJournalStore.subscribe(
      (s) => s.discovered.length,
      () => checkAchievements(),
    ),
  );

  // Subscribe to game plays
  unsubs.push(
    useGameStore.subscribe(
      (s) => s.gamesPlayedToday,
      (gamesPlayed, prevGamesPlayed) => {
        if (gamesPlayed > prevGamesPlayed) {
          useAchievementStore.getState().recordCareDay("game");
          checkAchievements();
        }
      },
    ),
  );

  // Persist on state changes
  unsubs.push(
    useAchievementStore.subscribe(
      (s) => s.unlocked,
      () => debouncedSave(),
      { equalityFn: (a, b) => a === b },
    ),
  );
  unsubs.push(
    useAchievementStore.subscribe(
      (s) => s.totalFocusSessions,
      () => debouncedSave(),
    ),
  );
  unsubs.push(
    useAchievementStore.subscribe(
      (s) => s.totalChats,
      () => debouncedSave(),
    ),
  );
  unsubs.push(
    useAchievementStore.subscribe(
      (s) => s.careHistory,
      () => debouncedSave(),
    ),
  );
}

export function cleanupAchievementPersistence() {
  for (const unsub of unsubs) unsub();
  unsubs.length = 0;
  if (debounceTimer) clearTimeout(debounceTimer);
}
