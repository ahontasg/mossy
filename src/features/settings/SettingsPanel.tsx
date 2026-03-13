import { motion } from "motion/react";
import { useSettingsStore } from "../../stores/settingsStore";
import { useChatStore } from "../../stores/chatStore";
import { useFocusStore } from "../../stores/focusStore";
import { SnapshotButton } from "../social";

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const setSoundEnabled = useSettingsStore((s) => s.setSoundEnabled);
  const focusStatus = useFocusStore((s) => s.status);
  const focusDurationMs = useFocusStore((s) => s.focusDurationMs);
  const shortBreakMs = useFocusStore((s) => s.shortBreakMs);
  const longBreakMs = useFocusStore((s) => s.longBreakMs);
  const setDurations = useFocusStore((s) => s.setDurations);
  const isTimerIdle = focusStatus === "idle";

  const llmStatus = useChatStore((s) => s.llmStatus);
  const checkLlmStatus = useChatStore((s) => s.checkLlmStatus);

  const statusLabel =
    llmStatus === "ready" ? "Running" :
    llmStatus === "starting" ? "Starting..." :
    llmStatus === "checking" ? "Checking..." :
    "Stopped";

  const statusColor =
    llmStatus === "ready" ? "#7cb342" : "#ef4444";

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="rounded-xl px-4 py-3 w-[200px]"
        style={{ background: "rgba(0, 0, 0, 0.6)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/80 text-xs font-medium">Settings</span>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/70 text-sm leading-none transition-colors"
          >
            &#x2715;
          </button>
        </div>

        {/* Sound toggle */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-[10px]">Sound effects</span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="rounded-full px-2 py-0.5 text-[9px] font-medium transition-colors"
            style={{
              background: soundEnabled ? "rgba(124, 179, 66, 0.3)" : "rgba(255, 255, 255, 0.08)",
              color: soundEnabled ? "#7cb342" : "rgba(255, 255, 255, 0.4)",
            }}
          >
            {soundEnabled ? "ON" : "OFF"}
          </button>
        </div>

        {/* Focus Timer durations */}
        <div className="mb-2 pt-2 border-t border-white/10">
          <span className="text-white/60 text-[10px] block mb-1.5">Focus Timer</span>

          {/* Focus duration */}
          <div className="mb-1.5">
            <span className="text-white/40 text-[8px] block mb-0.5">Focus</span>
            <div className="flex gap-0.5 flex-wrap">
              {[15, 20, 25, 30, 45, 60].map((min) => {
                const ms = min * 60_000;
                const active = focusDurationMs === ms;
                return (
                  <button
                    key={min}
                    disabled={!isTimerIdle}
                    onClick={() => setDurations(ms, shortBreakMs, longBreakMs)}
                    className="rounded-full px-1.5 py-0.5 text-[8px] font-medium transition-colors disabled:opacity-40"
                    style={{
                      background: active ? "rgba(124, 179, 66, 0.3)" : "rgba(255, 255, 255, 0.08)",
                      color: active ? "#7cb342" : "rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    {min}m
                  </button>
                );
              })}
            </div>
          </div>

          {/* Short break */}
          <div className="mb-1.5">
            <span className="text-white/40 text-[8px] block mb-0.5">Short Break</span>
            <div className="flex gap-0.5">
              {[3, 5, 10].map((min) => {
                const ms = min * 60_000;
                const active = shortBreakMs === ms;
                return (
                  <button
                    key={min}
                    disabled={!isTimerIdle}
                    onClick={() => setDurations(focusDurationMs, ms, longBreakMs)}
                    className="rounded-full px-1.5 py-0.5 text-[8px] font-medium transition-colors disabled:opacity-40"
                    style={{
                      background: active ? "rgba(124, 179, 66, 0.3)" : "rgba(255, 255, 255, 0.08)",
                      color: active ? "#7cb342" : "rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    {min}m
                  </button>
                );
              })}
            </div>
          </div>

          {/* Long break */}
          <div className="mb-1">
            <span className="text-white/40 text-[8px] block mb-0.5">Long Break</span>
            <div className="flex gap-0.5">
              {[10, 15, 20, 30].map((min) => {
                const ms = min * 60_000;
                const active = longBreakMs === ms;
                return (
                  <button
                    key={min}
                    disabled={!isTimerIdle}
                    onClick={() => setDurations(focusDurationMs, shortBreakMs, ms)}
                    className="rounded-full px-1.5 py-0.5 text-[8px] font-medium transition-colors disabled:opacity-40"
                    style={{
                      background: active ? "rgba(124, 179, 66, 0.3)" : "rgba(255, 255, 255, 0.08)",
                      color: active ? "#7cb342" : "rgba(255, 255, 255, 0.4)",
                    }}
                  >
                    {min}m
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* LLM status */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-[10px]">LLM</span>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: statusColor }}
            />
            <span className="text-white/50 text-[9px]">{statusLabel}</span>
          </div>
        </div>

        {/* Restart sidecar button */}
        {llmStatus === "ready" && (
          <button
            onClick={() => checkLlmStatus()}
            className="w-full text-[9px] text-white/40 hover:text-white/60 py-1 rounded transition-colors"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          >
            Restart LLM
          </button>
        )}

        {/* Model info */}
        <div className="mt-2 pt-2 border-t border-white/10">
          <div className="text-white/30 text-[8px]">
            Qwen3.5 0.8B Q4_K_M
          </div>
        </div>

        {/* Growth Snapshot */}
        <div className="mt-2 pt-2 border-t border-white/10">
          <SnapshotButton />
        </div>
      </div>
    </motion.div>
  );
}
