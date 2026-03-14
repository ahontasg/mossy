import { type ReactNode } from "react";
import { motion } from "motion/react";
import { IconClose } from "./icons";

interface PanelCardProps {
  title: string;
  icon?: ReactNode;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}

export function PanelCard({ title, icon, subtitle, onClose, children }: PanelCardProps) {
  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-50 flex flex-col"
      style={{
        top: "30%",
        background: "var(--color-surface-overlay)",
        borderRadius: "16px 16px 0 0",
        boxShadow: "0 -4px 24px oklch(0 0 0 / 0.08)",
      }}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 320 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span style={{ color: "var(--color-terracotta-500)" }}>{icon}</span>
          )}
          <span
            className="font-semibold"
            style={{
              fontSize: "var(--text-base)",
              color: "var(--color-text-primary)",
            }}
          >
            {title}
          </span>
          {subtitle && (
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-tertiary)",
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg transition-colors"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <IconClose size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        {children}
      </div>
    </motion.div>
  );
}
