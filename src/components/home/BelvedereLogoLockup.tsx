/**
 * Belvedere logo lockup: radar symbol + wordmark + tagline.
 * SVG derived from provided design; colors use theme tokens.
 */
export function BelvedereLogoLockup({ className }: { className?: string }) {
  return (
    <svg
      width="320"
      height="80"
      viewBox="0 0 320 80"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Belvedere Governance Intelligence"
    >
      {/* Radar symbol */}
      <g transform="translate(40,40)">
        <polygon
          points="0,-22 21,-7 13,20 -13,20 -21,-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <line x1="0" y1="0" x2="0" y2="-22" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="0" x2="21" y2="-7" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="0" x2="13" y2="20" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="0" x2="-13" y2="20" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="0" x2="-21" y2="-7" stroke="currentColor" strokeWidth="1" />
        <circle cx="0" cy="0" r="2.5" fill="var(--brand)" />
      </g>
      {/* Wordmark — tightened spacing from icon */}
      <text
        x="76"
        y="38"
        fontFamily="var(--font-display), Georgia, serif"
        fontSize="24"
        fill="var(--foreground)"
        letterSpacing="1"
      >
        BELVEDERE
      </text>
      <text
        x="76"
        y="56"
        fontFamily="var(--font-sans), Inter, sans-serif"
        fontSize="12"
        fill="var(--muted-foreground)"
      >
        Governance Intelligence
      </text>
    </svg>
  );
}
