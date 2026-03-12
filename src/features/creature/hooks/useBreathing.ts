import { useState, useEffect } from "react";

export type BreathFrame = "idle1" | "idle2";

export function useBreathing(intervalMs = 1500): BreathFrame {
  const [frame, setFrame] = useState<BreathFrame>("idle1");

  useEffect(() => {
    const id = setInterval(() => {
      setFrame((prev) => (prev === "idle1" ? "idle2" : "idle1"));
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return frame;
}
