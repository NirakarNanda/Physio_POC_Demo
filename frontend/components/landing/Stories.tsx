import SectionHead from "./SectionHead";
import Reveal from "./Reveal";

const STORIES = [
  {
    quote:
      "I walked in with a slipped disc and a lot of fear. Eight weeks later I carried my daughter up the stairs. They didn't just fix my back — they gave me my confidence back.",
    name: "Rohan M.",
    tag: "Back & Spine Care",
    initials: "RM",
  },
  {
    quote:
      "Tore my ACL in a tournament match. Seven months of structured rehab later, I was back on the field — and honestly, stronger than before the injury.",
    name: "Priya I.",
    tag: "Sports Injury Rehab",
    initials: "PI",
  },
  {
    quote:
      "After my knee replacement I thought stairs were over for me. The team measured everything, pushed me exactly the right amount, and now I forget I ever had surgery.",
    name: "Kavya R.",
    tag: "Post-Surgical Rehab",
    initials: "KR",
  },
];

function Stars() {
  return (
    <div className="flex gap-1 text-volt-400" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.4 5.9 20.9l1.5-6.8L2.2 9.5l6.9-.7z" />
        </svg>
      ))}
    </div>
  );
}

export default function Stories() {
  return (
    <section id="stories" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead
          eyebrow="PATIENT STORIES"
          title={
            <>
              Real people. Real <em className="text-volt-300 not-italic font-semibold">comebacks.</em>
            </>
          }
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {STORIES.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.1}>
              <figure className="lift glass flex h-full flex-col rounded-3xl p-8">
                <Stars />
                <blockquote className="font-display mt-5 flex-1 text-xl font-light italic leading-relaxed text-cream-50">
                  “{s.quote}”
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-volt-400/15 font-mono text-sm font-bold text-volt-300 ring-1 ring-volt-400/30">
                    {s.initials}
                  </span>
                  <span>
                    <span className="block font-semibold text-cream-50">{s.name}</span>
                    <span className="block text-sm text-sage-400">{s.tag}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
