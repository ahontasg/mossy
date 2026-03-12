import { useState, useEffect, useRef, useCallback } from "react";
import { PARTICLE_CONFIGS, type ParticleConfig } from "../data/particles";
import type { CareAction } from "../../../types";
import { useCreatureStore, isDormant } from "../../../stores/creatureStore";

export interface Particle {
  id: number;
  config: ParticleConfig;
  x: number; // grid column
  y: number; // grid row
  ttl: number; // remaining ticks
}

const MAX_PARTICLES = 12;
const TICK_MS = 125; // ~8fps for retro feel

let nextId = 0;

export function useParticles(): Particle[] {
  const [particles, setParticles] = useState<Particle[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spawn = useCallback((actionType: CareAction | "zzz" | "spore") => {
    const config = PARTICLE_CONFIGS[actionType];
    if (!config) return;

    setParticles((prev) => {
      const available = MAX_PARTICLES - prev.length;
      const count = Math.min(config.count, available);
      if (count <= 0) return prev;

      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const offsetX = Math.floor(
          Math.random() * config.spread - config.spread / 2,
        );
        newParticles.push({
          id: nextId++,
          config,
          x: 8 + offsetX, // center of 16-wide grid + spread
          y: config.startRow,
          ttl: config.ttl,
        });
      }
      return [...prev, ...newParticles];
    });
  }, []);

  // Tick: move particles, decrement TTL, remove expired
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.config.dx,
            y: p.y + p.config.dy,
            ttl: p.ttl - 1,
          }))
          .filter((p) => p.ttl > 0),
      );
    }, TICK_MS);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  // Subscribe to care actions
  useEffect(() => {
    const unsub = useCreatureStore.subscribe(
      (s) => s.lastCareAction,
      (action) => {
        if (action) {
          spawn(action.type);
        }
      },
    );
    return unsub;
  }, [spawn]);

  // Continuous spore emission when dormant (all stats at floor)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const unsub = useCreatureStore.subscribe(
      (s) => s.stats,
      (stats) => {
        if (isDormant(stats) && !interval) {
          interval = setInterval(() => spawn("spore"), 800);
        } else if (!isDormant(stats) && interval) {
          clearInterval(interval);
          interval = null;
        }
      },
      { fireImmediately: true },
    );

    return () => {
      unsub();
      if (interval) clearInterval(interval);
    };
  }, [spawn]);

  return particles;
}
