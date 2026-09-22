import { useEffect } from 'react';
import Lenis from 'lenis';
import Header from '@/components/layout/Header';
import { Footer, WhatsAppButton, CookieBar } from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import Proof from '@/components/sections/Proof';
import Services from '@/components/sections/Services';
import CoverFlowCarousel from '@/components/sections/CoverFlowCarousel';
import Methodology from '@/components/sections/Methodology';
import Leadership from '@/components/sections/Leadership';
import Testimonials from '@/components/sections/Testimonials';
import ClosingCTA from '@/components/sections/ClosingCTA';

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  return (
    <div className="bg-[color:var(--background)] text-foreground min-h-screen transition-colors">
      <Header />
      <main>
        <Hero />
        <Proof />
        <Services />
        <CoverFlowCarousel />
        <Methodology />
        <Leadership />
        <Testimonials />
        <ClosingCTA />
      </main>
      <Footer />
      <WhatsAppButton />
      <CookieBar />
    </div>
  );
}
