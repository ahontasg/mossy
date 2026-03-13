import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useLeaderboardStore } from "../../../stores/leaderboardStore";
import { useAuthStore } from "../../../stores/authStore";
import { ActivityFeed } from "./ActivityFeed";
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
        background: isCurrentUser ? "rgba(124, 179, 66, 0.12)" : "rgba(255, 255, 255, 0.03)",
      }}
    >
      <span className="text-[9px] text-white/40 w-4 text-center flex-shrink-0">
        {crown ?? rank}
      </span>
      <span
        className="text-[9px] flex-1 truncate"
        style={{ color: isCurrentUser ? "#7cb342" : "rgba(255, 255, 255, 0.7)" }}
      >
        {displayName}
      </span>
      <span className="text-[8px] text-white/50 flex-shrink-0">{xp} XP</span>
      <span className="text-[7px] text-white/30 flex-shrink-0">{activeDays}d</span>
      <span className="text-[7px] text-white/30 flex-shrink-0" title="Specimens">{"\u{1F344}"}{specimens}</span>
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
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="rounded-xl px-4 py-3 w-[220px]"
        style={{ background: "rgba(0, 0, 0, 0.6)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 text-xs font-medium">
            {team?.name ?? "Leaderboard"}
          </span>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/70 text-sm leading-none transition-colors"
          >
            {"\u2715"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-2">
          <button
            onClick={() => setTab("leaderboard")}
            className="flex-1 text-[9px] py-1 rounded transition-colors"
            style={{
              background: tab === "leaderboard" ? "rgba(255, 255, 255, 0.1)" : "transparent",
              color: tab === "leaderboard" ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.35)",
            }}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setTab("activity")}
            className="flex-1 text-[9px] py-1 rounded transition-colors"
            style={{
              background: tab === "activity" ? "rgba(255, 255, 255, 0.1)" : "transparent",
              color: tab === "activity" ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.35)",
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
                    color: period === p ? "#d4af37" : "rgba(255, 255, 255, 0.3)",
                  }}
                >
                  {p === "weekly" ? "Week" : "Month"}
                </button>
              ))}
            </div>

            {/* Leaderboard entries */}
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <span className="text-white/40 text-[9px]">Loading...</span>
              </div>
            ) : entries.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <span className="text-white/40 text-[9px]">No activity yet</span>
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
      </div>
    </motion.div>
  );
}
