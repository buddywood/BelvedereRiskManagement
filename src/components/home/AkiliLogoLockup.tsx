import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Explicit pixel height — sets default box size when className does not size the mark. */
  height?: number;
};

/**
 * Use trimmed PNGs (not SVG) for UI lockups.
 * Brand kit SVGs leave "Risk Intelligence" as live Montserrat text without
 * embedded fonts; browsers fall back and break glyph spacing when SVG is
 * loaded via <img>.
 */
const ASSETS = {
  horizontalPrimary: "/brand/akili-horizontal-primary.png",
  horizontalWhite: "/brand/akili-horizontal-white.png",
  verticalPrimary: "/brand/akili-vertical-primary.png",
  verticalWhite: "/brand/akili-vertical-white.png",
  iconColor: "/brand/akili-icon-color.png",
  iconWhite: "/brand/akili-icon-white.png",
} as const;

/** Horizontal lockup (1288×240) — color icon + Montserrat wordmark. */
const HEADER_LOCKUP_ASPECT = 1288 / 240;
/** Vertical lockup (825×322) — icon above wordmark row. */
const LOCKUP_ASPECT = 825 / 322;
/** Trimmed color icon (428×394). */
const ICON_ASPECT = 428 / 394;

/**
 * Theme-aware image pair: Primary (light) / White (dark).
 */
function ThemeLogoPair({
  lightSrc,
  darkSrc,
  width,
  height,
  className,
  alt = "AKILI Risk Intelligence",
  /** When true, fill parent width (aspect kept); for footer / not-found. */
  fluid = false,
}: {
  lightSrc: string;
  darkSrc: string;
  width: number;
  height: number;
  className?: string;
  alt?: string;
  fluid?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-block shrink-0",
        fluid && "h-auto w-full",
        className,
      )}
      style={
        fluid
          ? { aspectRatio: `${width} / ${height}` }
          : { width, height, aspectRatio: `${width} / ${height}` }
      }
      role="img"
      aria-label={alt}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static public brand assets */}
      <img
        src={lightSrc}
        alt=""
        width={width}
        height={height}
        className="block h-full w-full object-contain dark:hidden"
        decoding="async"
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- static public brand assets */}
      <img
        src={darkSrc}
        alt=""
        width={width}
        height={height}
        className="hidden h-full w-full object-contain dark:block"
        decoding="async"
      />
    </span>
  );
}

/**
 * Compact header lockup: horizontal Primary (light) / White (dark).
 */
export function AkiliHeaderLockup({ className, height = 40 }: LogoProps) {
  const width = Math.round(height * HEADER_LOCKUP_ASPECT);

  return (
    <ThemeLogoPair
      lightSrc={ASSETS.horizontalPrimary}
      darkSrc={ASSETS.horizontalWhite}
      width={width}
      height={height}
      className={cn("akili-header-lockup", className)}
    />
  );
}

/**
 * AKILI logo lockup: vertical Primary (light) / White (dark).
 */
export function AkiliLogoLockup({ className, height = 48 }: LogoProps) {
  const width = Math.round(height * LOCKUP_ASPECT);
  const fluid = Boolean(className && /\bw-full\b/.test(className));

  return (
    <ThemeLogoPair
      lightSrc={ASSETS.verticalPrimary}
      darkSrc={ASSETS.verticalWhite}
      width={width}
      height={height}
      className={cn("akili-logo-lockup", className)}
      fluid={fluid}
    />
  );
}

/** Icon-only mark for compact UI / powered-by attribution. */
export function AkiliIcon({ className, size = 32 }: LogoProps & { size?: number }) {
  const width = Math.round(size * ICON_ASPECT);

  return (
    <ThemeLogoPair
      lightSrc={ASSETS.iconColor}
      darkSrc={ASSETS.iconWhite}
      width={width}
      height={size}
      className={cn("akili-logo-lockup", className)}
      alt="AKILI"
    />
  );
}

/** Horizontal compact lockup (same assets as header; kept for callers). */
export function AkiliHorizontal({ className, height = 40 }: LogoProps) {
  return <AkiliHeaderLockup className={className} height={height} />;
}
