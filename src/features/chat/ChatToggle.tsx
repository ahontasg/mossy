import { useChatStore } from "../../stores/chatStore";

interface ChatToggleProps {
  onToggle: () => void;
}

export function ChatToggle({ onToggle }: ChatToggleProps) {
  const isOpen = useChatStore((s) => s.isOpen);

  return (
    <button
      onClick={onToggle}
      className="w-7 h-7 flex items-center justify-center rounded-full bg-moss-700/60 text-moss-100 hover:bg-moss-600/60 hover:scale-110 active:scale-95 transition-all text-xs"
      title={isOpen ? "Close chat" : "Chat with Mossy"}
    >
      {isOpen ? "\u2715" : "\u{1F4AC}"}
    </button>
  );
}
