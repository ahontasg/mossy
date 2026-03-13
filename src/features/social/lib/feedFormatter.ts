import type { CareEventType } from "../../../types";

const EVENT_TEMPLATES: Record<CareEventType, string> = {
  feed: "{name} fed their Mossy",
  water: "{name} watered their Mossy",
  pet: "{name} pet their Mossy",
  sunlight: "{name} gave their Mossy some sun",
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

  if (xpEarned > 0) {
    template += ` (+${xpEarned} XP)`;
  }

  return template;
}
