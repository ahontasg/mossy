import { useCallback, useRef } from "react";
import { useCreatureStore, isDormant } from "../../stores/creatureStore";
import { PixelGrid } from "./components/PixelGrid";
import { ParticleLayer } from "./components/ParticleLayer";
import { useBreathing } from "./hooks/useBreathing";
import { useBlink } from "./hooks/useBlink";
import { useTalking } from "./hooks/useTalking";
import { FRAMES, ACCESSORIES, DORMANT_OVERLAY, mergeFrames } from "./data/frames";
import { GRID_OFFSET_X, GRID_OFFSET_Y } from "./constants";
import type { TimeOfDay } from "../../types";

interface MossCreatureProps {
  timeOfDay: TimeOfDay;
}

export function MossCreature({ timeOfDay: _timeOfDay }: MossCreatureProps) {
  const mood = useCreatureStore((s) => s.mood);
  const growthStage = useCreatureStore((s) => s.growthStage);
  const stats = useCreatureStore((s) => s.stats);
  const pet = useCreatureStore((s) => s.pet);

  const breathFrame = useBreathing();
  const isBlinking = useBlink(mood);
  const { isTalking, talkFrame } = useTalking();

  const svgRef = useRef<SVGSVGElement>(null);

  const frameKey = isTalking ? talkFrame : isBlinking ? "blink" : breathFrame;
  const baseFrame = FRAMES[mood][frameKey];
  const accessoryOverlay = ACCESSORIES[growthStage];
  let mergedFrame = mergeFrames(baseFrame, accessoryOverlay);

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
        <PixelGrid frame={mergedFrame} />
        <ParticleLayer />
      </g>

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
