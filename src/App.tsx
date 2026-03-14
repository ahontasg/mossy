import { useEffect, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { AnimatePresence } from "motion/react";
import { MossCreature } from "./features/creature";
import { StatusBar } from "./features/creature/components/StatusBar";
import { ReturnOverlay } from "./features/creature/components/ReturnOverlay";
import { FocusPanel, FocusCompletionPopup } from "./features/focus";
import { ChatPanel } from "./features/chat";
import { ReminderToast } from "./features/chat/components/ReminderToast";
import { NotesPanel } from "./features/chat/components/NotesPanel";
import { SettingsPanel } from "./features/settings";
import { JournalPanel, DiscoveryPopup } from "./features/journal";
import { QuestPanel, QuestCompletionPopup } from "./features/quests";
import { AchievementToast, AchievementGallery } from "./features/achievements";
import { AuthPanel, LeaderboardPanel } from "./features/social";
import { NavTabs } from "./components/NavTabs";
import { IconBack } from "./components/icons";
import { useUiStore, type PanelId } from "./stores/uiStore";
import { useTimeOfDay } from "./hooks/useTimeOfDay";
import { useSeason } from "./hooks/useSeason";
import { initPersistence, saveImmediate, cleanupPersistence } from "./hooks/useTauriStore";
import { initSettingsPersistence } from "./hooks/useSettingsStore";
import { initJournalPersistence, cleanupJournalPersistence } from "./hooks/useJournalStore";
import { initQuestPersistence, cleanupQuestPersistence } from "./hooks/useQuestStore";
import { initAchievementPersistence, cleanupAchievementPersistence } from "./hooks/useAchievementStore";
import { initAuthPersistence, cleanupAuthPersistence } from "./hooks/useAuthStore";
import { initSyncPersistence, cleanupSyncPersistence } from "./hooks/useSyncStore";
import { initFocusPersistence, cleanupFocusPersistence } from "./hooks/useFocusStore";
import { initAssistantPersistence, cleanupAssistantPersistence } from "./hooks/useAssistantStore";
import { useAssistantStore } from "./stores/assistantStore";
import { buildDailyBrief } from "./features/chat/lib/dailyBrief";
import { useFocusStore } from "./stores/focusStore";
import { useCreatureStore } from "./stores/creatureStore";
import { getLocalDate } from "./lib/time";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useChatStore } from "./stores/chatStore";
import { expandWindow, collapseWindow } from "./hooks/useWindowResize";

// Panels that need the expanded window
const EXPANDED_PANELS = new Set<PanelId>(["chat", "focus"]);

const PANEL_TITLES: Partial<Record<PanelId, string>> = {
  chat: "Chat",
  focus: "Focus",
};

function App() {
  const timeOfDay = useTimeOfDay();
  const season = useSeason();
  const activePanel = useUiStore((s) => s.activePanel);
  const setPanel = useUiStore((s) => s.setPanel);
  const goHome = useUiStore((s) => s.goHome);
  const checkLlmStatus = useChatStore((s) => s.checkLlmStatus);

  // Sync chat store isOpen with uiStore
  const chatIsOpen = useChatStore((s) => s.isOpen);
  const toggleChat = useChatStore((s) => s.toggleChat);

  useEffect(() => {
    (async () => {
      // Wave 1: independent store hydrations
      await Promise.all([
        initPersistence(),
        initSettingsPersistence(),
        initJournalPersistence(),
        initAuthPersistence(),
        initFocusPersistence(),
        initAssistantPersistence(),
      ]);
      // Wave 2: depend on creature/journal/focus stores being ready
      await Promise.all([
        initQuestPersistence(),
        initAchievementPersistence(),
      ]);
      // Wave 3: depends on auth being ready
      await initSyncPersistence();

      // Daily brief: inject greeting on new day
      const today = getLocalDate();
      const { lastBriefDate } = useAssistantStore.getState();
      if (lastBriefDate !== today) {
        const focusState = useFocusStore.getState();
        const creature = useCreatureStore.getState();
        const brief = buildDailyBrief({
          focusStreak: focusState.focusStreak,
          todayFocusMinutes: focusState.todayFocusMinutes,
          completedSessionsToday: focusState.completedSessionsToday,
          totalFocusMinutes: focusState.totalFocusMinutes,
          level: creature.level,
          mood: creature.mood,
        });
        useChatStore.getState().injectProactiveMessage(brief);
        useAssistantStore.getState().markBriefShown();
      }

      checkLlmStatus();
    })();

    const unlisten = getCurrentWindow().onCloseRequested(async () => {
      await saveImmediate();
    });

    const unlistenSettings = listen("show-settings", () => {
      setPanel("settings");
    });

    return () => {
      cleanupPersistence();
      cleanupJournalPersistence();
      cleanupQuestPersistence();
      cleanupAchievementPersistence();
      cleanupAuthPersistence();
      cleanupSyncPersistence();
      cleanupFocusPersistence();
      cleanupAssistantPersistence();
      unlisten.then((fn) => fn());
      unlistenSettings.then((fn) => fn());
    };
  }, []);

  const handleGoHome = useCallback(async () => {
    const wasExpanded = EXPANDED_PANELS.has(activePanel);

    if (chatIsOpen) {
      toggleChat();
    }

    goHome();

    if (wasExpanded) {
      await collapseWindow();
    }
  }, [activePanel, chatIsOpen, toggleChat, goHome]);

  // Wire NavTabs to our handler
  useEffect(() => {
    return useUiStore.subscribe(
      (s) => s.activePanel,
      (panel, prevPanel) => {
        if (panel === prevPanel) return;
        // The store was set directly by NavTabs; now handle resize
        const wasExpanded = EXPANDED_PANELS.has(prevPanel);
        const willExpand = EXPANDED_PANELS.has(panel);

        if (willExpand && !wasExpanded) {
          expandWindow().then(() => {
            if (panel === "chat" && !useChatStore.getState().isOpen) {
              useChatStore.getState().toggleChat();
            }
          });
        } else if (!willExpand && wasExpanded) {
          if (useChatStore.getState().isOpen) {
            useChatStore.getState().toggleChat();
          }
          collapseWindow();
        } else {
          // Same size — just sync chat
          if (panel === "chat" && !useChatStore.getState().isOpen) {
            useChatStore.getState().toggleChat();
          } else if (panel !== "chat" && useChatStore.getState().isOpen) {
            useChatStore.getState().toggleChat();
          }
        }
      },
    );
  }, []);

  const isExpanded = EXPANDED_PANELS.has(activePanel);

  return (
    <main className="flex h-full w-full flex-col">
      {isExpanded ? (
        <>
          {/* Expanded mode: scaled creature + panel content */}
          <div
            className="flex items-center justify-center pt-1 flex-shrink-0"
            style={{ height: "32%" }}
            data-tauri-drag-region
          >
            <div style={{ transform: "scale(0.55)", transformOrigin: "center center" }}>
              <MossCreature timeOfDay={timeOfDay} season={season} />
            </div>
          </div>

          {/* Back button + title */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0"
            style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
          >
            <button
              onClick={handleGoHome}
              className="p-1 rounded-lg transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <IconBack size={16} />
            </button>
            <span
              className="font-semibold"
              style={{
                fontSize: "var(--text-base)",
                color: "var(--color-text-primary)",
              }}
            >
              {PANEL_TITLES[activePanel] ?? ""}
            </span>
          </div>

          {/* Panel content */}
          <div className="flex flex-col flex-1 w-full min-h-0">
            {activePanel === "chat" && <ChatPanel />}
            {activePanel === "focus" && <FocusPanel />}
          </div>
        </>
      ) : (
        <>
          {/* Compact mode: creature + status bar + nav */}
          <div
            className="flex flex-1 items-center justify-center"
            data-tauri-drag-region
            style={{ minHeight: 0 }}
          >
            <MossCreature timeOfDay={timeOfDay} season={season} />
          </div>

          <StatusBar />
          <NavTabs />

          {/* Overlay panels */}
          <AnimatePresence>
            {activePanel === "journal" && (
              <JournalPanel onClose={handleGoHome} />
            )}
            {activePanel === "quests" && (
              <QuestPanel onClose={handleGoHome} />
            )}
            {activePanel === "achievements" && (
              <AchievementGallery onClose={handleGoHome} />
            )}
            {activePanel === "notes" && (
              <NotesPanel onClose={handleGoHome} />
            )}
            {activePanel === "social" && (
              <AuthPanel onClose={handleGoHome} />
            )}
            {activePanel === "leaderboard" && (
              <LeaderboardPanel onClose={handleGoHome} />
            )}
            {activePanel === "settings" && (
              <SettingsPanel onClose={handleGoHome} />
            )}
          </AnimatePresence>
        </>
      )}

      {/* Global toasts */}
      <DiscoveryPopup />
      <ReturnOverlay />
      <QuestCompletionPopup />
      <AchievementToast />
      <FocusCompletionPopup />
      <ReminderToast />
    </main>
  );
}

export default App;
