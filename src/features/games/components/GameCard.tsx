import { LeafCoinIcon } from "./TokenBadge";

interface GameCardProps {
  name: string;
  description: string;
  highScore: number;
  state: "locked" | "free" | "available" | "unavailable";
  lockProgress?: string;      // e.g. "4/6 specimens"
  lockMessage?: string;       // e.g. "Discover 6 specimens to unlock"
  onPlay: () => void;
}

export function GameCard({ name, description, highScore, state, lockProgress, lockMessage, onPlay }: GameCardProps) {
  const isPlayable = state === "free" || state === "available";

  return (
    <button
      onClick={isPlayable ? onPlay : undefined}
      disabled={!isPlayable}
      className="flex flex-col gap-1 rounded-xl p-3 text-left transition-transform w-full"
      style={{
        background: "var(--color-surface-raised)",
        border: "1px solid var(--color-border-subtle)",
        opacity: isPlayable ? 1 : 0.5,
        cursor: isPlayable ? "pointer" : "default",
      }}
    >
      <div className="flex items-center justify-between w-full">
        <span
          className="font-semibold"
          style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)" }}
        >
          {name}
        </span>
        {state === "free" && (
          <span
            className="rounded-full px-2 py-0.5 font-bold"
            style={{ fontSize: "9px", background: "#7cb342", color: "white" }}
          >
            FREE
          </span>
        )}
        {state === "available" && (
          <span
            className="flex items-center gap-0.5 font-medium"
            style={{ fontSize: "var(--text-xs)", color: "#7cb342" }}
          >
            <LeafCoinIcon size={10} />
            1
          </span>
        )}
      </div>
      <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
        {state === "locked" ? lockMessage : description}
      </span>
      <div className="flex items-center justify-between w-full">
        {highScore > 0 && (
          <span style={{ fontSize: "var(--text-xs)", color: "#d4af37" }}>
            Best: {highScore}
          </span>
        )}
        {state === "locked" && lockProgress && (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            {lockProgress}
          </span>
        )}
        {state === "unavailable" && (
          <span style={{ fontSize: "9px", color: "var(--color-text-tertiary)" }}>
            Earn tokens by focusing
          </span>
        )}
      </div>
    </button>
  );
}
