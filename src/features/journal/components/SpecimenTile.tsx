import type { SpecimenDefinition } from "../../../types";

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

function MiniPixelArt({ pattern, dimmed }: { pattern: (string | null)[][]; dimmed: boolean }) {
  const rows = pattern.length;
  const cols = Math.max(...pattern.map((r) => r.length));
  const cellSize = Math.min(4, Math.floor(28 / Math.max(rows, cols)));
  const w = cols * cellSize;
  const h = rows * cellSize;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} shapeRendering="crispEdges">
      {pattern.map((row, y) =>
        row.map((color, x) =>
          color ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill={dimmed ? "oklch(0.70 0.02 80)" : color}
            />
          ) : null,
        ),
      )}
    </svg>
  );
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
