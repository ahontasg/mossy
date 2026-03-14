interface MiniPixelArtProps {
  pattern: (string | null)[][];
  dimmed?: boolean;
  size?: number;
}

export function MiniPixelArt({ pattern, dimmed = false, size = 28 }: MiniPixelArtProps) {
  const rows = pattern.length;
  const cols = Math.max(...pattern.map((r) => r.length));
  const cellSize = Math.min(4, Math.floor(size / Math.max(rows, cols)));
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
