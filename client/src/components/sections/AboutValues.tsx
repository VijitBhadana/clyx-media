import { MessagesSquare, RefreshCw, Sparkles, type LucideIcon } from 'lucide-react';
import { Reveal } from '@/components/ui/ScrollMotion';
import '@/styles/about-values.css';

const values: { title: string; text: string; tag: string; Icon: LucideIcon }[] = [
  { title: 'Directness', text: 'Senior partners, clear thinking, no unnecessary layers.', tag: 'How we talk', Icon: MessagesSquare },
  { title: 'Instinct', text: 'Creative that earns attention before it asks for action.', tag: 'How we create', Icon: Sparkles },
  { title: 'Iteration', text: 'Every winning hook becomes a system, not a one-off.', tag: 'How we scale', Icon: RefreshCw },
];

// The yellow "principles" band on the About page. It stays yellow in both themes.
export default function AboutValues() {
  return (
    <section className="bg-yellow text-dark values-band">
      <div className="container values-inner">
        <Reveal className="values-head">
          <div>
            <p className="values-eyebrow"><span className="values-eyebrow-dot" />How we work</p>
            <h2 className="display values-title">Three principles.<br />Zero fluff.</h2>
          </div>
          <p className="values-intro">
            The rules every brief, creative and campaign at CLYX runs on, from the first call to the tenth scaled ad.
          </p>
        </Reveal>

        <div className="values-grid">
          {values.map(({ title, text, tag, Icon }, i) => (
            <Reveal key={title} delay={i * 140}>
              <div className="values-card">
                <div className="values-card-top">
                  <span className="values-icon"><Icon size={22} strokeWidth={2.2} /></span>
                  <span className="values-num display">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <p className="values-tag">{tag}</p>
                <h3 className="display values-card-title">{title}</h3>
                <p className="values-card-text">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
