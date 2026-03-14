import { useQuestStore } from "../../stores/questStore";
import { QUEST_TEMPLATE_MAP } from "./data/questTemplates";
import { PanelCard } from "../../components/PanelCard";
import { IconQuests } from "../../components/icons";

interface QuestPanelProps {
  onClose: () => void;
}

export function QuestPanel({ onClose }: QuestPanelProps) {
  const date = useQuestStore((s) => s.date);
  const quests = useQuestStore((s) => s.quests);

  return (
    <PanelCard
      title="Daily Quests"
      subtitle={date}
      onClose={onClose}
      icon={<IconQuests size={16} />}
    >
      <div className="flex flex-col gap-2">
        {quests.map((q) => {
          const template = QUEST_TEMPLATE_MAP.get(q.templateId);
          if (!template) return null;
          const progress = Math.min(q.progress, template.targetValue);
          const pct = (progress / template.targetValue) * 100;

          return (
            <div
              key={q.templateId}
              className="rounded-lg p-2"
              style={{
                background: q.completed
                  ? "oklch(0.58 0.14 145 / 0.08)"
                  : "var(--color-surface-raised)",
              }}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-medium" style={{ fontSize: "var(--text-xs)", color: "var(--color-text-primary)" }}>
                  {q.completed && <span className="mr-1">&#x2714;</span>}
                  {template.title}
                </span>
                <span
                  className="font-bold rounded px-1 py-0.5"
                  style={{ fontSize: "8px", background: "rgba(212, 175, 55, 0.2)", color: "#d4af37" }}
                >
                  +{template.rewardXp} XP
                </span>
              </div>
              <div className="mb-1" style={{ fontSize: "8px", color: "var(--color-text-tertiary)" }}>
                {template.description}
              </div>
              <div
                className="h-[3px] rounded-full overflow-hidden"
                style={{ background: "var(--color-surface-inset)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(pct, 3)}%`,
                    background: q.completed ? "#7cb342" : "#d4af37",
                  }}
                />
              </div>
              <div className="mt-0.5 text-right" style={{ fontSize: "7px", color: "var(--color-text-tertiary)" }}>
                {progress}/{template.targetValue}
                {template.durationMinutes ? " min" : ""}
              </div>
            </div>
          );
        })}

        {quests.length === 0 && (
          <div className="text-center py-4" style={{ color: "var(--color-text-tertiary)", fontSize: "var(--text-xs)" }}>
            No quests today
          </div>
        )}
      </div>
    </PanelCard>
  );
}
