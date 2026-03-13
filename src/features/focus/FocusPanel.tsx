import { useEffect, useRef, useCallback, useState } from "react";
import { useFocusStore } from "../../stores/focusStore";
import { useChatStore } from "../../stores/chatStore";
import { useCreatureStore } from "../../stores/creatureStore";
import { computeRemainingMs, formatTimeDisplay, getDurationForStatus } from "./lib/focusTimer";
import { pickProactiveMessage } from "../chat/lib/proactiveMessages";
import { TimerRing } from "./components/TimerRing";
import { SessionProgress } from "./components/SessionProgress";
import { BreakMenu } from "./components/BreakMenu";

export function FocusPanel() {
  const status = useFocusStore((s) => s.status);
  const sessionIndex = useFocusStore((s) => s.sessionIndex);
  const remainingMs = useFocusStore((s) => s.remainingMs);
  const startedAt = useFocusStore((s) => s.startedAt);
  const completedSessionsToday = useFocusStore((s) => s.completedSessionsToday);
  const todayFocusMinutes = useFocusStore((s) => s.todayFocusMinutes);
  const focusStreak = useFocusStore((s) => s.focusStreak);

  const start = useFocusStore((s) => s.start);
  const pause = useFocusStore((s) => s.pause);
  const resume = useFocusStore((s) => s.resume);
  const stop = useFocusStore((s) => s.stop);
  const tick = useFocusStore((s) => s.tick);

  const [displayMs, setDisplayMs] = useState(remainingMs);
  const rafRef = useRef<number>(0);

  // Animation frame loop for smooth countdown
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

      // Check for segment completion
      if (ms <= 0) {
        state.tick();
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [status, startedAt, remainingMs, tick]);

  // Inject proactive message on break transitions (if chat is open)
  const prevStatusRef = useRef(status);
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;
    const isBreakNow = status === "short_break" || status === "long_break";
    const wasBreak = prev === "short_break" || prev === "long_break";
    if (isBreakNow && !wasBreak) {
      const chatState = useChatStore.getState();
      if (chatState.isOpen) {
        const focusState = useFocusStore.getState();
        const mood = useCreatureStore.getState().mood;
        const msg = pickProactiveMessage({
          focusStatus: status,
          completedSessionsToday: focusState.completedSessionsToday,
          todayFocusMinutes: focusState.todayFocusMinutes,
          focusStreak: focusState.focusStreak,
          mood,
        });
        if (msg) {
          chatState.injectProactiveMessage(msg);
        }
      }
    }
  }, [status]);

  const totalMs = getDurationForStatus(useFocusStore.getState());
  const displayTime = formatTimeDisplay(displayMs);
  const isBreak = status === "short_break" || status === "long_break";

  const handleSkipBreak = useCallback(() => {
    // Force-complete the break by ticking
    start();
  }, [start]);

  return (
    <div className="flex flex-col items-center gap-3 w-full px-4 py-2">
      {/* Timer ring */}
      <TimerRing
        remainingMs={displayMs}
        totalMs={totalMs}
        status={status}
        displayTime={displayTime}
        size={140}
      />

      {/* Session progress */}
      <SessionProgress
        sessionIndex={sessionIndex}
        completedToday={completedSessionsToday}
      />

      {/* Controls */}
      <div className="flex items-center gap-2">
        {status === "idle" && (
          <button
            onClick={start}
            className="rounded-lg px-4 py-1.5 text-xs font-bold text-white transition-transform hover:scale-105 active:scale-95"
            style={{ background: "#7cb342" }}
          >
            Start Focus
          </button>
        )}

        {(status === "focus" || isBreak) && (
          <>
            <button
              onClick={pause}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/80 transition-transform hover:scale-105"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              Pause
            </button>
            <button
              onClick={stop}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/50 transition-transform hover:scale-105"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              Stop
            </button>
          </>
        )}

        {status === "paused" && (
          <>
            <button
              onClick={resume}
              className="rounded-lg px-4 py-1.5 text-xs font-bold text-white transition-transform hover:scale-105 active:scale-95"
              style={{ background: "#fbbf24" }}
            >
              Resume
            </button>
            <button
              onClick={stop}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/50 transition-transform hover:scale-105"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              Stop
            </button>
          </>
        )}
      </div>

      {/* Break suggestions */}
      {isBreak && <BreakMenu onSkipBreak={handleSkipBreak} />}

      {/* Today's stats */}
      <div className="flex items-center gap-3 text-[9px] text-white/50">
        {todayFocusMinutes > 0 && (
          <span>{todayFocusMinutes}m focused today</span>
        )}
        {focusStreak > 0 && (
          <span className="text-orange-400">
            {focusStreak}-day streak
          </span>
        )}
      </div>
    </div>
  );
}
