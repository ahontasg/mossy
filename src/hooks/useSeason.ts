import { useState, useEffect } from "react";
import type { Season } from "../types";
import { getSeason } from "../lib/season";
import { applySeasonCSS } from "../lib/seasonTheme";

export function useSeason(): Season {
  const [season, setSeason] = useState<Season>(getSeason);

  useEffect(() => {
    function update() {
      const s = getSeason();
      setSeason(s);
      document.documentElement.setAttribute("data-season", s);
      applySeasonCSS(s);
    }

    update();
    const id = setInterval(update, 3_600_000);
    return () => clearInterval(id);
  }, []);

  return season;
}
