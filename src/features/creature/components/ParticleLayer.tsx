import { AnimatePresence, motion } from "motion/react";
import { useParticles, type Particle } from "../hooks/useParticles";

import { CELL_SIZE } from "../constants";

const CELL = CELL_SIZE;

function ParticleSprite({ particle }: { particle: Particle }) {
  const { config, x, y } = particle;
  return (
    <g transform={`translate(${x * CELL}, ${y * CELL})`}>
      {config.pattern.map((row, py) =>
        row.map((color, px) =>
          color ? (
            <rect
              key={`${px}-${py}`}
              x={px * CELL}
              y={py * CELL}
              width={CELL}
              height={CELL}
              fill={color}
            />
          ) : null,
        ),
      )}
    </g>
  );
}

import type { ParticleType } from "../data/particles";
import type { Season } from "../../../types";

export function ParticleLayer({ onSpawnRef, season }: { onSpawnRef?: React.MutableRefObject<((type: ParticleType) => void) | null>; season?: Season }) {
  const { particles, spawn } = useParticles(season);

  // Expose spawn to parent via ref
  if (onSpawnRef) {
    onSpawnRef.current = spawn;
  }

  return (
    <g>
      <AnimatePresence>
        {particles.map((p) => (
          <motion.g
            key={p.id}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0 }}
          >
            <ParticleSprite particle={p} />
          </motion.g>
        ))}
      </AnimatePresence>
    </g>
  );
}
