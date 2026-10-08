"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Stat {
  value: number;
  suffix: string;
  decimals?: number;
  label: string;
}

const STATS: Stat[] = [
  { value: 12400, suffix: "+", label: "sessions delivered" },
  { value: 96, suffix: "%", label: "reach their recovery goals" },
  { value: 14, suffix: " yrs", label: "of clinical experience" },
  { value: 4.9, suffix: "/5", label: "average patient rating", decimals: 1 },
];

export default function Stats() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const nums = gsap.utils.toArray<HTMLElement>("[data-count]", root.current ?? undefined);
      nums.forEach((el, i) => {
        const target = STATS[i];
        const render = (v: number) =>
          (el.textContent =
            (target.decimals ? v.toFixed(target.decimals) : Math.round(v).toLocaleString("en-IN")) +
            target.suffix);
        if (reduced) {
          render(target.value);
          return;
        }
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target.value,
          duration: 2.2,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
          onUpdate: () => render(obj.v),
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="results" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="glass grid grid-cols-2 gap-y-10 rounded-3xl px-6 py-10 sm:px-12 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p
                data-count
                className="font-display text-4xl font-semibold text-volt-300 sm:text-5xl"
              >
                0{s.suffix}
              </p>
              <p className="mt-2 text-sm text-sage-300">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
