import { Fragment, useEffect, type ReactNode } from 'react';
import { ArrowUpRight, Mail } from 'lucide-react';
import { useLocation } from 'wouter';
import Header from '@/components/layout/Header';
import { CookieBar, Footer, WhatsAppButton } from '@/components/layout/Footer';
import { Reveal } from '@/components/ui/ScrollMotion';
import { legalContactEmail, privacy, terms } from '@/data/legal';
import '@/styles/legal.css';

const DOCS = [privacy, terms];

/** "**bold**" runs and the contact email as a mailto link; everything else is plain text. */
function inline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    const pieces = part.split(legalContactEmail);
    return (
      <Fragment key={i}>
        {pieces.map((piece, j) => (
          <Fragment key={j}>
            {j > 0 && <a href={`mailto:${legalContactEmail}`}>{legalContactEmail}</a>}
            {piece}
          </Fragment>
        ))}
      </Fragment>
    );
  });
}

function Paragraph({ text }: { text: string }) {
  if (text.startsWith('- ')) {
    return <ul>{text.split('\n').map((line, i) => <li key={i}>{inline(line.replace(/^- /, ''))}</li>)}</ul>;
  }
  return <p>{inline(text)}</p>;
}

/** Privacy Policy (/privacy) and Terms of Use (/terms), linked from the footer. */
export default function LegalPage() {
  const [location] = useLocation();
  const doc = DOCS.find((d) => d.path === location) ?? privacy;

  useEffect(() => {
    const previous = document.title;
    document.title = `${doc.title} | CLYX Media`;
    return () => { document.title = previous; };
  }, [doc.title]);

  return (
    <div className="legal-page min-h-screen">
      <Header />
      <main>
        <header className="lg-hero">
          <div className="lg-hero-glow" aria-hidden="true" />
          <div className="container">
            <Reveal>
              <p className="lg-eyebrow"><span aria-hidden="true" className="lg-eyebrow-dot" />Legal</p>
              <h1 className="lg-title">{doc.title}</h1>
              <p className="lg-intro">{doc.intro}</p>
              <div className="lg-hero-foot">
                <nav className="lg-switch" aria-label="Legal pages">
                  {DOCS.map((d) => (
                    <a key={d.path} href={d.path} className={d.path === doc.path ? 'is-active' : undefined} aria-current={d.path === doc.path ? 'page' : undefined}>
                      {d.label}
                    </a>
                  ))}
                </nav>
                <p className="lg-updated">Last updated · {doc.updated}</p>
              </div>
            </Reveal>
          </div>
        </header>

        <div className="container lg-layout">
          <aside className="lg-aside">
            <nav className="lg-toc" aria-label="On this page">
              <p className="lg-toc-label">On this page</p>
              <ol>
                {doc.sections.map((s, i) => (
                  <li key={s.id}><a href={`#${s.id}`}><span>{String(i + 1).padStart(2, '0')}</span>{s.title}</a></li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="lg-body">
            {doc.sections.map((s, i) => (
              <section key={s.id} id={s.id} className="lg-section">
                <h2><span className="lg-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{s.title}</h2>
                {s.body.map((text, j) => <Paragraph key={j} text={text} />)}
              </section>
            ))}

            <div className="lg-contact">
              <div>
                <p className="lg-contact-title">Questions about this page?</p>
                <p className="lg-contact-text">Write to us and a real person from the team will get back to you.</p>
              </div>
              <a href={`mailto:${legalContactEmail}`} className="lg-contact-btn">
                <Mail size={16} aria-hidden="true" /> {legalContactEmail} <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          </article>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
      <CookieBar />
    </div>
  );
}
