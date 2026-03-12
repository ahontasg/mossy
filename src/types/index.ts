export type Mood = "happy" | "content" | "neutral" | "sad" | "critical";

export type GrowthStage = "sprout" | "young" | "mature" | "elder";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

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
