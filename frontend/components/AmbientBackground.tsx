"use client";

/**
 * AmbientBackground — a rich, clearly-visible mesh gradient that sits behind
 * the app so the frosted-glass cards float over flowing color.
 * Light: ivory base with mint, sage, peach and aqua gradients.
 * Dark: deep teal-navy with teal/blue/indigo glow gradients.
 * The mesh drifts almost imperceptibly on a 26s loop (calm, premium);
 * motion is disabled under prefers-reduced-motion.
 */
export default function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      {/* light-mode mesh */}
      <div
        className="ambient-drift absolute -inset-[8%] dark:hidden"
        style={{
          background: `
            radial-gradient(42rem 30rem at 12% 8%, rgba(178, 224, 199, 0.9), transparent 65%),
            radial-gradient(46rem 34rem at 88% 18%, rgba(247, 214, 172, 0.85), transparent 65%),
            radial-gradient(40rem 32rem at 78% 88%, rgba(212, 226, 186, 0.9), transparent 65%),
            radial-gradient(36rem 28rem at 18% 82%, rgba(192, 226, 218, 0.85), transparent 65%),
            radial-gradient(30rem 30rem at 55% 45%, rgba(255, 255, 255, 0.75), transparent 60%),
            linear-gradient(135deg, #f8f5ed 0%, #ebf2e3 38%, #f7efdd 68%, #e7eee2 100%)`,
        }}
      />
      {/* dark-mode mesh */}
      <div
        className="ambient-drift absolute -inset-[8%] hidden dark:block"
        style={{
          background: `
            radial-gradient(44rem 32rem at 15% 10%, rgba(45, 190, 170, 0.22), transparent 65%),
            radial-gradient(40rem 34rem at 85% 22%, rgba(96, 165, 250, 0.16), transparent 65%),
            radial-gradient(42rem 30rem at 75% 85%, rgba(45, 212, 191, 0.15), transparent 65%),
            radial-gradient(34rem 30rem at 25% 80%, rgba(129, 140, 248, 0.14), transparent 65%),
            radial-gradient(28rem 28rem at 55% 40%, rgba(45, 190, 170, 0.08), transparent 60%),
            linear-gradient(160deg, #0a1f27 0%, #0d2735 45%, #091a26 100%)`,
        }}
      />
      {/* film grain to keep gradients from banding */}
      <div className="hero-grain absolute inset-0 opacity-[0.05] dark:opacity-[0.08]" />
    </div>
  );
}
