import { useCallback, useRef, useMemo } from "react";
import { useCreatureStore, isDormant } from "../../stores/creatureStore";
import { PixelGrid } from "./components/PixelGrid";
import { ParticleLayer } from "./components/ParticleLayer";
import { FloatingXP } from "./components/FloatingXP";
import { useBreathing } from "./hooks/useBreathing";
import { useBlink } from "./hooks/useBlink";
import { useTalking } from "./hooks/useTalking";
import { useLevelUp } from "./hooks/useLevelUp";
import { useDiscoveryEffect } from "./hooks/useDiscoveryEffect";
import { useQuestCompletionEffect } from "./hooks/useQuestCompletionEffect";
import { FRAMES, ACCESSORIES, DORMANT_OVERLAY, mergeFrames } from "./data/frames";
import { SEASONAL_OVERLAYS } from "./data/seasonalOverlays";
import { SEASON_COLOR_MAP } from "./data/seasonalPalette";
import { GRID_OFFSET_X, GRID_OFFSET_Y } from "./constants";
import type { TimeOfDay, Season } from "../../types";
import type { ParticleType } from "./data/particles";

interface MossCreatureProps {
  timeOfDay: TimeOfDay;
  season?: Season;
}

export function MossCreature({ timeOfDay: _timeOfDay, season }: MossCreatureProps) {
  const mood = useCreatureStore((s) => s.mood);
  const growthStage = useCreatureStore((s) => s.growthStage);
  const stats = useCreatureStore((s) => s.stats);
  const pet = useCreatureStore((s) => s.pet);

  const breathFrame = useBreathing();
  const isBlinking = useBlink(mood);
  const { isTalking, talkFrame } = useTalking();

  const svgRef = useRef<SVGSVGElement>(null);
  const spawnRef = useRef<((type: ParticleType) => void) | null>(null);

  const spawnParticles = useCallback((type: ParticleType) => {
    spawnRef.current?.(type);
  }, []);

  useLevelUp(spawnParticles);
  useDiscoveryEffect(spawnParticles);
  useQuestCompletionEffect(spawnParticles);

  const colorMap = useMemo(
    () => (season ? SEASON_COLOR_MAP[season] : undefined),
    [season],
  );

  const frameKey = isTalking ? talkFrame : isBlinking ? "blink" : breathFrame;
  const baseFrame = FRAMES[mood][frameKey];
  const accessoryOverlay = ACCESSORIES[growthStage];
  let mergedFrame = mergeFrames(baseFrame, accessoryOverlay);

  if (season) {
    mergedFrame = mergeFrames(mergedFrame, SEASONAL_OVERLAYS[season]);
  }

  if (isDormant(stats)) {
    mergedFrame = mergeFrames(mergedFrame, DORMANT_OVERLAY);
  }

  const handleClick = useCallback(() => {
    pet();
    // Apply bounce animation
    const svg = svgRef.current;
    if (svg) {
      svg.classList.add("pet-bounce");
      setTimeout(() => svg.classList.remove("pet-bounce"), 400);
    }
  }, [pet]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 256 256"
      width={256}
      height={256}
      shapeRendering="crispEdges"
    >
      <g transform={`translate(${GRID_OFFSET_X}, ${GRID_OFFSET_Y})`}>
        <PixelGrid frame={mergedFrame} colorMap={colorMap} />
        <ParticleLayer onSpawnRef={spawnRef} season={season} />
      </g>

      <FloatingXP />

      {/* Invisible drag + click capture overlay */}
      <rect
        x={0}
        y={0}
        width={256}
        height={256}
        fill="transparent"
        data-tauri-drag-region
        onClick={handleClick}
        style={{ cursor: "grab" }}
      />
    </svg>
  );
}
