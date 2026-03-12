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
      <div className="max-w-[85%] rounded-lg px-2.5 py-1.5 text-xs leading-relaxed bg-moss-800/80 text-moss-100">
        {displayText}
        <span className="inline-block w-1.5 h-3 ml-0.5 bg-moss-300 animate-pulse" />
      </div>
    </div>
  );
}
