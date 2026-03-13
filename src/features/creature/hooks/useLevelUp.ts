import { useEffect, useRef } from "react";
import { useCreatureStore } from "../../../stores/creatureStore";
import { useSettingsStore } from "../../../stores/settingsStore";
import { playLevelUpDing } from "../../../lib/audio";

export function useLevelUp(spawnParticles: (type: "levelup") => void) {
  const seenRef = useRef<number | null>(null);

  useEffect(() => {
    return useCreatureStore.subscribe(
      (s) => s.lastLevelUp,
      (timestamp) => {
        if (!timestamp || timestamp === seenRef.current) return;
        seenRef.current = timestamp;

        // Spawn celebration particles
        spawnParticles("levelup");

        // Play ding if sound enabled
        if (useSettingsStore.getState().soundEnabled) {
          playLevelUpDing();
        }

        // Flash effect on main element
        const main = document.querySelector("main");
        if (main) {
          main.classList.add("level-flash");
          setTimeout(() => main.classList.remove("level-flash"), 500);
        }
      },
    );
  }, [spawnParticles]);
}
