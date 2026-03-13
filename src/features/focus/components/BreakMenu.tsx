import { BREAK_SUGGESTION_TEXTS } from "../data/breakSuggestions";

interface BreakMenuProps {
  onSkipBreak: () => void;
}

export function BreakMenu({ onSkipBreak }: BreakMenuProps) {
  const suggestion = BREAK_SUGGESTION_TEXTS[Math.floor(Date.now() / 60_000) % BREAK_SUGGESTION_TEXTS.length];

  return (
    <div className="flex flex-col items-center gap-2 px-3">
      <p className="text-[10px] text-white/70 text-center italic">
        {suggestion}
      </p>
      <button
        onClick={onSkipBreak}
        className="text-[9px] text-white/40 hover:text-white/70 transition-colors"
      >
        Skip break
      </button>
    </div>
  );
}
