import type { MossySaysState } from "../lib/mossySaysEngine";

interface RoundIndicatorProps {
  round: number;
  playerInputLength: number;
  sequenceLength: number;
  phase: MossySaysState["phase"];
}

export function RoundIndicator({ round, playerInputLength, sequenceLength, phase }: RoundIndicatorProps) {
  const showProgress = phase === "input";

  return (
    <div className="flex items-center gap-2" style={{ fontSize: "var(--text-xs)" }}>
      <span
        className="font-bold"
        style={{ color: "var(--color-text-primary)" }}
      >
        Round {round}
      </span>
      {showProgress && (
        <span style={{ color: "var(--color-text-tertiary)" }}>
          {playerInputLength}/{sequenceLength}
        </span>
      )}
      {phase === "showing" && (
        <span style={{ color: "var(--color-text-tertiary)" }}>
          Watch...
        </span>
      )}
      {phase === "success" && (
        <span style={{ color: "#7cb342" }}>
          Correct!
        </span>
      )}
    </div>
  );
}
