"use client";

/**
 * JointBuddy — a cozy little animated knee joint that keeps the doctor company
 * on the login screen. Pure SVG + CSS: gentle bob, blinking eyes, drifting
 * sparkles. Respects prefers-reduced-motion (see globals.css).
 */
export default function JointBuddy() {
  return (
    <div className="joint-buddy relative h-24 w-24" aria-hidden="true">
      {/* sparkles */}
      <svg
        viewBox="0 0 24 24"
        className="absolute -left-3 top-1 h-4 w-4 text-mint-500 motion-safe:animate-[sparkle-rise_5s_ease-in-out_infinite] dark:text-mint-300"
        fill="currentColor"
      >
        <path d="M12 2c.7 4.8 3.2 7.3 8 8-4.8.7-7.3 3.2-8 8-.7-4.8-3.2-7.3-8-8 4.8-.7 7.3-3.2 8-8z" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        className="absolute -right-2 top-4 h-3 w-3 text-amber-400 motion-safe:animate-[sparkle-rise_6.5s_ease-in-out_1.2s_infinite] dark:text-amber-300"
        fill="currentColor"
      >
        <path d="M12 2c.7 4.8 3.2 7.3 8 8-4.8.7-7.3 3.2-8 8-.7-4.8-3.2-7.3-8-8 4.8-.7 7.3-3.2 8-8z" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        className="absolute -left-1 bottom-2 h-2.5 w-2.5 text-mint-400 motion-safe:animate-[sparkle-rise_7.5s_ease-in-out_2.4s_infinite] dark:text-mint-200"
        fill="currentColor"
      >
        <path d="M12 2c.7 4.8 3.2 7.3 8 8-4.8.7-7.3 3.2-8 8-.7-4.8-3.2-7.3-8-8 4.8-.7 7.3-3.2 8-8z" />
      </svg>

      {/* the knee joint */}
      <svg
        viewBox="0 0 100 104"
        className="h-full w-full motion-safe:animate-[joint-bob_4.5s_ease-in-out_infinite]"
      >
        <defs>
          <radialGradient id="jointBody" cx="38%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#fdf9f0" />
            <stop offset="100%" stopColor="#f3e9d6" />
          </radialGradient>
        </defs>
        {/* soft ground shadow */}
        <ellipse cx="50" cy="98" rx="26" ry="4.5" fill="#0e2a28" opacity="0.10" />
        {/* femur (upper bone) */}
        <path
          d="M35 6h30c3 0 5 2.4 5 5.4v14.2c0 5.6-3.4 9.4-8.6 11.4L50 42l-11.4-5c-5.2-2-8.6-5.8-8.6-11.4V11.4C30 8.4 32 6 35 6z"
          fill="url(#jointBody)"
          stroke="#e7d9bf"
          strokeWidth="1.5"
        />
        {/* patella (kneecap) */}
        <circle
          cx="50"
          cy="48"
          r="9"
          fill="url(#jointBody)"
          stroke="#e7d9bf"
          strokeWidth="1.5"
        />
        {/* glossy highlight on kneecap */}
        <ellipse
          cx="47"
          cy="45"
          rx="3"
          ry="4"
          fill="#ffffff"
          opacity="0.75"
          transform="rotate(-18 47 45)"
        />
        {/* tibia (lower bone) */}
        <path
          d="M38 58h24c2.6 0 4.4 2 4 4.6L61.5 92c-.5 3-2.9 5-5.9 5h-11.2c-3 0-5.4-2-5.9-5L33.9 62.6c-.4-2.6 1.5-4.6 4.1-4.6z"
          fill="url(#jointBody)"
          stroke="#e7d9bf"
          strokeWidth="1.5"
        />
        {/* blush */}
        <ellipse cx="40" cy="48" rx="4" ry="2.8" fill="#f6b8a0" opacity="0.55" />
        <ellipse cx="60" cy="48" rx="4" ry="2.8" fill="#f6b8a0" opacity="0.55" />
        {/* eyes (blink) on the kneecap */}
        <g className="joint-eye motion-safe:animate-[joint-blink_5.2s_ease-in-out_infinite]">
          <ellipse cx="46.5" cy="47" rx="2.6" ry="3.4" fill="#143230" />
          <circle cx="47.4" cy="45.8" r="0.9" fill="#ffffff" opacity="0.9" />
        </g>
        <g
          className="joint-eye motion-safe:animate-[joint-blink_5.2s_ease-in-out_infinite]"
          style={{ animationDelay: "0.02s" }}
        >
          <ellipse cx="53.5" cy="47" rx="2.6" ry="3.4" fill="#143230" />
          <circle cx="54.4" cy="45.8" r="0.9" fill="#ffffff" opacity="0.9" />
        </g>
        {/* smile */}
        <path
          d="M46 53q4 4 8 0"
          fill="none"
          stroke="#143230"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
