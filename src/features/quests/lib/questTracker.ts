import type { ActiveQuest, QuestTemplate, CareAction, CreatureStats, TimeOfDay } from "../../../types";

function updateQuest(
  quests: ActiveQuest[],
  templateMap: Map<string, QuestTemplate>,
  predicate: (template: QuestTemplate, quest: ActiveQuest) => ActiveQuest | null,
): ActiveQuest[] {
  let changed = false;
  const updated = quests.map((q) => {
    if (q.completed) return q;
    const template = templateMap.get(q.templateId);
    if (!template) return q;
    const result = predicate(template, q);
    if (result && result !== q) {
      changed = true;
      return result;
    }
    return q;
  });
  return changed ? updated : quests;
}

export function trackCareAction(
  quests: ActiveQuest[],
  templateMap: Map<string, QuestTemplate>,
  action: CareAction,
): ActiveQuest[] {
  return updateQuest(quests, templateMap, (template, quest) => {
    if (template.type === "care_count" && template.targetKey === action) {
      const progress = quest.progress + 1;
      const completed = progress >= template.targetValue;
      return { ...quest, progress, completed, completedAt: completed ? Date.now() : null };
    }
    if (template.type === "care_any_count") {
      const progress = quest.progress + 1;
      const completed = progress >= template.targetValue;
      return { ...quest, progress, completed, completedAt: completed ? Date.now() : null };
    }
    return null;
  });
}

export function trackChatMessage(
  quests: ActiveQuest[],
  templateMap: Map<string, QuestTemplate>,
  chatCount: number,
): ActiveQuest[] {
  return updateQuest(quests, templateMap, (template, quest) => {
    if (template.type === "chat_count") {
      const progress = Math.min(chatCount, template.targetValue);
      if (progress === quest.progress) return null;
      const completed = progress >= template.targetValue;
      return { ...quest, progress, completed, completedAt: completed ? Date.now() : null };
    }
    return null;
  });
}

export function trackStatCheck(
  quests: ActiveQuest[],
  templateMap: Map<string, QuestTemplate>,
  stats: CreatureStats,
  now: number,
): ActiveQuest[] {
  return updateQuest(quests, templateMap, (template, quest) => {
    if (template.type !== "stat_threshold") return null;
    const threshold = template.targetValue;
    const allAbove =
      stats.hunger >= threshold &&
      stats.hydration >= threshold &&
      stats.happiness >= threshold &&
      stats.energy >= threshold;

    if (allAbove) {
      if (quest.thresholdMetSince === null) {
        return { ...quest, thresholdMetSince: now };
      }
      const elapsed = (now - quest.thresholdMetSince) / 60_000;
      const progress = Math.min(elapsed, template.durationMinutes ?? 0);
      const completed = elapsed >= (template.durationMinutes ?? 0);
      return {
        ...quest,
        progress: Math.round(progress),
        completed,
        completedAt: completed ? now : null,
      };
    } else {
      // Stats dropped — reset timer
      if (quest.thresholdMetSince !== null) {
        return { ...quest, thresholdMetSince: null, progress: 0 };
      }
      return null;
    }
  });
}

export function trackLevelUp(
  quests: ActiveQuest[],
  templateMap: Map<string, QuestTemplate>,
  newLevel: number,
): ActiveQuest[] {
  return updateQuest(quests, templateMap, (template, quest) => {
    if (template.type === "reach_level") {
      const progress = Math.min(newLevel, template.targetValue);
      if (progress === quest.progress) return null;
      const completed = newLevel >= template.targetValue;
      return { ...quest, progress, completed, completedAt: completed ? Date.now() : null };
    }
    return null;
  });
}

export function trackStreakChange(
  quests: ActiveQuest[],
  templateMap: Map<string, QuestTemplate>,
  streak: number,
): ActiveQuest[] {
  return updateQuest(quests, templateMap, (template, quest) => {
    if (template.type === "streak_reach") {
      const progress = Math.min(streak, template.targetValue);
      if (progress === quest.progress) return null;
      const completed = streak >= template.targetValue;
      return { ...quest, progress, completed, completedAt: completed ? Date.now() : null };
    }
    return null;
  });
}

export function trackChatTime(
  quests: ActiveQuest[],
  templateMap: Map<string, QuestTemplate>,
  timeOfDay: TimeOfDay,
): ActiveQuest[] {
  return updateQuest(quests, templateMap, (template, quest) => {
    if (template.type === "chat_time" && template.targetKey === timeOfDay) {
      if (quest.progress >= 1) return null;
      return { ...quest, progress: 1, completed: true, completedAt: Date.now() };
    }
    return null;
  });
}

export function trackSpecimenDiscovery(
  quests: ActiveQuest[],
  templateMap: Map<string, QuestTemplate>,
  todayDiscoveries: number,
): ActiveQuest[] {
  return updateQuest(quests, templateMap, (template, quest) => {
    if (template.type === "discover_specimen") {
      const progress = Math.min(todayDiscoveries, template.targetValue);
      if (progress === quest.progress) return null;
      const completed = progress >= template.targetValue;
      return { ...quest, progress, completed, completedAt: completed ? Date.now() : null };
    }
    return null;
  });
}
