import { useState, useCallback } from "react";
import { useAuthStore } from "../../../stores/authStore";

export function TeamSetup() {
  const [mode, setMode] = useState<"choice" | "create" | "join">("choice");
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const createTeam = useAuthStore((s) => s.createTeam);
  const joinTeam = useAuthStore((s) => s.joinTeam);

  const handleCreate = useCallback(async () => {
    if (!teamName.trim()) return;
    setError(null);
    setIsLoading(true);
    try {
      const code = await createTeam(teamName.trim());
      setCreatedCode(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setIsLoading(false);
    }
  }, [teamName, createTeam]);

  const handleJoin = useCallback(async () => {
    if (!joinCode.trim()) return;
    setError(null);
    setIsLoading(true);
    try {
      await joinTeam(joinCode.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join team");
    } finally {
      setIsLoading(false);
    }
  }, [joinCode, joinTeam]);

  if (createdCode) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-[10px]" style={{ color: "var(--color-text-primary)" }}>Team created!</span>
        <div
          className="text-center py-2 rounded text-sm font-mono font-bold tracking-widest"
          style={{ background: "var(--color-surface-inset)", color: "var(--color-text-primary)" }}
        >
          {createdCode}
        </div>
        <span className="text-[8px]" style={{ color: "var(--color-text-tertiary)" }}>Share this code with your team</span>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(createdCode);
          }}
          className="text-[9px] py-1 rounded transition-opacity hover:opacity-70"
          style={{ color: "var(--color-text-tertiary)", background: "var(--color-surface-inset)" }}
        >
          Copy code
        </button>
      </div>
    );
  }

  if (mode === "choice") {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-[10px]" style={{ color: "var(--color-text-secondary)" }}>Join or create a team to compete</span>
        <button
          onClick={() => setMode("create")}
          className="text-[10px] font-medium py-1.5 rounded transition-colors"
          style={{ background: "rgba(124, 179, 66, 0.3)", color: "#7cb342" }}
        >
          Create a team
        </button>
        <button
          onClick={() => setMode("join")}
          className="text-[10px] font-medium py-1.5 rounded transition-colors"
          style={{ background: "var(--color-surface-inset)", color: "var(--color-text-secondary)" }}
        >
          Join with code
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setMode("choice")}
        className="text-[8px] self-start transition-opacity hover:opacity-70"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {"\u2190"} Back
      </button>

      {mode === "create" ? (
        <>
          <input
            type="text"
            placeholder="Team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="rounded px-2 py-1 text-[10px] outline-none"
            style={{ background: "var(--color-surface-inset)", color: "var(--color-text-primary)" }}
          />
          <button
            onClick={handleCreate}
            disabled={isLoading || !teamName.trim()}
            className="text-[10px] font-medium py-1 rounded transition-colors"
            style={{
              background: "rgba(124, 179, 66, 0.3)",
              color: "#7cb342",
              opacity: isLoading || !teamName.trim() ? 0.5 : 1,
            }}
          >
            {isLoading ? "..." : "Create"}
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter join code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="rounded px-2 py-1 text-[10px] font-mono tracking-widest text-center outline-none"
            style={{ background: "var(--color-surface-inset)", color: "var(--color-text-primary)" }}
          />
          <button
            onClick={handleJoin}
            disabled={isLoading || joinCode.length < 6}
            className="text-[10px] font-medium py-1 rounded transition-colors"
            style={{
              background: "rgba(124, 179, 66, 0.3)",
              color: "#7cb342",
              opacity: isLoading || joinCode.length < 6 ? 0.5 : 1,
            }}
          >
            {isLoading ? "..." : "Join"}
          </button>
        </>
      )}

      {error && <span className="text-[8px] text-red-400">{error}</span>}
    </div>
  );
}
