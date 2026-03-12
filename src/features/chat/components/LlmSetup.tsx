import { useChatStore } from "../../../stores/chatStore";

export function LlmSetup() {
  const status = useChatStore((s) => s.llmStatus);
  const pullProgress = useChatStore((s) => s.pullProgress);
  const downloadModel = useChatStore((s) => s.downloadModel);

  if (status === "ready" || status === "unknown") return null;

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-6 text-center">
      {status === "checking" && (
        <div className="text-white/60 text-xs animate-pulse">
          *checking for brain...*
        </div>
      )}

      {status === "no_model" && (
        <>
          <div className="text-moss-200 text-sm font-medium mb-2">
            Mossy needs a brain!
          </div>
          <div className="text-white/50 text-xs mb-3 leading-relaxed">
            Download Mossy's brain (~1.0 GB)
          </div>
          <button
            onClick={downloadModel}
            className="text-xs px-3 py-1.5 rounded-lg bg-moss-600/60 text-moss-100 hover:bg-moss-500/60 transition-colors"
          >
            Download model
          </button>
        </>
      )}

      {status === "downloading" && (
        <>
          <div className="text-moss-200 text-sm font-medium mb-2">
            Downloading Mossy's brain...
          </div>
          <div className="w-full max-w-[200px] mb-2">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-moss-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(pullProgress, 2)}%` }}
              />
            </div>
            <div className="text-white/40 text-[10px] mt-1">
              {pullProgress < 1 ? pullProgress.toFixed(1) : Math.round(pullProgress)}%
            </div>
          </div>
        </>
      )}

      {status === "starting" && (
        <div className="text-white/60 text-xs animate-pulse">
          *waking up...*
        </div>
      )}
    </div>
  );
}
