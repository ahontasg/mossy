import { useState, useCallback } from "react";
import { generateSnapshot } from "../lib/snapshot";

export function SnapshotButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = generateSnapshot();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <button
      onClick={handleCopy}
      className="w-full text-[9px] font-medium py-1.5 rounded transition-colors"
      style={{
        background: copied ? "rgba(124, 179, 66, 0.2)" : "rgba(255, 255, 255, 0.05)",
        color: copied ? "#7cb342" : "rgba(255, 255, 255, 0.5)",
      }}
    >
      {copied ? "Copied!" : "Copy Growth Snapshot"}
    </button>
  );
}
