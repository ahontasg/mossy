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
        className="flex-1 bg-white/10 text-white/90 text-xs rounded-lg px-2.5 py-1.5 placeholder:text-white/30 outline-none focus:ring-1 focus:ring-moss-400/50 disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={isStreaming || !text.trim()}
        className="text-sm px-2 py-1 rounded-lg bg-moss-700/60 text-moss-100 hover:bg-moss-600/60 disabled:opacity-30 transition-colors"
      >
        Send
      </button>
    </div>
  );
}
