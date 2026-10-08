"use client";

import Image from "next/image";

/**
 * PotScene — the purple orchid as a DISCRETE element anchored bottom-right
 * of the landing hero (not a full-width strip). The PNG has a true
 * transparent background (user-removed), so no masks, overlays, or grading
 * are needed — it floats cleanly on both themes with just a soft ground
 * shadow under the pot. GSAP gives it only a barely-perceptible slow zoom.
 *
 * Responsive sizing: small and discreet on phones (130px — the CTA button
 * and caption stay 100px+ clear, and the pot tucks below the footer text),
 * modest on tablets (210px), full presence on desktop (52vh).
 */
export default function PotScene() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 right-0 z-[1] overflow-hidden"
    >
      <div
        data-pot
        className="pot-zoom relative aspect-[1260/1240] h-[130px] w-auto sm:h-[210px] lg:h-[52vh]"
      >
        {/* soft ground shadow so the pot sits in the scene */}
        <div className="absolute bottom-3 left-1/2 h-[26px] w-[62%] -translate-x-1/2 rounded-full bg-black/25 blur-xl dark:bg-black/60" />
        <Image
          src="/orchid-plant.png"
          alt=""
          fill
          sizes="(max-width: 640px) 132px, (max-width: 1024px) 213px, 40vw"
          className="object-contain object-bottom"
        />
      </div>
    </div>
  );
}

const BUTTERFLIES = [
  // near the bubble (upper-center)
  { left: "44%", top: "26%", size: 40, dur: 26, delay: 0, src: "/butterfly-monarch.png" },
  // near the orchid pot (bottom-right)
  { left: "70%", top: "64%", size: 30, dur: 31, delay: 5, src: "/butterfly-morpho.png" },
  // upper-left airspace
  { left: "12%", top: "20%", size: 28, dur: 29, delay: 11, src: "/butterfly-monarch.png" },
  // right-middle airspace
  { left: "83%", top: "42%", size: 34, dur: 27, delay: 16, src: "/butterfly-morpho.png" },
];

/**
 * Butterflies — delicate photorealistic butterflies wandering the hero on
 * gentle curved paths with fluttering wings. Small, blurred, ambient.
 */
export function Butterflies() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
      {BUTTERFLIES.map((b, i) => (
        <div
          key={i}
          data-butterfly
          data-dur={b.dur}
          data-delay={b.delay}
          className="absolute opacity-0"
          style={{ left: b.left, top: b.top, width: b.size }}
        >
          <div data-flutter className="blur-[0.5px]">
            <Image
              src={b.src}
              alt=""
              width={160}
              height={100}
              className="h-auto w-full"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
