import { ArrowDown } from 'lucide-react';
import { Button, Label } from '@/components/ui/primitives';
import { DirectionalReveal } from '@/components/ui/ScrollMotion';
import { useCmsRecord } from '@/lib/cms';
import { HeroTiltStack } from './HeroTiltStack';

export default function Hero() {
  const { record } = useCmsRecord('homepage', 'hero');
  const content = record?.content ?? {};
  const eyebrow = String(content.eyebrow ?? 'Performance creative / creator ads');
  const headline = String(content.headline ?? 'We turn organic clips into scaled accounts.');
  const supportingCopy = String(
    content.supportingCopy ??
      'CLYX turns creator content into paid media that moves at scale. Creative instincts, performance discipline.'
  );
  const primaryCta = String(content.primaryCta ?? 'See what we do');
  const secondaryCta = String(content.secondaryCta ?? 'Scroll to explore');

  return (
    <section
      id="top"
      className="noise grid-lines relative flex min-h-[680px] items-center overflow-hidden bg-blue pb-16 pt-28 text-white md:min-h-[740px] md:pb-20"
    >
      <div className="container relative z-10 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline and CTAs */}
          <div className="lg:col-span-7 hero-copy">
            <Label style={{ color: '#FFDE59' }}>{eyebrow}</Label>
            <div className="reveal">
              <h1 className="display max-w-none text-[clamp(2.8rem,5.2vw,5.4rem)] font-bold">
                <span className="hidden md:block">
                  {headline.split(/\s+(?=into\b)/i).map((line, i) => (
                    <span key={i} className="block whitespace-nowrap">
                      {line}
                    </span>
                  ))}
                </span>
                <span className="mobile-hero-line block md:hidden whitespace-nowrap">
                  {headline.replace(/\s*scaled accounts\.?/i, '')}
                </span>
                <span className="mobile-hero-scale block whitespace-nowrap text-yellow">scaled accounts.</span>
              </h1>
            </div>

            <DirectionalReveal direction="right" delay={200} className="hero-support max-w-xl pt-4 md:pt-6">
              <p className="text-base leading-7 text-white/90">{supportingCopy}</p>
              <div className="hero-actions mt-7 flex flex-wrap items-center gap-4">
                <Button href="#services">{primaryCta}</Button>
                <a
                  href="#about"
                  className="inline-flex items-center gap-2 border border-yellow px-4 py-3 text-sm font-semibold uppercase tracking-[.1em] text-white hover:bg-yellow hover:text-dark transition-colors"
                >
                  {secondaryCta} <ArrowDown size={15} />
                </a>
              </div>
            </DirectionalReveal>
          </div>

          {/* Right Column: Interactive Tilt Card Stack */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end mt-6 lg:mt-0">
            <HeroTiltStack />
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 right-8 hidden font-mono text-[10px] uppercase tracking-[.1em] text-white/70 md:block">
        Mumbai · London · Everywhere
      </div>
    </section>
  );
}
