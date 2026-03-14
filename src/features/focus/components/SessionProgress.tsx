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
                  : "var(--color-surface-inset)",
              transition: "background 0.3s",
            }}
          />
        );
      })}
      {completedToday > 0 && (
        <span className="ml-1" style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
          {completedToday} done
        </span>
      )}
    </div>
  );
}
