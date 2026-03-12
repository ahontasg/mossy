import { useState, useEffect, useRef } from "react";
import { useChatStore } from "../../../stores/chatStore";

export function useTalking(): {
  isTalking: boolean;
  talkFrame: "talk1" | "talk2";
} {
  const isStreaming = useChatStore((s) => s.isStreaming);
  const [talkFrame, setTalkFrame] = useState<"talk1" | "talk2">("talk1");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isStreaming) {
      intervalRef.current = setInterval(() => {
        setTalkFrame((prev) => (prev === "talk1" ? "talk2" : "talk1"));
      }, 200);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTalkFrame("talk1");
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isStreaming]);

  return { isTalking: isStreaming, talkFrame };
}
