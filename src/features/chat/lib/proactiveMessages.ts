import type { Mood } from "../../../types";

const BREAK_ENCOURAGEMENT = [
  "*stretches a tiny leaf* Nice focus session! Take a breather.",
  "Great work staying focused! Remember to hydrate.",
  "*yawns contentedly* That was a solid session. Rest your eyes for a bit.",
  "You've been working hard! Time for a well-earned break.",
  "*rustles approvingly* Another session done. Stretch those shoulders!",
  "Focused work done! Maybe grab some water?",
];

const STREAK_CELEBRATION = [
  "*bounces excitedly* Your focus streak is going strong!",
  "*unfurls proudly* Look at that streak! Keep it up!",
  "Your consistency is impressive. The streak grows!",
];

const GENERAL = [
  "*sways gently* Taking a break is part of the process.",
  "*watches dust motes float by* Breaks help ideas settle.",
  "A moment of rest before the next push. You've got this.",
  "*hums quietly* The quiet moments matter too.",
];

export function pickProactiveMessage(context: {
  focusStatus: string;
  completedSessionsToday: number;
  todayFocusMinutes: number;
  focusStreak: number;
  mood: Mood;
}): string | null {
  if (context.focusStatus !== "short_break" && context.focusStatus !== "long_break") {
    return null;
  }

  // Pick category based on context
  let pool: string[];
  if (context.focusStreak >= 5 && context.completedSessionsToday === 1) {
    pool = STREAK_CELEBRATION;
  } else if (context.completedSessionsToday > 0) {
    pool = BREAK_ENCOURAGEMENT;
  } else {
    pool = GENERAL;
  }

  const index = Math.floor(Date.now() / 60_000) % pool.length;
  return pool[index];
}
