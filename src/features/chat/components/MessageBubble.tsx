import type { ChatMessage } from "../../../types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMossy = message.role === "assistant";

  return (
    <div className={`flex ${isMossy ? "justify-start" : "justify-end"} mb-1.5`}>
      <div
        className="max-w-[85%] rounded-lg px-2.5 py-1.5 leading-relaxed"
        style={{
          fontSize: "var(--text-sm)",
          background: isMossy
            ? "oklch(0.93 0.04 145 / 0.5)"
            : "oklch(0.62 0.12 45 / 0.12)",
          color: "var(--color-text-primary)",
        }}
      >
        {message.content}
      </div>
    </div>
  );
}
