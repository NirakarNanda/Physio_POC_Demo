"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import MocapFigure from "./MocapFigure";
import { CLINIC } from "@/lib/clinic";

gsap.registerPlugin(useGSAP);

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set("[data-hero]", { opacity: 1, y: 0 });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        "[data-hero='eyebrow']",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        0.15,
      )
        .fromTo(
          "[data-hero='line']",
          { y: 70, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, stagger: 0.12 },
          0.25,
        )
        .fromTo(
          "[data-hero='sub']",
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9 },
          0.7,
        )
        .fromTo(
          "[data-hero='cta']",
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 },
          0.85,
        )
        .fromTo(
          "[data-hero='panel']",
          { y: 40, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 1.2 },
          0.5,
        )
        .fromTo(
          "[data-hero='trust']",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 },
          1.05,
        );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="top" className="relative overflow-hidden pt-32 pb-16 sm:pt-40 lg:pb-24">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="ambient-drift absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-volt-400/10 blur-[140px]" />
        <div className="ambient-drift absolute top-1/3 -left-40 h-[420px] w-[420px] rounded-full bg-ink-600/40 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(200,245,66,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(200,245,66,0.5) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 90% 70% at 50% 30%, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 30%, black 30%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-6">
        {/* copy */}
        <div className="lg:col-span-7">
          <p
            data-hero="eyebrow"
            className="mb-6 inline-flex items-center gap-3 rounded-full border border-volt-400/25 bg-volt-400/5 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-volt-300"
            style={{ opacity: 0 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-volt-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-volt-400" />
            </span>
            PHYSIOTHERAPY · REHAB · PERFORMANCE
          </p>

          <h1 className="font-display text-[13vw] leading-[0.95] font-medium tracking-tight text-cream-50 sm:text-7xl lg:text-[5.6rem]">
            <span data-hero="line" className="block overflow-hidden" style={{ opacity: 0 }}>
              <span className="block">Move <em className="text-volt-300 not-italic font-semibold">better.</em></span>
            </span>
            <span data-hero="line" className="block overflow-hidden" style={{ opacity: 0 }}>
              <span className="block">Live <em className="font-light italic text-cream-50">pain-free.</em></span>
            </span>
          </h1>

          <p data-hero="sub" className="mt-7 max-w-xl text-lg leading-relaxed text-sage-300" style={{ opacity: 0 }}>
            Evidence-based physiotherapy, sports rehab and post-surgical recovery —
            mapped to your body, your goals and your life. Not generic exercise
            sheets. A plan that moves with you.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              data-hero="cta"
              href="#book"
              style={{ opacity: 0 }}
              className="group inline-flex items-center gap-2.5 rounded-full bg-volt-400 px-7 py-4 text-base font-semibold text-ink-950 shadow-[0_0_40px_-8px_rgba(200,245,66,0.8)] transition-transform duration-300 hover:scale-105"
            >
              Book your assessment
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a
              data-hero="cta"
              href="#treatments"
              style={{ opacity: 0 }}
              className="inline-flex items-center gap-2.5 rounded-full border border-white/15 px-7 py-4 text-base font-medium text-cream-50 transition-colors duration-300 hover:border-volt-400/60 hover:text-volt-300"
            >
              Explore treatments
            </a>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-5">
            {[
              ["12,400+", "sessions delivered"],
              ["4.9 / 5", "patient rating"],
              ["96%", "reach recovery goals"],
            ].map(([v, l]) => (
              <div key={l} data-hero="trust" style={{ opacity: 0 }}>
                <p className="font-display text-3xl font-semibold text-cream-50">{v}</p>
                <p className="mt-1 text-sm text-sage-400">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* motion-capture panel */}
        <div className="lg:col-span-5" data-hero="panel" style={{ opacity: 0 }}>
          <div className="grain relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900/60">
            {/* HUD frame */}
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                <span className="font-mono text-[11px] tracking-[0.2em] text-sage-300">
                  LIVE GAIT ANALYSIS
                </span>
              </div>
              <span className="font-mono text-[11px] tracking-[0.2em] text-volt-300/80">
                SUBJECT 07
              </span>
            </div>
            <MocapFigure className="h-auto w-full" />
            <div className="flex items-center justify-between border-t border-white/8 px-5 py-3.5">
              <span className="font-mono text-[11px] tracking-[0.15em] text-sage-400">
                EVERY STEP, MEASURED
              </span>
              <span className="font-mono text-[11px] tracking-[0.15em] text-sage-400">
                {CLINIC.name.toUpperCase()} LAB
              </span>
            </div>
            {/* corner brackets */}
            <div className="pointer-events-none absolute inset-3" aria-hidden>
              <span className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-volt-400/60" />
              <span className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-volt-400/60" />
              <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-volt-400/60" />
              <span className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-volt-400/60" />
            </div>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div className="relative mt-16 flex justify-center" aria-hidden>
        <div className="flex h-12 w-7 items-start justify-center rounded-full border border-white/15 p-1.5">
          <div className="animate-float-y h-2.5 w-1 rounded-full bg-volt-400" />
        </div>
      </div>
    </section>
  );
}
