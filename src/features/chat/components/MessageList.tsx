import { useEffect, useRef } from "react";
import { useChatStore } from "../../../stores/chatStore";
import { MessageBubble } from "./MessageBubble";
import { StreamingIndicator } from "./StreamingIndicator";

export function MessageList() {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingText = useChatStore((s) => s.streamingText);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
      {messages.length === 0 && !isStreaming && (
        <div className="text-center mt-4" style={{ color: "var(--color-text-tertiary)", fontSize: "var(--text-sm)" }}>
          *rustles gently* Say hi to Mossy!
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isStreaming && streamingText && (
        <StreamingIndicator text={streamingText} />
      )}
      {isStreaming && !streamingText && (
        <div className="flex justify-start mb-1.5">
          <div
            className="rounded-lg px-2.5 py-1.5"
            style={{
              fontSize: "var(--text-sm)",
              background: "oklch(0.93 0.04 145 / 0.5)",
              color: "var(--color-text-secondary)",
            }}
          >
            <span className="animate-pulse">*thinking...*</span>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
