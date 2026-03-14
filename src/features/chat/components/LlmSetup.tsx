import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useChatStore } from "../../../stores/chatStore";

export function LlmSetup() {
  const status = useChatStore((s) => s.llmStatus);
  const pullProgress = useChatStore((s) => s.pullProgress);
  const downloadModel = useChatStore((s) => s.downloadModel);

  const prevStatusRef = useRef(status);
  const [showReady, setShowReady] = useState(false);

  useEffect(() => {
    if (prevStatusRef.current !== "ready" && status === "ready") {
      setShowReady(true);
      const timer = setTimeout(() => setShowReady(false), 2000);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = status;
  }, [status]);

  if (status === "ready" && !showReady) return null;
  if (status === "unknown") return null;

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-6 text-center">
      <AnimatePresence>
        {status === "ready" && showReady && (
          <motion.div
            className="text-xs font-medium"
            style={{ color: "var(--color-moss-500)" }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            Mossy is ready to chat!
          </motion.div>
        )}
      </AnimatePresence>

      {status === "checking" && (
        <div className="text-xs animate-pulse" style={{ color: "var(--color-text-secondary)" }}>
          *checking for brain...*
        </div>
      )}

      {status === "no_model" && (
        <>
          <div className="text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
            Mossy needs a brain!
          </div>
          <div className="text-xs mb-3 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            Download Mossy's brain (~1.0 GB)
          </div>
          <button
            onClick={downloadModel}
            className="px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: "var(--color-terracotta-500)", color: "white", fontSize: "var(--text-sm)" }}
          >
            Download model
          </button>
        </>
      )}

      {status === "downloading" && (
        <>
          <div className="text-sm font-medium mb-2" style={{ color: "var(--color-text-primary)" }}>
            Downloading Mossy's brain...
          </div>
          <div className="w-full max-w-[200px] mb-2">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-surface-inset)" }}>
              <div
                className="h-full bg-moss-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(pullProgress, 2)}%` }}
              />
            </div>
            <div className="text-[10px] mt-1" style={{ color: "var(--color-text-tertiary)" }}>
              {pullProgress < 1 ? pullProgress.toFixed(1) : Math.round(pullProgress)}%
            </div>
          </div>
        </>
      )}

      {status === "starting" && (
        <div className="text-xs animate-pulse" style={{ color: "var(--color-text-secondary)" }}>
          *waking up...*
        </div>
      )}
    </div>
  );
}
