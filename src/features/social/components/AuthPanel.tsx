import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { useAuthStore } from "../../../stores/authStore";
import { SignInForm } from "./SignInForm";
import { TeamSetup } from "./TeamSetup";

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
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div
        className="rounded-xl px-4 py-3 w-[220px]"
        style={{ background: "rgba(0, 0, 0, 0.6)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/80 text-xs font-medium">Social</span>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/70 text-sm leading-none transition-colors"
          >
            {"\u2715"}
          </button>
        </div>

        {status === "loading" && (
          <div className="flex items-center justify-center py-4">
            <span className="text-white/40 text-[10px]">Loading...</span>
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
                style={{ background: "rgba(124, 179, 66, 0.2)" }}>
                {"\u{1F33F}"}
              </div>
              <div>
                <div className="text-white/80 text-[10px] font-medium">{profile?.displayName}</div>
                <div className="text-white/30 text-[8px]">{team.name}</div>
              </div>
            </div>

            {/* Team code */}
            <div className="flex items-center justify-between rounded px-2 py-1"
              style={{ background: "rgba(255, 255, 255, 0.05)" }}>
              <span className="text-white/40 text-[8px]">Team code</span>
              <span className="text-white/60 text-[9px] font-mono tracking-wider">{team.joinCode}</span>
            </div>

            {/* Invite button */}
            <button
              onClick={handleCopyInvite}
              className="w-full text-[9px] font-medium py-1.5 rounded transition-colors"
              style={{
                background: inviteCopied ? "rgba(124, 179, 66, 0.2)" : "rgba(124, 179, 66, 0.3)",
                color: "#7cb342",
              }}
            >
              {inviteCopied ? "Copied!" : "Invite a teammate"}
            </button>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="w-full text-[8px] text-white/30 hover:text-white/50 py-1 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
