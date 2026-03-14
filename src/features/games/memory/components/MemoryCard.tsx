import { motion, AnimatePresence } from "motion/react";
import { MiniPixelArt } from "../../../../components/MiniPixelArt";
import type { MemoryCard as MemoryCardType } from "../lib/memoryEngine";
import type { SpecimenDefinition } from "../../../../types";

const RARITY_GLOW: Record<string, string> = {
  common: "rgba(124, 179, 66, 0.5)",
  uncommon: "rgba(66, 165, 245, 0.6)",
  rare: "rgba(171, 71, 188, 0.7)",
  legendary: "rgba(255, 215, 0, 0.8)",
};

interface MemoryCardProps {
  card: MemoryCardType;
  specimen?: SpecimenDefinition;
  isFlipped: boolean;
  onTap: () => void;
  disabled: boolean;
}

export function MemoryCard({ card, specimen, isFlipped, onTap, disabled }: MemoryCardProps) {
  return (
    <AnimatePresence mode="wait">
      {card.matched ? (
        <motion.div
          key="matched"
          className="flex items-center justify-center rounded-lg"
          style={{
            aspectRatio: "1",
            background: "var(--color-surface-inset)",
            border: `1px solid ${specimen ? RARITY_GLOW[specimen.rarity] : "var(--color-border-subtle)"}`,
            boxShadow: specimen ? `0 0 6px ${RARITY_GLOW[specimen.rarity]}` : undefined,
          }}
          initial={{ scale: 1.05 }}
          animate={{ scale: 0.9, opacity: 0.3 }}
          transition={{ duration: 0.4 }}
        >
          {specimen && <MiniPixelArt pattern={specimen.pattern} size={32} />}
        </motion.div>
      ) : (
        <motion.button
          key="card"
          onClick={disabled ? undefined : onTap}
          className="flex items-center justify-center rounded-lg"
          style={{
            aspectRatio: "1",
            background: isFlipped ? "var(--color-surface-raised)" : "var(--color-surface-inset)",
            border: `1px solid ${isFlipped && specimen ? RARITY_GLOW[specimen.rarity] : "var(--color-border-subtle)"}`,
            cursor: disabled ? "default" : "pointer",
            perspective: "400px",
          }}
          whileTap={disabled ? undefined : { scale: 0.95 }}
        >
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            style={{ transformStyle: "preserve-3d", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {isFlipped && specimen ? (
              <motion.div
                style={{ transform: "rotateY(180deg)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <MiniPixelArt pattern={specimen.pattern} size={32} />
              </motion.div>
            ) : (
              <div className="flex items-center justify-center" style={{ opacity: 0.3 }}>
                {/* Card back: small leaf pattern */}
                <svg width={16} height={16} viewBox="0 0 16 16" fill="var(--color-moss-500)" opacity={0.4}>
                  <path d="M8 2C5 2 3 5 3 8c0 2 1 3.5 2 4 .5-2.5 2-4.5 5-6C10.5 4 9.5 3 8 2z" />
                  <path d="M8 14c3 0 5-3 5-6 0-2-1-3.5-2-4-.5 2.5-2 4.5-5 6C5.5 12 6.5 13 8 14z" opacity={0.6} />
                </svg>
              </div>
            )}
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
