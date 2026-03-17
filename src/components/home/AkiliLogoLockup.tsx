/**
 * AKILI logo lockup: radar symbol + wordmark + tagline.
 * Professional version with consistent stroke weights and unified typography.
 * SVG optimized for scalability and professional appearance.
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
      {/* Radar symbol - professional version with consistent stroke weights */}
      <g transform="translate(30,40)">
        {/* Outer pentagon */}
        <polygon
          points="0,-22 20,-7 13,19 -13,19 -20,-7"
          fill="none"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Radar sweep lines - consistent 1.5px stroke */}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="-23"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="0"
          x2="21"
          y2="-7.5"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="0"
          x2="14"
          y2="20"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="0"
          x2="-14"
          y2="20"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="0"
          x2="-21"
          y2="-7.5"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Center point */}
        <circle
          cx="0"
          cy="0"
          r="2.5"
          fill="var(--brand, #2563EB)"
        />
      </g>

      {/* Wordmark - unified sans-serif typography */}
      <text
        x="58"
        y="36"
        textAnchor="start"
        fontFamily="var(--font-sans), Inter, -apple-system, system-ui, sans-serif"
        fontSize="26"
        fontWeight="700"
        fill="var(--foreground, #1E293B)"
        letterSpacing="0.5"
      >
        AKILI
      </text>

      {/* Tagline - consistent sans-serif family */}
      <text
        x="58"
        y="54"
        textAnchor="start"
        fontFamily="var(--font-sans), Inter, -apple-system, system-ui, sans-serif"
        fontSize="12"
        fontWeight="500"
        fill="var(--muted-foreground, #64748B)"
        letterSpacing="0.3"
      >
        Risk Intelligence
      </text>
    </svg>
  );
}

/**
 * Simplified icon-only version for small applications (favicons, avatars)
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
      <g transform="translate(30,30)">
        {/* Simplified pentagon for small sizes */}
        <polygon
          points="0,-18 16,-5.5 10,15 -10,15 -16,-5.5"
          fill="none"
          stroke="var(--brand, #2563EB)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Simplified radar lines */}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="-19"
          stroke="var(--brand, #2563EB)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="0"
          x2="17"
          y2="-6"
          stroke="var(--brand, #2563EB)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="0"
          x2="11"
          y2="16"
          stroke="var(--brand, #2563EB)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Center point */}
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
 * Horizontal lockup version for headers and navigation
 */
export function AkiliHorizontal({ className }: { className?: string }) {
  return (
    <svg
      width="180"
      height="40"
      viewBox="0 0 180 40"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="AKILI Risk Intelligence"
    >
      {/* Compact radar symbol */}
      <g transform="translate(20,20)">
        <polygon
          points="0,-12 11,-4 7,10 -7,10 -11,-4"
          fill="none"
          stroke="var(--brand, #2563EB)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <line x1="0" y1="0" x2="0" y2="-13" stroke="var(--brand, #2563EB)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="0" y1="0" x2="12" y2="-4" stroke="var(--brand, #2563EB)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="0" y1="0" x2="8" y2="11" stroke="var(--brand, #2563EB)" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="0" cy="0" r="1.5" fill="var(--brand, #2563EB)" />
      </g>

      {/* Compact wordmark */}
      <text
        x="40"
        y="20"
        textAnchor="start"
        fontFamily="var(--font-sans), Inter, -apple-system, system-ui, sans-serif"
        fontSize="14"
        fontWeight="700"
        fill="var(--foreground, #1E293B)"
        letterSpacing="0.3"
        dominantBaseline="middle"
      >
        AKILI
      </text>

      {/* Compact tagline */}
      <text
        x="40"
        y="28"
        textAnchor="start"
        fontFamily="var(--font-sans), Inter, -apple-system, system-ui, sans-serif"
        fontSize="8"
        fontWeight="500"
        fill="var(--muted-foreground, #64748B)"
        letterSpacing="0.2"
      >
        Risk Intelligence
      </text>
    </svg>
  );
}
