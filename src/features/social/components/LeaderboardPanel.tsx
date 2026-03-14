import { useEffect, useState } from "react";
import { useLeaderboardStore } from "../../../stores/leaderboardStore";
import { useAuthStore } from "../../../stores/authStore";
import { ActivityFeed } from "./ActivityFeed";
import { PanelCard } from "../../../components/PanelCard";
import { IconLeaderboard } from "../../../components/icons";
import type { LeaderboardPeriod } from "../../../types";

interface LeaderboardPanelProps {
  onClose: () => void;
}

function LeaderboardEntryRow({
  rank,
  displayName,
  xp,
  activeDays,
  specimens,
  isCurrentUser,
}: {
  rank: number;
  displayName: string;
  xp: number;
  activeDays: number;
  specimens: number;
  isCurrentUser: boolean;
}) {
  const crown = rank === 1 ? "\u{1F451}" : rank === 2 ? "\u{1F948}" : rank === 3 ? "\u{1F949}" : null;

  return (
    <div
      className="flex items-center gap-1.5 rounded px-2 py-1"
      style={{
        background: isCurrentUser ? "oklch(0.58 0.14 145 / 0.08)" : "var(--color-surface-raised)",
      }}
    >
      <span className="text-[9px] w-4 text-center flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }}>
        {crown ?? rank}
      </span>
      <span
        className="text-[9px] flex-1 truncate"
        style={{ color: isCurrentUser ? "#7cb342" : "var(--color-text-primary)" }}
      >
        {displayName}
      </span>
      <span className="text-[8px] flex-shrink-0" style={{ color: "var(--color-text-secondary)" }}>{xp} XP</span>
      <span className="text-[7px] flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }}>{activeDays}d</span>
      <span className="text-[7px] flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }} title="Specimens">{"\u{1F344}"}{specimens}</span>
    </div>
  );
}

export function LeaderboardPanel({ onClose }: LeaderboardPanelProps) {
  const entries = useLeaderboardStore((s) => s.entries);
  const period = useLeaderboardStore((s) => s.period);
  const isLoading = useLeaderboardStore((s) => s.isLoading);
  const setPeriod = useLeaderboardStore((s) => s.setPeriod);
  const fetchLeaderboard = useLeaderboardStore((s) => s.fetchLeaderboard);
  const status = useAuthStore((s) => s.status);
  const team = useAuthStore((s) => s.team);
  const [tab, setTab] = useState<"leaderboard" | "activity">("leaderboard");

  useEffect(() => {
    if (status === "signed_in" && team) {
      fetchLeaderboard();
    }
  }, [status, team, fetchLeaderboard]);

  return (
    <PanelCard
      title={team?.name ?? "Leaderboard"}
      onClose={onClose}
      icon={<IconLeaderboard size={16} />}
    >
      {/* Tabs */}
      <div className="flex gap-1 mb-2">
        <button
          onClick={() => setTab("leaderboard")}
          className="flex-1 text-[9px] py-1 rounded transition-colors"
          style={{
            background: tab === "leaderboard" ? "var(--color-surface-inset)" : "transparent",
            color: tab === "leaderboard" ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
          }}
        >
          Leaderboard
        </button>
        <button
          onClick={() => setTab("activity")}
          className="flex-1 text-[9px] py-1 rounded transition-colors"
          style={{
            background: tab === "activity" ? "var(--color-surface-inset)" : "transparent",
            color: tab === "activity" ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
          }}
        >
          Activity
        </button>
      </div>

      {tab === "leaderboard" ? (
        <>
          {/* Period toggle */}
          <div className="flex gap-1 mb-2">
            {(["weekly", "monthly"] as LeaderboardPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="flex-1 text-[8px] py-0.5 rounded transition-colors"
                style={{
                  background: period === p ? "rgba(212, 175, 55, 0.2)" : "transparent",
                  color: period === p ? "#d4af37" : "var(--color-text-tertiary)",
                }}
              >
                {p === "weekly" ? "Week" : "Month"}
              </button>
            ))}
          </div>

          {/* Leaderboard entries */}
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <span className="text-[9px]" style={{ color: "var(--color-text-tertiary)" }}>Loading...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <span className="text-[9px]" style={{ color: "var(--color-text-tertiary)" }}>No activity yet</span>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 max-h-[180px] overflow-y-auto">
              {entries.map((entry, i) => (
                <LeaderboardEntryRow
                  key={entry.userId}
                  rank={i + 1}
                  displayName={entry.displayName}
                  xp={entry.xp}
                  activeDays={entry.activeDays}
                  specimens={entry.specimens}
                  isCurrentUser={entry.isCurrentUser}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <ActivityFeed />
      )}
    </PanelCard>
  );
}
