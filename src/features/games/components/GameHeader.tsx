import { IconBack } from "../../../components/icons";

interface GameHeaderProps {
  onBack: () => void;
  timeDisplay: string;     // "0:45"
  score: number;
}

export function GameHeader({ onBack, timeDisplay, score }: GameHeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-2 py-1.5"
      style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
    >
      <button
        onClick={onBack}
        className="p-1 rounded-lg transition-colors"
        style={{ color: "var(--color-text-secondary)" }}
      >
        <IconBack size={14} />
      </button>
      <span
        className="font-mono font-bold"
        style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)" }}
      >
        {timeDisplay}
      </span>
      <span
        className="font-bold"
        style={{ fontSize: "var(--text-sm)", color: "#d4af37" }}
      >
        {score}
      </span>
    </div>
  );
}
