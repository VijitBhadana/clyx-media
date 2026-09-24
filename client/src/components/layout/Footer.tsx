import { Instagram, Linkedin, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { footerColumns } from '@/data/home';

const footerRoutes: Record<string, string> = {
  About: '/about',
  Creators: '/creators',
  Careers: '/careers',
  Admin: '/admin',
  Services: '/services',
  Portfolio: '/portfolio',
  'Case studies': '/case-studies',
  WhatsApp: 'https://wa.me/919671430111',
  Calendly: '/contact#contact-form',
};

export function Footer() {
  return (
    <footer className="shared-site-footer border-t border-white/20 bg-blue text-white" id="contact">
      <div className="container py-14 md:py-20">
        <div className="shared-footer-grid grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div className="shared-footer-brand">
            <div className="display text-3xl font-bold">
              CLYX<span className="text-yellow">.</span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/80">
              The performance creative partner for brands that want to move faster than the feed.
            </p>
            <div className="mt-7 flex gap-3">
              <a
                className="border border-white/30 p-3 hover:border-yellow hover:text-yellow transition-colors"
                href="https://www.instagram.com/d2cwithclyx"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                className="border border-white/30 p-3 hover:border-yellow hover:text-yellow transition-colors"
                href="https://www.linkedin.com/company/clyxmediax/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          {Object.entries(footerColumns).map(([title, items]) => (
            <div key={title}>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[.16em] text-yellow">{title}</p>
              {items.map(item => (
                <a
                  href={item.includes('@') ? 'mailto:' + item : footerRoutes[item] || '/contact'}
                  target={item === 'WhatsApp' ? '_blank' : undefined}
                  rel={item === 'WhatsApp' ? 'noreferrer' : undefined}
                  key={item}
                  className="group flex items-center justify-between border-b border-white/20 py-3 text-sm text-white/80 hover:text-white transition-colors"
                >
                  {item}
                  <ArrowUpRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-white/20 pt-5 text-xs text-white/60 md:flex-row">
          <span>© 2026 CLYX Media. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="/about" className="hover:text-white transition-colors">Privacy</a>
            <a href="/about" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919671430111"
      aria-label="Chat on WhatsApp"
      className="whatsapp-button group fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue text-white shadow-lg hover:bg-yellow hover:text-dark transition-all"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 !text-white group-hover:!text-dark fill-current">
        <path d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.9-1.3A9.5 9.5 0 1 0 12 2.5Zm0 17.3c-1.5 0-2.9-.4-4.1-1.2l-.3-.2-2.9.8.8-2.8-.2-.3a7.8 7.8 0 1 1 6.7 3.7Zm4.3-5.8c-.2-.1-1.3-.7-1.5-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.1-.3.2-.5.1-1.4-.7-2.4-1.3-3.3-2.9-.1-.2 0-.3.1-.4l.4-.5c.1-.1.1-.3 0-.4l-.6-1.4c-.2-.4-.3-.4-.5-.4h-.4c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.1 1.5 2.4 3.7 3.3 1.4.6 1.9.6 2.5.5.4-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1-.1-.1-.2-.2-.4-.3Z" />
      </svg>
    </a>
  );
}

export function CookieBar() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(localStorage.getItem('clyx-cookie-consent') !== 'accepted');
  }, []);
  const accept = () => {
    localStorage.setItem('clyx-cookie-consent', 'accepted');
    setVisible(false);
  };
  if (!visible) return null;
  return (
    <div className="cookie-consent fixed bottom-4 right-4 max-w-md z-40 rounded-2xl border border-grid bg-[color:var(--background)]/90 p-5 shadow-2xl backdrop-blur-xl transition-all">
      <p className="text-sm font-semibold tracking-tight text-foreground">
        Cookie preferences
      </p>
      <p className="mt-1 text-xs text-muted leading-relaxed">
        We use cookies to make CLYX faster and track essential performance metrics.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={accept}
          className="border border-grid px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-muted/10 rounded-md transition-colors"
        >
          Essential
        </button>
        <button
          onClick={accept}
          className="bg-yellow px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-dark hover:bg-blue hover:text-white rounded-md transition-colors"
        >
          Accept all
        </button>
      </div>
    </div>
  );
}
