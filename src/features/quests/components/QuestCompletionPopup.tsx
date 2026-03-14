import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { Toast } from "../../../components/Toast";
import { useQuestStore } from "../../../stores/questStore";
import { useSettingsStore } from "../../../stores/settingsStore";
import { playLevelUpDing } from "../../../lib/audio";
import { QUEST_TEMPLATE_MAP } from "../data/questTemplates";

interface Popup {
  id: number;
  title: string;
  xp: number;
}

let popupId = 0;

export function QuestCompletionPopup() {
  const [popups, setPopups] = useState<Popup[]>([]);

  useEffect(() => {
    return useQuestStore.subscribe(
      (s) => s.lastCompletion,
      (completion) => {
        if (!completion) return;
        const template = QUEST_TEMPLATE_MAP.get(completion.templateId);
        if (!template) return;

        if (useSettingsStore.getState().soundEnabled) {
          playLevelUpDing();
        }

        const id = ++popupId;
        setPopups((prev) => [...prev, { id, title: template.title, xp: completion.rewardXp }]);
        setTimeout(() => {
          setPopups((prev) => prev.filter((p) => p.id !== id));
        }, 2000);
      },
    );
  }, []);

  return (
    <AnimatePresence>
      {popups.map((p) => (
        <Toast key={p.id} variant="success">
          <div style={{ color: "var(--color-text-tertiary)", fontSize: "var(--text-xs)" }}>
            Quest Complete!
          </div>
          <div
            className="font-bold"
            style={{ color: "var(--color-text-primary)", fontSize: "var(--text-sm)" }}
          >
            {p.title}
          </div>
          <div className="font-bold" style={{ color: "#d4af37", fontSize: "var(--text-xs)" }}>
            +{p.xp} XP
          </div>
        </Toast>
      ))}
    </AnimatePresence>
  );
}
