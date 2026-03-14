import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Toast } from "../../../components/Toast";
import { useGameStore } from "../../../stores/gameStore";

export function NewRecordToast() {
  const [visible, setVisible] = useState(false);
  const lastGameResult = useGameStore((s) => s.lastGameResult);

  useEffect(() => {
    if (lastGameResult?.isNewRecord) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastGameResult]);

  return (
    <AnimatePresence>
      {visible && lastGameResult && (
        <Toast variant="achievement">
          <div className="font-bold" style={{ color: "var(--color-text-primary)", fontSize: "var(--text-sm)" }}>
            New Record!
          </div>
          <div style={{ color: "#d4af37", fontSize: "var(--text-xs)" }}>
            Score: {lastGameResult.score}
          </div>
        </Toast>
      )}
    </AnimatePresence>
  );
}
