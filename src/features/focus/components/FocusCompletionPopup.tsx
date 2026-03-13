import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div
            className="rounded-lg px-3 py-2 text-center"
            style={{ background: "rgba(124, 179, 66, 0.9)" }}
          >
            <div className="text-white text-xs font-bold">
              Focus Complete!
            </div>
            <div className="text-white/80 text-[10px]">
              +{FOCUS_SESSION_XP} XP
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
