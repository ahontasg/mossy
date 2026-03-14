import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Toast } from "../../../components/Toast";
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

  return (
    <AnimatePresence>
      {visible && firedReminder && (
        <Toast variant="reminder">
          <div style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)", maxWidth: 200 }}>
            Hey! You asked me to remind you about: {firedReminder.message}
          </div>
        </Toast>
      )}
    </AnimatePresence>
  );
}
