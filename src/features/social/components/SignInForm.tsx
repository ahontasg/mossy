import { useState, useCallback } from "react";
import { useAuthStore } from "../../../stores/authStore";

export function SignInForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const signUp = useAuthStore((s) => s.signUp);
  const signIn = useAuthStore((s) => s.signIn);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);
      try {
        if (isSignUp) {
          await signUp(email, password, displayName || email.split("@")[0]);
        } else {
          await signIn(email, password);
        }
      } catch (err) {
        if (err instanceof Error && err.message === "CHECK_EMAIL") {
          setConfirmationSent(true);
        } else {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isSignUp, email, password, displayName, signUp, signIn],
  );

  if (confirmationSent) {
    return (
      <div className="flex flex-col gap-2 text-center">
        <span className="text-[10px] text-green-400">
          Check your email to confirm your account, then sign in.
        </span>
        <button
          type="button"
          onClick={() => {
            setConfirmationSent(false);
            setIsSignUp(false);
          }}
          className="rounded py-1 text-[10px] font-medium transition-colors"
          style={{ background: "oklch(0.58 0.14 145 / 0.15)", color: "#7cb342" }}
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {isSignUp && (
        <input
          type="text"
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded px-2 py-1 text-[10px] outline-none"
          style={{ background: "var(--color-surface-inset)", color: "var(--color-text-primary)" }}
        />
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="rounded px-2 py-1 text-[10px] outline-none"
        style={{ background: "var(--color-surface-inset)", color: "var(--color-text-primary)" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        className="rounded px-2 py-1 text-[10px] outline-none"
        style={{ background: "var(--color-surface-inset)", color: "var(--color-text-primary)" }}
      />

      {error && (
        <span className="text-[8px] text-red-400">{error}</span>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="rounded py-1 text-[10px] font-medium transition-colors"
        style={{
          background: "oklch(0.58 0.14 145 / 0.15)",
          color: "#7cb342",
          opacity: isLoading ? 0.5 : 1,
        }}
      >
        {isLoading ? "..." : isSignUp ? "Sign Up" : "Sign In"}
      </button>

      <button
        type="button"
        onClick={() => {
          setIsSignUp(!isSignUp);
          setError(null);
        }}
        className="text-[8px] transition-opacity hover:opacity-70"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {isSignUp ? "Already have an account? Sign in" : "New here? Create account"}
      </button>
    </form>
  );
}
