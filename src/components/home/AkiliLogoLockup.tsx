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
      {/* Enhanced radar chart - professional data visualization symbol */}
      <defs>
        <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--brand, #2563EB)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--brand-secondary, #3B82F6)" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="dataFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--trust-accent, #F59E0B)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--brand, #2563EB)" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      <g transform="translate(30,40)">
        {/* Radar chart concentric rings */}
        <polygon
          points="0,-22 20,-7 13,19 -13,19 -20,-7"
          fill="none"
          stroke="var(--border, #E2E8F0)"
          strokeWidth="1"
          strokeLinejoin="round"
          opacity="0.6"
        />
        <polygon
          points="0,-15 14,-4.5 9,13 -9,13 -14,-4.5"
          fill="none"
          stroke="var(--border, #E2E8F0)"
          strokeWidth="1"
          strokeLinejoin="round"
          opacity="0.4"
        />
        <polygon
          points="0,-8 7,-2.5 4.5,6.5 -4.5,6.5 -7,-2.5"
          fill="none"
          stroke="var(--border, #E2E8F0)"
          strokeWidth="1"
          strokeLinejoin="round"
          opacity="0.3"
        />

        {/* Radar chart axis lines */}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="-22"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.7"
        />
        <line
          x1="0"
          y1="0"
          x2="20"
          y2="-7"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.7"
        />
        <line
          x1="0"
          y1="0"
          x2="13"
          y2="19"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.7"
        />
        <line
          x1="0"
          y1="0"
          x2="-13"
          y2="19"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.7"
        />
        <line
          x1="0"
          y1="0"
          x2="-20"
          y2="-7"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Data visualization - risk assessment polygon */}
        <polygon
          points="0,-18 16,-3 8,12 -6,8 -14,-3"
          fill="url(#dataFill)"
          stroke="var(--trust-accent, #F59E0B)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Data points on radar chart */}
        <circle cx="0" cy="-18" r="2" fill="var(--trust-accent, #F59E0B)" />
        <circle cx="16" cy="-3" r="2" fill="var(--trust-accent, #F59E0B)" />
        <circle cx="8" cy="12" r="2" fill="var(--trust-accent, #F59E0B)" />
        <circle cx="-6" cy="8" r="2" fill="var(--trust-accent, #F59E0B)" />
        <circle cx="-14" cy="-3" r="2" fill="var(--trust-accent, #F59E0B)" />

        {/* Center point */}
        <circle
          cx="0"
          cy="0"
          r="2.5"
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
      {/* Professional trademark indicator - positioned right after AKILI */}
      <text
        x="168"
        y="28"
        textAnchor="start"
        fontFamily="IBM Plex Sans, -apple-system, system-ui, sans-serif"
        fontSize="12"
        fontWeight="600"
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
        {/* Simplified radar chart for small sizes */}
        <polygon
          points="0,-18 16,-5.5 10,15 -10,15 -16,-5.5"
          fill="none"
          stroke="var(--brand, #2563EB)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <polygon
          points="0,-9 8,-2.75 5,7.5 -5,7.5 -8,-2.75"
          fill="none"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          opacity="0.6"
        />

        {/* Simplified data visualization */}
        <polygon
          points="0,-12 10,-2 6,8 -4,5 -8,-2"
          fill="url(#iconGradient)"
          stroke="var(--trust-accent, #F59E0B)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Enhanced center point for small-size visibility */}
        <circle
          cx="0"
          cy="0"
          r="3"
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

      {/* Enhanced compact radar chart */}
      <g transform="translate(20,20)">
        <polygon
          points="0,-12 11,-4 7,10 -7,10 -11,-4"
          fill="none"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <polygon
          points="0,-6 5.5,-2 3.5,5 -3.5,5 -5.5,-2"
          fill="none"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1"
          strokeLinejoin="round"
          opacity="0.5"
        />

        {/* Compact data visualization */}
        <polygon
          points="0,-9 8,-2 5,7 -3,4 -6,-2"
          fill="url(#horizontalGradient)"
          stroke="var(--trust-accent, #F59E0B)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        <circle cx="0" cy="0" r="1.5" fill="var(--brand, #2563EB)" />
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

      {/* Professional trademark - positioned right after AKILI */}
      <text
        x="88"
        y="14"
        textAnchor="start"
        fontFamily="IBM Plex Sans, -apple-system, system-ui, sans-serif"
        fontSize="8"
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
