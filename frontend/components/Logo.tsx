interface LogoProps {
  size?: number;
  className?: string;
}

/** MoveWell mark: white activity pulse inside a mint gradient circle. */
export default function Logo({ size = 40, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="MoveWell Physiotherapy Studio logo"
    >
      <defs>
        <linearGradient id="movewell-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="55%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0e7490" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="url(#movewell-g)" />
      <circle cx="24" cy="24" r="22" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5" />
      {/* activity pulse — movement, the heart of physiotherapy */}
      <path
        d="M9 25.5h6.2l3.4-7.5 5.2 13 3.6-8.2 1.8 2.7H39"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* sparkle */}
      <path
        d="M35.5 12.5c.6 1.4 1.1 2 2.5 2.6-1.4.6-1.9 1.2-2.5 2.6-.6-1.4-1.1-2-2.5-2.6 1.4-.6 1.9-1.2 2.5-2.6z"
        fill="#ffffff"
        opacity="0.9"
      />
    </svg>
  );
}

/** Standalone pulse glyph used for decorative / section art. */
export function PulseGlyph({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M9 25.5h6.2l3.4-7.5 5.2 13 3.6-8.2 1.8 2.7H39"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
