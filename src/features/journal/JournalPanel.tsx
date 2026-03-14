import { useJournalStore } from "../../stores/journalStore";
import { SPECIMENS } from "./data/specimens";
import { SpecimenTile } from "./components/SpecimenTile";
import { PanelCard } from "../../components/PanelCard";
import { IconJournal } from "../../components/icons";

interface JournalPanelProps {
  onClose: () => void;
}

export function JournalPanel({ onClose }: JournalPanelProps) {
  const discovered = useJournalStore((s) => s.discovered);
  const discoveredMap = new Map(discovered.map((d) => [d.specimenId, d]));

  return (
    <PanelCard
      title="Specimen Journal"
      subtitle={`${discovered.length}/${SPECIMENS.length}`}
      onClose={onClose}
      icon={<IconJournal size={16} />}
    >
      <div className="grid grid-cols-4 gap-1">
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
    </PanelCard>
  );
}
