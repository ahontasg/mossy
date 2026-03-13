import { motion } from "motion/react";
import { useJournalStore } from "../../stores/journalStore";
import { SPECIMENS } from "./data/specimens";
import { SpecimenTile } from "./components/SpecimenTile";

interface JournalPanelProps {
  onClose: () => void;
}

export function JournalPanel({ onClose }: JournalPanelProps) {
  const discovered = useJournalStore((s) => s.discovered);
  const discoveredMap = new Map(discovered.map((d) => [d.specimenId, d]));

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="rounded-xl px-3 py-3 w-[220px] max-h-[90%] flex flex-col"
        style={{ background: "rgba(0, 0, 0, 0.6)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 text-xs font-medium">Specimen Journal</span>
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-[9px]">
              {discovered.length}/{SPECIMENS.length}
            </span>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/70 text-sm leading-none transition-colors"
            >
              &#x2715;
            </button>
          </div>
        </div>

        <div
          className="overflow-y-auto grid grid-cols-4 gap-1 pr-0.5"
          style={{ maxHeight: "280px" }}
        >
          {SPECIMENS.map((spec) => {
            const entry = discoveredMap.get(spec.id);
            return (
              <SpecimenTile
                key={spec.id}
                specimen={spec}
                discovered={!!entry}
                discoveredDate={entry?.discoveredDate}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
