import { useEffect, useRef } from "react";
import { useJournalStore } from "../../../stores/journalStore";
import { useSettingsStore } from "../../../stores/settingsStore";
import { playLevelUpDing } from "../../../lib/audio";
import type { ParticleType } from "../data/particles";

export function useDiscoveryEffect(spawnParticles: (type: ParticleType) => void) {
  const seenRef = useRef<number | null>(null);

  useEffect(() => {
    return useJournalStore.subscribe(
      (s) => s.lastDiscovery,
      (discovery) => {
        if (!discovery || discovery.timestamp === seenRef.current) return;
        seenRef.current = discovery.timestamp;

        spawnParticles("discovery");

        if (useSettingsStore.getState().soundEnabled) {
          playLevelUpDing();
        }
      },
    );
  }, [spawnParticles]);
}
