import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
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
        <motion.div
          key={p.id}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 rounded-lg px-3 py-1.5 text-center pointer-events-none"
          style={{
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(124, 179, 66, 0.4)",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-[9px] text-white/50">Quest Complete!</div>
          <div className="text-[11px] font-bold text-white/90">{p.title}</div>
          <div className="text-[9px] font-bold" style={{ color: "#d4af37" }}>
            +{p.xp} XP
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
