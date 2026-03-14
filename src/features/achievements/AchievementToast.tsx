import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { Toast } from "../../components/Toast";
import { useAchievementStore } from "../../stores/achievementStore";
import { ACHIEVEMENT_MAP } from "./data/achievements";
import { useSettingsStore } from "../../stores/settingsStore";
import { playLevelUpDing } from "../../lib/audio";

interface ToastItem {
  id: number;
  name: string;
  icon: string;
}

let toastId = 0;

export function AchievementToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

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
        <Toast key={t.id} variant="achievement">
          <div style={{ color: "var(--color-text-tertiary)", fontSize: "var(--text-xs)" }}>
            Achievement Unlocked!
          </div>
          <div
            className="font-bold"
            style={{ color: "var(--color-text-primary)", fontSize: "var(--text-sm)" }}
          >
            {t.icon} {t.name}
          </div>
        </Toast>
      ))}
    </AnimatePresence>
  );
}
