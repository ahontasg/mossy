import type { ChatMessage } from "../../../types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isMossy = message.role === "assistant";

  return (
    <div className={`flex ${isMossy ? "justify-start" : "justify-end"} mb-1.5`}>
      <div
        className={`max-w-[85%] rounded-lg px-2.5 py-1.5 text-xs leading-relaxed ${
          isMossy
            ? "bg-moss-800/80 text-moss-100"
            : "bg-white/15 text-white/90"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
