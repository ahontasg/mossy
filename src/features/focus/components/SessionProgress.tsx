import { SESSIONS_PER_CYCLE } from "../lib/focusTimer";

interface SessionProgressProps {
  sessionIndex: number;
  completedToday: number;
}

export function SessionProgress({ sessionIndex, completedToday }: SessionProgressProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: SESSIONS_PER_CYCLE }, (_, i) => {
        const isComplete = i < sessionIndex;
        const isCurrent = i === sessionIndex;
        return (
          <div
            key={i}
            className="h-1.5 w-5 rounded-full"
            style={{
              background: isComplete
                ? "#7cb342"
                : isCurrent
                  ? "rgba(124, 179, 66, 0.5)"
                  : "rgba(255,255,255,0.15)",
              transition: "background 0.3s",
            }}
          />
        );
      })}
      {completedToday > 0 && (
        <span className="text-[8px] text-white/50 ml-1">
          {completedToday} done
        </span>
      )}
    </div>
  );
}
