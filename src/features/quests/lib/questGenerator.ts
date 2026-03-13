import type { ActiveQuest, QuestTemplate } from "../../../types";
import { QUEST_TEMPLATES } from "../data/questTemplates";

/** Mulberry32 seeded PRNG */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Simple hash of date string to seed */
function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return hash;
}

export function generateDailyQuests(
  date: string,
  level: number,
  discoveredCount: number,
  totalSpecimens: number,
): ActiveQuest[] {
  const rng = mulberry32(hashDate(date));

  // Filter eligible templates
  const eligible = QUEST_TEMPLATES.filter((t) => {
    if (t.minLevel && level < t.minLevel) return false;
    // Exclude reach_level if already met
    if (t.type === "reach_level" && level >= t.targetValue) return false;
    // Exclude discover if all found
    if (t.type === "discover_specimen" && discoveredCount >= totalSpecimens) return false;
    return true;
  });

  const questCount = level >= 5 ? 3 : 2;

  // Shuffle with seeded RNG
  const shuffled = [...eligible].sort(() => rng() - 0.5);

  // Select with type diversity
  const selected: QuestTemplate[] = [];
  const usedTypes = new Set<string>();

  for (const template of shuffled) {
    if (selected.length >= questCount) break;
    if (usedTypes.has(template.type)) continue;
    selected.push(template);
    usedTypes.add(template.type);
  }

  // If we don't have enough unique types, fill with remaining
  if (selected.length < questCount) {
    for (const template of shuffled) {
      if (selected.length >= questCount) break;
      if (selected.some((s) => s.id === template.id)) continue;
      selected.push(template);
    }
  }

  return selected.map((t) => ({
    templateId: t.id,
    progress: 0,
    completed: false,
    completedAt: null,
    thresholdMetSince: null,
  }));
}
