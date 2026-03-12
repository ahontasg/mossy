import { useEffect, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { MossCreature } from "./features/creature";
import { CareButtons } from "./features/creature/components/CareButtons";
import { ChatPanel, ChatToggle } from "./features/chat";
import { useTimeOfDay } from "./hooks/useTimeOfDay";
import { initPersistence, saveImmediate, cleanupPersistence } from "./hooks/useTauriStore";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCreatureStore } from "./stores/creatureStore";
import { useChatStore } from "./stores/chatStore";
import { expandWindow, collapseWindow } from "./hooks/useWindowResize";

function App() {
  const timeOfDay = useTimeOfDay();
  const isOpen = useChatStore((s) => s.isOpen);
  const toggleChat = useChatStore((s) => s.toggleChat);
  const checkLlmStatus = useChatStore((s) => s.checkLlmStatus);

  useEffect(() => {
    initPersistence();
    checkLlmStatus();

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

    return () => {
      cleanupPersistence();
      unlisten.then((fn) => fn());
      unlistenCare.then((fn) => fn());
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
              <MossCreature timeOfDay={timeOfDay} />
            </div>
          </div>
          <div className="absolute top-2 right-2 z-10">
            <ChatToggle onToggle={handleToggleChat} />
          </div>
          <div className="flex flex-col flex-1 w-full min-h-0">
            <ChatPanel />
          </div>
        </>
      ) : (
        <>
          {/* Compact mode: creature + care buttons + chat toggle */}
          <div className="flex flex-1 items-center justify-center" data-tauri-drag-region>
            <MossCreature timeOfDay={timeOfDay} />
          </div>
          <div className="flex items-center pb-2 px-1 w-full justify-center">
            <CareButtons />
            <div className="ml-1 flex-shrink-0">
              <ChatToggle onToggle={handleToggleChat} />
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default App;
