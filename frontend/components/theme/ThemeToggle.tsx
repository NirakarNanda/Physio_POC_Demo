"use client";

import { useTheme } from "@/components/theme/ThemeProvider";

/**
 * Sun/moon theme toggle. Renders a neutral placeholder until mounted so the
 * server/client markup never mismatches.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, mounted, toggle } = useTheme();

  if (!mounted) {
    return (
      <span
        className={`inline-block h-10 w-10 rounded-full ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border transition-all duration-300 hover:-translate-y-0.5 ${
        isDark
          ? "border-mint-800 bg-abyss-800 text-mint-300 hover:border-mint-600 hover:text-mint-200"
          : "border-mint-200 bg-white text-mint-700 shadow-soft hover:border-mint-400 hover:text-mint-900"
      } ${className}`}
    >
      {isDark ? (
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M19.1 4.9l-1.6 1.6M6.5 17.5l-1.6 1.6" />
        </svg>
      ) : (
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />
        </svg>
      )}
    </button>
  );
}
