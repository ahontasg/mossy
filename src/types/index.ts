export type Mood = "happy" | "content" | "neutral" | "sad" | "critical";

export type GrowthStage = "sprout" | "young" | "mature" | "elder";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export type Season = "spring" | "summer" | "autumn" | "winter";

export type CareAction = "feed" | "water" | "pet" | "sunlight";

export interface CreatureStats {
  hunger: number;
  hydration: number;
  happiness: number;
  energy: number;
}

export interface CreatureState {
  stats: CreatureStats;
  xp: number;
  level: number;
  growthStage: GrowthStage;
  lastSave: number;
}

// ── Chat types ──

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// ── Streak types ──

export interface StreakData {
  currentStreak: number;
  lastCareDate: string | null; // YYYY-MM-DD
  shieldAvailable: boolean;
  shieldLastGrantedWeek: string | null; // YYYY-Www
}

export interface ReturnMoment {
  durationHours: number;
  statsBefore: CreatureStats;
  statsAfter: CreatureStats;
}

// ── Chat types ──

export type LlmStatus =
  | "unknown"
  | "checking"
  | "no_model"
  | "downloading"
  | "starting"
  | "ready";

export interface ChatEventDelta {
  event: "delta";
  data: { text: string };
}

export interface ChatEventDone {
  event: "done";
}

export interface ChatEventError {
  event: "error";
  data: { message: string };
}

export type ChatEvent = ChatEventDelta | ChatEventDone | ChatEventError;

export interface PullEventProgress {
  event: "progress";
  data: { status: string; percent: number };
}

export interface PullEventDone {
  event: "done";
}

export interface PullEventError {
  event: "error";
  data: { message: string };
}

export type PullEvent = PullEventProgress | PullEventDone | PullEventError;

// ── Specimen types ──

export type SpecimenRarity = "common" | "uncommon" | "rare" | "legendary";

export interface DiscoveryCondition {
  type: "time_of_day" | "season" | "min_stat" | "min_avg_stats" | "min_level" | "growth_stage" | "streak" | "random";
  key?: string;
  value?: number;
}

export interface SpecimenDefinition {
  id: string;
  name: string;
  description: string;
  rarity: SpecimenRarity;
  pattern: (string | null)[][];
  conditions: DiscoveryCondition[];
  season?: Season;
}

export interface DiscoveredSpecimen {
  specimenId: string;
  discoveredAt: number;
  discoveredDate: string;
}

// ── Quest types ──

export type QuestType =
  | "care_count"
  | "care_any_count"
  | "stat_threshold"
  | "chat_count"
  | "chat_time"
  | "reach_level"
  | "streak_reach"
  | "discover_specimen";

export interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  targetKey?: string;
  targetValue: number;
  durationMinutes?: number;
  rewardXp: number;
  minLevel?: number;
}

export interface ActiveQuest {
  templateId: string;
  progress: number;
  completed: boolean;
  completedAt: number | null;
  thresholdMetSince: number | null;
}

// ── Achievement types ──

export interface CareHistoryEntry {
  date: string;
  actions: CareAction[];
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number;
}

// ── Social types ──

export type AuthStatus = "signed_out" | "loading" | "signed_in";

export type CareEventType =
  | "feed"
  | "water"
  | "pet"
  | "sunlight"
  | "chat"
  | "quest_complete"
  | "level_up";

export interface UserProfile {
  id: string;
  displayName: string;
  teamId: string | null;
  referredBy: string | null;
}

export interface Team {
  id: string;
  name: string;
  joinCode: string;
  createdBy: string;
}

export interface QueuedCareEvent {
  id: string;
  eventType: CareEventType;
  xpEarned: number;
  metadata: Record<string, unknown>;
  clientTimestamp: number;
  retryCount: number;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  xp: number;
  activeDays: number;
  specimens: number;
  isCurrentUser: boolean;
}

export type LeaderboardPeriod = "weekly" | "monthly";

export interface FeedItem {
  id: string;
  displayName: string;
  eventType: CareEventType;
  xpEarned: number;
  metadata: Record<string, unknown>;
  serverTimestamp: string;
}
