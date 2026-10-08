import SectionHead from "./SectionHead";
import Reveal from "./Reveal";

interface Service {
  title: string;
  copy: string;
  icon: React.ReactNode;
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const SERVICES: Service[] = [
  {
    title: "Back & Spine Care",
    copy: "Disc bulges, sciatica and chronic back pain — targeted spinal therapy that gets you bending, lifting and sitting without fear.",
    icon: (
      <Icon>
        <path d="M12 2.5v19" />
        <ellipse cx="12" cy="6" rx="4.5" ry="2.2" />
        <ellipse cx="12" cy="12" rx="4.5" ry="2.2" />
        <ellipse cx="12" cy="18" rx="4.5" ry="2.2" />
      </Icon>
    ),
  },
  {
    title: "Sports Injury Rehab",
    copy: "ACL, rotator cuff, sprains and strains. Sport-specific rehab with return-to-play testing that brings you back stronger.",
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="9" />
        <path d="M13 5.5L8.5 13H12l-1 5.5L15.5 11H12l1-5.5z" />
      </Icon>
    ),
  },
  {
    title: "Post-Surgical Rehab",
    copy: "Structured protocols after knee, hip and shoulder surgery — every milestone tracked, nothing rushed, no guesswork.",
    icon: (
      <Icon>
        <path d="M12 2.5l7.5 3v6c0 4.5-3.2 7.6-7.5 9.5-4.3-1.9-7.5-5-7.5-9.5v-6l7.5-3z" />
        <path d="M12 8.5v7M8.5 12h7" />
      </Icon>
    ),
  },
  {
    title: "Neck & Shoulder Pain",
    copy: "Frozen shoulder, cervical strain, tech-neck. Hands-on release plus posture retraining built for desk life.",
    icon: (
      <Icon>
        <circle cx="12" cy="7" r="3.5" />
        <path d="M5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" />
        <path d="M12 10.5v3" />
      </Icon>
    ),
  },
  {
    title: "Neurological Rehab",
    copy: "Stroke, Parkinson's and balance disorders — neuroplasticity-driven training that rebuilds independence, step by step.",
    icon: (
      <Icon>
        <circle cx="6" cy="6" r="2.4" />
        <circle cx="18" cy="7" r="2.4" />
        <circle cx="12" cy="13" r="2.4" />
        <circle cx="7" cy="19" r="2.4" />
        <circle cx="17" cy="18.5" r="2.4" />
        <path d="M8 7.5l7.6-.8M7.2 8.2l3.3 3M16.8 9.2l-3.3 2.4M11 15.2l-2.6 2.4M13.4 14.6l2.4 2.4" />
      </Icon>
    ),
  },
  {
    title: "Geriatric Mobility Care",
    copy: "Fall prevention, strength and confidence — stay active, steady and self-reliant at every age.",
    icon: (
      <Icon>
        <circle cx="14.5" cy="4.5" r="2.2" />
        <path d="M13 8l-4.5 2L7 15l3.5-1 1.5 6" />
        <path d="M13 8l3 3 3.5 1" />
        <path d="M4 21l3.5-6" />
      </Icon>
    ),
  },
];

export default function Services() {
  return (
    <section id="treatments" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHead
          eyebrow="TREATMENTS"
          title={
            <>
              Every pain has a <em className="text-volt-300 not-italic font-semibold">plan.</em>
            </>
          }
          copy="Six specialised programs, one philosophy: find the root cause, treat it with evidence — and measure everything."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 0.08}>
              <article className="lift glass group h-full rounded-3xl p-7 hover:border-volt-400/35">
                <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-volt-400/10 text-volt-300 ring-1 ring-volt-400/25 transition-all duration-500 group-hover:bg-volt-400 group-hover:text-ink-950 group-hover:shadow-[0_0_30px_-4px_rgba(200,245,66,0.7)]">
                  {s.icon}
                </div>
                <h3 className="font-display text-2xl font-medium text-cream-50">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-sage-300">{s.copy}</p>
                <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-volt-300 opacity-0 transition-all duration-500 group-hover:opacity-100">
                  Part of every plan
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
