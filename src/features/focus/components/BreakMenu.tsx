import { BREAK_SUGGESTION_TEXTS } from "../data/breakSuggestions";
import { useUiStore } from "../../../stores/uiStore";

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
        onClick={() => useUiStore.getState().setPanel("games")}
        className="rounded-lg px-3 py-1 font-medium transition-transform hover:scale-105 active:scale-95"
        style={{
          background: "var(--color-surface-raised)",
          color: "var(--color-moss-600)",
          fontSize: "var(--text-xs)",
        }}
      >
        Play a brain break
      </button>
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
