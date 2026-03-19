/**
 * AKILI logo lockup: radar symbol + wordmark + tagline.
 * Enhanced professional version with IBM Plex Sans typography, trust indicators,
 * and refined stroke weights for enterprise-grade authority.
 * SVG optimized for scalability and financial services appearance.
 */
export function AkiliLogoLockup({ className }: { className?: string }) {
  return (
    <svg
      width="280"
      height="80"
      viewBox="0 0 280 80"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="AKILI Risk Intelligence"
    >
      {/* Enhanced radar symbol - enterprise authority with gradient and hierarchy */}
      <defs>
        <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--brand, #2563EB)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--brand-secondary, #3B82F6)" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      <g transform="translate(30,40)">
        {/* Outer pentagon - enhanced authority weight */}
        <polygon
          points="0,-22 20,-7 13,19 -13,19 -20,-7"
          fill="url(#radarGradient)"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Radar sweep lines - refined precision weight */}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="-23"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="0"
          x2="21"
          y2="-7.5"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="0"
          x2="14"
          y2="20"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="0"
          x2="-14"
          y2="20"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="0"
          x2="-21"
          y2="-7.5"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Enhanced center point - improved visibility */}
        <circle
          cx="0"
          cy="0"
          r="3"
          fill="var(--brand, #2563EB)"
        />
      </g>

      {/* Enhanced wordmark - IBM Plex Sans for financial trust */}
      <text
        x="58"
        y="36"
        textAnchor="start"
        fontFamily="IBM Plex Sans, -apple-system, system-ui, sans-serif"
        fontSize="28"
        fontWeight="800"
        fill="var(--foreground, #1E293B)"
        letterSpacing="0.8"
      >
        AKILI
      </text>
      {/* Professional trademark indicator */}
      <text
        x="152"
        y="30"
        textAnchor="start"
        fontFamily="IBM Plex Sans, -apple-system, system-ui, sans-serif"
        fontSize="10"
        fontWeight="500"
        fill="var(--trust-accent, #F59E0B)"
      >
        ®
      </text>

      {/* Professional separator line */}
      <line
        x1="58"
        y1="44"
        x2="180"
        y2="44"
        stroke="var(--border, #E2E8F0)"
        strokeWidth="0.5"
      />

      {/* Enhanced tagline - refined professional hierarchy */}
      <text
        x="58"
        y="56"
        textAnchor="start"
        fontFamily="IBM Plex Sans, -apple-system, system-ui, sans-serif"
        fontSize="13"
        fontWeight="600"
        fill="var(--muted-foreground, #64748B)"
        letterSpacing="0.4"
      >
        Risk Intelligence
      </text>
    </svg>
  );
}

/**
 * Enhanced icon-only version for small applications (favicons, avatars)
 * Optimized for clarity at small sizes with bold strokes
 */
export function AkiliIcon({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="AKILI"
    >
      <defs>
        <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--brand, #2563EB)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--brand-secondary, #3B82F6)" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      <g transform="translate(30,30)">
        {/* Simplified pentagon with subtle fill for authority */}
        <polygon
          points="0,-18 16,-5.5 10,15 -10,15 -16,-5.5"
          fill="url(#iconGradient)"
          stroke="var(--brand, #2563EB)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Enhanced center point for small-size visibility */}
        <circle
          cx="0"
          cy="0"
          r="4"
          fill="var(--brand, #2563EB)"
        />
      </g>
    </svg>
  );
}

/**
 * Enhanced horizontal lockup version for headers and navigation
 * Professional compact design with IBM Plex Sans
 */
export function AkiliHorizontal({ className }: { className?: string }) {
  return (
    <svg
      width="190"
      height="40"
      viewBox="0 0 190 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="AKILI Risk Intelligence"
    >
      <defs>
        <linearGradient id="horizontalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--brand, #2563EB)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--brand-secondary, #3B82F6)" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* Enhanced compact radar symbol */}
      <g transform="translate(20,20)">
        <polygon
          points="0,-12 11,-4 7,10 -7,10 -11,-4"
          fill="url(#horizontalGradient)"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <line x1="0" y1="0" x2="0" y2="-13" stroke="var(--brand, #2563EB)" strokeWidth="1.0" strokeLinecap="round" />
        <line x1="0" y1="0" x2="12" y2="-4" stroke="var(--brand, #2563EB)" strokeWidth="1.0" strokeLinecap="round" />
        <line x1="0" y1="0" x2="8" y2="11" stroke="var(--brand, #2563EB)" strokeWidth="1.0" strokeLinecap="round" />
        <circle cx="0" cy="0" r="2" fill="var(--brand, #2563EB)" />
      </g>

      {/* Enhanced compact wordmark */}
      <text
        x="40"
        y="18"
        textAnchor="start"
        fontFamily="IBM Plex Sans, -apple-system, system-ui, sans-serif"
        fontSize="15"
        fontWeight="800"
        fill="var(--foreground, #1E293B)"
        letterSpacing="0.4"
        dominantBaseline="middle"
      >
        AKILI
      </text>

      {/* Professional trademark */}
      <text
        x="82"
        y="14"
        textAnchor="start"
        fontFamily="IBM Plex Sans, -apple-system, system-ui, sans-serif"
        fontSize="7"
        fontWeight="600"
        fill="var(--trust-accent, #F59E0B)"
      >
        ®
      </text>

      {/* Enhanced compact tagline */}
      <text
        x="40"
        y="30"
        textAnchor="start"
        fontFamily="IBM Plex Sans, -apple-system, system-ui, sans-serif"
        fontSize="9"
        fontWeight="600"
        fill="var(--muted-foreground, #64748B)"
        letterSpacing="0.25"
      >
        Risk Intelligence
      </text>
    </svg>
  );
}
