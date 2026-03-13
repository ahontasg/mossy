import { useQuestStore } from "../../../stores/questStore";

interface QuestIndicatorProps {
  onClick: () => void;
}

export function QuestIndicator({ onClick }: QuestIndicatorProps) {
  const quests = useQuestStore((s) => s.quests);
  const completed = quests.filter((q) => q.completed).length;
  const total = quests.length;
  const allDone = total > 0 && completed === total;

  if (total === 0) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-0.5 rounded px-1.5 py-0.5 transition-transform hover:scale-110"
      style={{
        background: allDone ? "rgba(124, 179, 66, 0.2)" : "rgba(255, 255, 255, 0.08)",
      }}
      title="Daily Quests"
    >
      <span className="text-[10px] leading-none">&#x2705;</span>
      <span
        className="text-[8px] font-bold leading-none"
        style={{ color: allDone ? "#7cb342" : "rgba(255, 255, 255, 0.5)" }}
      >
        {completed}/{total}
      </span>
    </button>
  );
}
