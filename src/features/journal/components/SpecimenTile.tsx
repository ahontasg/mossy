import type { SpecimenDefinition } from "../../../types";
import { MiniPixelArt } from "../../../components/MiniPixelArt";

const RARITY_BORDER: Record<string, string> = {
  common: "rgba(124, 179, 66, 0.4)",
  uncommon: "rgba(66, 165, 245, 0.5)",
  rare: "rgba(171, 71, 188, 0.6)",
  legendary: "rgba(255, 215, 0, 0.7)",
};

interface SpecimenTileProps {
  specimen: SpecimenDefinition;
  discovered: boolean;
  discoveredDate?: string;
  onSelect?: () => void;
}

export function SpecimenTile({ specimen, discovered, discoveredDate, onSelect }: SpecimenTileProps) {
  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-center gap-0.5 rounded-lg p-1.5 transition-transform hover:scale-105"
      style={{
        background: discovered ? "var(--color-surface-raised)" : "var(--color-surface-inset)",
        border: `1px solid ${discovered ? RARITY_BORDER[specimen.rarity] : "var(--color-border-subtle)"}`,
        opacity: discovered ? 1 : 0.5,
      }}
      title={
        discovered
          ? `${specimen.name}\n${specimen.description}\nFound: ${discoveredDate}`
          : "???"
      }
    >
      <MiniPixelArt pattern={specimen.pattern} dimmed={!discovered} />
      <span
        className="text-[7px] leading-none truncate w-full text-center"
        style={{ color: discovered ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}
      >
        {discovered ? specimen.name : "???"}
      </span>
    </button>
  );
}
