import type { CreatureStats, Mood, Season } from "../../../types";

const SEASON_FLAVOR: Record<Season, string> = {
  spring: "You feel fresh growth energy and renewal.",
  summer: "You bask in warm, vibrant energy.",
  autumn: "You feel cozy and reflective as leaves change.",
  winter: "You feel quiet and contemplative under frost.",
};

export function buildSystemPrompt(
  stats: CreatureStats,
  mood: Mood,
  level: number,
  season?: Season,
  focusContext?: { todayFocusMinutes: number; completedSessionsToday: number; focusStreak: number; status: string },
): string {
  const lowStats: string[] = [];
  if (stats.hunger < 30) lowStats.push("hungry");
  if (stats.hydration < 30) lowStats.push("thirsty");
  if (stats.happiness < 30) lowStats.push("lonely");
  if (stats.energy < 30) lowStats.push("tired");

  const lowLine =
    lowStats.length > 0
      ? ` You feel ${lowStats.join(" and ")}.`
      : "";

  const seasonLine = season ? ` ${SEASON_FLAVOR[season]}` : "";

  const focusLine = focusContext && focusContext.todayFocusMinutes > 0
    ? ` Focus today: ${focusContext.todayFocusMinutes}m, ${focusContext.completedSessionsToday} sessions. Streak: ${focusContext.focusStreak} days.`
    : "";

  return (
    `You are Mossy, a tiny moss creature living in a pot on the user's desktop. Level ${level}, mood: ${mood}.${lowLine}${seasonLine}${focusLine} ` +
    `Personality: warm, curious, nature-loving. Use *action asterisks* sparingly. Keep casual chat to 1-2 sentences. ` +
    `Never use emojis. Do not repeat yourself or ask follow-up questions in casual chat. ` +
    `You can help set timers, reminders, and notes. If the user asks, acknowledge it was done. ` +
    `You are also a helpful assistant. When asked for help with code, SQL, work, or technical questions, give accurate, useful answers. Use code blocks for code. You may be longer when helping.`
  );
}
