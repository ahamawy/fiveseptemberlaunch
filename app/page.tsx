import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import CTA from "@/components/landing/CTA";
import Background from "@/components/landing/Background";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main
      className="min-h-screen bg-[color:var(--bg,#0B071A)]"
      style={{
        background: "linear-gradient(180deg, #0B071A 0%, #040210 100%)",
      }}
    >
      <Background />
      <Nav />
      <Hero />
      <div className="mt-4" />
      <Stats />
      <div className="mt-8" />
      <CTA />
      <Footer />
    </main>
  );
}
