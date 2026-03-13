import type { Frame } from "../data/frames";
import { CELL_SIZE } from "../constants";

interface PixelGridProps {
  frame: Frame;
  cellSize?: number;
  colorMap?: Map<string, string>;
}

export function PixelGrid({ frame, cellSize = CELL_SIZE, colorMap }: PixelGridProps) {
  return (
    <g>
      {frame.map((row, y) =>
        row.map((color, x) =>
          color ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize}
              height={cellSize}
              fill={colorMap?.get(color) ?? color}
            />
          ) : null,
        ),
      )}
    </g>
  );
}
