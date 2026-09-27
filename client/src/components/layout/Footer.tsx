import { Instagram, Linkedin, ArrowUpRight, ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isExternalHref, parseLinks, safeHref, usePageContent } from '@/lib/pageContent';
import BrandLogo from '@/components/ui/BrandLogo';
import '@/styles/site-footer.css';

// Opens off-site links in a new tab.
const targetFor = (href: string) => (isExternalHref(href) ? { target: '_blank', rel: 'noreferrer' } : {});

export function Footer() {
  const c = usePageContent('global');
  const year = new Date().getFullYear();
  const socials = [
    { label: 'Instagram', href: c.instagramUrl, Icon: Instagram },
    { label: 'LinkedIn', href: c.linkedinUrl, Icon: Linkedin },
  ].filter(s => s.href);
  const columns = [1, 2, 3]
    .map(n => ({ title: c[`footerCol${n}Title`], links: parseLinks(c[`footerCol${n}Links`]) }))
    .filter(col => col.title || col.links.length);
  const primaryHref = safeHref(c.footerPrimaryUrl);
  const secondaryHref = safeHref(c.footerSecondaryUrl);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="clyx-footer" id="contact">
      <div className="cf-inner">
        <div className="cf-top">
          <div>
            <p className="cf-eyebrow">
              <span className="cf-dot" aria-hidden="true" />
              {c.footerEyebrow}
            </p>
            {c.footerEmail && <a className="cf-email" href={'mailto:' + c.footerEmail}>
              <span>{c.footerEmail}</span>
              <span className="cf-email-arrow" aria-hidden="true">
                <ArrowUpRight size={22} />
              </span>
            </a>}
          </div>
          <div className="cf-top-actions">
            {c.footerPrimaryText && (
              <a className="cf-btn cf-btn-primary" href={primaryHref} {...targetFor(primaryHref)}>
                {c.footerPrimaryText} <ArrowUpRight size={16} />
              </a>
            )}
            {c.footerSecondaryText && (
              <a className="cf-btn cf-btn-ghost" href={secondaryHref} {...targetFor(secondaryHref)}>
                {c.footerSecondaryText} <ArrowUpRight size={16} />
              </a>
            )}
          </div>
        </div>

        <div className="cf-main">
          <div className="cf-brand">
            <div className="cf-brand-row">
              <a href="/" className="cf-logo" aria-label="CLYX Media home">
                <BrandLogo size={48} />
              </a>
              <div className="cf-socials">
                {socials.map(({ label, href, Icon }) => (
                  <a key={label} className="cf-social" href={safeHref(href)} target="_blank" rel="noreferrer" aria-label={label}>
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            </div>
            <p className="cf-tagline">{c.footerTagline}</p>
          </div>

          {columns.map(({ title, links }, i) => (
            <nav key={`${title}-${i}`} className="cf-col" aria-label={title}>
              <p className="cf-col-title">{title}</p>
              <ul>
                {links.map(({ label, href }, j) => (
                  <li key={`${label}-${j}`}>
                    <a className="cf-link" href={href} {...targetFor(href)}>
                      <span>{label}</span>
                      <ArrowUpRight size={14} className="cf-link-arrow" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="cf-bottom">
          <span>© {year} {c.footerCopyright}</span>
          <div className="cf-legal">
            {parseLinks(c.footerLegalLinks).map(({ label, href }, i) => (
              <a key={`${label}-${i}`} href={href} {...targetFor(href)}>{label}</a>
            ))}
          </div>
          <button type="button" className="cf-top-btn" onClick={scrollToTop}>
            {c.footerTopText}
            <span aria-hidden="true"><ArrowUp size={14} /></span>
          </button>
        </div>
      </div>

      <div className="cf-wordmark" aria-hidden="true">
        {c.footerWordmark}
      </div>
    </footer>
  );
}

export function WhatsAppButton() {
  const { whatsappUrl } = usePageContent('global');
  if (!whatsappUrl) return null;
  return (
    <a
      href={safeHref(whatsappUrl)}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="whatsapp-button group fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1EBE5A] hover:scale-105 transition-all"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 !text-white fill-current">
        <path d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.9-1.3A9.5 9.5 0 1 0 12 2.5Zm0 17.3c-1.5 0-2.9-.4-4.1-1.2l-.3-.2-2.9.8.8-2.8-.2-.3a7.8 7.8 0 1 1 6.7 3.7Zm4.3-5.8c-.2-.1-1.3-.7-1.5-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.1-.3.2-.5.1-1.4-.7-2.4-1.3-3.3-2.9-.1-.2 0-.3.1-.4l.4-.5c.1-.1.1-.3 0-.4l-.6-1.4c-.2-.4-.3-.4-.5-.4h-.4c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.1 1.5 2.4 3.7 3.3 1.4.6 1.9.6 2.5.5.4-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1-.1-.1-.2-.2-.4-.3Z" />
      </svg>
    </a>
  );
}

export function CookieBar() {
  const c = usePageContent('global');
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
    <div className="cookie-consent fixed bottom-4 left-4 right-4 sm:left-auto max-w-md z-40 rounded-2xl border border-grid bg-[color:var(--background)]/90 p-5 shadow-2xl backdrop-blur-xl transition-all">
      <p className="text-sm font-semibold tracking-tight text-foreground">
        {c.cookieTitle}
      </p>
      <p className="mt-1 text-xs text-muted leading-relaxed">
        {c.cookieText}
      </p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={accept}
          className="border border-grid px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-muted/10 rounded-md transition-colors"
        >
          {c.cookieEssential}
        </button>
        <button
          onClick={accept}
          className="bg-yellow px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-dark hover:bg-blue hover:text-white rounded-md transition-colors"
        >
          {c.cookieAccept}
        </button>
      </div>
    </div>
  );
}
