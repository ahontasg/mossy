import { useState, useEffect } from "react";
import { useJournalStore } from "../../../stores/journalStore";

interface JournalToggleProps {
  onClick: () => void;
}

export function JournalToggle({ onClick }: JournalToggleProps) {
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    return useJournalStore.subscribe(
      (s) => s.lastDiscovery,
      (discovery) => {
        if (!discovery) return;
        setHasNew(true);
        const timer = setTimeout(() => setHasNew(false), 30_000);
        return () => clearTimeout(timer);
      },
    );
  }, []);

  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center w-5 h-5 rounded transition-transform hover:scale-110"
      style={{ background: "rgba(255, 255, 255, 0.08)" }}
      title="Specimen Journal"
    >
      <span className="text-[10px] leading-none">&#x1F4D6;</span>
      {hasNew && (
        <span
          className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
          style={{ background: "#7cb342" }}
        />
      )}
    </button>
  );
}
