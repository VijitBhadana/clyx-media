import { FlaskConical, Scissors, TrendingUp, type LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/ui/ScrollMotion';
import { pageDefaults } from '@/lib/pageContent';
import '@/styles/case-pattern.css';

// Card icons stay fixed; the copy on each step comes from the Case Studies page content.
const ICONS: LucideIcon[] = [TrendingUp, Scissors, FlaskConical];

// Noise on the left settling into a clean, growing wave on the right: "find the signal, scale the signal".
const NOISE_PATH = 'M2 34 L10 30 L16 37 L23 29 L30 36 L37 31 L44 38 L51 28 L58 35 L65 31 L72 37 L79 30 L86 34 L94 32';
const SIGNAL_PATH = 'M94 32 C104 32 108 24 118 24 S132 40 142 40 S160 16 172 16 S192 48 206 48 S228 8 244 8 S268 54 284 54 S312 4 330 4';

function SignalWave() {
  return (
    <svg className="cp-wave" viewBox="0 0 340 60" fill="none" aria-hidden="true">
      <path className="cp-wave-noise" d={NOISE_PATH} pathLength={1} />
      <path className="cp-wave-signal" d={SIGNAL_PATH} pathLength={1} />
      <circle className="cp-wave-dot" cx="330" cy="4" r="4" />
    </svg>
  );
}

// The "recurring pattern" block on the Case Studies page: a blue panel with the keep / cut / try-next loop.
export default function CasePattern({ content: c = pageDefaults('caseStudies') }: { content?: Record<string, string> }) {
  const lines = c.patternTitle.split('\n').filter(Boolean);
  const steps = ICONS.map((Icon, i) => ({
    Icon,
    tag: c[`patternStep${i + 1}Tag`],
    title: c[`patternStep${i + 1}Title`],
    text: c[`patternStep${i + 1}Text`],
  })).filter((s) => s.title || s.text);

  return (
    <section className="cp-section bg-blue">
      <div className="container">
        <div className="cp-panel">
          <Reveal className="cp-intro">
            {c.patternLabel && <p className="cp-label"><span className="cp-pulse" aria-hidden="true" />{c.patternLabel}</p>}
            <h2 className="cp-title">
              {lines.map((line, i) => (
                <span
                  key={i}
                  className={`cp-title-line${i === lines.length - 1 && lines.length > 1 ? ' is-hl' : ''}`}
                  style={{ '--i': i } as React.CSSProperties}
                >
                  {line}
                </span>
              ))}
            </h2>
            {c.patternText && <p className="cp-text">{c.patternText}</p>}
            <SignalWave />
          </Reveal>

          <ol className="cp-flow">
            {steps.map(({ Icon, tag, title, text }, i) => (
              <li key={i}>
                <Reveal delay={i * 120} className="cp-step-reveal">
                  <div className="cp-step">
                    <span className="cp-step-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      {tag && <p className="cp-step-tag"><Icon size={14} strokeWidth={2.4} aria-hidden="true" />{tag}</p>}
                      <h3 className="cp-step-title">{title}</h3>
                      {text && <p className="cp-step-text">{text}</p>}
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
