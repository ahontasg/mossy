import { useState, useEffect, useRef, useCallback } from "react";
import { PARTICLE_CONFIGS, type ParticleConfig, type ParticleType } from "../data/particles";
import { useCreatureStore, isDormant } from "../../../stores/creatureStore";
import type { Season } from "../../../types";

export interface Particle {
  id: number;
  config: ParticleConfig;
  x: number; // grid column
  y: number; // grid row
  ttl: number; // remaining ticks
}

const MAX_PARTICLES = 16;
const TICK_MS = 125; // ~8fps for retro feel

const SEASON_PARTICLE: Record<Season, ParticleType> = {
  spring: "petal",
  summer: "firefly",
  autumn: "leaf",
  winter: "snowflake",
};

let nextId = 0;

export function useParticles(season?: Season): { particles: Particle[]; spawn: (type: ParticleType) => void } {
  const [particles, setParticles] = useState<Particle[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spawn = useCallback((actionType: ParticleType) => {
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

    let tick = 0;
    const unsub = useCreatureStore.subscribe(
      (s) => s.stats,
      (stats) => {
        if (isDormant(stats) && !interval) {
          interval = setInterval(() => {
            spawn(tick % 2 === 0 ? "zzz" : "spore");
            tick++;
          }, 1200);
        } else if (!isDormant(stats) && interval) {
          clearInterval(interval);
          interval = null;
          tick = 0;
        }
      },
      { fireImmediately: true },
    );

    return () => {
      unsub();
      if (interval) clearInterval(interval);
    };
  }, [spawn]);

  // Ambient seasonal particles
  useEffect(() => {
    if (!season) return;
    const particleType = SEASON_PARTICLE[season];

    const interval = setInterval(() => {
      const stats = useCreatureStore.getState().stats;
      if (!isDormant(stats)) {
        spawn(particleType);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [season, spawn]);

  return { particles, spawn };
}
