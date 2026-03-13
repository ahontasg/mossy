import { useEffect, useCallback, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { MossCreature } from "./features/creature";
import { CareButtons } from "./features/creature/components/CareButtons";
import { ReturnOverlay } from "./features/creature/components/ReturnOverlay";
import { ChatPanel, ChatToggle } from "./features/chat";
import { SettingsPanel } from "./features/settings";
import { JournalPanel, DiscoveryPopup } from "./features/journal";
import { QuestPanel, QuestCompletionPopup } from "./features/quests";
import { AchievementToast, AchievementGallery } from "./features/achievements";
import { useTimeOfDay } from "./hooks/useTimeOfDay";
import { useSeason } from "./hooks/useSeason";
import { initPersistence, saveImmediate, cleanupPersistence } from "./hooks/useTauriStore";
import { initSettingsPersistence } from "./hooks/useSettingsStore";
import { initJournalPersistence, cleanupJournalPersistence } from "./hooks/useJournalStore";
import { initQuestPersistence, cleanupQuestPersistence } from "./hooks/useQuestStore";
import { initAchievementPersistence, cleanupAchievementPersistence } from "./hooks/useAchievementStore";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCreatureStore } from "./stores/creatureStore";
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

  useEffect(() => {
    (async () => {
      await initPersistence();
      await initSettingsPersistence();
      await initJournalPersistence();
      await initQuestPersistence();
      await initAchievementPersistence();
      checkLlmStatus();
    })();

    const unlisten = getCurrentWindow().onCloseRequested(async () => {
      await saveImmediate();
    });

    const unlistenCare = listen<string>("care-action", (event) => {
      const actions: Record<string, () => void> = {
        feed: useCreatureStore.getState().feed,
        water: useCreatureStore.getState().water,
        pet: useCreatureStore.getState().pet,
        sunlight: useCreatureStore.getState().sunlight,
      };
      const action = actions[event.payload];
      if (action) action();
    });

    const unlistenSettings = listen("show-settings", () => {
      setShowSettings(true);
    });

    return () => {
      cleanupPersistence();
      cleanupJournalPersistence();
      cleanupQuestPersistence();
      cleanupAchievementPersistence();
      unlisten.then((fn) => fn());
      unlistenCare.then((fn) => fn());
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
      ) : (
        <>
          {/* Compact mode: creature + care buttons + chat toggle */}
          <div className="flex flex-1 items-center justify-center" data-tauri-drag-region>
            <MossCreature timeOfDay={timeOfDay} season={season} />
          </div>
          <div className="flex items-center pb-2 px-1 w-full justify-center">
            <CareButtons
              onJournalToggle={() => setShowJournal(true)}
              onQuestToggle={() => setShowQuests(true)}
              onAchievementToggle={() => setShowAchievements(true)}
            />
            <div className="ml-1 flex-shrink-0">
              <ChatToggle onToggle={handleToggleChat} />
            </div>
          </div>
          <DiscoveryPopup />
          <ReturnOverlay />
          {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
          {showJournal && <JournalPanel onClose={() => setShowJournal(false)} />}
          {showQuests && <QuestPanel onClose={() => setShowQuests(false)} />}
          {showAchievements && <AchievementGallery onClose={() => setShowAchievements(false)} />}
        </>
      )}
      <QuestCompletionPopup />
      <AchievementToast />
    </main>
  );
}

export default App;
