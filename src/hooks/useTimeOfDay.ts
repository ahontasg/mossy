import { useState, useEffect } from "react";
import type { TimeOfDay } from "../types";
import { getTimeOfDay, TIME_THEMES } from "../lib/time";

export function useTimeOfDay(): TimeOfDay {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay);

  useEffect(() => {
    function update() {
      const tod = getTimeOfDay();
      setTimeOfDay(tod);

      const theme = TIME_THEMES[tod];
      const root = document.documentElement;
      root.setAttribute("data-time", tod);
      root.style.setProperty("--tod-bg", theme.bg);
      root.style.setProperty("--tod-accent", theme.accent);
      root.style.setProperty("--tod-ambient", theme.ambient);
      root.style.setProperty("--color-surface-base", theme.bg);
    }

    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return timeOfDay;
}
