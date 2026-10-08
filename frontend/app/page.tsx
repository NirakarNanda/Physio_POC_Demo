"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { fraunces } from "@/lib/fonts";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import PotScene, { Butterflies } from "@/components/PotScene";
import { gsap, useGSAP } from "@/lib/gsap";

const AVATARS = [
  { initials: "AR", bg: "bg-[#dfe9e4] text-[#3d5a53] dark:bg-abyss-700 dark:text-mint-200" },
  { initials: "PK", bg: "bg-[#efe6d4] text-[#7a6234] dark:bg-abyss-800 dark:text-mint-100" },
  { initials: "SM", bg: "bg-[#dcebe8] text-[#2f5d55] dark:bg-abyss-700 dark:text-mint-200" },
  { initials: "JT", bg: "bg-[#e9e2d6] text-[#6d5a3e] dark:bg-abyss-800 dark:text-mint-100" },
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * MoveWell POC entry page — like the botanical reference:
 * a pure-CSS 3D glass bubble with a soft warm glow overlapping the headline
 * (text stays visible THROUGH the clear center), a discrete purple-orchid
 * pot grounded bottom-right, and delicate butterflies wandering the hero.
 */
export default function LandingPage() {
  const rootRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const breatheRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (reduced) {
        gsap.set(".hl-inner", { yPercent: 0 });
        gsap.set("[data-fade]", { opacity: 1, y: 0 });
        gsap.set("[data-orb-enter]", { opacity: 1, scale: 1 });
        gsap.set("[data-pot]", { scale: 1 });
        gsap.set("[data-butterfly]", { opacity: 0 });
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

      // Bubble entrance
      gsap.fromTo(
        "[data-orb-enter]",
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.8,
          ease: "power3.out",
          delay: 0.45,
        },
      );

      // Quiet fades for header, corners, side notes, CTA, flora
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

      // ── Bubble life ──────────────────────────────────────────
      // Gentle vertical bob (±14px, ~6s)
      gsap.to(floatRef.current, {
        y: -14,
        duration: 6,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 2,
      });
      // Slight rotation (±2°)
      gsap.to(spinRef.current, {
        rotation: 2,
        duration: 7,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 2,
      });
      // Slow "breathing" scale
      gsap.to(breatheRef.current, {
        scale: 1.015,
        duration: 4.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 2,
      });
      // Subtle mouse parallax on the whole bubble group (±18px)
      const fine = window.matchMedia("(pointer: fine)").matches;

      // ── Orchid pot: barely-there slow zoom, a living still-life ──
      gsap.to("[data-pot]", {
        scale: 1.03,
        duration: 18,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 2,
      });

      // ── Butterflies: gentle wandering around the hero ──
      // Curved drift on randomized waypoints (never a straight line),
      // wings fluttering via a fast scaleY oscillation on the inner
      // wrapper. Small, blurred, ambient — never distracting.
      gsap.utils.toArray<HTMLElement>("[data-butterfly]").forEach((bf) => {
        const dur = parseFloat(bf.dataset.dur || "28");
        const delay = parseFloat(bf.dataset.delay || "0");
        gsap.to(bf, { opacity: 1, duration: 2.5, delay: delay + 1 });
        gsap.to(bf, {
          keyframes: [
            {
              x: rand(60, 150),
              y: rand(-55, -12),
              rotation: rand(-9, 9),
              duration: dur * 0.3,
              ease: "sine.inOut",
            },
            {
              x: rand(-50, 110),
              y: rand(-75, 8),
              rotation: rand(-11, 11),
              duration: dur * 0.35,
              ease: "sine.inOut",
            },
            {
              x: rand(-90, 30),
              y: rand(-45, -5),
              rotation: rand(-9, 9),
              duration: dur * 0.35,
              ease: "sine.inOut",
            },
          ],
          repeat: -1,
          yoyo: true,
          delay: delay + 1,
        });
        const wing = bf.querySelector("[data-flutter]");
        if (wing) {
          gsap.to(wing, {
            scaleY: 0.55,
            transformOrigin: "50% 50%",
            duration: rand(0.14, 0.2),
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          });
        }
      });

      if (fine && parallaxRef.current) {
        const qx = gsap.quickTo(parallaxRef.current, "x", {
          duration: 0.9,
          ease: "power3.out",
        });
        const qy = gsap.quickTo(parallaxRef.current, "y", {
          duration: 0.9,
          ease: "power3.out",
        });
        const onMove = (e: MouseEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          qx(nx * 36);
          qy(ny * 36);
        };
        window.addEventListener("mousemove", onMove);

        return () => window.removeEventListener("mousemove", onMove);
      }
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-svh flex-col overflow-hidden bg-[#f7f4ec] text-[#0e2a28] dark:bg-abyss-950 dark:text-[#edf7f5]"
    >
      {/* ── slim top bar ─────────────────────────────────────────── */}
      <header
        data-fade
        className="relative z-20 border-b border-[#0e2a28]/10 dark:border-white/10"
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" className="flex items-center gap-3" aria-label="MoveWell home">
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

      {/* ── top-left: doctor monogram tile ───────────────────────── */}
      <div
        data-fade
        className="absolute left-6 top-32 z-20 hidden md:block lg:left-12"
      >
        <Link
          href="/login"
          className="group flex flex-col items-center gap-3"
          aria-label="Meet Dr. Arjun Rao — sign in"
        >
          <span className="relative block h-[76px] w-[60px] overflow-visible rounded-2xl border border-[#0e2a28]/12 shadow-soft transition-transform duration-500 group-hover:-translate-y-1 dark:border-white/15">
            <span className="absolute inset-0 overflow-hidden rounded-2xl">
              <Image
                src="/doctor-portrait.jpg"
                alt="Dr. Arjun Rao"
                fill
                sizes="60px"
                className="object-cover"
              />
            </span>
            <span className="absolute -bottom-2.5 -right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#0e2a28] text-[#f7f4ec] shadow-soft transition-transform duration-500 group-hover:scale-110 dark:bg-mint-300 dark:text-abyss-950">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M3.5 2.3v7.4c0 .5.6.9 1 .6l5.6-3.7c.4-.3.4-.9 0-1.2L4.5 1.7c-.4-.3-1 0-1 .6z" />
              </svg>
            </span>
          </span>
          <span className="text-center leading-tight">
            <span className="block text-[12px] font-semibold">
              Dr. Arjun Rao
            </span>
            <span className="block text-[11px] text-[#0e2a28]/55 dark:text-white/50">
              Chief Physiotherapist
            </span>
          </span>
        </Link>
      </div>

      {/* ── top-right: stat + avatar stack ───────────────────────── */}
      <div
        data-fade
        className="absolute right-6 top-32 z-20 hidden text-right md:block lg:right-12"
      >
        <p className={`${fraunces.className} text-[40px] font-light leading-none`}>
          2.5K+
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-[#0e2a28]/60 dark:text-white/55">
          Pain-free recoveries
          <br />
          crafted with care
        </p>
        <div className="mt-3 flex justify-end -space-x-2.5">
          {AVATARS.map((a) => (
            <span
              key={a.initials}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-[#f7f4ec] dark:ring-abyss-950 ${a.bg}`}
            >
              {a.initials}
            </span>
          ))}
        </div>
      </div>

      {/* ── hero: headline with the bubble overlapping its middle ── */}
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6">
        <div className="relative flex w-full flex-col items-center">
          <h1
            className={`${fraunces.className} relative z-0 text-center text-[clamp(2.9rem,7vw,5.75rem)] font-light leading-[1.08] tracking-[-0.015em]`}
          >
            <span className="block overflow-hidden pb-1">
              <span className="hl-inner block">Expert Physio,</span>
            </span>
            <span className="block overflow-hidden pb-1">
              <span className="hl-inner block">Crafted Around</span>
            </span>
            <span className="block overflow-hidden pb-3">
              <span className="hl-inner block italic">Your Recovery.</span>
            </span>
          </h1>

          {/* The bubble — a pure-CSS 3D glass sphere + soft warm glow.
              The center stays transparent so the headline reads THROUGH it. */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div ref={parallaxRef} data-orb-enter className="opacity-0">
              <div ref={floatRef}>
                <div ref={spinRef}>
                  <div
                    ref={breatheRef}
                    className="relative h-[clamp(220px,34vw,400px)] w-[clamp(220px,34vw,400px)]"
                  >
                    {/* 3D glass sphere: smooth sheen + hairline rim + warm glow */}
                    <div
                      aria-hidden="true"
                      className="orb-sphere absolute inset-0 rounded-full"
                    />
                    {/* knee joint floating inside the glass */}
                    <Image
                      src="/knee-joint.png"
                      alt=""
                      width={400}
                      height={400}
                      className="absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 object-contain"
                    />
                    {/* one specular highlight at ~10 o'clock */}
                    <div
                      aria-hidden="true"
                      className="absolute left-[17%] top-[11%] h-[9%] w-[15%] -rotate-[24deg] rounded-[100%] bg-white/70 blur-[7px] dark:bg-white/60"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* side notes flank the bubble on wide screens */}
          <div
            data-fade
            className="absolute left-0 top-1/2 hidden w-56 -translate-y-1/2 xl:block"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#0e2a28]/45 dark:text-white/40">
              The Studio
            </p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-[#0e2a28]/70 dark:text-white/60">
              Precise, hands-on physiotherapy designed around your body — and
              your goals.
            </p>
          </div>
        </div>

        {/* ── CTA ── */}
        <div data-fade className="mt-14 flex flex-col items-center gap-4 lg:mt-16">
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
          <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#0e2a28]/45 dark:text-white/40">
            Demo POC
          </p>
        </div>
      </main>

      {/* ── butterflies wandering the hero ── */}
      <div data-fade>
        <Butterflies />
      </div>

      {/* ── orchid pot scene along the bottom edge ── */}
      <div data-fade>
        <PotScene />
      </div>

      {/* ── side note: The Standard — far right, in the open space between
          the stat stack (top-anchored, ends ~256px) and the orchid (52vh
          tall, bottom-anchored). The bottom offset parks it just above the
          plant's max height at any window size; PIL alpha checks confirm
          the blooms never reach this band. (Beside-the-button placement was
          tried and reverted: at 1440px the centered login pill extends into
          that zone, so the two overlapped.) */}
      <div
        data-fade
        className="absolute bottom-[calc(52vh+1.25rem)] right-6 z-10 hidden w-56 text-right lg:right-12 xl:min-[760px]:block"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#0e2a28]/45 dark:text-white/40">
          The Standard
        </p>
        <p className="mt-3 text-[13.5px] leading-relaxed text-[#0e2a28]/70 dark:text-white/60">
          From sports injuries to post-surgical rehab. One studio, one
          standard: excellence.
        </p>
      </div>

      {/* ── film grain ── */}
      <div
        aria-hidden="true"
        className="hero-grain pointer-events-none absolute inset-0 z-[3] opacity-[0.05] dark:opacity-[0.07]"
      />

      <footer
        data-fade
        className="relative z-20 pb-6 pt-2 text-center text-[11px] font-medium tracking-wide text-[#0e2a28]/40 dark:text-white/35"
      >
        © 2026 MoveWell Physiotherapy Studio · Designed &amp; built by Nirakar
        Nanda
      </footer>
    </section>
  );
}
