import type { Frame } from "../data/frames";
import { CELL_SIZE } from "../constants";

interface PixelGridProps {
  frame: Frame;
  cellSize?: number;
}

export function PixelGrid({ frame, cellSize = CELL_SIZE }: PixelGridProps) {
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
              fill={color}
            />
          ) : null,
        ),
      )}
    </g>
  );
}
