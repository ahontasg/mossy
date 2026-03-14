import { useState, useCallback, type KeyboardEvent } from "react";
import { useChatStore } from "../../../stores/chatStore";

export function ChatInput() {
  const [text, setText] = useState("");
  const isStreaming = useChatStore((s) => s.isStreaming);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    setText("");
    sendMessage(trimmed);
  }, [text, isStreaming, sendMessage]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="flex items-center gap-1.5 px-2 pb-2 pt-1">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isStreaming}
        placeholder={isStreaming ? "Mossy is thinking..." : "Talk to Mossy..."}
        className="flex-1 rounded-lg px-2.5 py-1.5 outline-none disabled:opacity-50"
        style={{
          background: "var(--color-surface-inset)",
          color: "var(--color-text-primary)",
          fontSize: "var(--text-sm)",
          border: "1px solid var(--color-border-subtle)",
        }}
      />
      <button
        onClick={handleSend}
        disabled={isStreaming || !text.trim()}
        className="px-3 py-1.5 rounded-lg font-medium disabled:opacity-30 transition-colors"
        style={{
          background: "var(--color-terracotta-500)",
          color: "white",
          fontSize: "var(--text-sm)",
        }}
      >
        Send
      </button>
    </div>
  );
}
