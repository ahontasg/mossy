import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Toast } from "../../../components/Toast";
import { useFocusStore } from "../../../stores/focusStore";
import { FOCUS_SESSION_XP } from "../lib/focusRewards";

export function FocusCompletionPopup() {
  const [visible, setVisible] = useState(false);
  const completedSessionsToday = useFocusStore((s) => s.completedSessionsToday);

  useEffect(() => {
    if (completedSessionsToday > 0) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [completedSessionsToday]);

  return (
    <AnimatePresence>
      {visible && (
        <Toast variant="success">
          <div className="font-bold" style={{ color: "var(--color-text-primary)", fontSize: "var(--text-sm)" }}>
            Focus Complete!
          </div>
          <div style={{ color: "#d4af37", fontSize: "var(--text-xs)" }}>
            +{FOCUS_SESSION_XP} XP
          </div>
        </Toast>
      )}
    </AnimatePresence>
  );
}
