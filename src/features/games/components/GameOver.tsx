import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface GameOverProps {
  score: number;
  isNewRecord: boolean;
  onPlayAgain?: () => void;   // undefined if can't play again
  onDone: () => void;
}

export function GameOver({ score, isNewRecord, onPlayAgain, onDone }: GameOverProps) {
  const [displayScore, setDisplayScore] = useState(0);

  // Animate score counter over 0.6s
  useEffect(() => {
    if (score === 0) { setDisplayScore(0); return; }
    const duration = 600;
    const start = performance.now();
    let frameId = 0;
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayScore(Math.round(progress * score));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [score]);

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl"
      style={{ background: "oklch(0.20 0.02 80 / 0.85)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <div
          className="font-bold"
          style={{ fontSize: "var(--text-lg)", color: "var(--color-text-primary)" }}
        >
          Game Over
        </div>
        <div
          className="font-bold tabular-nums"
          style={{ fontSize: "28px", color: "#d4af37" }}
        >
          {displayScore}
        </div>
        {isNewRecord && (
          <motion.div
            className="font-bold"
            style={{ fontSize: "var(--text-sm)", color: "#fbbf24" }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
          >
            New Record!
          </motion.div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onPlayAgain && (
          <button
            onClick={onPlayAgain}
            className="rounded-lg px-3 py-1.5 font-bold transition-transform hover:scale-105 active:scale-95"
            style={{
              background: "var(--color-terracotta-500)",
              color: "white",
              fontSize: "var(--text-sm)",
            }}
          >
            Play Again
          </button>
        )}
        <button
          onClick={onDone}
          className="rounded-lg px-3 py-1.5 font-medium transition-transform hover:scale-105"
          style={{
            background: "var(--color-surface-raised)",
            color: "var(--color-text-secondary)",
            fontSize: "var(--text-sm)",
          }}
        >
          Done
        </button>
      </div>
    </motion.div>
  );
}
