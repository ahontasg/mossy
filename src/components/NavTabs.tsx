import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useUiStore, type PanelId } from "../stores/uiStore";
import { isSupabaseConfigured } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";
import {
  IconFocus,
  IconChat,
  IconJournal,
  IconQuests,
  IconMore,
  IconAchievements,
  IconNotes,
  IconSocial,
  IconLeaderboard,
  IconSettings,
} from "./icons";

interface TabDef {
  id: PanelId;
  label: string;
  icon: typeof IconFocus;
}

const PRIMARY_TABS: TabDef[] = [
  { id: "focus", label: "Focus", icon: IconFocus },
  { id: "chat", label: "Chat", icon: IconChat },
  { id: "journal", label: "Journal", icon: IconJournal },
  { id: "quests", label: "Quests", icon: IconQuests },
];

interface MoreItem {
  id: PanelId;
  label: string;
  icon: typeof IconAchievements;
  show?: boolean;
}

export function NavTabs() {
  const activePanel = useUiStore((s) => s.activePanel);
  const setPanel = useUiStore((s) => s.setPanel);
  const [showMore, setShowMore] = useState(false);
  const hasTeam = useAuthStore((s) => s.team !== null);
  const showSocial = isSupabaseConfigured();

  const moreItems = ([
    { id: "achievements" as PanelId, label: "Badges", icon: IconAchievements },
    { id: "notes" as PanelId, label: "Notes", icon: IconNotes },
    { id: "social" as PanelId, label: "Social", icon: IconSocial, show: showSocial },
    { id: "leaderboard" as PanelId, label: "Ranks", icon: IconLeaderboard, show: hasTeam },
    { id: "settings" as PanelId, label: "Settings", icon: IconSettings },
  ] as MoreItem[]).filter((item) => item.show !== false);

  const handleTab = (id: PanelId) => {
    setShowMore(false);
    setPanel(id);
  };

  const isMoreActive = moreItems.some((item) => item.id === activePanel);

  return (
    <div className="relative w-full">
      {/* More popover */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full right-1 mb-2 z-50 rounded-xl p-1.5 shadow-lg"
              style={{
                background: "var(--color-surface-overlay)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePanel === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTab(item.id)}
                    className="flex items-center gap-2 w-full rounded-lg px-3 py-1.5 transition-colors"
                    style={{
                      color: isActive
                        ? "var(--color-terracotta-500)"
                        : "var(--color-text-secondary)",
                      background: isActive
                        ? "oklch(0.62 0.12 45 / 0.08)"
                        : "transparent",
                    }}
                  >
                    <Icon size={14} />
                    <span style={{ fontSize: "var(--text-sm)" }}>{item.label}</span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tab bar */}
      <nav
        className="flex items-center justify-around px-2 py-1.5"
        style={{
          borderTop: "1px solid var(--color-border-subtle)",
          background: "var(--color-surface-raised)",
        }}
      >
        {PRIMARY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activePanel === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTab(tab.id)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors"
              style={{
                color: isActive
                  ? "var(--color-terracotta-500)"
                  : "var(--color-text-tertiary)",
              }}
            >
              <Icon size={16} />
              <span style={{ fontSize: "var(--text-xs)" }}>{tab.label}</span>
            </button>
          );
        })}

        {/* More tab */}
        <button
          onClick={() => setShowMore((prev) => !prev)}
          className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors"
          style={{
            color: isMoreActive || showMore
              ? "var(--color-terracotta-500)"
              : "var(--color-text-tertiary)",
          }}
        >
          <IconMore size={16} />
          <span style={{ fontSize: "var(--text-xs)" }}>More</span>
        </button>
      </nav>
    </div>
  );
}
