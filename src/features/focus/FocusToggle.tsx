import { useEffect, useRef, useState } from "react";
import { useFocusStore } from "../../stores/focusStore";
import { computeRemainingMs, formatTimeDisplay } from "./lib/focusTimer";

interface FocusToggleProps {
  onClick: () => void;
}

export function FocusToggle({ onClick }: FocusToggleProps) {
  const status = useFocusStore((s) => s.status);
  const remainingMs = useFocusStore((s) => s.remainingMs);
  const startedAt = useFocusStore((s) => s.startedAt);
  const tick = useFocusStore((s) => s.tick);
  const [displayMs, setDisplayMs] = useState(remainingMs);
  const rafRef = useRef<number>(0);

  const isActive = status !== "idle";

  useEffect(() => {
    if (status === "idle" || status === "paused") {
      setDisplayMs(remainingMs);
      return;
    }

    function animate() {
      const state = useFocusStore.getState();
      const now = Date.now();
      const ms = computeRemainingMs(state, now);
      setDisplayMs(ms);
      if (ms <= 0) state.tick();
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [status, startedAt, remainingMs, tick]);

  const isBreak = status === "short_break" || status === "long_break";
  const bgColor = isActive
    ? isBreak
      ? "oklch(0.55 0.10 255 / 0.15)"
      : "oklch(0.58 0.14 145 / 0.15)"
    : "var(--color-surface-inset)";

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 rounded-lg px-2 py-1 transition-transform hover:scale-105 active:scale-95"
      style={{ background: bgColor }}
      title={isActive ? `Focus timer: ${formatTimeDisplay(displayMs)}` : "Start a focus session"}
    >
      {isActive ? (
        <>
          <span className="text-[10px] leading-none">
            {isBreak ? "\u2615" : "\u{1F3AF}"}
          </span>
          <span className="text-[9px] font-mono font-bold leading-none" style={{ color: "var(--color-text-primary)" }}>
            {formatTimeDisplay(displayMs)}
          </span>
        </>
      ) : (
        <span className="text-[10px] leading-none" title="Focus">
          {"\u{1F3AF}"}
        </span>
      )}
    </button>
  );
}
