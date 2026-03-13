import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useJournalStore } from "../../../stores/journalStore";
import { SPECIMEN_MAP } from "../data/specimens";

interface Popup {
  id: number;
  name: string;
  rarity: string;
}

let popupId = 0;

const RARITY_COLORS: Record<string, string> = {
  common: "#7cb342",
  uncommon: "#42a5f5",
  rare: "#ab47bc",
  legendary: "#ffd700",
};

export function DiscoveryPopup() {
  const [popups, setPopups] = useState<Popup[]>([]);

  useEffect(() => {
    return useJournalStore.subscribe(
      (s) => s.lastDiscovery,
      (discovery) => {
        if (!discovery) return;
        const spec = SPECIMEN_MAP.get(discovery.specimenId);
        if (!spec) return;
        const id = ++popupId;
        setPopups((prev) => [...prev, { id, name: spec.name, rarity: spec.rarity }]);
        setTimeout(() => {
          setPopups((prev) => prev.filter((p) => p.id !== id));
        }, 2500);
      },
    );
  }, []);

  return (
    <AnimatePresence>
      {popups.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-2 left-1/2 -translate-x-1/2 z-40 rounded-lg px-3 py-1.5 text-center pointer-events-none"
          style={{
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            border: `1px solid ${RARITY_COLORS[p.rarity] ?? "#7cb342"}`,
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-[9px] text-white/50">New specimen!</div>
          <div
            className="text-[11px] font-bold"
            style={{ color: RARITY_COLORS[p.rarity] ?? "#7cb342" }}
          >
            {p.name}
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
