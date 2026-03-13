import type { ActiveQuest, QuestTemplate, TimeOfDay } from "../../../types";

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

/** Track focus session completions. */
export function trackFocusSession(
  quests: ActiveQuest[],
  templateMap: Map<string, QuestTemplate>,
  completedSessionsToday: number,
  todayFocusMinutes: number,
): ActiveQuest[] {
  return updateQuest(quests, templateMap, (template, quest) => {
    if (template.type === "focus_sessions") {
      const progress = Math.min(completedSessionsToday, template.targetValue);
      if (progress === quest.progress) return null;
      const completed = progress >= template.targetValue;
      return { ...quest, progress, completed, completedAt: completed ? Date.now() : null };
    }
    if (template.type === "focus_cycle") {
      const progress = Math.min(completedSessionsToday, template.targetValue);
      if (progress === quest.progress) return null;
      const completed = progress >= template.targetValue;
      return { ...quest, progress, completed, completedAt: completed ? Date.now() : null };
    }
    if (template.type === "focus_minutes") {
      const progress = Math.min(todayFocusMinutes, template.targetValue);
      if (progress === quest.progress) return null;
      const completed = progress >= template.targetValue;
      return { ...quest, progress, completed, completedAt: completed ? Date.now() : null };
    }
    return null;
  });
}

/** Track game plays. */
export function trackGamePlay(
  quests: ActiveQuest[],
  templateMap: Map<string, QuestTemplate>,
  gamesPlayedToday: number,
): ActiveQuest[] {
  return updateQuest(quests, templateMap, (template, quest) => {
    if (template.type === "game_play") {
      const progress = Math.min(gamesPlayedToday, template.targetValue);
      if (progress === quest.progress) return null;
      const completed = progress >= template.targetValue;
      return { ...quest, progress, completed, completedAt: completed ? Date.now() : null };
    }
    return null;
  });
}

/** Track game high score achievements. */
export function trackGameHighScore(
  quests: ActiveQuest[],
  templateMap: Map<string, QuestTemplate>,
  gameId: string,
  isNewRecord: boolean,
): ActiveQuest[] {
  if (!isNewRecord) return quests;
  return updateQuest(quests, templateMap, (template, quest) => {
    if (template.type === "game_high_score" && template.targetKey === gameId) {
      if (quest.progress >= 1) return null;
      return { ...quest, progress: 1, completed: true, completedAt: Date.now() };
    }
    return null;
  });
}

/** Track daily challenge completion. */
export function trackChallengeComplete(
  quests: ActiveQuest[],
  templateMap: Map<string, QuestTemplate>,
  completedToday: boolean,
): ActiveQuest[] {
  if (!completedToday) return quests;
  return updateQuest(quests, templateMap, (template, quest) => {
    if (template.type === "challenge_complete") {
      if (quest.progress >= 1) return null;
      return { ...quest, progress: 1, completed: true, completedAt: Date.now() };
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

export function trackReminderSet(
  quests: ActiveQuest[],
  templateMap: Map<string, QuestTemplate>,
  reminderCount: number,
): ActiveQuest[] {
  return updateQuest(quests, templateMap, (template, quest) => {
    if (template.type === "set_reminder") {
      const progress = Math.min(reminderCount, template.targetValue);
      if (progress === quest.progress) return null;
      const completed = progress >= template.targetValue;
      return { ...quest, progress, completed, completedAt: completed ? Date.now() : null };
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
