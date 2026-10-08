"use client";

import { useState } from "react";
import Logo from "@/components/Logo";
import Reveal from "./Reveal";
import { TREATMENTS } from "@/lib/api";
import { CLINIC } from "@/lib/clinic";

export default function CtaFooter() {
  const [sent, setSent] = useState(false);

  return (
    <>
      {/* ---- booking CTA ---- */}
      <section id="book" className="relative scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
        <Reveal className="mx-auto max-w-6xl">
          <div className="grain relative overflow-hidden rounded-[2.5rem] border border-volt-400/20 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 px-6 py-14 sm:px-14 sm:py-20">
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden
              style={{
                background:
                  "radial-gradient(ellipse 55% 60% at 78% 20%, rgba(200,245,66,0.14), transparent 65%)",
              }}
            />
            <div className="relative grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="font-mono text-[11px] font-semibold tracking-[0.28em] text-volt-300">
                  FIRST ASSESSMENT · 45 MINUTES
                </p>
                <h2 className="font-display mt-4 text-4xl font-medium tracking-tight text-cream-50 sm:text-6xl">
                  Ready to move <em className="text-volt-300 not-italic font-semibold">pain-free?</em>
                </h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-sage-300">
                  Your first visit maps your movement, finds the root cause and
                  lays out your recovery roadmap — no commitment beyond that.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <a
                    href={`tel:${CLINIC.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-2.5 text-lg font-semibold text-cream-50 transition-colors hover:text-volt-300"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-volt-400 text-ink-950">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" />
                      </svg>
                    </span>
                    {CLINIC.phone}
                  </a>
                  <span className="text-sm text-sage-400">{CLINIC.hours}</span>
                </div>
              </div>

              {/* demo request form */}
              <div className="glass rounded-3xl p-7 sm:p-8">
                {sent ? (
                  <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-volt-400 text-ink-950">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    <h3 className="font-display mt-5 text-2xl font-medium text-cream-50">
                      Request received.
                    </h3>
                    <p className="mt-2 max-w-xs text-sage-300">
                      We’ll call you within 2 working hours to confirm your assessment slot.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSent(true);
                    }}
                    className="flex flex-col gap-4"
                  >
                    <h3 className="font-display text-2xl font-medium text-cream-50">
                      Request a callback
                    </h3>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium text-sage-300">Your name</span>
                      <input
                        required
                        placeholder="e.g. Ananya Sharma"
                        className="rounded-xl border border-white/10 bg-ink-950/60 px-4 py-3 text-cream-50 placeholder:text-sage-500 outline-none transition-colors focus:border-volt-400/60"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium text-sage-300">Phone</span>
                      <input
                        required
                        type="tel"
                        placeholder="+91 …"
                        className="rounded-xl border border-white/10 bg-ink-950/60 px-4 py-3 text-cream-50 placeholder:text-sage-500 outline-none transition-colors focus:border-volt-400/60"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium text-sage-300">What hurts?</span>
                      <select
                        className="rounded-xl border border-white/10 bg-ink-950/60 px-4 py-3 text-cream-50 outline-none transition-colors focus:border-volt-400/60"
                        defaultValue={TREATMENTS[0]}
                      >
                        {TREATMENTS.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="submit"
                      className="mt-2 rounded-xl bg-volt-400 py-3.5 font-semibold text-ink-950 shadow-[0_0_36px_-8px_rgba(200,245,66,0.8)] transition-transform duration-300 hover:scale-[1.02]"
                    >
                      Request callback
                    </button>
                    <p className="text-center text-xs text-sage-500">
                      Demo form — no data leaves your browser.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---- footer ---- */}
      <footer className="border-t border-ink-950/10 dark:border-white/8 px-5 py-12 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sage-500 dark:text-sage-400">
              {CLINIC.tagline} Evidence-based physiotherapy, sports rehab and
              post-surgical recovery.
            </p>
            <p className="mt-4 text-sm text-sage-500">{CLINIC.address}</p>
          </div>
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[0.24em] text-sage-500">
              EXPLORE
            </p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              {[
                ["Treatments", "#treatments"],
                ["Method", "#method"],
                ["Results", "#results"],
                ["Stories", "#stories"],
              ].map(([l, h]) => (
                <li key={h}>
                  <a href={h} className="text-sage-500 dark:text-sage-300 transition-colors hover:text-volt-600 dark:hover:text-volt-300">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[11px] font-semibold tracking-[0.24em] text-sage-500">
              CLINIC
            </p>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              <li>
                <a href="/login" className="text-sage-500 dark:text-sage-300 transition-colors hover:text-volt-600 dark:hover:text-volt-300">
                  Doctor login
                </a>
              </li>
              <li className="text-sage-500 dark:text-sage-400">{CLINIC.phone}</li>
              <li className="text-sage-500 dark:text-sage-400">{CLINIC.email}</li>
              <li className="text-sage-500 dark:text-sage-400">{CLINIC.hours}</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-ink-950/10 dark:border-white/8 pt-6 text-xs text-sage-500">
          <p>© 2026 {CLINIC.fullName}. Demo build — rename freely.</p>
          <p className="font-mono tracking-[0.18em]">MOVE BETTER · LIVE PAIN-FREE</p>
        </div>
      </footer>
    </>
  );
}
