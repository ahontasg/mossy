import { useCreatureStore } from "../../../stores/creatureStore";
import { useJournalStore } from "../../../stores/journalStore";
import { useQuestStore } from "../../../stores/questStore";
import { useAchievementStore } from "../../../stores/achievementStore";
import { SPECIMENS } from "../../journal/data/specimens";

function careRhythmBar(history: { date: string }[]): string {
  const dates = new Set(history.map((h) => h.date));
  const today = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (11 - i));
    const key = d.toISOString().slice(0, 10);
    return dates.has(key) ? "\u2588" : "\u2591";
  }).join("");
}

export function generateSnapshot(): string {
  const creature = useCreatureStore.getState();
  const journal = useJournalStore.getState();
  const quests = useQuestStore.getState();
  const achievements = useAchievementStore.getState();

  const dayCount = achievements.careHistory.length || 1;
  const totalSpecimens = SPECIMENS.length;
  const discoveredCount = journal.discovered.length;

  const lines: string[] = [];

  lines.push(`\u{1F33F} Mossy Day ${dayCount} | Lvl ${creature.level}`);
  lines.push(`${careRhythmBar(achievements.careHistory)} Care Rhythm`);

  // Most recent discovery
  if (journal.discovered.length > 0) {
    const latest = journal.discovered[journal.discovered.length - 1];
    lines.push(`\u{1F344} New: ${latest.specimenId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}!`);
  }

  lines.push(`\u2728 ${discoveredCount}/${totalSpecimens} specimens discovered`);

  if (creature.streak.currentStreak > 0) {
    lines.push(`\u{1F525} ${creature.streak.currentStreak}-day streak`);
  }

  const completedToday = quests.quests.filter((q) => q.completed).length;
  if (completedToday > 0) {
    lines.push(`\u2705 ${completedToday}/${quests.quests.length} quests done today`);
  }

  return lines.join("\n");
}
