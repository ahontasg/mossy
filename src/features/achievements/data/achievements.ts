import type { GrowthStage, TimeOfDay } from "../../../types";

export interface AchievementContext {
  level: number;
  growthStage: GrowthStage;
  focusStreak: number;
  completedSessionsToday: number;
  totalFocusMinutes: number;
  totalChats: number;
  discoveredCount: number;
  timeOfDay: TimeOfDay;
  lastFocusTimeOfDay?: TimeOfDay;
  allStatsAbove75: boolean;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "growth" | "streak" | "focus" | "time" | "chat" | "discovery";
  condition: (ctx: AchievementContext) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Growth
  {
    id: "first_sprout",
    name: "First Sprout",
    description: "Reach level 2",
    icon: "\u{1F331}",
    category: "growth",
    condition: (ctx) => ctx.level >= 2,
  },
  {
    id: "young_moss",
    name: "Growing Up",
    description: "Reach the Young growth stage",
    icon: "\u{1F33F}",
    category: "growth",
    condition: (ctx) => ["young", "mature", "elder"].includes(ctx.growthStage),
  },
  {
    id: "elder_moss",
    name: "Ancient Wisdom",
    description: "Reach the Elder growth stage",
    icon: "\u{1F333}",
    category: "growth",
    condition: (ctx) => ctx.growthStage === "elder",
  },

  // Focus
  {
    id: "first_focus",
    name: "First Focus",
    description: "Complete your first focus session",
    icon: "\u{1F3AF}",
    category: "focus",
    condition: (ctx) => ctx.completedSessionsToday >= 1 || ctx.totalFocusMinutes >= 25,
  },
  {
    id: "deep_work",
    name: "Deep Work",
    description: "Complete 4 focus sessions in one day",
    icon: "\u{1F9E0}",
    category: "focus",
    condition: (ctx) => ctx.completedSessionsToday >= 4,
  },
  {
    id: "perfect_day",
    name: "Perfect Day",
    description: "Have all stats at 75 or above",
    icon: "\u{2728}",
    category: "focus",
    condition: (ctx) => ctx.allStatsAbove75,
  },

  // Streak
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "Maintain a 7-day focus streak",
    icon: "\u{1F525}",
    category: "streak",
    condition: (ctx) => ctx.focusStreak >= 7,
  },
  {
    id: "streak_14",
    name: "Fortnight Friend",
    description: "Maintain a 14-day focus streak",
    icon: "\u{1F525}",
    category: "streak",
    condition: (ctx) => ctx.focusStreak >= 14,
  },
  {
    id: "streak_30",
    name: "Monthly Devotion",
    description: "Maintain a 30-day focus streak",
    icon: "\u{2B50}",
    category: "streak",
    condition: (ctx) => ctx.focusStreak >= 30,
  },
  {
    id: "streak_60",
    name: "Steadfast Guardian",
    description: "Maintain a 60-day focus streak",
    icon: "\u{1F48E}",
    category: "streak",
    condition: (ctx) => ctx.focusStreak >= 60,
  },
  {
    id: "streak_100",
    name: "Century of Care",
    description: "Maintain a 100-day focus streak",
    icon: "\u{1F451}",
    category: "streak",
    condition: (ctx) => ctx.focusStreak >= 100,
  },

  // Time
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Complete a focus session at night",
    icon: "\u{1F319}",
    category: "time",
    condition: (ctx) => ctx.lastFocusTimeOfDay === "night",
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Complete a focus session in the morning",
    icon: "\u{1F305}",
    category: "time",
    condition: (ctx) => ctx.lastFocusTimeOfDay === "morning",
  },

  // Chat
  {
    id: "first_chat",
    name: "Hello, Mossy!",
    description: "Have your first chat conversation",
    icon: "\u{1F4AC}",
    category: "chat",
    condition: (ctx) => ctx.totalChats >= 1,
  },
  {
    id: "chatty",
    name: "Chatty Gardener",
    description: "Have 50 chat conversations",
    icon: "\u{1F5E3}",
    category: "chat",
    condition: (ctx) => ctx.totalChats >= 50,
  },

  // Discovery
  {
    id: "first_find",
    name: "First Discovery",
    description: "Discover your first specimen",
    icon: "\u{1F50D}",
    category: "discovery",
    condition: (ctx) => ctx.discoveredCount >= 1,
  },
  {
    id: "mycologist",
    name: "Mycologist",
    description: "Discover 15 specimens",
    icon: "\u{1F344}",
    category: "discovery",
    condition: (ctx) => ctx.discoveredCount >= 15,
  },
];

export const ACHIEVEMENT_MAP = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));
