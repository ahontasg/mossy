import type { QuestTemplate } from "../../../types";

export const QUEST_TEMPLATES: QuestTemplate[] = [
  // Focus quests
  { id: "focus_2", title: "Focused Mind", description: "Complete 2 focus sessions today", type: "focus_sessions", targetValue: 2, rewardXp: 40 },
  { id: "focus_4", title: "Deep Work", description: "Complete a full 4-session cycle", type: "focus_cycle", targetValue: 4, rewardXp: 50, minLevel: 3 },
  { id: "focus_30m", title: "Half Hour Hero", description: "Focus for 30 total minutes today", type: "focus_minutes", targetValue: 30, rewardXp: 30 },
  { id: "focus_50m", title: "Marathon Focus", description: "Focus for 50 total minutes today", type: "focus_minutes", targetValue: 50, rewardXp: 35, minLevel: 3 },
  { id: "focus_90m", title: "Zone Master", description: "Focus for 90 total minutes today", type: "focus_minutes", targetValue: 90, rewardXp: 50, minLevel: 5 },
  { id: "focus_1", title: "First Session", description: "Complete 1 focus session today", type: "focus_sessions", targetValue: 1, rewardXp: 25 },

  // Game quests (Phase 7+ — will track once games exist)
  { id: "game_play", title: "Brain Break", description: "Play a brain break game", type: "game_play", targetValue: 1, rewardXp: 20, minLevel: 3 },
  { id: "game_high", title: "New Record!", description: "Beat your memory match record", type: "game_high_score", targetKey: "memory", targetValue: 1, rewardXp: 30, minLevel: 5 },

  // Challenge quests (Phase 8+ — will track once daily challenge exists)
  { id: "challenge_1", title: "Word Gardener", description: "Complete today's Daily Challenge", type: "challenge_complete", targetValue: 1, rewardXp: 30, minLevel: 3 },

  // Chat quests
  { id: "chat_3", title: "Chatty Day", description: "Chat with Mossy 3 times today", type: "chat_count", targetValue: 3, rewardXp: 15 },
  { id: "chat_5", title: "Best Friends", description: "Chat with Mossy 5 times today", type: "chat_count", targetValue: 5, rewardXp: 25, minLevel: 3 },
  { id: "chat_night", title: "Night Chat", description: "Chat with Mossy at night", type: "chat_time", targetKey: "night", targetValue: 1, rewardXp: 20 },
  { id: "chat_morning", title: "Morning Chat", description: "Chat with Mossy in the morning", type: "chat_time", targetKey: "morning", targetValue: 1, rewardXp: 20 },

  // Streak quests
  { id: "streak_3", title: "Three's a Charm", description: "Maintain a 3-day focus streak", type: "streak_reach", targetValue: 3, rewardXp: 30 },
  { id: "streak_7", title: "Week Warrior", description: "Maintain a 7-day focus streak", type: "streak_reach", targetValue: 7, rewardXp: 60, minLevel: 3 },

  // Progression
  { id: "reach_3", title: "Growth Spurt", description: "Reach level 3", type: "reach_level", targetValue: 3, rewardXp: 40 },
  { id: "reach_5", title: "Getting Bigger", description: "Reach level 5", type: "reach_level", targetValue: 5, rewardXp: 50, minLevel: 3 },
  { id: "reach_10", title: "Double Digits", description: "Reach level 10", type: "reach_level", targetValue: 10, rewardXp: 75, minLevel: 7 },

  // Assistant
  { id: "reminder_1", title: "Personal Assistant", description: "Set a reminder via chat", type: "set_reminder", targetValue: 1, rewardXp: 10 },

  // Discovery
  { id: "discover_1", title: "Curious Explorer", description: "Discover a new specimen today", type: "discover_specimen", targetValue: 1, rewardXp: 35 },
  { id: "discover_2", title: "Keen Observer", description: "Discover 2 new specimens today", type: "discover_specimen", targetValue: 2, rewardXp: 60, minLevel: 5 },
];

export const QUEST_TEMPLATE_MAP = new Map(QUEST_TEMPLATES.map((t) => [t.id, t]));
