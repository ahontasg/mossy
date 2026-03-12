import { useChatStore } from "../../stores/chatStore";
import { MessageList } from "./components/MessageList";
import { ChatInput } from "./components/ChatInput";
import { QuickReplies } from "./components/QuickReplies";
import { LlmSetup } from "./components/LlmSetup";

export function ChatPanel() {
  const llmStatus = useChatStore((s) => s.llmStatus);

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-black/40 backdrop-blur-sm rounded-t-xl">
      {llmStatus !== "ready" ? (
        <LlmSetup />
      ) : (
        <>
          <MessageList />
          <QuickReplies />
          <ChatInput />
        </>
      )}
    </div>
  );
}
