import type { CareEventType } from "../../../types";

const EVENT_TEMPLATES: Record<CareEventType, string> = {
  focus_complete: "{name} completed a focus session",
  game_score: "{name} scored {score} in {game}!",
  challenge_complete: "{name} completed the Daily Challenge!",
  chat: "{name} chatted with their Mossy",
  quest_complete: "{name} completed a quest!",
  level_up: "{name} reached Level {level}!",
};

export function formatFeedEvent(
  displayName: string,
  eventType: CareEventType,
  xpEarned: number,
  metadata: Record<string, unknown> = {},
): string {
  let template = EVENT_TEMPLATES[eventType] ?? `${displayName} did something`;
  template = template.replace("{name}", displayName);

  if (eventType === "level_up" && metadata.level != null) {
    template = template.replace("{level}", String(metadata.level));
  }

  if (eventType === "game_score") {
    template = template.replace("{score}", String(metadata.score ?? 0));
    template = template.replace("{game}", String(metadata.gameId ?? "a game"));
  }

  if (xpEarned > 0) {
    template += ` (+${xpEarned} XP)`;
  }

  return template;
}
