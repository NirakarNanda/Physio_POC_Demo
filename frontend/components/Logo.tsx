import { CLINIC } from "@/lib/clinic";

/** MoveWell wordmark: a volt motion-arc + wordmark. */
export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width={compact ? 30 : 36}
        height={compact ? 30 : 36}
        viewBox="0 0 36 36"
        fill="none"
        aria-hidden
      >
        <circle cx="18" cy="18" r="16.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" />
        <path
          d="M6 22c4-7 8-11 12-11s8 4 12 11"
          stroke="#c8f542"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="18" cy="9.5" r="3" fill="#c8f542" />
        <circle cx="27.5" cy="24.5" r="2" fill="#c8f542" opacity="0.7" />
      </svg>
      <span className="font-display text-xl font-semibold tracking-tight">
        {CLINIC.name}
        <span className="text-volt-400">.</span>
      </span>
    </span>
  );
}
