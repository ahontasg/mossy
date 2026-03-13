import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { invoke, Channel } from "../lib/tauri";
import { buildSystemPrompt } from "../features/chat/lib/systemPrompt";
import { parseIntent } from "../features/chat/lib/intentParser";
import { executeIntent } from "../features/chat/lib/actionExecutor";
import { useCreatureStore } from "./creatureStore";
import { useFocusStore } from "./focusStore";
import type { ChatMessage, LlmStatus, ChatEvent, PullEvent, Season } from "../types";

const SLIDING_WINDOW = 6;

/** Strip <think>...</think> blocks and orphaned tags */
function stripThinkTags(text: string): string {
  // Remove complete <think>...</think> blocks (including across lines)
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, "");
  // Remove an unclosed <think> block at the end (still streaming)
  cleaned = cleaned.replace(/<think>[\s\S]*$/, "");
  // Remove orphaned </think> tags (model sometimes emits closing without opening)
  cleaned = cleaned.replace(/<\/think>/g, "");
  return cleaned.trim();
}

let messageIdCounter = 0;
function nextId(): string {
  return `msg-${++messageIdCounter}-${Date.now()}`;
}

interface ChatStore {
  messages: ChatMessage[];
  isOpen: boolean;
  isStreaming: boolean;
  streamingText: string;
  llmStatus: LlmStatus;
  pullProgress: number;

  toggleChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  injectProactiveMessage: (content: string) => void;
  checkLlmStatus: () => Promise<void>;
  downloadModel: () => Promise<void>;
  clearHistory: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatStore>()(
  subscribeWithSelector((set, get) => ({
    messages: [],
    isOpen: false,
    isStreaming: false,
    streamingText: "",
    llmStatus: "unknown",
    pullProgress: 0,

    toggleChat: () => {
      set((s) => ({ isOpen: !s.isOpen }));
    },

    injectProactiveMessage: (content: string) => {
      set((s) => ({
        messages: [...s.messages, {
          id: nextId(),
          role: "assistant" as const,
          content,
          timestamp: Date.now(),
        }],
      }));
    },

    sendMessage: async (text: string) => {
      const userMessage: ChatMessage = {
        id: nextId(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      };

      set((s) => ({
        messages: [...s.messages, userMessage],
        isStreaming: true,
        streamingText: "",
      }));

      // Intent parsing intercept — handle commands without LLM
      const intent = parseIntent(text);
      if (intent.type !== "none") {
        const result = executeIntent(intent);
        if (result.executed) {
          const assistantMessage: ChatMessage = {
            id: nextId(),
            role: "assistant",
            content: result.response ?? "",
            timestamp: Date.now(),
          };
          set((s) => ({
            messages: [...s.messages, assistantMessage],
            isStreaming: false,
            streamingText: "",
          }));
          useCreatureStore.getState().addXp(10);
          useCreatureStore.getState().focusCare("happiness", 10);
          return;
        }
      }

      const { stats, mood, level } = useCreatureStore.getState();
      const season = document.documentElement.getAttribute("data-season") as Season | null;
      const focusState = useFocusStore.getState();
      const focusContext = focusState.totalFocusMinutes > 0 ? {
        todayFocusMinutes: focusState.todayFocusMinutes,
        completedSessionsToday: focusState.completedSessionsToday,
        focusStreak: focusState.focusStreak,
        status: focusState.status,
      } : undefined;
      const systemPrompt = buildSystemPrompt(stats, mood, level, season ?? undefined, focusContext);

      // Build sliding window of messages for context, enforcing alternating roles
      const allMessages = get()
        .messages.slice(-SLIDING_WINDOW)
        .map((m) => ({ role: m.role, content: m.content }));

      // Walk backward and keep the most recent valid alternating sequence
      const recentMessages: typeof allMessages = [];
      for (let i = allMessages.length - 1; i >= 0; i--) {
        const msg = allMessages[i];
        if (recentMessages.length === 0 || recentMessages[0].role !== msg.role) {
          recentMessages.unshift(msg);
        }
      }

      const channel = new Channel<ChatEvent>();
      let accumulated = "";

      channel.onmessage = (event: ChatEvent) => {
        switch (event.event) {
          case "delta": {
            accumulated += event.data.text;
            const cleaned = stripThinkTags(accumulated);
            if (cleaned !== get().streamingText) {
              set({ streamingText: cleaned });
            }
            break;
          }
          case "done": {
            const finalContent = stripThinkTags(accumulated);
            const assistantMessage: ChatMessage = {
              id: nextId(),
              role: "assistant",
              content: finalContent || "*rustles quietly*",
              timestamp: Date.now(),
            };
            set((s) => ({
              messages: [...s.messages, assistantMessage],
              isStreaming: false,
              streamingText: "",
            }));
            // Award XP for conversation + happiness boost
            useCreatureStore.getState().addXp(10);
            useCreatureStore.getState().focusCare("happiness", 10);
            break;
          }
          case "error":
            set((s) => {
              const errorMessage: ChatMessage = {
                id: nextId(),
                role: "assistant",
                content: `*rustles nervously* I couldn't think of what to say... (${event.data.message})`,
                timestamp: Date.now(),
              };
              return {
                messages: [...s.messages, errorMessage],
                isStreaming: false,
                streamingText: "",
              };
            });
            break;
        }
      };

      try {
        await invoke("chat_with_mossy", {
          messages: recentMessages,
          systemPrompt,
          onEvent: channel,
        });
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        set((s) => {
          const errorMessage: ChatMessage = {
            id: nextId(),
            role: "assistant",
            content: `*wilts slightly* Something went wrong... (${errorMsg})`,
            timestamp: Date.now(),
          };
          return {
            messages: [...s.messages, errorMessage],
            isStreaming: false,
            streamingText: "",
          };
        });
      }
    },

    checkLlmStatus: async () => {
      set({ llmStatus: "checking" });
      try {
        const hasModel = await invoke("check_model_exists", {});
        if (!hasModel) {
          set({ llmStatus: "no_model" });
          return;
        }
        set({ llmStatus: "starting" });
        await invoke("start_sidecar", {});
        set({ llmStatus: "ready" });
      } catch (e) {
        console.error("checkLlmStatus failed:", e);
        set({ llmStatus: "no_model" });
      }
    },

    downloadModel: async () => {
      set({ llmStatus: "downloading", pullProgress: 0 });

      const channel = new Channel<PullEvent>();
      channel.onmessage = (event: PullEvent) => {
        switch (event.event) {
          case "progress":
            set({ pullProgress: event.data.percent });
            break;
          case "done":
            set({ pullProgress: 100 });
            break;
          case "error":
            set({ llmStatus: "no_model", pullProgress: 0 });
            break;
        }
      };

      try {
        await invoke("download_model", { onEvent: channel });
        // After download, start the sidecar
        await get().checkLlmStatus();
      } catch (e) {
        console.error("download_model failed:", e);
        set({ llmStatus: "no_model", pullProgress: 0 });
      }
    },

    clearHistory: () => {
      messageIdCounter = 0;
      set({ messages: [], streamingText: "" });
    },

    reset: () => {
      messageIdCounter = 0;
      set({
        messages: [],
        isOpen: false,
        isStreaming: false,
        streamingText: "",
        llmStatus: "unknown",
        pullProgress: 0,
      });
    },
  })),
);
