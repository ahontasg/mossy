import { useState, useCallback } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { SignInForm } from "./SignInForm";
import { TeamSetup } from "./TeamSetup";
import { PanelCard } from "../../../components/PanelCard";
import { IconSocial } from "../../../components/icons";

interface AuthPanelProps {
  onClose: () => void;
}

export function AuthPanel({ onClose }: AuthPanelProps) {
  const status = useAuthStore((s) => s.status);
  const profile = useAuthStore((s) => s.profile);
  const team = useAuthStore((s) => s.team);
  const signOut = useAuthStore((s) => s.signOut);
  const [inviteCopied, setInviteCopied] = useState(false);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const handleCopyInvite = useCallback(async () => {
    if (!team) return;
    const text = `Join my Mossy team! \u{1F33F}\nTeam: ${team.name} | Code: ${team.joinCode}`;
    await navigator.clipboard.writeText(text);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  }, [team]);

  return (
    <PanelCard
      title="Social"
      onClose={onClose}
      icon={<IconSocial size={16} />}
    >
      {status === "loading" && (
        <div className="flex items-center justify-center py-4">
          <span className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>Loading...</span>
        </div>
      )}

      {status === "signed_out" && (
        <SignInForm />
      )}

      {status === "signed_in" && !team && (
        <TeamSetup />
      )}

      {status === "signed_in" && team && (
        <div className="flex flex-col gap-2">
          {/* Profile info */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
              style={{ background: "oklch(0.58 0.14 145 / 0.1)" }}>
              {"\u{1F33F}"}
            </div>
            <div>
              <div className="text-[10px] font-medium" style={{ color: "var(--color-text-primary)" }}>{profile?.displayName}</div>
              <div className="text-[8px]" style={{ color: "var(--color-text-tertiary)" }}>{team.name}</div>
            </div>
          </div>

          {/* Team code */}
          <div className="flex items-center justify-between rounded px-2 py-1"
            style={{ background: "var(--color-surface-inset)" }}>
            <span className="text-[8px]" style={{ color: "var(--color-text-tertiary)" }}>Team code</span>
            <span className="text-[9px] font-mono tracking-wider" style={{ color: "var(--color-text-secondary)" }}>{team.joinCode}</span>
          </div>

          {/* Invite button */}
          <button
            onClick={handleCopyInvite}
            className="w-full text-[9px] font-medium py-1.5 rounded transition-colors"
            style={{
              background: inviteCopied ? "oklch(0.58 0.14 145 / 0.1)" : "oklch(0.58 0.14 145 / 0.15)",
              color: "#7cb342",
            }}
          >
            {inviteCopied ? "Copied!" : "Invite a teammate"}
          </button>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full text-[8px] py-1 transition-opacity hover:opacity-70"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Sign out
          </button>
        </div>
      )}
    </PanelCard>
  );
}
