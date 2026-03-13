import { useCallback, useEffect, useRef, useState } from "react";
import { useCreatureStore } from "../../../stores/creatureStore";
import { JournalToggle } from "../../journal";
import { QuestIndicator } from "../../quests";
import { SocialToggle } from "../../social/components/SocialToggle";
import { isSupabaseConfigured } from "../../../lib/supabase";
import { useAuthStore } from "../../../stores/authStore";
import type { CareAction, GrowthStage } from "../../../types";

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
  if (streak.currentStreak === 0) return null;

  const color = getStreakColor(streak.currentStreak);
  const shieldText = streak.shieldAvailable ? "Shield active" : "Shield used this week";

  return (
    <span
      className="flex items-center gap-0.5 text-[8px] font-bold leading-none"
      style={{ color }}
      title={`${streak.currentStreak}-day streak! ${shieldText}`}
    >
      <span className="text-[10px]" style={{ filter: "saturate(1.3)" }}>&#x1F525;</span>
      {streak.currentStreak}
    </span>
  );
}

interface CareButtonsProps {
  onJournalToggle?: () => void;
  onQuestToggle?: () => void;
  onAchievementToggle?: () => void;
  onSocialToggle?: () => void;
  onLeaderboardToggle?: () => void;
}

export function CareButtons({ onJournalToggle, onQuestToggle, onAchievementToggle, onSocialToggle, onLeaderboardToggle }: CareButtonsProps) {
  const stats = useCreatureStore((s) => s.stats);
  const level = useCreatureStore((s) => s.level);
  const xp = useCreatureStore((s) => s.xp);
  const growthStage = useCreatureStore((s) => s.growthStage);
  const hasTeam = useAuthStore((s) => s.team !== null);
  const showSocial = isSupabaseConfigured();

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
    <div className="flex flex-col items-center gap-0.5">
      {/* Meta-indicator row */}
      {(onJournalToggle || onQuestToggle || onAchievementToggle || (showSocial && onSocialToggle)) && (
        <div
          className="flex items-center gap-1 rounded-lg px-2 py-0.5"
          style={{ background: "rgba(0, 0, 0, 0.25)" }}
        >
          {onJournalToggle && <JournalToggle onClick={onJournalToggle} />}
          {onQuestToggle && <QuestIndicator onClick={onQuestToggle} />}
          {onAchievementToggle && (
            <button
              onClick={onAchievementToggle}
              className="flex items-center justify-center w-5 h-5 rounded transition-transform hover:scale-110"
              style={{ background: "rgba(255, 255, 255, 0.08)" }}
              title="Achievements"
            >
              <span className="text-[10px] leading-none">&#x1F3C6;</span>
            </button>
          )}
          {showSocial && onSocialToggle && (
            <SocialToggle onClick={onSocialToggle} />
          )}
          {hasTeam && onLeaderboardToggle && (
            <button
              onClick={onLeaderboardToggle}
              className="flex items-center justify-center w-5 h-5 rounded transition-transform hover:scale-110"
              style={{ background: "rgba(255, 255, 255, 0.08)" }}
              title="Leaderboard"
            >
              <span className="text-[10px] leading-none">{"\u{1F3C5}"}</span>
            </button>
          )}
        </div>
      )}

      <div
        className="flex items-center gap-1 rounded-xl px-2 py-1.5"
        style={{ background: "rgba(0, 0, 0, 0.35)" }}
      >
      {/* XP ring + level badge */}
      <XpRing level={level} xp={xp} growthStage={growthStage} />

      {/* Streak indicator */}
      <StreakIndicator />

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
    </div>
  );
}
