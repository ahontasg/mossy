import { useState, useEffect } from "react";

interface StreamingIndicatorProps {
  text: string;
}

export function StreamingIndicator({ text }: StreamingIndicatorProps) {
  const [showWaking, setShowWaking] = useState(false);

  useEffect(() => {
    if (text) {
      setShowWaking(false);
      return;
    }
    const timer = setTimeout(() => setShowWaking(true), 1500);
    return () => clearTimeout(timer);
  }, [text]);

  const displayText = text || (showWaking ? "Mossy is waking up..." : "");

  return (
    <div className="flex justify-start mb-1.5">
      <div
        className="max-w-[85%] rounded-lg px-2.5 py-1.5 leading-relaxed"
        style={{
          fontSize: "var(--text-sm)",
          background: "oklch(0.93 0.04 145 / 0.5)",
          color: "var(--color-text-primary)",
        }}
      >
        {displayText}
        <span className="inline-block w-1.5 h-3 ml-0.5 animate-pulse" style={{ background: "var(--color-moss-400)" }} />
      </div>
    </div>
  );
}
