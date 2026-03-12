import { useChatStore } from "../../../stores/chatStore";

const QUICK_REPLIES = [
  "How are you?",
  "Fun fact!",
  "What should I do?",
];

export function QuickReplies() {
  const sendMessage = useChatStore((s) => s.sendMessage);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const hasMessages = useChatStore((s) => s.messages.length > 0);

  if (hasMessages || isStreaming) return null;

  return (
    <div className="flex flex-wrap gap-1 px-2 pb-1">
      {QUICK_REPLIES.map((reply) => (
        <button
          key={reply}
          onClick={() => sendMessage(reply)}
          className="text-[11px] px-2 py-0.5 rounded-full bg-moss-700/40 text-moss-200 hover:bg-moss-600/50 transition-colors"
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
