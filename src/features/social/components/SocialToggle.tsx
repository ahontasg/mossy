interface SocialToggleProps {
  onClick: () => void;
}

export function SocialToggle({ onClick }: SocialToggleProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-5 h-5 rounded transition-transform hover:scale-110"
      style={{ background: "rgba(255, 255, 255, 0.08)" }}
      title="Social"
    >
      <span className="text-[10px] leading-none">{"\u{1F465}"}</span>
    </button>
  );
}
