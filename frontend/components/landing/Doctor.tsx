import Image from "next/image";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";
import { CLINIC } from "@/lib/clinic";

const CREDENTIALS = [
  ["BPTh, MPT (Orthopaedics)", "Gold-medalist physiotherapist"],
  ["14 years", "clinical experience"],
  ["12,000+", "sessions delivered"],
  ["Sports physio", "state-level athletic teams"],
];

export default function Doctor() {
  return (
    <section id="doctor" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
        <Reveal>
          <div className="relative mx-auto max-w-md">
            <div
              className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-volt-400/10 blur-3xl"
              aria-hidden
            />
            <div className="grain relative overflow-hidden rounded-[2rem] border border-ink-950/10 dark:border-white/10">
              <Image
                src="/doctor-portrait.jpg"
                alt={`${CLINIC.doctor}, ${CLINIC.doctorTitle} at ${CLINIC.fullName}`}
                width={768}
                height={960}
                className="h-auto w-full object-cover"
                priority={false}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent p-6 pt-16">
                <p className="font-display text-2xl font-medium text-ink-950 dark:text-cream-50">{CLINIC.doctor}</p>
                <p className="mt-1 text-sm tracking-wide text-volt-600 dark:text-volt-300">{CLINIC.doctorTitle}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <div>
          <SectionHead
            align="left"
            eyebrow="YOUR PHYSIO"
            title={
              <>
                In hands that have rebuilt <em className="text-volt-600 dark:text-volt-300 not-italic font-semibold">thousands</em> of bodies.
              </>
            }
            copy="Recovery is personal. You work with one senior physiotherapist from assessment to discharge — someone who knows your injury, your sport, your job and your goals."
          />
          <div className="mt-10 grid grid-cols-2 gap-4">
            {CREDENTIALS.map(([v, l], i) => (
              <Reveal key={l} delay={i * 0.07}>
                <div className="glass lift rounded-2xl p-5">
                  <p className="font-display text-xl font-semibold text-volt-600 dark:text-volt-300">{v}</p>
                  <p className="mt-1 text-sm text-sage-500 dark:text-sage-300">{l}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <blockquote className="font-display mt-8 border-l-2 border-volt-400/60 pl-6 text-xl font-light italic leading-relaxed text-ink-950/ dark:text-cream-50/90">
              “Pain is information. My job is to read it precisely — and then
              teach your body to forget it.”
            </blockquote>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
