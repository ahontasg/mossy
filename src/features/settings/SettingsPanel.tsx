import { useSettingsStore } from "../../stores/settingsStore";
import { useChatStore } from "../../stores/chatStore";
import { useFocusStore } from "../../stores/focusStore";
import { SnapshotButton } from "../social";
import { PanelCard } from "../../components/PanelCard";
import { IconSettings } from "../../components/icons";

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
    <PanelCard
      title="Settings"
      onClose={onClose}
      icon={<IconSettings size={16} />}
    >
      {/* Sound toggle */}
      <div className="flex items-center justify-between mb-2">
        <span style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>Sound effects</span>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="rounded-full px-2 py-0.5 text-[9px] font-medium transition-colors"
          style={{
            background: soundEnabled ? "oklch(0.58 0.14 145 / 0.15)" : "var(--color-surface-inset)",
            color: soundEnabled ? "#7cb342" : "var(--color-text-tertiary)",
          }}
        >
          {soundEnabled ? "ON" : "OFF"}
        </button>
      </div>

      {/* Focus Timer durations */}
      <div className="mb-2 pt-2 border-t" style={{ borderColor: "var(--color-border-subtle)" }}>
        <span className="block mb-1.5" style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>Focus Timer</span>

        {/* Focus duration */}
        <div className="mb-1.5">
          <span className="block mb-0.5" style={{ color: "var(--color-text-tertiary)", fontSize: "var(--text-xs)" }}>Focus</span>
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
                    background: active ? "oklch(0.58 0.14 145 / 0.15)" : "var(--color-surface-inset)",
                    color: active ? "#7cb342" : "var(--color-text-tertiary)",
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
          <span className="block mb-0.5" style={{ color: "var(--color-text-tertiary)", fontSize: "var(--text-xs)" }}>Short Break</span>
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
                    background: active ? "oklch(0.58 0.14 145 / 0.15)" : "var(--color-surface-inset)",
                    color: active ? "#7cb342" : "var(--color-text-tertiary)",
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
          <span className="block mb-0.5" style={{ color: "var(--color-text-tertiary)", fontSize: "var(--text-xs)" }}>Long Break</span>
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
                    background: active ? "oklch(0.58 0.14 145 / 0.15)" : "var(--color-surface-inset)",
                    color: active ? "#7cb342" : "var(--color-text-tertiary)",
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
        <span style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>LLM</span>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: statusColor }}
          />
          <span style={{ color: "var(--color-text-tertiary)", fontSize: "var(--text-xs)" }}>{statusLabel}</span>
        </div>
      </div>

      {/* Restart sidecar button */}
      {llmStatus === "ready" && (
        <button
          onClick={() => checkLlmStatus()}
          className="w-full py-1 rounded transition-opacity hover:opacity-70"
          style={{ color: "var(--color-text-tertiary)", background: "var(--color-surface-inset)", fontSize: "var(--text-xs)" }}
        >
          Restart LLM
        </button>
      )}

      {/* Model info */}
      <div className="mt-2 pt-2 border-t" style={{ borderColor: "var(--color-border-subtle)" }}>
        <div style={{ color: "var(--color-text-tertiary)", fontSize: "var(--text-xs)" }}>
          Qwen3.5 0.8B Q4_K_M
        </div>
      </div>

      {/* Growth Snapshot */}
      <div className="mt-2 pt-2 border-t" style={{ borderColor: "var(--color-border-subtle)" }}>
        <SnapshotButton />
      </div>
    </PanelCard>
  );
}
