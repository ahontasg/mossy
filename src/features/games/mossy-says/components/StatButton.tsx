import { motion } from "motion/react";
import type { StatIcon } from "../lib/mossySaysEngine";

const STAT_CONFIG: Record<StatIcon, { color: string; brightColor: string; label: string }> = {
  hunger:    { color: "#7cb342", brightColor: "#8bc34a", label: "Hunger" },
  hydration: { color: "#42a5f5", brightColor: "#64b5f6", label: "Hydration" },
  happiness: { color: "#e57373", brightColor: "#ef9a9a", label: "Happiness" },
  energy:    { color: "#ffb74d", brightColor: "#ffd54f", label: "Energy" },
};

const STAT_ICON_PATHS: Record<StatIcon, string> = {
  hunger:    "M8 2C5 2 2 5 2 8s1 4 3 5c1-3 3-5 6-6.5C12 4 10.5 3 8 2zM8 14c3 0 6-3 6-6s-1-4-3-5c-1 3-3 5-6 6.5C4 12 5.5 13 8 14z", // leaf
  hydration: "M8 2L4 8c0 2.5 1.8 4 4 4s4-1.5 4-4L8 2z", // water drop
  happiness: "M8 3C5.5 3 3.5 5 3.5 7.5S5.5 12 8 14c2.5-2 4.5-4 4.5-6.5S10.5 3 8 3z", // heart
  energy:    "M9 2L5 9h3l-1 5 4-7H8l1-5z", // lightning
};

interface StatButtonProps {
  icon: StatIcon;
  lit: boolean;
  success: boolean;
  disabled: boolean;
  onTap: () => void;
}

export function StatButton({ icon, lit, success, disabled, onTap }: StatButtonProps) {
  const config = STAT_CONFIG[icon];
  const isLit = lit || success;

  return (
    <motion.button
      onClick={disabled ? undefined : onTap}
      className="flex flex-col items-center justify-center gap-1 rounded-2xl"
      style={{
        aspectRatio: "1",
        background: isLit ? config.brightColor : config.color,
        opacity: isLit ? 1 : 0.35,
        cursor: disabled ? "default" : "pointer",
        boxShadow: isLit ? `0 0 12px ${config.color}` : "none",
        pointerEvents: disabled ? "none" : "auto",
      }}
      animate={{
        scale: isLit ? 1.06 : 1,
        opacity: isLit ? 1 : 0.35,
      }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
    >
      <svg width={28} height={28} viewBox="0 0 16 16" fill="white" opacity={0.9}>
        <path d={STAT_ICON_PATHS[icon]} />
      </svg>
      <span style={{ fontSize: "9px", color: "white", fontWeight: 600, opacity: 0.8 }}>
        {config.label}
      </span>
    </motion.button>
  );
}
