"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fraunces } from "@/lib/fonts";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import Skeleton from "@/components/landing/Skeleton";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

type Practice = {
  id: string;
  no: string;
  title: string;
  bones: string[];
  focus: string;
  desc: string;
  meta: string;
};

const PRACTICES: Practice[] = [
  {
    id: "spine",
    no: "01",
    title: "Back & Spine Care",
    bones: ["spine"],
    focus: "Lumbar spine",
    desc: "Sciatica, herniated discs, chronic back pain — decompression, manual therapy and core retraining that rebuilds your foundation.",
    meta: "₹600 / session · 8–12 sessions",
  },
  {
    id: "sports",
    no: "02",
    title: "Sports Injury Rehab",
    bones: ["knee", "ankle"],
    focus: "Knee · Ankle",
    desc: "ACL sprains, ligament tears, twisted ankles — structured return-to-sport protocols that bring athletes back stronger.",
    meta: "₹800 / session · 6–10 sessions",
  },
  {
    id: "neck",
    no: "03",
    title: "Neck & Shoulder Pain",
    bones: ["neck", "shoulder"],
    focus: "Cervical spine · Shoulder",
    desc: "Stiff neck, frozen shoulder, whiplash — posture correction, mobilization and TENS for desk-bound bodies.",
    meta: "₹600 / session · 6–8 sessions",
  },
  {
    id: "surgical",
    no: "04",
    title: "Post-Surgical Rehab",
    bones: ["hip", "knee"],
    focus: "Hip · Knee",
    desc: "Knee and hip replacements, fracture recovery — surgeon-aligned rehab plans that protect the repair while restoring motion.",
    meta: "₹900 / session · 10–16 sessions",
  },
  {
    id: "neuro",
    no: "05",
    title: "Neurological Rehab",
    bones: ["skull"],
    focus: "Brain · Nervous system",
    desc: "Stroke recovery, Parkinson's, balance disorders — neuroplasticity-driven training for control and confidence.",
    meta: "₹1000 / session · ongoing",
  },
  {
    id: "geriatric",
    no: "06",
    title: "Geriatric Mobility Care",
    bones: ["all"],
    focus: "Full body",
    desc: "Arthritis, fall prevention, everyday strength — gentle programs that keep you independent and moving well.",
    meta: "₹700 / session · 8–12 sessions",
  },
];

/**
 * MoveWell landing — "The Anatomy of Recovery".
 * A hand-drawn skeleton draws itself in the hero, then stays sticky while
 * you scroll through the six practices: each section spotlights the exact
 * bones it treats, dimming the rest, with the treated joints pulsing.
 */
export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [activeBones, setActiveBones] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activePractice = PRACTICES.find((p) => p.id === activeId) ?? null;

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduced) {
        gsap.set(".hl-inner", { yPercent: 0 });
        gsap.set("[data-fade]", { opacity: 1, y: 0 });
        if (countRef.current) countRef.current.textContent = "206";
        return;
      }

      // Headline: staggered line-mask reveal
      gsap.fromTo(
        ".hl-inner",
        { yPercent: 118 },
        {
          yPercent: 0,
          duration: 1.25,
          stagger: 0.13,
          ease: "power4.out",
          delay: 0.2,
        },
      );

      // Quiet fades
      gsap.fromTo(
        "[data-fade]",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.09,
          ease: "power3.out",
          delay: 0.7,
        },
      );

      // Bone counter: 0 → 206 while the skeleton draws itself
      const counter = { v: 0 };
      gsap.to(counter, {
        v: 206,
        duration: 2.6,
        delay: 0.5,
        ease: "power2.out",
        onUpdate: () => {
          if (countRef.current)
            countRef.current.textContent = String(Math.round(counter.v));
        },
      });

      // Practice spotlight: each section lights up its bones
      const triggers: ScrollTrigger[] = [];
      document
        .querySelectorAll<HTMLElement>("[data-practice]")
        .forEach((section) => {
          const id = section.dataset.practice || "";
          const practice = PRACTICES.find((p) => p.id === id);
          if (!practice) return;
          triggers.push(
            ScrollTrigger.create({
              trigger: section,
              start: "top 55%",
              end: "bottom 45%",
              onToggle: (self) => {
                if (self.isActive) {
                  setActiveBones(practice.bones);
                  setActiveId(practice.id);
                }
              },
            }),
          );
        });

      // Scrolling back into the hero clears the spotlight
      triggers.push(
        ScrollTrigger.create({
          trigger: "[data-hero]",
          start: "top 60%",
          end: "bottom 40%",
          onToggle: (self) => {
            if (self.isActive) {
              setActiveBones([]);
              setActiveId(null);
            }
          },
        }),
      );

      return () => triggers.forEach((t) => t.kill());
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="relative bg-[#f7f4ec] text-[#0e2a28] dark:bg-abyss-950 dark:text-[#edf7f5]"
    >
      {/* ── slim top bar ─────────────────────────────────────────── */}
      <header
        data-fade
        className="relative z-20 border-b border-[#0e2a28]/10 dark:border-white/10"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="MoveWell home"
          >
            <Logo size={34} />
            <span className="leading-none">
              <span
                className={`${fraunces.className} block text-[22px] font-medium tracking-tight`}
              >
                MoveWell
              </span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.3em] text-[#0e2a28]/55 dark:text-white/50">
                Physiotherapy Studio
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-[#0e2a28]/70 underline-offset-4 transition-colors hover:text-[#0e2a28] hover:underline sm:block dark:text-white/70 dark:hover:text-white"
            >
              Doctor Login
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── skeleton journey: sticky bones, scrolling practices ── */}
      <main className="relative mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="lg:grid lg:grid-cols-[1fr_1.05fr] lg:gap-10">
          {/* skeleton column — sticky on desktop */}
          <div className="relative order-2 lg:order-1 lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-center">
            <div className="pointer-events-none absolute inset-0 -z-0 flex items-center justify-center lg:static">
              <div
                aria-hidden="true"
                className="h-[420px] w-[420px] rounded-full bg-[#0e2a28]/[0.045] blur-3xl dark:bg-mint-400/10"
              />
            </div>
            <div className="relative flex flex-col items-center py-8 lg:py-0">
              <Skeleton
                active={activeBones}
                className="h-[46vh] w-auto text-[#0e2a28] dark:text-[#edf7f5] lg:h-[76vh]"
              />
              {/* focus readout */}
              <div className="mt-2 flex h-8 items-center gap-3 lg:mt-4">
                <span
                  className={`h-2 w-2 rounded-full transition-colors duration-500 ${
                    activePractice
                      ? "animate-pulse bg-teal-600 dark:bg-mint-300"
                      : "bg-[#0e2a28]/20 dark:bg-white/20"
                  }`}
                />
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0e2a28]/55 dark:text-white/50">
                  {activePractice
                    ? `Treating — ${activePractice.focus}`
                    : "Full skeleton · 206 bones"}
                </p>
              </div>
            </div>
          </div>

          {/* content column */}
          <div className="order-1 lg:order-2">
            {/* hero */}
            <section
              data-hero
              className="flex min-h-[92svh] flex-col justify-center py-16 lg:min-h-svh"
            >
              <p
                data-fade
                className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#0e2a28]/50 dark:text-white/45"
              >
                MoveWell Physiotherapy Studio
              </p>
              <h1
                className={`${fraunces.className} mt-6 text-[clamp(3rem,7.5vw,5.5rem)] font-light leading-[1.04] tracking-[-0.015em]`}
              >
                <span className="block overflow-hidden pb-1">
                  <span className="hl-inner block">
                    <span ref={countRef}>0</span> bones.
                  </span>
                </span>
                <span className="block overflow-hidden pb-3">
                  <span className="hl-inner block italic">
                    One road to recovery.
                  </span>
                </span>
              </h1>
              <p
                data-fade
                className="mt-6 max-w-md text-[15px] leading-relaxed text-[#0e2a28]/65 dark:text-white/60"
              >
                MoveWell maps physiotherapy onto your skeleton — scroll on and
                watch each practice light up the exact bones it heals.
              </p>
              <div
                data-fade
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-3 rounded-full border border-[#0e2a28]/15 bg-white/85 py-4 pl-9 pr-7 text-[15px] font-semibold tracking-wide text-[#0e2a28] shadow-soft backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0e2a28]/30 hover:shadow-lift dark:border-white/15 dark:bg-white/[0.07] dark:text-white dark:hover:border-white/30"
                >
                  Doctor Login
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
                <span className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#0e2a28]/45 dark:text-white/40">
                  Demo POC
                </span>
              </div>
              <div
                data-fade
                className="mt-16 flex items-center gap-3 text-[#0e2a28]/40 dark:text-white/35"
              >
                <span className="block h-10 w-px animate-pulse bg-current" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">
                  Scroll — the bones respond
                </p>
              </div>
            </section>

            {/* practices */}
            {PRACTICES.map((p) => {
              const isActive = activeId === p.id;
              return (
                <section
                  key={p.id}
                  data-practice={p.id}
                  className="flex min-h-[88svh] items-center py-14 lg:min-h-[92svh]"
                >
                  <article
                    className={`w-full max-w-lg rounded-[1.75rem] border p-8 transition-all duration-500 sm:p-10 ${
                      isActive
                        ? "border-teal-700/25 bg-white/80 shadow-lift dark:border-mint-300/25 dark:bg-white/[0.07]"
                        : "border-[#0e2a28]/10 bg-white/45 dark:border-white/10 dark:bg-white/[0.03]"
                    }`}
                  >
                    <p
                      className={`${fraunces.className} text-[64px] font-light leading-none ${
                        isActive
                          ? "text-teal-700 dark:text-mint-300"
                          : "text-[#0e2a28]/15 dark:text-white/15"
                      } transition-colors duration-500`}
                    >
                      {p.no}
                    </p>
                    <h2
                      className={`${fraunces.className} mt-4 text-[2rem] font-light leading-tight tracking-tight`}
                    >
                      {p.title}
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.focus.split(" · ").map((t) => (
                        <span
                          key={t}
                          className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-500 ${
                            isActive
                              ? "bg-teal-700/10 text-teal-800 dark:bg-mint-300/15 dark:text-mint-200"
                              : "bg-[#0e2a28]/[0.06] text-[#0e2a28]/55 dark:bg-white/[0.07] dark:text-white/50"
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="mt-5 text-[15px] leading-relaxed text-[#0e2a28]/70 dark:text-white/60">
                      {p.desc}
                    </p>
                    <p className="mt-6 border-t border-[#0e2a28]/10 pt-4 text-[12.5px] font-semibold uppercase tracking-[0.16em] text-[#0e2a28]/50 dark:border-white/10 dark:text-white/45">
                      {p.meta}
                    </p>
                  </article>
                </section>
              );
            })}

            {/* outro */}
            <section className="flex min-h-[80svh] flex-col justify-center py-16">
              <h2
                className={`${fraunces.className} text-[clamp(2.2rem,5vw,3.75rem)] font-light leading-[1.08] tracking-[-0.015em]`}
              >
                Every bone accounted for.
                <br />
                <span className="italic">Ready to move well?</span>
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#0e2a28]/65 dark:text-white/60">
                Step into the studio dashboard — today&apos;s sessions,
                patients, and revenue, all in one calm place.
              </p>
              <div className="mt-8">
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#0e2a28] py-4 pl-9 pr-7 text-[15px] font-semibold tracking-wide text-[#f7f4ec] shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift dark:bg-mint-300 dark:text-abyss-950"
                >
                  Doctor Login
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </div>
            </section>
          </div>
        </div>

        {/* ── stats strip ── */}
        <section className="border-t border-[#0e2a28]/10 py-14 dark:border-white/10">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {[
              { v: "2.5K+", l: "Pain-free recoveries" },
              { v: "12K+", l: "Sessions delivered" },
              { v: "6", l: "Specialised practices" },
              { v: "206", l: "Bones in our care" },
            ].map((s) => (
              <div key={s.l}>
                <p
                  className={`${fraunces.className} text-[2.75rem] font-light leading-none`}
                >
                  {s.v}
                </p>
                <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#0e2a28]/50 dark:text-white/45">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── doctor band ── */}
        <section className="border-t border-[#0e2a28]/10 py-14 dark:border-white/10">
          <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl border border-[#0e2a28]/10 shadow-soft dark:border-white/15">
              <Image
                src="/doctor-portrait.jpg"
                alt="Dr. Arjun Rao"
                fill
                sizes="112px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#0e2a28]/50 dark:text-white/45">
                Your physiotherapist
              </p>
              <p
                className={`${fraunces.className} mt-2 text-[1.75rem] font-light tracking-tight`}
              >
                Dr. Arjun Rao
              </p>
              <p className="mt-3 max-w-xl text-[15px] italic leading-relaxed text-[#0e2a28]/65 dark:text-white/60">
                “We don&apos;t treat the scan. We treat the person carrying
                it — bone by bone, session by session.”
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#0e2a28]/10 py-8 text-center text-[11px] font-medium tracking-wide text-[#0e2a28]/40 dark:border-white/10 dark:text-white/35">
        © 2026 MoveWell Physiotherapy Studio · Designed &amp; built by Nirakar
        Nanda
      </footer>
    </div>
  );
}
