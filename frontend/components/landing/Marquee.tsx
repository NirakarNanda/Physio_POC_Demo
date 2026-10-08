import { TREATMENTS } from "@/lib/api";

/** Infinite treatment marquee strip. */
export default function Marquee() {
  const items = [...TREATMENTS, ...TREATMENTS];
  return (
    <div className="relative overflow-hidden border-y border-ink-950/10 dark:border-white/8 bg-cream-100/60 dark:bg-ink-900/40 py-5">
      <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap pr-10">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="font-display text-xl italic text-ink-950/ dark:text-cream-50/85 sm:text-2xl">{t}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0 text-volt-600 dark:text-volt-400" aria-hidden>
              <path d="M7 0l1.8 5.2L14 7l-5.2 1.8L7 14l-1.8-5.2L0 7l5.2-1.8z" fill="currentColor" />
            </svg>
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-cream-100 dark:from-ink-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-cream-100 dark:from-ink-950 to-transparent" />
    </div>
  );
}
