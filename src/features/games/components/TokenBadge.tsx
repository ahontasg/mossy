export function LeafCoinIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor" opacity={0.8}>
      <path d="M6 1C3 1 1 4 1 7c0 1.5.5 2.5 1.5 3 .5-2 2-4 5-5.5C8.5 3 7.5 2 6 1z" />
      <path d="M6 11c3 0 5-3 5-6 0-1.5-.5-2.5-1.5-3-.5 2-2 4-5 5.5C3.5 9 4.5 10 6 11z" opacity={0.6} />
    </svg>
  );
}

interface TokenBadgeProps {
  tokens: number;
}

export function TokenBadge({ tokens }: TokenBadgeProps) {
  return (
    <span
      className="flex items-center gap-1 font-bold leading-none"
      style={{ color: "#7cb342", fontSize: "var(--text-sm)" }}
    >
      <LeafCoinIcon />
      {tokens}
    </span>
  );
}
