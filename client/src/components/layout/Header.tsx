import { useEffect, useState, type MouseEvent } from 'react';
import { useLocation } from 'wouter';
import { ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-react';
import { isExternalHref, parseLinks, safeHref, usePageContent } from '@/lib/pageContent';
import BrandLogo from '@/components/ui/BrandLogo';

// The page a menu link points at, e.g. "/about" for "/about#team". Used to highlight the current page.
const pathOf = (href: string) => (href.startsWith('/') ? href.split(/[?#]/)[0] || '/' : null);

// All header motion is plain CSS, so the animation library is not part of every page's first download.
const EASE = 'cubic-bezier(.23,1,.32,1)';
// A slight overshoot, like the spring the hover pill used to have.
const PILL_EASE = 'cubic-bezier(.34,1.25,.64,1)';

export default function Header() {
  const [location] = useLocation();
  const c = usePageContent('global');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // The hover pill glides under whichever desktop link the pointer is on.
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('clyx-theme');
      if (saved) return saved === 'dark';
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    }
    return false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('clyx-theme', 'dark');
      localStorage.setItem('clyx_standalone_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('clyx-theme', 'light');
      localStorage.setItem('clyx_standalone_theme', 'light');
    }
  }, [dark]);

  useEffect(() => {
    const syncTheme = (event: Event) => {
      const theme = (event as CustomEvent<string>).detail;
      setDark(theme === 'dark');
    };
    window.addEventListener('clyx-theme-change', syncTheme);
    return () => window.removeEventListener('clyx-theme-change', syncTheme);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock page scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const toggle = () => setDark(prev => !prev);
  const showPill = (e: MouseEvent<HTMLAnchorElement>) => setPill({ left: e.currentTarget.offsetLeft, width: e.currentTarget.offsetWidth });

  const nav = parseLinks(c.navLinks);
  // A sub-page such as /blog/some-article keeps its section (Blog) highlighted.
  const activeHref = (nav.find(item => pathOf(item.href) === location)
    ?? nav.find(item => pathOf(item.href) !== '/' && location.startsWith(`${pathOf(item.href)}/`)))?.href;
  const ctaHref = safeHref(c.headerCtaUrl || '/contact');
  const linkTarget = (href: string) => (isExternalHref(href) ? { target: '_blank', rel: 'noreferrer' } : {});

  return (
    <header className="clyx-nav fixed inset-x-0 top-0 z-50 flex justify-center">
      <div
        className={`clyx-nav-bar relative flex w-full items-center justify-between border-grid transition-all duration-500 ease-[cubic-bezier(.23,1,.32,1)] ${
          scrolled
            ? 'is-floating mt-3 h-[58px] max-w-[1200px] mx-3 md:mx-6 rounded-[29px] border bg-white/70 shadow-[0_10px_40px_-12px_rgba(1,58,163,0.25)] backdrop-blur-xl backdrop-saturate-150 dark:bg-[#0a1024]/70 dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.8)]'
            : 'mt-0 h-[68px] max-w-full mx-0 rounded-none border-b bg-white/80 backdrop-blur-md dark:bg-[#050814]/80'
        }`}
      >
        {/* Brand Logo */}
        <a href="/" className="clyx-nav-plain group relative shrink-0" aria-label="CLYX Media home">
          <BrandLogo size={scrolled ? 40 : 46} className="transition-all duration-500 ease-[cubic-bezier(.23,1,.32,1)] group-hover:scale-105" />
        </a>

        {/* Center Desktop Navigation */}
        <nav aria-label="Primary" className="hidden lg:flex">
          <div className="flex items-center rounded-full border border-grid bg-black/[0.03] p-1 dark:bg-white/[0.035]">
            <div className="relative inline-flex items-center" onMouseLeave={() => setPill(null)}>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-black/[0.06] dark:bg-white/[0.08]"
                style={{
                  width: pill?.width ?? 0,
                  transform: `translateX(${pill?.left ?? 0}px)`,
                  opacity: pill ? 1 : 0,
                  // Fades in where it appears, then glides between links.
                  transition: pill
                    ? `transform .45s ${PILL_EASE}, width .45s ${PILL_EASE}, opacity .2s ease`
                    : 'opacity .2s ease',
                }}
              />
              {nav.map(({ label, href }, i) => {
                const active = href === activeHref;
                return (
                  <a
                    key={`${label}-${i}`}
                    href={href}
                    {...linkTarget(href)}
                    onMouseEnter={showPill}
                    aria-current={active ? 'page' : undefined}
                    className={`clyx-nav-plain relative isolate block px-3 py-2 text-[11px] font-semibold uppercase tracking-[.1em] transition-colors duration-200 xl:px-4 ${
                      active ? 'text-white dark:text-[#050505]' : 'text-muted hover:text-foreground'
                    }`}
                  >
                    {active && (
                      <span
                        className="absolute inset-0 -z-10 rounded-full bg-[#013AA3] shadow-[0_4px_14px_-4px_rgba(1,58,163,0.7)] dark:bg-[#FFDE59] dark:shadow-[0_4px_16px_-4px_rgba(255,222,89,0.6)]"
                      />
                    )}
                    <span className="relative z-10 whitespace-nowrap">{label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Right Action Icons & Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggle}
            className="clyx-nav-round relative hidden h-10 w-10 items-center justify-center overflow-hidden border border-grid bg-black/[0.03] text-muted hover:text-foreground hover:border-[color:var(--border-strong)] dark:bg-white/[0.04] md:flex"
          >
            <ThemeIcon dark={dark} size={16} />
          </button>

          <a
            href={ctaHref}
            {...linkTarget(ctaHref)}
            className="clyx-nav-round group hidden items-center gap-2 bg-[#FFDE59] py-1.5 pl-5 pr-1.5 text-[11px] font-bold uppercase tracking-[.1em] text-[#050505] shadow-[0_6px_20px_-6px_rgba(255,222,89,0.8)] hover:shadow-[0_8px_28px_-6px_rgba(255,222,89,1)] md:inline-flex lg:pl-1.5 xl:pl-5"
            aria-label={c.headerCtaText}
          >
            <span className="lg:hidden xl:inline">{c.headerCtaText}</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#050505] text-[#FFDE59] transition-transform duration-300 group-hover:rotate-45">
              <ArrowUpRight size={14} strokeWidth={2.5} />
            </span>
          </a>

          {/* Mobile Hamburger Button */}
          <button
            className="clyx-nav-round flex h-11 w-11 items-center justify-center border border-grid text-foreground lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu: always rendered and shown/hidden with CSS transitions; `inert` keeps it out of reach while closed. */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 top-0 -z-10 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <div
        inert={!open}
        className={`absolute inset-x-3 max-h-[calc(100svh-96px)] overflow-y-auto rounded-2xl border border-grid bg-[color:var(--background)]/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-2xl lg:hidden ${
          scrolled ? 'top-[78px]' : 'top-[76px]'
        } ${open ? 'visible' : 'invisible pointer-events-none'}`}
        style={{
          opacity: open ? 1 : 0,
          transform: open ? 'none' : 'translateY(-12px) scale(0.98)',
          transition: `opacity .3s ${EASE}, transform .3s ${EASE}, visibility 0s linear ${open ? '0s' : '.3s'}`,
        }}
      >
        <nav aria-label="Mobile">
          {nav.map(({ label, href }, i) => {
            const active = href === activeHref;
            return (
              <a
                key={`${label}-${i}`}
                href={href}
                {...linkTarget(href)}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`clyx-nav-plain flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold uppercase tracking-[.12em] ${
                  active
                    ? 'bg-[#013AA3] text-white dark:bg-[#FFDE59] dark:text-[#050505]'
                    : 'text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                }`}
                // Links slide in one after another as the drawer opens. Inline so the global `a { transition }`
                // rule in index.css cannot override it.
                style={{
                  opacity: open ? 1 : 0,
                  transform: open ? 'none' : 'translateX(-10px)',
                  transition: `opacity .25s ease ${open ? 0.04 * i : 0}s, transform .25s ease ${open ? 0.04 * i : 0}s, background .18s ease, color .18s ease`,
                }}
              >
                {label}
                <ArrowUpRight size={16} className={active ? 'opacity-100' : 'opacity-30'} />
              </a>
            );
          })}
        </nav>
        <div className="mt-3 flex items-center gap-2 border-t border-grid pt-3">
          <button
            onClick={toggle}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="clyx-nav-round flex h-12 w-12 shrink-0 items-center justify-center border border-grid text-foreground"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <a
            href={ctaHref}
            {...linkTarget(ctaHref)}
            onClick={() => setOpen(false)}
            className="clyx-nav-round flex h-12 flex-1 items-center justify-center gap-2 bg-[#FFDE59] text-xs font-bold uppercase tracking-[.1em] text-[#050505]"
          >
            {c.headerCtaText} <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </header>
  );
}

// Keyed by theme, so switching remounts the icon and its drop-in animation plays again.
function ThemeIcon({ dark, size }: { dark: boolean; size: number }) {
  return (
    <span key={dark ? 'sun' : 'moon'} className="flex animate-[nav-icon-in_.25s_ease-out]">
      {dark ? <Sun size={size} /> : <Moon size={size} />}
    </span>
  );
}
