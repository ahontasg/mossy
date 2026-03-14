import { BREAK_SUGGESTION_TEXTS } from "../data/breakSuggestions";

interface BreakMenuProps {
  onSkipBreak: () => void;
}

export function BreakMenu({ onSkipBreak }: BreakMenuProps) {
  const suggestion = BREAK_SUGGESTION_TEXTS[Math.floor(Date.now() / 60_000) % BREAK_SUGGESTION_TEXTS.length];

  return (
    <div className="flex flex-col items-center gap-2 px-3">
      <p className="text-center italic" style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-xs)" }}>
        {suggestion}
      </p>
      <button
        onClick={onSkipBreak}
        className="hover:opacity-70 transition-opacity"
        style={{ color: "var(--color-text-tertiary)", fontSize: "var(--text-xs)" }}
      >
        Skip break
      </button>
    </div>
  );
}
