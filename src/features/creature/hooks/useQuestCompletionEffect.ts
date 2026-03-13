import { useEffect, useRef } from "react";
import { useQuestStore } from "../../../stores/questStore";
import type { ParticleType } from "../data/particles";

export function useQuestCompletionEffect(spawnParticles: (type: ParticleType) => void) {
  const seenRef = useRef<number | null>(null);

  useEffect(() => {
    return useQuestStore.subscribe(
      (s) => s.lastCompletion,
      (completion) => {
        if (!completion || completion.timestamp === seenRef.current) return;
        seenRef.current = completion.timestamp;

        spawnParticles("levelup");
      },
    );
  }, [spawnParticles]);
}
