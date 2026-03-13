import { useEffect, useCallback, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { MossCreature } from "./features/creature";
import { CareButtons } from "./features/creature/components/CareButtons";
import { ReturnOverlay } from "./features/creature/components/ReturnOverlay";
import { FocusPanel, FocusCompletionPopup } from "./features/focus";
import { ChatPanel, ChatToggle } from "./features/chat";
import { ReminderToast } from "./features/chat/components/ReminderToast";
import { NotesPanel } from "./features/chat/components/NotesPanel";
import { SettingsPanel } from "./features/settings";
import { JournalPanel, DiscoveryPopup } from "./features/journal";
import { QuestPanel, QuestCompletionPopup } from "./features/quests";
import { AchievementToast, AchievementGallery } from "./features/achievements";
import { AuthPanel, LeaderboardPanel } from "./features/social";
import { HubMenu } from "./components/HubMenu";
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

function App() {
  const timeOfDay = useTimeOfDay();
  const season = useSeason();
  const isOpen = useChatStore((s) => s.isOpen);
  const toggleChat = useChatStore((s) => s.toggleChat);
  const checkLlmStatus = useChatStore((s) => s.checkLlmStatus);
  const [showSettings, setShowSettings] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showFocus, setShowFocus] = useState(false);
  const [showHub, setShowHub] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

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
      setShowSettings(true);
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

  const handleToggleChat = useCallback(async () => {
    if (isOpen) {
      toggleChat();
      await collapseWindow();
    } else {
      await expandWindow();
      toggleChat();
    }
  }, [isOpen, toggleChat]);

  const handleToggleFocus = useCallback(async () => {
    if (showFocus) {
      setShowFocus(false);
      await collapseWindow();
    } else {
      await expandWindow();
      setShowFocus(true);
    }
  }, [showFocus]);

  return (
    <main className="flex h-full w-full flex-col items-center">
      {isOpen ? (
        <>
          {/* Chat mode: scaled creature + chat panel */}
          <div
            className="flex items-center justify-center pt-1"
            style={{ height: "35%" }}
            data-tauri-drag-region
          >
            <div style={{ transform: "scale(0.55)", transformOrigin: "center center" }}>
              <MossCreature timeOfDay={timeOfDay} season={season} />
            </div>
          </div>
          <div className="absolute top-2 right-2 z-10">
            <ChatToggle onToggle={handleToggleChat} />
          </div>
          <div className="flex flex-col flex-1 w-full min-h-0">
            <ChatPanel />
          </div>
          <DiscoveryPopup />
          <ReturnOverlay />
        </>
      ) : showFocus ? (
        <>
          {/* Focus mode: scaled creature + focus panel */}
          <div
            className="flex items-center justify-center pt-1"
            style={{ height: "35%" }}
            data-tauri-drag-region
          >
            <div style={{ transform: "scale(0.55)", transformOrigin: "center center" }}>
              <MossCreature timeOfDay={timeOfDay} season={season} />
            </div>
          </div>
          <div className="absolute top-2 right-2 z-10 flex gap-1">
            <ChatToggle onToggle={handleToggleChat} />
            <button
              onClick={handleToggleFocus}
              className="flex items-center justify-center w-6 h-6 rounded-full transition-transform hover:scale-110"
              style={{ background: "rgba(0,0,0,0.4)" }}
              title="Close focus panel"
            >
              <span className="text-white/70 text-xs">{"\u2715"}</span>
            </button>
          </div>
          <div className="flex flex-col flex-1 w-full min-h-0">
            <FocusPanel />
          </div>
          <DiscoveryPopup />
          <ReturnOverlay />
        </>
      ) : (
        <>
          {/* Compact mode: creature + focus HUD + hub */}
          <div className="flex flex-1 items-center justify-center" data-tauri-drag-region>
            <MossCreature timeOfDay={timeOfDay} season={season} />
          </div>
          <div className="flex items-center pb-2 px-1 w-full justify-center">
            <CareButtons
              onFocusToggle={handleToggleFocus}
              onHubToggle={() => setShowHub((prev) => !prev)}
            />
            <div className="ml-1 flex-shrink-0">
              <ChatToggle onToggle={handleToggleChat} />
            </div>
          </div>
          <DiscoveryPopup />
          <ReturnOverlay />
          <HubMenu
            isOpen={showHub}
            onClose={() => setShowHub(false)}
            onJournal={() => setShowJournal(true)}
            onQuests={() => setShowQuests(true)}
            onAchievements={() => setShowAchievements(true)}
            onNotes={() => setShowNotes(true)}
            onSocial={() => setShowSocial(true)}
            onLeaderboard={() => setShowLeaderboard(true)}
            onSettings={() => setShowSettings(true)}
          />
          {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
          {showJournal && <JournalPanel onClose={() => setShowJournal(false)} />}
          {showQuests && <QuestPanel onClose={() => setShowQuests(false)} />}
          {showAchievements && <AchievementGallery onClose={() => setShowAchievements(false)} />}
          {showSocial && <AuthPanel onClose={() => setShowSocial(false)} />}
          {showLeaderboard && <LeaderboardPanel onClose={() => setShowLeaderboard(false)} />}
          {showNotes && <NotesPanel onClose={() => setShowNotes(false)} />}
        </>
      )}
      <QuestCompletionPopup />
      <AchievementToast />
      <FocusCompletionPopup />
      <ReminderToast />
    </main>
  );
}

export default App;
