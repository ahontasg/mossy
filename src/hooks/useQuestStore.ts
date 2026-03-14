import { load } from "@tauri-apps/plugin-store";
import { useQuestStore } from "../stores/questStore";
import { useCreatureStore } from "../stores/creatureStore";
import { useFocusStore } from "../stores/focusStore";
import { useChatStore } from "../stores/chatStore";
import { useJournalStore } from "../stores/journalStore";
import { useAssistantStore } from "../stores/assistantStore";
import { QUEST_TEMPLATE_MAP } from "../features/quests/data/questTemplates";
import { SPECIMENS } from "../features/journal/data/specimens";
import { generateDailyQuests } from "../features/quests/lib/questGenerator";
import {
  trackFocusSession,
  trackChatMessage,
  trackChatTime,
  trackLevelUp,
  trackStreakChange,
  trackSpecimenDiscovery,
  trackReminderSet,
  trackGamePlay,
  trackGameHighScore,
} from "../features/quests/lib/questTracker";
import { useGameStore } from "../stores/gameStore";
import { getLocalDate, getTimeOfDay } from "../lib/time";
import type { ActiveQuest } from "../types";

let storeInstance: Awaited<ReturnType<typeof load>> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const unsubs: (() => void)[] = [];

interface PersistedQuests {
  date: string;
  quests: ActiveQuest[];
}

async function saveToStore() {
  if (!storeInstance) return;
  const { date, quests } = useQuestStore.getState();
  await storeInstance.set("quests", { date, quests } satisfies PersistedQuests);
  await storeInstance.save();
}

function debouncedSave() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(saveToStore, 2000);
}

function checkCompletions(prev: ActiveQuest[], next: ActiveQuest[]) {
  for (let i = 0; i < next.length; i++) {
    if (next[i].completed && prev[i] && !prev[i].completed) {
      const template = QUEST_TEMPLATE_MAP.get(next[i].templateId);
      if (template) {
        useQuestStore.getState().completeQuest(next[i].templateId, template.rewardXp);
      }
    }
  }
}

function ensureTodayQuests() {
  const today = getLocalDate();
  const { date } = useQuestStore.getState();
  if (date !== today) {
    const { level } = useCreatureStore.getState();
    const discoveredCount = useJournalStore.getState().discovered.length;
    const quests = generateDailyQuests(today, level, discoveredCount, SPECIMENS.length);
    useQuestStore.getState().setQuests(today, quests);
  }
}

function countTodayChats(): number {
  const today = getLocalDate();
  const todayStart = new Date(today).getTime();
  return useChatStore.getState().messages.filter(
    (m) => m.role === "user" && m.timestamp >= todayStart,
  ).length;
}

function countTodayDiscoveries(): number {
  const today = getLocalDate();
  return useJournalStore.getState().discovered.filter((d) => d.discoveredDate === today).length;
}

export async function initQuestPersistence() {
  storeInstance = await load("mossy-data.json", { defaults: {}, autoSave: false });

  const data = await storeInstance.get<PersistedQuests>("quests");
  const today = getLocalDate();

  if (data?.date === today && data.quests) {
    useQuestStore.getState().hydrate(data.date, data.quests);
  } else {
    // Generate fresh quests for today
    const { level } = useCreatureStore.getState();
    const discoveredCount = useJournalStore.getState().discovered.length;
    const quests = generateDailyQuests(today, level, discoveredCount, SPECIMENS.length);
    useQuestStore.getState().setQuests(today, quests);
  }

  // Subscribe to focus session completions
  unsubs.push(
    useFocusStore.subscribe(
      (s) => s.completedSessionsToday,
      () => {
        const { completedSessionsToday, todayFocusMinutes } = useFocusStore.getState();
        const { quests } = useQuestStore.getState();
        const next = trackFocusSession(quests, QUEST_TEMPLATE_MAP, completedSessionsToday, todayFocusMinutes);
        if (next !== quests) {
          checkCompletions(quests, next);
          useQuestStore.getState().updateQuests(next);
        }
      },
    ),
  );

  // Also track focus minutes (updates separately from session count)
  unsubs.push(
    useFocusStore.subscribe(
      (s) => s.todayFocusMinutes,
      () => {
        const { completedSessionsToday, todayFocusMinutes } = useFocusStore.getState();
        const { quests } = useQuestStore.getState();
        const next = trackFocusSession(quests, QUEST_TEMPLATE_MAP, completedSessionsToday, todayFocusMinutes);
        if (next !== quests) {
          checkCompletions(quests, next);
          useQuestStore.getState().updateQuests(next);
        }
      },
    ),
  );

  // Subscribe to chat messages
  unsubs.push(
    useChatStore.subscribe(
      (s) => s.messages.length,
      () => {
        const chatCount = countTodayChats();
        const { quests } = useQuestStore.getState();
        let next = trackChatMessage(quests, QUEST_TEMPLATE_MAP, chatCount);
        next = trackChatTime(next, QUEST_TEMPLATE_MAP, getTimeOfDay());
        if (next !== quests) {
          checkCompletions(quests, next);
          useQuestStore.getState().updateQuests(next);
        }
      },
    ),
  );

  // Subscribe to level changes
  unsubs.push(
    useCreatureStore.subscribe(
      (s) => s.level,
      (level) => {
        const { quests } = useQuestStore.getState();
        const next = trackLevelUp(quests, QUEST_TEMPLATE_MAP, level);
        if (next !== quests) {
          checkCompletions(quests, next);
          useQuestStore.getState().updateQuests(next);
        }
      },
    ),
  );

  // Subscribe to focus streak changes
  unsubs.push(
    useFocusStore.subscribe(
      (s) => s.focusStreak,
      (streak) => {
        const { quests } = useQuestStore.getState();
        const next = trackStreakChange(quests, QUEST_TEMPLATE_MAP, streak);
        if (next !== quests) {
          checkCompletions(quests, next);
          useQuestStore.getState().updateQuests(next);
        }
      },
    ),
  );

  // Subscribe to specimen discoveries
  unsubs.push(
    useJournalStore.subscribe(
      (s) => s.discovered.length,
      () => {
        const todayDisc = countTodayDiscoveries();
        const { quests } = useQuestStore.getState();
        const next = trackSpecimenDiscovery(quests, QUEST_TEMPLATE_MAP, todayDisc);
        if (next !== quests) {
          checkCompletions(quests, next);
          useQuestStore.getState().updateQuests(next);
        }
      },
    ),
  );

  // Subscribe to reminder creation
  unsubs.push(
    useAssistantStore.subscribe(
      (s) => s.reminders.length,
      (count) => {
        const { quests } = useQuestStore.getState();
        const next = trackReminderSet(quests, QUEST_TEMPLATE_MAP, count);
        if (next !== quests) {
          checkCompletions(quests, next);
          useQuestStore.getState().updateQuests(next);
        }
      },
    ),
  );

  // Subscribe to game plays
  unsubs.push(
    useGameStore.subscribe(
      (s) => s.gamesPlayedToday,
      (gamesPlayed, prevGamesPlayed) => {
        if (gamesPlayed <= prevGamesPlayed) return; // guard against day reset
        const { quests } = useQuestStore.getState();
        const next = trackGamePlay(quests, QUEST_TEMPLATE_MAP, gamesPlayed);
        if (next !== quests) {
          checkCompletions(quests, next);
          useQuestStore.getState().updateQuests(next);
        }
      },
    ),
  );

  // Subscribe to game high scores
  unsubs.push(
    useGameStore.subscribe(
      (s) => s.lastGameResult,
      (result) => {
        if (!result) return;
        const { quests } = useQuestStore.getState();
        const next = trackGameHighScore(quests, QUEST_TEMPLATE_MAP, result.gameId, result.isNewRecord);
        if (next !== quests) {
          checkCompletions(quests, next);
          useQuestStore.getState().updateQuests(next);
        }
      },
    ),
  );

  // Day rollover check on stat decay ticks
  unsubs.push(
    useCreatureStore.subscribe(
      (s) => s.stats,
      () => ensureTodayQuests(),
    ),
  );

  // Persist quest changes
  unsubs.push(
    useQuestStore.subscribe(
      (s) => s.quests,
      () => debouncedSave(),
      { equalityFn: (a, b) => a === b },
    ),
  );
}

export function cleanupQuestPersistence() {
  for (const unsub of unsubs) unsub();
  unsubs.length = 0;
  if (debounceTimer) clearTimeout(debounceTimer);
}
