import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import Stats from "@/components/landing/Stats";
import Services from "@/components/landing/Services";
import Method from "@/components/landing/Method";
import Stories from "@/components/landing/Stories";
import Doctor from "@/components/landing/Doctor";
import CtaFooter from "@/components/landing/CtaFooter";

export default function LandingPage() {
  return (
    <div className="grain relative min-h-full bg-ink-950 text-cream-50">
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Stats />
        <Services />
        <Method />
        <Stories />
        <Doctor />
      </main>
      <CtaFooter />
    </div>
  );
}
