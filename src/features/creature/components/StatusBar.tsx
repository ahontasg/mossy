import { useCreatureStore } from "../../../stores/creatureStore";
import { useFocusStore } from "../../../stores/focusStore";
import { IconFlame } from "../../../components/icons";
import type { CreatureStats, GrowthStage } from "../../../types";

const STAT_ITEMS: {
  statKey: keyof CreatureStats;
  label: string;
  color: string;
}[] = [
  { statKey: "hunger", label: "Hunger", color: "#7cb342" },
  { statKey: "hydration", label: "Hydration", color: "#42a5f5" },
  { statKey: "happiness", label: "Happy", color: "#e57373" },
  { statKey: "energy", label: "Energy", color: "#ffb74d" },
];

const STAGE_LABELS: Record<GrowthStage, string> = {
  sprout: "Sprout",
  young: "Young",
  mature: "Mature",
  elder: "Elder",
};

function getBarColor(value: number, baseColor: string): string {
  if (value >= 50) return baseColor;
  if (value >= 25) return "#fbbf24";
  return "#ef4444";
}

function getStreakColor(streak: number): string {
  if (streak >= 30) return "#fbbf24";
  if (streak >= 14) return "#d4af37";
  if (streak >= 7) return "#e8a020";
  return "#c07830";
}

function XpRing({ level, xp, growthStage }: { level: number; xp: number; growthStage: GrowthStage }) {
  const threshold = level * 50;
  const progress = xp / threshold;
  const nearLevel = progress >= 0.85;

  const r = 10;
  const circumference = 2 * Math.PI * r;
  const dashoffset = circumference * (1 - progress);

  return (
    <div className="flex items-center gap-1.5">
      <svg
        width={28}
        height={28}
        viewBox="0 0 28 28"
        className={nearLevel ? "level-glow-pulse" : ""}
        style={{ display: "block" }}
      >
        <title>{`${STAGE_LABELS[growthStage]} — Level ${level} (XP: ${xp}/${threshold})`}</title>
        <circle
          cx={14} cy={14} r={r}
          fill="none"
          stroke="var(--color-surface-inset)"
          strokeWidth={2.5}
        />
        <circle
          cx={14} cy={14} r={r}
          fill="none"
          stroke="#d4af37"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          transform="rotate(-90 14 14)"
          style={{ transition: "stroke-dashoffset 0.5s" }}
        />
        <text
          x={14} y={14}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#d4af37"
          fontSize={9}
          fontWeight="bold"
        >
          {level}
        </text>
      </svg>
      <span
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-tertiary)",
        }}
      >
        {STAGE_LABELS[growthStage]}
      </span>
    </div>
  );
}

function StreakIndicator() {
  const streak = useCreatureStore((s) => s.streak);
  const focusStreak = useFocusStore((s) => s.focusStreak);
  const displayStreak = Math.max(streak.currentStreak, focusStreak);
  if (displayStreak === 0) return null;

  const color = getStreakColor(displayStreak);

  return (
    <span
      className="flex items-center gap-0.5 font-bold leading-none"
      style={{ color, fontSize: "var(--text-sm)" }}
      title={`${displayStreak}-day streak`}
    >
      <IconFlame size={12} className="opacity-80" />
      {displayStreak}
    </span>
  );
}

export function StatusBar() {
  const stats = useCreatureStore((s) => s.stats);
  const level = useCreatureStore((s) => s.level);
  const xp = useCreatureStore((s) => s.xp);
  const growthStage = useCreatureStore((s) => s.growthStage);

  return (
    <div
      className="flex items-center justify-between w-full px-3 py-2"
      style={{
        borderTop: "1px solid var(--color-border-subtle)",
        background: "var(--color-surface-raised)",
      }}
    >
      {/* Left: XP ring + growth stage */}
      <XpRing level={level} xp={xp} growthStage={growthStage} />

      {/* Center: Streak */}
      <StreakIndicator />

      {/* Right: 4 mini stat circles */}
      <div className="flex items-center gap-1.5">
        {STAT_ITEMS.map((item) => {
          const value = stats[item.statKey];
          const barColor = getBarColor(value, item.color);
          const r = 3;
          const circumference = 2 * Math.PI * r;
          const dashoffset = circumference * (1 - value / 100);
          return (
            <svg
              key={item.statKey}
              width={10}
              height={10}
              viewBox="0 0 10 10"
              aria-label={`${item.label} (${Math.round(value)}%)`}
            >
              <circle
                cx={5} cy={5} r={r}
                fill="none"
                stroke="var(--color-surface-inset)"
                strokeWidth={1.5}
              />
              <circle
                cx={5} cy={5} r={r}
                fill="none"
                stroke={barColor}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                transform="rotate(-90 5 5)"
                style={{ transition: "stroke-dashoffset 0.5s" }}
              />
            </svg>
          );
        })}
      </div>
    </div>
  );
}
