import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { Toast } from "../../../components/Toast";
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
        <Toast key={p.id} variant="discovery">
          <div style={{ color: "var(--color-text-tertiary)", fontSize: "var(--text-xs)" }}>
            New specimen!
          </div>
          <div
            className="font-bold"
            style={{ color: RARITY_COLORS[p.rarity] ?? "#7cb342", fontSize: "var(--text-sm)" }}
          >
            {p.name}
          </div>
        </Toast>
      ))}
    </AnimatePresence>
  );
}
