import { useCallback, useEffect, useRef, useState } from "react";
import { useCreatureStore } from "../../../stores/creatureStore";
import type { CareAction } from "../../../types";

const COOLDOWN_MS = 8000;

const CARE_ITEMS: {
  action: CareAction;
  label: string;
  icon: string;
  statKey: "hunger" | "hydration" | "happiness" | "energy";
  color: string;
}[] = [
  { action: "feed", label: "Feed", icon: "\u{1F33F}", statKey: "hunger", color: "#7cb342" },
  { action: "water", label: "Water", icon: "\u{1F4A7}", statKey: "hydration", color: "#42a5f5" },
  { action: "pet", label: "Pet", icon: "\u{1F49A}", statKey: "happiness", color: "#e57373" },
  { action: "sunlight", label: "Sun", icon: "\u{2600}\u{FE0F}", statKey: "energy", color: "#ffb74d" },
];

function getBarColor(value: number, baseColor: string): string {
  if (value >= 50) return baseColor;
  if (value >= 25) return "#fbbf24";
  return "#ef4444";
}

export function CareButtons() {
  const stats = useCreatureStore((s) => s.stats);
  const level = useCreatureStore((s) => s.level);

  const cooldownTimers = useRef<Map<CareAction, ReturnType<typeof setTimeout>>>(new Map());
  const [cooldownKeys, setCooldownKeys] = useState<Set<CareAction>>(new Set());

  useEffect(() => {
    return () => cooldownTimers.current.forEach(clearTimeout);
  }, []);

  const handleClick = useCallback(
    (action: CareAction) => {
      if (cooldownTimers.current.has(action)) return;

      useCreatureStore.getState()[action]();

      setCooldownKeys((prev) => new Set(prev).add(action));
      const timer = setTimeout(() => {
        cooldownTimers.current.delete(action);
        setCooldownKeys((prev) => {
          const next = new Set(prev);
          next.delete(action);
          return next;
        });
      }, COOLDOWN_MS);
      cooldownTimers.current.set(action, timer);
    },
    [],
  );

  return (
    <div
      className="flex items-center gap-1 rounded-xl px-2 py-1.5"
      style={{ background: "rgba(0, 0, 0, 0.35)" }}
    >
      {/* Level badge */}
      <span
        className="text-[8px] font-bold leading-none"
        style={{ color: "#d4af37" }}
      >
        Lv.{level}
      </span>

      {CARE_ITEMS.map((item) => {
        const value = stats[item.statKey];
        const barColor = getBarColor(value, item.color);
        const onCooldown = cooldownKeys.has(item.action);
        return (
          <button
            key={item.action}
            onClick={() => handleClick(item.action)}
            disabled={onCooldown}
            className="flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-1 transition-transform hover:scale-110 active:scale-90 disabled:pointer-events-none"
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              opacity: onCooldown ? 0.4 : 1,
              transition: "opacity 0.3s",
            }}
            title={`${item.label} (${Math.round(value)}%)`}
          >
            <span className="text-sm leading-none">{item.icon}</span>
            {/* Stat bar */}
            <div
              className="h-[3px] w-6 overflow-hidden rounded-full"
              style={{ background: "rgba(255, 255, 255, 0.15)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(value, 3)}%`,
                  background: barColor,
                }}
              />
            </div>
            <span className="text-[7px] leading-none font-medium text-white/50">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
