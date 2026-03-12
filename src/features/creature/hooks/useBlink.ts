import { useState, useEffect, useRef } from "react";
import type { Mood } from "../../../types";

export function useBlink(mood: Mood): boolean {
  const [isBlinking, setIsBlinking] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function scheduleBlink() {
      const isSlow = mood === "sad" || mood === "critical";
      const minDelay = isSlow ? 1000 : 2000;
      const maxDelay = isSlow ? 3000 : 6000;
      const delay = minDelay + Math.random() * (maxDelay - minDelay);

      timeoutRef.current = setTimeout(() => {
        setIsBlinking(true);
        timeoutRef.current = setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 150);
      }, delay);
    }

    scheduleBlink();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [mood]);

  return isBlinking;
}
