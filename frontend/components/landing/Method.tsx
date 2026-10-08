"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEPS = [
  {
    n: "01",
    title: "Deep assessment",
    copy: "A 45-minute movement-mapping session: history, posture, strength and gait analysis. We find the why, not just the where.",
  },
  {
    n: "02",
    title: "Your personal plan",
    copy: "A week-by-week roadmap with clear milestones — sessions, home exercises and progress markers you can actually see.",
  },
  {
    n: "03",
    title: "Treat & train",
    copy: "Hands-on therapy, dry needling, taping and guided exercise — adjusted every single session to how your body responds.",
  },
  {
    n: "04",
    title: "Measure & thrive",
    copy: "Re-assessed every 4 sessions. You're discharged only when you're stronger than the day you walked in.",
  },
];

export default function Method() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        "[data-progress]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-timeline]",
            start: "top 70%",
            end: "bottom 55%",
            scrub: 0.6,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="method" className="relative scroll-mt-24 py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 55%, rgba(200,245,66,0.06), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead
          eyebrow="THE METHOD"
          title={
            <>
              Recovery, <em className="font-light italic">engineered.</em>
            </>
          }
          copy="No guesswork, no endless sessions. A four-stage system refined over 12,000+ recoveries."
        />

        <div data-timeline className="relative mx-auto mt-16 max-w-3xl">
          {/* track */}
          <div className="absolute bottom-4 left-[27px] top-4 w-px bg-ink-950/10 dark:bg-white/10" aria-hidden />
          <div
            data-progress
            className="absolute bottom-4 left-[27px] top-4 w-px origin-top bg-gradient-to-b from-volt-300 to-volt-500 shadow-[0_0_12px_rgba(200,245,66,0.8)]"
            aria-hidden
          />

          <div className="flex flex-col gap-10">
            {STEPS.map((s) => (
              <Reveal key={s.n}>
                <div className="group relative flex gap-7">
                  <div className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border border-volt-400/40 bg-white dark:bg-ink-900 font-mono text-sm font-bold text-volt-600 dark:text-volt-300 transition-all duration-500 group-hover:bg-volt-400 group-hover:text-ink-950 group-hover:shadow-[0_0_28px_-4px_rgba(200,245,66,0.8)]">
                    {s.n}
                  </div>
                  <div className="glass lift rounded-3xl p-6 sm:p-7">
                    <h3 className="font-display text-2xl font-medium text-ink-950 dark:text-cream-50">{s.title}</h3>
                    <p className="mt-2.5 leading-relaxed text-sage-500 dark:text-sage-300">{s.copy}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
