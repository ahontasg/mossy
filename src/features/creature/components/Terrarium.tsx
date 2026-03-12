/** Glass terrarium dome + wooden base rendered behind the pixel grid */
export function Terrarium() {
  return (
    <g shapeRendering="geometricPrecision" pointerEvents="none">
      {/* Wooden base */}
      <rect x={18} y={222} width={220} height={22} rx={3} fill="#A0785A" />
      <rect x={26} y={225} width={204} height={16} rx={2} fill="#876548" />

      {/* Glass dome — elliptical arc */}
      <path
        d="M 16 222 A 112 210 0 0 1 240 222"
        fill="rgba(255, 255, 255, 0.05)"
        stroke="rgba(255, 255, 255, 0.25)"
        strokeWidth={1.5}
      />

      {/* Glass highlight (upper-left shine) */}
      <path
        d="M 52 80 Q 58 40 80 24"
        fill="none"
        stroke="rgba(255, 255, 255, 0.18)"
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Pebbles — positioned in transparent columns near base */}
      <circle cx={40} cy={214} r={4} fill="#8B7355" />
      <circle cx={50} cy={217} r={3} fill="#9B8565" />
      <circle cx={34} cy={218} r={3.5} fill="#7A6548" />
      <circle cx={216} cy={215} r={3.5} fill="#8B7355" />
      <circle cx={222} cy={218} r={3} fill="#9B8565" />
      <circle cx={208} cy={216} r={4} fill="#7A6548" />
    </g>
  );
}
