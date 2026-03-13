import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCreatureStore } from "../../../stores/creatureStore";
import { useFocusStore } from "../../../stores/focusStore";
import type { CreatureStats } from "../../../types";

const STAT_LABELS: Record<keyof CreatureStats, string> = {
  hunger: "Hunger",
  hydration: "Hydration",
  happiness: "Happiness",
  energy: "Energy",
};

function StatDelta({ label, before, after }: { label: string; before: number; after: number }) {
  const diff = Math.round(after - before);
  const color = diff >= 0 ? "#7cb342" : "#ef4444";
  return (
    <div className="flex justify-between text-[10px]">
      <span className="text-white/60">{label}</span>
      <span style={{ color }}>
        {Math.round(before)} → {Math.round(after)} ({diff > 0 ? "+" : ""}{diff})
      </span>
    </div>
  );
}

export function ReturnOverlay() {
  const returnMoment = useCreatureStore((s) => s.returnMoment);
  const dismiss = useCreatureStore((s) => s.dismissReturnMoment);

  // Auto-dismiss after 3s
  useEffect(() => {
    if (!returnMoment) return;
    const timer = setTimeout(dismiss, 3000);
    return () => clearTimeout(timer);
  }, [returnMoment, dismiss]);

  // Dismiss on first focus session start or any interaction
  useEffect(() => {
    if (!returnMoment) return;
    return useFocusStore.subscribe(
      (s) => s.status,
      (status) => {
        if (status !== "idle") dismiss();
      },
    );
  }, [returnMoment, dismiss]);

  return (
    <AnimatePresence>
      {returnMoment && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={dismiss}
        >
          <div className="rounded-xl px-4 py-3 text-center" style={{ background: "rgba(0, 0, 0, 0.5)" }}>
            <div className="text-white/80 text-xs font-medium mb-1.5">
              While you were away...
            </div>
            <div className="text-white/40 text-[9px] mb-2">
              ({returnMoment.durationHours}h)
            </div>
            <div className="space-y-0.5">
              {(Object.keys(STAT_LABELS) as (keyof CreatureStats)[]).map((key) => (
                <StatDelta
                  key={key}
                  label={STAT_LABELS[key]}
                  before={returnMoment.statsBefore[key]}
                  after={returnMoment.statsAfter[key]}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
