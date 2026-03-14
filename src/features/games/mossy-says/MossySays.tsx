import { useReducer, useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { GameHeader } from "../components/GameHeader";
import { GameOver } from "../components/GameOver";
import { StatButton } from "./components/StatButton";
import { RoundIndicator } from "./components/RoundIndicator";
import {
  createGame,
  extendSequence,
  handleInput,
  calculateScore,
  type MossySaysState,
  type StatIcon,
} from "./lib/mossySaysEngine";
import { formatTimeDisplay } from "../../focus/lib/focusTimer";
import { useGameStore } from "../../../stores/gameStore";

interface MossySaysProps {
  onDone: () => void;
  onPlayAgain?: () => void;
}

type Action =
  | { type: "start_showing" }
  | { type: "show_next" }
  | { type: "start_input" }
  | { type: "input"; icon: StatIcon }
  | { type: "next_round" }
  | { type: "timeout" };

function reducer(state: MossySaysState, action: Action): MossySaysState {
  switch (action.type) {
    case "start_showing":
      return { ...state, phase: "showing", showingIndex: -1, playerInput: [] };
    case "show_next":
      return { ...state, showingIndex: state.showingIndex + 1 };
    case "start_input":
      return { ...state, phase: "input", showingIndex: -1 };
    case "input": {
      const result = handleInput(state, action.icon);
      return result.state;
    }
    case "next_round":
      return extendSequence(state);
    case "timeout":
      return { ...state, phase: "timeout" };
    default:
      return state;
  }
}

function initGame(_: null): MossySaysState {
  return createGame();
}

export function MossySays({ onDone, onPlayAgain }: MossySaysProps) {
  const [state, dispatch] = useReducer(reducer, null, initGame);
  const [displayMs, setDisplayMs] = useState(state.timeLimit);
  const [litIcon, setLitIcon] = useState<StatIcon | null>(null);
  const [gameResult, setGameResult] = useState<{ score: number; isNewRecord: boolean } | null>(null);
  const rafRef = useRef(0);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPhaseRef = useRef(state.phase);

  // RAF countdown
  useEffect(() => {
    const isActive = state.phase === "showing" || state.phase === "input";
    if (!isActive) return;

    function animate() {
      const elapsed = Date.now() - state.startedAt;
      const remaining = Math.max(0, state.timeLimit - elapsed);
      setDisplayMs(remaining);

      if (remaining <= 0) {
        dispatch({ type: "timeout" });
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [state.phase, state.startedAt, state.timeLimit]);

  // Showing sequence animation
  useEffect(() => {
    if (state.phase !== "showing") return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const showDelay = state.showingIndex === -1 ? 400 : 200; // initial delay vs gap

    timeoutId = setTimeout(() => {
      const nextIdx = state.showingIndex + 1;
      if (nextIdx >= state.sequence.length) {
        // Done showing
        setLitIcon(null);
        dispatch({ type: "start_input" });
      } else {
        dispatch({ type: "show_next" });
        setLitIcon(state.sequence[nextIdx]);
        // Turn off after 400ms
        showTimerRef.current = setTimeout(() => setLitIcon(null), 400);
      }
    }, showDelay);

    return () => {
      clearTimeout(timeoutId);
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
    };
  }, [state.phase, state.showingIndex, state.sequence]);

  // Handle phase transitions
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = state.phase;

    if (state.phase === "success" && prev !== "success") {
      // Brief celebration then next round
      const timer = setTimeout(() => {
        dispatch({ type: "next_round" });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // Record result on fail/timeout
  useEffect(() => {
    if (state.phase === "fail" || state.phase === "timeout") {
      const score = calculateScore(state);
      useGameStore.getState().recordGameResult("mossy_says", score);
      const result = useGameStore.getState().lastGameResult;
      setGameResult({ score, isNewRecord: result?.isNewRecord ?? false });
    }
  }, [state.phase]);

  // Start showing on mount
  useEffect(() => {
    dispatch({ type: "start_showing" });
  }, []);

  const litTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleButtonTap = useCallback((icon: StatIcon) => {
    if (state.phase !== "input") return;
    // Brief flash on tap
    if (litTimerRef.current) clearTimeout(litTimerRef.current);
    setLitIcon(icon);
    litTimerRef.current = setTimeout(() => setLitIcon(null), 150);
    dispatch({ type: "input", icon });
  }, [state.phase]);

  // Cleanup lit timer on unmount
  useEffect(() => {
    return () => { if (litTimerRef.current) clearTimeout(litTimerRef.current); };
  }, []);

  const timeStr = formatTimeDisplay(displayMs);
  const isGameOver = state.phase === "fail" || state.phase === "timeout";
  const isInputDisabled = state.phase !== "input";

  return (
    <div className="relative flex flex-col gap-3 items-center">
      <GameHeader
        onBack={onDone}
        timeDisplay={timeStr}
        score={calculateScore(state)}
      />

      <RoundIndicator
        round={state.round}
        playerInputLength={state.playerInput.length}
        sequenceLength={state.sequence.length}
        phase={state.phase}
      />

      {/* 2x2 button grid */}
      <div
        className="grid gap-3 px-4 py-2"
        style={{ gridTemplateColumns: "repeat(2, 1fr)", width: "100%" }}
      >
        <StatButton
          icon="hunger"
          lit={litIcon === "hunger"}
          success={state.phase === "success"}
          disabled={isInputDisabled}
          onTap={() => handleButtonTap("hunger")}
        />
        <StatButton
          icon="hydration"
          lit={litIcon === "hydration"}
          success={state.phase === "success"}
          disabled={isInputDisabled}
          onTap={() => handleButtonTap("hydration")}
        />
        <StatButton
          icon="happiness"
          lit={litIcon === "happiness"}
          success={state.phase === "success"}
          disabled={isInputDisabled}
          onTap={() => handleButtonTap("happiness")}
        />
        <StatButton
          icon="energy"
          lit={litIcon === "energy"}
          success={state.phase === "success"}
          disabled={isInputDisabled}
          onTap={() => handleButtonTap("energy")}
        />
      </div>

      <AnimatePresence>
        {isGameOver && gameResult && (
          <GameOver
            score={gameResult.score}
            isNewRecord={gameResult.isNewRecord}
            onPlayAgain={onPlayAgain}
            onDone={onDone}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
