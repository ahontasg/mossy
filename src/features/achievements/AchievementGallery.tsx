import { useAchievementStore } from "../../stores/achievementStore";
import { ACHIEVEMENTS } from "./data/achievements";
import { CareCalendar } from "./CareCalendar";
import { PanelCard } from "../../components/PanelCard";
import { IconAchievements } from "../../components/icons";

interface AchievementGalleryProps {
  onClose: () => void;
}

export function AchievementGallery({ onClose }: AchievementGalleryProps) {
  const unlocked = useAchievementStore((s) => s.unlocked);
  const unlockedIds = new Set(unlocked.map((u) => u.id));
  const unlockedMap = new Map(unlocked.map((u) => [u.id, u]));

  return (
    <PanelCard
      title="Achievements"
      subtitle={`${unlocked.length}/${ACHIEVEMENTS.length}`}
      onClose={onClose}
      icon={<IconAchievements size={16} />}
    >
      {/* Care calendar */}
      <div className="mb-3 flex justify-center">
        <CareCalendar />
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-3 gap-1">
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
                  ? "oklch(0.82 0.06 85 / 0.3)"
                  : "var(--color-surface-inset)",
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
                style={{ color: isUnlocked ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}
              >
                {def.name}
              </span>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
}
