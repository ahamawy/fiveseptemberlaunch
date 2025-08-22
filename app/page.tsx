import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import CTA from "@/components/landing/CTA";
import Background from "@/components/landing/Background";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import Positioning from "@/components/landing/Positioning";
import ConvictionLibrary from "@/components/landing/ConvictionLibrary";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <main
      className="bg-[color:var(--bg,#0B071A)]"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0B071A 0%, #040210 100%)",
      }}
    >
      <Background />
      <Nav />
      <Hero />
      {/* Primary Access Buttons */}
      <section className="relative z-10 px-6 lg:px-8 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/investor-portal/select">
            <Button size="lg" variant="primary">
              Investor Access
            </Button>
          </a>
          <a href="/admin/deals">
            <Button size="lg" variant="glass">
              Admin Access
            </Button>
          </a>
        </div>
      </section>
      <div className="mt-4" />
      <Stats />
      <Positioning />
      <ConvictionLibrary />
      <div className="mt-8" />
      <CTA />
      <Footer />
    </main>
  );
}
