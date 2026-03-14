import { type ReactNode } from "react";
import { motion } from "motion/react";

type ToastVariant = "success" | "achievement" | "discovery" | "info" | "reminder";

const VARIANT_ACCENT: Record<ToastVariant, string> = {
  success: "#7cb342",
  achievement: "#d4af37",
  discovery: "#42a5f5",
  info: "var(--color-terracotta-500)",
  reminder: "#3b82f6",
};

interface ToastProps {
  variant: ToastVariant;
  children: ReactNode;
}

export function Toast({ variant, children }: ToastProps) {
  const accent = VARIANT_ACCENT[variant];

  return (
    <motion.div
      className="absolute top-3 left-1/2 -translate-x-1/2 z-50 rounded-xl px-3 py-2 text-center pointer-events-none shadow-lg"
      style={{
        background: "var(--color-surface-overlay)",
        borderLeft: `3px solid ${accent}`,
        minWidth: 140,
      }}
      initial={{ opacity: 0, y: -15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.95 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}
