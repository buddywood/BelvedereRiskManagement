/**
 * Static SVG radar chart preview for the hero.
 * Axes: Succession, Authority, Communication, Structure, Continuity.
 * Subtle, non-interactive — reinforces an analytical feel.
 */
const PADDING = 28;

export function GovernanceRadarPreview({ className }: { className?: string }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.35;

  const axes = [
    { label: "Succession", angle: 90 },
    { label: "Authority", angle: 90 - 72 },
    { label: "Communication", angle: 90 - 144 },
    { label: "Structure", angle: 90 - 216 },
    { label: "Continuity", angle: 90 - 288 },
  ];

  // Sample shape (0–1 scale) — irregular so it looks like real data
  const values = [0.72, 0.65, 0.78, 0.58, 0.74];

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const point = (angleDeg: number, value: number) => {
    const rad = toRad(angleDeg);
    const x = cx + r * value * Math.cos(rad);
    const y = cy - r * value * Math.sin(rad);
    return `${x},${y}`;
  };

  const dataPoints = axes.map((a, i) => point(a.angle, values[i])).join(" ");
  const axisPoints = axes.map((a) => {
    const rad = toRad(a.angle);
    const x2 = cx + r * Math.cos(rad);
    const y2 = cy - r * Math.sin(rad);
    const labelRadius = r + 18;
    const lx = cx + labelRadius * Math.cos(rad);
    const ly = cy - labelRadius * Math.sin(rad);
    return { x1: cx, y1: cy, x2, y2, label: a.label, lx, ly };
  });

  return (
    <figure className={className} aria-hidden>
      <svg
        viewBox={`${-PADDING} ${-PADDING} ${size + PADDING * 2} ${size + PADDING * 2}`}
        className="h-full w-full"
        role="img"
        aria-label="Governance score radar preview: Succession, Authority, Communication, Structure, Continuity"
      >
        {/* Grid: concentric rings */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={axes.map((a) => point(a.angle, scale)).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeWidth="0.6"
          />
        ))}
        {/* Axes */}
        {axisPoints.map(({ x1, y1, x2, y2 }) => (
          <line
            key={`${x2}-${y2}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeOpacity="0.2"
            strokeWidth="0.6"
          />
        ))}
        {/* Data shape */}
        <polygon
          points={dataPoints}
          fill="currentColor"
          fillOpacity="0.08"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        {/* Axis labels */}
        {axisPoints.map(({ label, lx, ly }) => (
          <text
            key={label}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-current text-[8px] font-medium opacity-50"
          >
            {label}
          </text>
        ))}
      </svg>
    </figure>
  );
}
