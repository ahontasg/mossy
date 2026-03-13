import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCreatureStore } from "../../../stores/creatureStore";

interface XpPopup {
  id: number;
  amount: number;
}

let popupId = 0;

export function FloatingXP() {
  const [popups, setPopups] = useState<XpPopup[]>([]);

  useEffect(() => {
    return useCreatureStore.subscribe(
      (s) => s.lastXpGain,
      (gain) => {
        if (!gain) return;
        const id = ++popupId;
        setPopups((prev) => [...prev, { id, amount: gain.amount }]);
        setTimeout(() => {
          setPopups((prev) => prev.filter((p) => p.id !== id));
        }, 900);
      },
    );
  }, []);

  return (
    <AnimatePresence>
      {popups.map((p) => (
        <motion.text
          key={p.id}
          x={128}
          y={30}
          textAnchor="middle"
          fill="#d4af37"
          fontSize={11}
          fontWeight="bold"
          fontFamily="monospace"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -20 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          +{p.amount} XP
        </motion.text>
      ))}
    </AnimatePresence>
  );
}
