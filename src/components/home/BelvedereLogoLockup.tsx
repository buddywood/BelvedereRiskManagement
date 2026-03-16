/**
 * Belvedere logo lockup: radar symbol + wordmark + tagline.
 * SVG derived from provided design; colors use theme tokens.
 */
export function BelvedereLogoLockup({ className }: { className?: string }) {
  return (
    <svg
      width="260"
      height="80"
      viewBox="0 0 260 80"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Belvedere Governance Intelligence"
    >
      {/* Radar symbol */}
      <g transform="translate(28,40)">
        <polygon
          points="0,-20 19,-6 12,18 -12,18 -19,-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="-22"
          stroke="currentColor"
          strokeWidth="0.9"
        />
        <line
          x1="0"
          y1="0"
          x2="21"
          y2="-7"
          stroke="currentColor"
          strokeWidth="0.9"
        />
        <line
          x1="0"
          y1="0"
          x2="13"
          y2="20"
          stroke="currentColor"
          strokeWidth="0.9"
        />
        <line
          x1="0"
          y1="0"
          x2="-13"
          y2="20"
          stroke="currentColor"
          strokeWidth="0.9"
        />
        <line
          x1="0"
          y1="0"
          x2="-21"
          y2="-7"
          stroke="currentColor"
          strokeWidth="0.9"
        />
        <circle cx="0" cy="0" r="2" fill="var(--brand)" />
      </g>
      {/* Wordmark */}
      <text
        x="54"
        y="35.5"
        textAnchor="start"
        fontFamily="var(--font-display), Georgia, serif"
        fontSize="24"
        fontWeight="600"
        fill="var(--foreground)"
        letterSpacing="0.8"
      >
        AKILI
      </text>
      <text
        x="54"
        y="53"
        textAnchor="start"
        fontFamily="var(--font-sans), Inter, sans-serif"
        fontSize="11.5"
        fill="var(--muted-foreground)"
        letterSpacing="0.2"
      >
        Risk Intelligence
      </text>
    </svg>
  );
}
