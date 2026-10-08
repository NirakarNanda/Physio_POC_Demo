"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { useTheme } from "@/components/theme/ThemeProvider";
import { CLINIC } from "@/lib/clinic";

const LINKS = [
  { label: "Treatments", href: "#treatments" },
  { label: "Method", href: "#method" },
  { label: "Results", href: "#results" },
  { label: "Stories", href: "#stories" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { dark, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass py-3" : "bg-transparent py-5"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" aria-label={`${CLINIC.fullName} home`}>
          <Logo />
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-sage-500 dark:text-sage-300 transition-colors hover:text-volt-600 dark:hover:text-volt-300 dark:text-sage-300"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="grid h-10 w-10 place-items-center rounded-full border border-ink-950/10 dark:border-white/10 text-sage-500 dark:text-sage-300 transition-colors hover:border-volt-400/50 hover:text-volt-600 dark:hover:text-volt-300"
          >
            {dark ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="4.2" />
                <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7" />
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M20 13.5A8 8 0 1 1 10.5 4 6.5 6.5 0 0 0 20 13.5Z" />
              </svg>
            )}
          </button>
          <a
            href="/login"
            className="hidden rounded-full px-4 py-2.5 text-sm font-medium text-sage-500 dark:text-sage-300 transition-colors hover:text-volt-600 dark:hover:text-volt-300 sm:block"
          >
            Doctor login
          </a>
          <a
            href="#book"
            className="rounded-full bg-volt-400 px-5 py-2.5 text-sm font-semibold text-ink-950 shadow-[0_0_28px_-6px_rgba(200,245,66,0.7)] transition-transform duration-300 hover:scale-105"
          >
            Book assessment
          </a>
        </div>
      </nav>
    </header>
  );
}
