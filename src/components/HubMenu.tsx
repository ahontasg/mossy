import { AnimatePresence, motion } from "motion/react";
import { isSupabaseConfigured } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";

interface HubMenuItem {
  id: string;
  icon: string;
  label: string;
  onClick: () => void;
  show?: boolean;
  badge?: boolean;
}

interface HubMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onJournal: () => void;
  onQuests: () => void;
  onAchievements: () => void;
  onNotes: () => void;
  onSocial: () => void;
  onLeaderboard: () => void;
  onSettings: () => void;
}

export function HubMenu({
  isOpen,
  onClose,
  onJournal,
  onQuests,
  onAchievements,
  onNotes,
  onSocial,
  onLeaderboard,
  onSettings,
}: HubMenuProps) {
  const hasTeam = useAuthStore((s) => s.team !== null);
  const showSocial = isSupabaseConfigured();

  const items: HubMenuItem[] = [
    { id: "journal", icon: "\u{1F4D6}", label: "Journal", onClick: onJournal },
    { id: "quests", icon: "\u{1F4CB}", label: "Quests", onClick: onQuests },
    { id: "achievements", icon: "\u{1F3C6}", label: "Badges", onClick: onAchievements },
    { id: "notes", icon: "\u{1F4DD}", label: "Notes", onClick: onNotes },
    { id: "social", icon: "\u{1F465}", label: "Social", onClick: onSocial, show: showSocial },
    { id: "leaderboard", icon: "\u{1F3C5}", label: "Ranks", onClick: onLeaderboard, show: hasTeam },
    { id: "settings", icon: "\u{2699}\u{FE0F}", label: "Settings", onClick: onSettings },
  ].filter((item) => item.show !== false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 rounded-xl p-2"
            style={{ background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(8px)" }}
          >
            <div className="grid grid-cols-3 gap-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onClose();
                    item.onClick();
                  }}
                  className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 transition-colors hover:bg-white/10"
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  <span className="text-[8px] text-white/60 leading-none">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
