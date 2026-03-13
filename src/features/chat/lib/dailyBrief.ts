import type { Mood } from "../../../types";

export function buildDailyBrief(context: {
  focusStreak: number;
  todayFocusMinutes: number;
  completedSessionsToday: number;
  totalFocusMinutes: number;
  level: number;
  mood: Mood;
}): string {
  const { focusStreak, todayFocusMinutes, completedSessionsToday, totalFocusMinutes, level } = context;

  if (totalFocusMinutes === 0 && focusStreak === 0) {
    return "*stretches awake* Good morning! Ready to start a new day?";
  }

  const parts: string[] = ["*yawns and unfurls* Good morning!"];

  if (todayFocusMinutes > 0 || completedSessionsToday > 0) {
    parts.push(
      `Yesterday you focused for ${todayFocusMinutes} minute${todayFocusMinutes !== 1 ? "s" : ""} across ${completedSessionsToday} session${completedSessionsToday !== 1 ? "s" : ""}.`,
    );
  }

  if (focusStreak > 1) {
    parts.push(`Your focus streak is at ${focusStreak} days!`);
  }

  if (level >= 5) {
    parts.push("You're growing nicely~");
  }

  parts.push("Let's keep going!");

  return parts.join(" ");
}
