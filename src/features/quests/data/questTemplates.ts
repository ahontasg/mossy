import type { QuestTemplate } from "../../../types";

export const QUEST_TEMPLATES: QuestTemplate[] = [
  // Care count quests
  { id: "water_3", title: "Hydration Station", description: "Water Mossy 3 times today", type: "care_count", targetKey: "water", targetValue: 3, rewardXp: 25 },
  { id: "feed_3", title: "Feeding Time", description: "Feed Mossy 3 times today", type: "care_count", targetKey: "feed", targetValue: 3, rewardXp: 25 },
  { id: "pet_5", title: "Gentle Touch", description: "Pet Mossy 5 times today", type: "care_count", targetKey: "pet", targetValue: 5, rewardXp: 20 },
  { id: "sun_2", title: "Sun Seeker", description: "Give Mossy sunlight 2 times today", type: "care_count", targetKey: "sunlight", targetValue: 2, rewardXp: 30 },

  // Care any count
  { id: "any_5", title: "Attentive Gardener", description: "Perform any 5 care actions today", type: "care_any_count", targetKey: undefined, targetValue: 5, rewardXp: 25 },
  { id: "any_8", title: "Devoted Caretaker", description: "Perform any 8 care actions today", type: "care_any_count", targetKey: undefined, targetValue: 8, rewardXp: 40 },

  // Stat threshold
  { id: "stats_60_30m", title: "Balanced Life", description: "Keep all stats above 60 for 30 minutes", type: "stat_threshold", targetKey: undefined, targetValue: 60, durationMinutes: 30, rewardXp: 40 },
  { id: "stats_80_15m", title: "Peak Wellness", description: "Keep all stats above 80 for 15 minutes", type: "stat_threshold", targetKey: undefined, targetValue: 80, durationMinutes: 15, rewardXp: 50 },

  // Chat quests
  { id: "chat_3", title: "Chatty Day", description: "Chat with Mossy 3 times today", type: "chat_count", targetKey: undefined, targetValue: 3, rewardXp: 25 },
  { id: "chat_5", title: "Best Friends", description: "Chat with Mossy 5 times today", type: "chat_count", targetKey: undefined, targetValue: 5, rewardXp: 35 },

  // Chat time
  { id: "chat_night", title: "Night Chat", description: "Chat with Mossy at night", type: "chat_time", targetKey: "night", targetValue: 1, rewardXp: 30 },
  { id: "chat_morning", title: "Morning Chat", description: "Chat with Mossy in the morning", type: "chat_time", targetKey: "morning", targetValue: 1, rewardXp: 25 },

  // Progression
  { id: "reach_3", title: "Growth Spurt", description: "Reach level 3", type: "reach_level", targetKey: undefined, targetValue: 3, rewardXp: 40 },
  { id: "reach_5", title: "Getting Bigger", description: "Reach level 5", type: "reach_level", targetKey: undefined, targetValue: 5, rewardXp: 50, minLevel: 3 },
  { id: "reach_10", title: "Double Digits", description: "Reach level 10", type: "reach_level", targetKey: undefined, targetValue: 10, rewardXp: 75, minLevel: 7 },

  { id: "streak_3", title: "Three's a Charm", description: "Maintain a 3-day care streak", type: "streak_reach", targetKey: undefined, targetValue: 3, rewardXp: 30 },
  { id: "streak_7", title: "Week Warrior", description: "Maintain a 7-day care streak", type: "streak_reach", targetKey: undefined, targetValue: 7, rewardXp: 50, minLevel: 3 },

  // Discovery
  { id: "discover_1", title: "Curious Explorer", description: "Discover a new specimen today", type: "discover_specimen", targetKey: undefined, targetValue: 1, rewardXp: 35 },
  { id: "discover_2", title: "Keen Observer", description: "Discover 2 new specimens today", type: "discover_specimen", targetKey: undefined, targetValue: 2, rewardXp: 60, minLevel: 5 },

  // Extra variety
  { id: "water_5", title: "Rain Dance", description: "Water Mossy 5 times today", type: "care_count", targetKey: "water", targetValue: 5, rewardXp: 35, minLevel: 3 },
  { id: "feed_5", title: "Feast Day", description: "Feed Mossy 5 times today", type: "care_count", targetKey: "feed", targetValue: 5, rewardXp: 35, minLevel: 3 },
  { id: "any_12", title: "Super Caretaker", description: "Perform any 12 care actions today", type: "care_any_count", targetKey: undefined, targetValue: 12, rewardXp: 50, minLevel: 5 },
];

export const QUEST_TEMPLATE_MAP = new Map(QUEST_TEMPLATES.map((t) => [t.id, t]));
