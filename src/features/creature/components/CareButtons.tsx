import { useCreatureStore } from "../../../stores/creatureStore";
import { useFocusStore } from "../../../stores/focusStore";
import { FocusToggle } from "../../focus/FocusToggle";
import type { CreatureStats, GrowthStage } from "../../../types";

const STAT_ITEMS: {
  statKey: keyof CreatureStats;
  label: string;
  icon: string;
  color: string;
}[] = [
  { statKey: "hunger", label: "Hunger", icon: "\u{1F33F}", color: "#7cb342" },
  { statKey: "hydration", label: "Hydration", icon: "\u{1F4A7}", color: "#42a5f5" },
  { statKey: "happiness", label: "Happy", icon: "\u{1F49A}", color: "#e57373" },
  { statKey: "energy", label: "Energy", icon: "\u{2600}\u{FE0F}", color: "#ffb74d" },
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

  const r = 8;
  const circumference = 2 * Math.PI * r;
  const dashoffset = circumference * (1 - progress);

  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 22 22"
      className={nearLevel ? "level-glow-pulse" : ""}
      style={{ display: "block" }}
    >
      <title>{`${STAGE_LABELS[growthStage]} — Level ${level} (XP: ${xp}/${threshold})`}</title>
      <circle cx={11} cy={11} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={2.5} />
      <circle
        cx={11}
        cy={11}
        r={r}
        fill="none"
        stroke="#d4af37"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashoffset}
        transform="rotate(-90 11 11)"
        style={{ transition: "stroke-dashoffset 0.5s" }}
      />
      <text
        x={11}
        y={11}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#d4af37"
        fontSize={7}
        fontWeight="bold"
      >
        {level}
      </text>
    </svg>
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
      className="flex items-center gap-0.5 text-[8px] font-bold leading-none"
      style={{ color }}
      title={`${displayStreak}-day streak`}
    >
      <span className="text-[10px]" style={{ filter: "saturate(1.3)" }}>&#x1F525;</span>
      {displayStreak}
    </span>
  );
}

interface CareButtonsProps {
  onFocusToggle: () => void;
  onHubToggle: () => void;
}

export function CareButtons({ onFocusToggle, onHubToggle }: CareButtonsProps) {
  const stats = useCreatureStore((s) => s.stats);
  const level = useCreatureStore((s) => s.level);
  const xp = useCreatureStore((s) => s.xp);
  const growthStage = useCreatureStore((s) => s.growthStage);

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="flex items-center gap-1 rounded-xl px-2 py-1.5"
        style={{ background: "rgba(0, 0, 0, 0.35)" }}
      >
        {/* XP ring + level badge */}
        <XpRing level={level} xp={xp} growthStage={growthStage} />

        {/* Streak indicator */}
        <StreakIndicator />

        {/* Stat bars (read-only) */}
        {STAT_ITEMS.map((item) => {
          const value = stats[item.statKey];
          const barColor = getBarColor(value, item.color);
          return (
            <div
              key={item.statKey}
              className="flex flex-col items-center gap-0.5 px-1"
              title={`${item.label} (${Math.round(value)}%)`}
            >
              <span className="text-[8px] leading-none">{item.icon}</span>
              <div
                className="h-[3px] w-5 overflow-hidden rounded-full"
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
            </div>
          );
        })}

        {/* Focus timer toggle */}
        <FocusToggle onClick={onFocusToggle} />

        {/* Hub menu button */}
        <button
          onClick={onHubToggle}
          className="flex items-center justify-center w-5 h-5 rounded transition-transform hover:scale-110"
          style={{ background: "rgba(255, 255, 255, 0.08)" }}
          title="Menu"
        >
          <span className="text-[10px] leading-none">{"\u2630"}</span>
        </button>
      </div>
    </div>
  );
}
