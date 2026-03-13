import { motion } from "motion/react";
import { useQuestStore } from "../../stores/questStore";
import { QUEST_TEMPLATE_MAP } from "./data/questTemplates";

interface QuestPanelProps {
  onClose: () => void;
}

export function QuestPanel({ onClose }: QuestPanelProps) {
  const date = useQuestStore((s) => s.date);
  const quests = useQuestStore((s) => s.quests);

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
        className="rounded-xl px-4 py-3 w-[220px]"
        style={{ background: "rgba(0, 0, 0, 0.6)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/80 text-xs font-medium">Daily Quests</span>
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-[8px]">{date}</span>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/70 text-sm leading-none transition-colors"
            >
              &#x2715;
            </button>
          </div>
        </div>

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
                    ? "rgba(124, 179, 66, 0.12)"
                    : "rgba(255, 255, 255, 0.04)",
                }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-medium text-white/80">
                    {q.completed && <span className="mr-1">&#x2714;</span>}
                    {template.title}
                  </span>
                  <span
                    className="text-[8px] font-bold rounded px-1 py-0.5"
                    style={{ background: "rgba(212, 175, 55, 0.2)", color: "#d4af37" }}
                  >
                    +{template.rewardXp} XP
                  </span>
                </div>
                <div className="text-[8px] text-white/40 mb-1">
                  {template.description}
                </div>
                <div
                  className="h-[3px] rounded-full overflow-hidden"
                  style={{ background: "rgba(255, 255, 255, 0.1)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(pct, 3)}%`,
                      background: q.completed ? "#7cb342" : "#d4af37",
                    }}
                  />
                </div>
                <div className="text-[7px] text-white/30 mt-0.5 text-right">
                  {progress}/{template.targetValue}
                  {template.durationMinutes ? " min" : ""}
                </div>
              </div>
            );
          })}

          {quests.length === 0 && (
            <div className="text-center text-white/30 text-[10px] py-4">
              No quests today
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
