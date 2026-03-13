import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAssistantStore } from "../../../stores/assistantStore";

export function ReminderToast() {
  const firedReminder = useAssistantStore((s) => s.firedReminder);
  const dismissFired = useAssistantStore((s) => s.dismissFired);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (firedReminder) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        dismissFired();
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [firedReminder, dismissFired]);

  const handleDismiss = () => {
    setVisible(false);
    dismissFired();
  };

  return (
    <AnimatePresence>
      {visible && firedReminder && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 cursor-pointer"
          onClick={handleDismiss}
        >
          <div
            className="rounded-lg px-3 py-2 text-center max-w-[200px]"
            style={{ background: "rgba(59, 130, 246, 0.9)" }}
          >
            <div className="text-white/80 text-[10px]">
              Hey! You asked me to remind you about: {firedReminder.message}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
