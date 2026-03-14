import { useReducer, useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { GameHeader } from "../components/GameHeader";
import { GameOver } from "../components/GameOver";
import { MemoryGrid } from "./components/MemoryGrid";
import {
  selectSpecimens,
  createGame,
  flipCard,
  resolveFlip,
  calculateScore,
  type MemoryState,
} from "./lib/memoryEngine";
import { formatTimeDisplay } from "../../focus/lib/focusTimer";
import { useGameStore } from "../../../stores/gameStore";
import { useJournalStore } from "../../../stores/journalStore";
import { SPECIMENS } from "../../journal/data/specimens";

interface MemoryMatchProps {
  onDone: () => void;
  onPlayAgain?: () => void;
}

type Action =
  | { type: "flip"; cardId: number }
  | { type: "resolve" }
  | { type: "time_up" };

function reducer(state: MemoryState, action: Action): MemoryState {
  switch (action.type) {
    case "flip":
      return flipCard(state, action.cardId);
    case "resolve":
      return resolveFlip(state).state;
    case "time_up":
      return { ...state, status: "time_up" };
    default:
      return state;
  }
}

function createInitialState(_: null): MemoryState {
  const discoveredIds = useJournalStore.getState().discovered.map((d) => d.specimenId);
  const pickedIds = selectSpecimens(discoveredIds, 6);
  return createGame(pickedIds);
}

export function MemoryMatch({ onDone, onPlayAgain }: MemoryMatchProps) {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);
  const [displayMs, setDisplayMs] = useState(state.timeLimit);
  const [gameResult, setGameResult] = useState<{ score: number; isNewRecord: boolean } | null>(null);
  const rafRef = useRef(0);
  const resolveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get specimen data map for rendering
  const specimenMap = useRef(
    new Map(SPECIMENS.map((s) => [s.id, s])),
  ).current;

  // RAF countdown
  useEffect(() => {
    if (state.status !== "playing") return;

    function animate() {
      const elapsed = Date.now() - state.startedAt;
      const remaining = Math.max(0, state.timeLimit - elapsed);
      setDisplayMs(remaining);

      if (remaining <= 0) {
        dispatch({ type: "time_up" });
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [state.status, state.startedAt, state.timeLimit]);

  // Auto-resolve after 2 cards flipped
  useEffect(() => {
    if (state.flippedIds.length === 2) {
      resolveTimerRef.current = setTimeout(() => {
        dispatch({ type: "resolve" });
      }, 600);
      return () => { if (resolveTimerRef.current) clearTimeout(resolveTimerRef.current); };
    }
  }, [state.flippedIds.length]);

  // Record result when game ends
  useEffect(() => {
    if (state.status === "won" || state.status === "time_up") {
      const elapsed = Date.now() - state.startedAt;
      const score = calculateScore(state.matchedPairs, elapsed);
      useGameStore.getState().recordGameResult("memory", score);
      const result = useGameStore.getState().lastGameResult;
      setGameResult({ score, isNewRecord: result?.isNewRecord ?? false });
    }
  }, [state.status]);

  const handleCardTap = useCallback((cardId: number) => {
    if (state.flippedIds.length >= 2) return;
    dispatch({ type: "flip", cardId });
  }, [state.flippedIds.length]);

  const timeStr = formatTimeDisplay(displayMs);
  const currentScore = state.matchedPairs * 100;

  const isGameOver = state.status === "won" || state.status === "time_up";

  return (
    <div className="relative flex flex-col gap-2">
      <GameHeader
        onBack={onDone}
        timeDisplay={timeStr}
        score={currentScore}
      />

      <MemoryGrid
        cards={state.cards}
        flippedIds={state.flippedIds}
        specimenMap={specimenMap}
        onCardTap={handleCardTap}
        disabled={isGameOver || state.flippedIds.length >= 2}
      />

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
