import { motion } from "motion/react";
import { useAchievementStore } from "../../stores/achievementStore";
import { ACHIEVEMENTS } from "./data/achievements";
import { CareCalendar } from "./CareCalendar";

interface AchievementGalleryProps {
  onClose: () => void;
}

export function AchievementGallery({ onClose }: AchievementGalleryProps) {
  const unlocked = useAchievementStore((s) => s.unlocked);
  const unlockedIds = new Set(unlocked.map((u) => u.id));
  const unlockedMap = new Map(unlocked.map((u) => [u.id, u]));

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="rounded-xl px-3 py-3 w-[220px] max-h-[90%] flex flex-col"
        style={{ background: "rgba(0, 0, 0, 0.6)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 text-xs font-medium">Achievements</span>
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-[9px]">
              {unlocked.length}/{ACHIEVEMENTS.length}
            </span>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/70 text-sm leading-none transition-colors"
            >
              &#x2715;
            </button>
          </div>
        </div>

        {/* Care calendar */}
        <div className="mb-2 flex justify-center">
          <CareCalendar />
        </div>

        {/* Badge grid */}
        <div
          className="overflow-y-auto grid grid-cols-3 gap-1 pr-0.5"
          style={{ maxHeight: "200px" }}
        >
          {ACHIEVEMENTS.map((def) => {
            const isUnlocked = unlockedIds.has(def.id);
            const entry = unlockedMap.get(def.id);
            const dateStr = entry
              ? new Date(entry.unlockedAt).toLocaleDateString()
              : "";

            return (
              <div
                key={def.id}
                className="flex flex-col items-center gap-0.5 rounded-lg p-1.5"
                style={{
                  background: isUnlocked
                    ? "rgba(212, 175, 55, 0.08)"
                    : "rgba(255, 255, 255, 0.02)",
                  opacity: isUnlocked ? 1 : 0.35,
                }}
                title={
                  isUnlocked
                    ? `${def.name}\n${def.description}\nUnlocked: ${dateStr}`
                    : `${def.name}\n${def.description}\nLocked`
                }
              >
                <span className="text-lg leading-none">{def.icon}</span>
                <span
                  className="text-[7px] leading-tight text-center truncate w-full"
                  style={{ color: isUnlocked ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }}
                >
                  {def.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
