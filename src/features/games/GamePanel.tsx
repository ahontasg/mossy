import { useState } from "react";
import { PanelCard } from "../../components/PanelCard";
import { IconGames } from "../../components/icons";
import { GameCard } from "./components/GameCard";
import { TokenBadge } from "./components/TokenBadge";
import { MemoryMatch } from "./memory/MemoryMatch";
import { MossySays } from "./mossy-says/MossySays";
import { useGameStore } from "../../stores/gameStore";
import { useFocusStore } from "../../stores/focusStore";
import { useJournalStore } from "../../stores/journalStore";
import { MIN_SPECIMENS_FOR_MEMORY } from "./lib/gameRewards";
import type { GameId } from "../../types";

interface GamePanelProps {
  onClose: () => void;
}

export function GamePanel({ onClose }: GamePanelProps) {
  const tokens = useGameStore((s) => s.tokens);
  const highScores = useGameStore((s) => s.highScores);
  const focusStatus = useFocusStore((s) => s.status);
  const discoveredCount = useJournalStore((s) => s.discovered.length);
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [gameKey, setGameKey] = useState(0);

  const isBreak = focusStatus === "short_break" || focusStatus === "long_break";

  function getGameAvailability(lockCondition?: boolean): "locked" | "free" | "available" | "unavailable" {
    if (lockCondition) return "locked";
    if (isBreak) return "free";
    if (tokens > 0) return "available";
    return "unavailable";
  }

  function handlePlay(gameId: GameId) {
    if (!isBreak) {
      const spent = useGameStore.getState().spendToken();
      if (!spent) return;
    }
    setActiveGame(gameId);
    setGameKey((k) => k + 1);
  }

  function canPlayAgain(): boolean {
    return isBreak || useGameStore.getState().tokens > 0;
  }

  function handlePlayAgain() {
    if (!isBreak) {
      const spent = useGameStore.getState().spendToken();
      if (!spent) return;
    }
    setGameKey((k) => k + 1);
  }

  if (activeGame === "memory") {
    return (
      <PanelCard title="Memory Match" icon={<IconGames size={16} />} onClose={onClose}>
        <MemoryMatch
          key={gameKey}
          onDone={() => setActiveGame(null)}
          onPlayAgain={canPlayAgain() ? handlePlayAgain : undefined}
        />
      </PanelCard>
    );
  }

  if (activeGame === "mossy_says") {
    return (
      <PanelCard title="Mossy Says" icon={<IconGames size={16} />} onClose={onClose}>
        <MossySays
          key={gameKey}
          onDone={() => setActiveGame(null)}
          onPlayAgain={canPlayAgain() ? handlePlayAgain : undefined}
        />
      </PanelCard>
    );
  }

  return (
    <PanelCard
      title="Games"
      icon={<IconGames size={16} />}
      subtitle={`${tokens} tokens`}
      onClose={onClose}
    >
      <div className="flex flex-col gap-3">
        {/* Token info */}
        <div className="flex items-center gap-2">
          <TokenBadge tokens={tokens} />
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}>
            Earn 1 per focus session
          </span>
        </div>

        {/* Break banner */}
        {isBreak && (
          <div
            className="rounded-lg px-3 py-1.5 text-center font-medium"
            style={{
              background: "oklch(0.60 0.12 145 / 0.12)",
              color: "#7cb342",
              fontSize: "var(--text-xs)",
            }}
          >
            Break time — play free!
          </div>
        )}

        {/* Game cards */}
        <GameCard
          name="Memory Match"
          description="Flip cards and find specimen pairs"
          highScore={highScores.memory}
          state={getGameAvailability(discoveredCount < MIN_SPECIMENS_FOR_MEMORY)}
          lockMessage="Discover 6 specimens to unlock"
          lockProgress={`${discoveredCount}/${MIN_SPECIMENS_FOR_MEMORY} specimens`}
          onPlay={() => handlePlay("memory")}
        />
        <GameCard
          name="Mossy Says"
          description="Repeat the pattern — how far can you go?"
          highScore={highScores.mossy_says}
          state={getGameAvailability()}
          onPlay={() => handlePlay("mossy_says")}
        />
      </div>
    </PanelCard>
  );
}
