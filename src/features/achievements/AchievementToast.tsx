import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAchievementStore } from "../../stores/achievementStore";
import { ACHIEVEMENT_MAP } from "./data/achievements";
import { useSettingsStore } from "../../stores/settingsStore";
import { playLevelUpDing } from "../../lib/audio";

interface Toast {
  id: number;
  name: string;
  icon: string;
}

let toastId = 0;

export function AchievementToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return useAchievementStore.subscribe(
      (s) => s.lastUnlock,
      (unlock) => {
        if (!unlock) return;
        const def = ACHIEVEMENT_MAP.get(unlock.id);
        if (!def) return;

        if (useSettingsStore.getState().soundEnabled) {
          playLevelUpDing();
        }

        const id = ++toastId;
        setToasts((prev) => [...prev, { id, name: def.name, icon: def.icon }]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
      },
    );
  }, []);

  return (
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          className="absolute top-1 left-1/2 -translate-x-1/2 z-50 rounded-lg px-3 py-1.5 text-center pointer-events-none"
          style={{
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(212, 175, 55, 0.5)",
          }}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-[9px] text-white/50">Achievement Unlocked!</div>
          <div className="text-[11px] font-bold text-white/90">
            {t.icon} {t.name}
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
