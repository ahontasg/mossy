import { useMemo } from "react";
import type { FocusStatus } from "../lib/focusTimer";

interface TimerRingProps {
  remainingMs: number;
  totalMs: number;
  status: FocusStatus;
  displayTime: string;
  size?: number;
}

const STATUS_COLORS: Record<FocusStatus, string> = {
  idle: "var(--color-surface-inset)",
  focus: "#7cb342",
  short_break: "#42a5f5",
  long_break: "#ab47bc",
  paused: "#fbbf24",
};

export function TimerRing({ remainingMs, totalMs, status, displayTime, size = 120 }: TimerRingProps) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = totalMs > 0 ? Math.max(0, remainingMs / totalMs) : 0;
  const dashoffset = circumference * (1 - progress);
  const color = STATUS_COLORS[status];

  const center = size / 2;

  const statusLabel = useMemo(() => {
    switch (status) {
      case "focus": return "FOCUS";
      case "short_break": return "BREAK";
      case "long_break": return "LONG BREAK";
      case "paused": return "PAUSED";
      default: return "";
    }
  }, [status]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background ring */}
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="var(--color-surface-inset)"
        strokeWidth={4}
      />
      {/* Progress ring */}
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashoffset}
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
      />
      {/* Time display */}
      <text
        x={center}
        y={center - 6}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--color-text-primary)"
        fontSize={size > 80 ? 22 : 14}
        fontWeight="bold"
        fontFamily="monospace"
      >
        {displayTime}
      </text>
      {/* Status label */}
      {statusLabel && (
        <text
          x={center}
          y={center + (size > 80 ? 14 : 8)}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={size > 80 ? 9 : 7}
          fontWeight="600"
          letterSpacing="0.5"
        >
          {statusLabel}
        </text>
      )}
    </svg>
  );
}
