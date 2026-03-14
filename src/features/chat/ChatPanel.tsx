import { useChatStore } from "../../stores/chatStore";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { QuickReplies } from "./components/QuickReplies";
import { LlmSetup } from "./components/LlmSetup";

export function ChatPanel() {
  const llmStatus = useChatStore((s) => s.llmStatus);
  const messages = useChatStore((s) => s.messages);
  const clearHistory = useChatStore((s) => s.clearHistory);

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ background: "var(--color-surface-raised)" }}>
      {llmStatus !== "ready" ? (
        <LlmSetup />
      ) : (
        <>
          {messages.length > 0 && (
            <div className="flex justify-end px-2 pt-1">
              <button
                onClick={clearHistory}
                className="hover:opacity-70 transition-opacity"
                style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}
              >
                Clear
              </button>
            </div>
          )}
          <MessageList />
          <QuickReplies />
          <ChatInput />
        </>
      )}
    </div>
  );
}
