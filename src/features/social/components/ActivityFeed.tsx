import { useEffect } from "react";
import { useFeedStore } from "../../../stores/feedStore";
import { useAuthStore } from "../../../stores/authStore";
import { formatFeedEvent } from "../lib/feedFormatter";

export function ActivityFeed() {
  const items = useFeedStore((s) => s.items);
  const isLoading = useFeedStore((s) => s.isLoading);
  const fetchRecent = useFeedStore((s) => s.fetchRecent);
  const subscribeFeed = useFeedStore((s) => s.subscribe);
  const team = useAuthStore((s) => s.team);

  useEffect(() => {
    if (!team) return;
    fetchRecent(team.id);
    const unsubscribe = subscribeFeed(team.id);
    return unsubscribe;
  }, [team, fetchRecent, subscribeFeed]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <span className="text-white/40 text-[9px]">Loading...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-4">
        <span className="text-white/40 text-[9px]">No recent activity</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto">
      {items.map((item) => {
        const text = formatFeedEvent(item.displayName, item.eventType, item.xpEarned, item.metadata);
        const timeAgo = getTimeAgo(item.serverTimestamp);
        return (
          <div
            key={item.id}
            className="flex items-start gap-1.5 rounded px-2 py-1"
            style={{ background: "rgba(255, 255, 255, 0.03)" }}
          >
            <span className="text-[9px] text-white/60 flex-1 leading-tight">{text}</span>
            <span className="text-[7px] text-white/25 flex-shrink-0 pt-0.5">{timeAgo}</span>
          </div>
        );
      })}
    </div>
  );
}

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
