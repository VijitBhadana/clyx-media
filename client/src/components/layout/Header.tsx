import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { navLinks } from '@/data/home';
import { Button } from '@/components/ui/primitives';
import { AnimatedBackground } from '@/components/core/animated-background';

const pageRoutes: Record<string, string> = {
  Home: '/',
  About: '/about',
  Services: '/services',
  Portfolio: '/portfolio',
  'Case Studies': '/case-studies',
  Creators: '/creators',
  Blog: '/blog',
  Careers: '/careers',
};

const routeToNav: Record<string, string> = {
  '/': 'Home',
  '/about': 'About',
  '/services': 'Services',
  '/portfolio': 'Portfolio',
  '/case-studies': 'Case Studies',
  '/creators': 'Creators',
  '/blog': 'Blog',
  '/careers': 'Careers',
};

const hrefFor = (label: string) => pageRoutes[label] || `/#${label.toLowerCase().replace(/\s+/g, '-')}`;

export default function Header() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
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

  const toggle = () => setDark(prev => !prev);

  const allNav = ['Home', ...navLinks.filter(l => l.toLowerCase() !== 'home')];
  const currentActiveNav = routeToNav[location] || 'Home';
  const isHome = location === '/';

  return (
    <header className={`fixed top-0 z-50 w-full border-b border-grid transition-colors duration-200 ${
      isHome 
        ? 'bg-white dark:bg-[#050814]' 
        : 'bg-[color:var(--background)]/92 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)]'
    }`}>
      <div className={`container flex ${isHome ? 'h-[60px]' : 'h-[76px]'} items-center justify-between`}>
        {/* Brand Logo */}
        <a href="/" className="display text-2xl font-bold tracking-[-.08em] text-foreground shrink-0">
          CLYX<span className="text-yellow">.</span>
        </a>

        {/* Center Desktop Navigation */}
        <nav className="hidden items-center lg:flex">
          {isHome ? (
            <div className="flex items-center gap-6">
              {allNav.map(x => (
                <a
                  key={x}
                  data-id={x}
                  href={hrefFor(x)}
                  className={`text-[11px] font-semibold uppercase tracking-[.09em] transition-colors duration-200 ${
                    currentActiveNav === x
                      ? 'text-blue dark:text-yellow font-bold'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {x}
                </a>
              ))}
            </div>
          ) : (
            <div className="flex items-center rounded-full border border-grid bg-black/[0.03] dark:bg-white/[0.04] p-1 backdrop-blur-md shadow-xs">
              <AnimatedBackground
                defaultValue={currentActiveNav}
                className="rounded-full bg-black/10 dark:bg-white/15 shadow-xs"
                transition={{
                  type: 'spring',
                  bounce: 0.18,
                  duration: 0.28,
                }}
                enableHover
              >
                {allNav.map(x => (
                  <a
                    key={x}
                    data-id={x}
                    href={hrefFor(x)}
                    className={`inline-block px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-[.09em] transition-colors duration-200 ${
                      currentActiveNav === x
                        ? 'text-foreground font-bold'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    {x}
                  </a>
                ))}
              </AnimatedBackground>
            </div>
          )}
        </nav>

        {/* Right Action Icons & Button */}
        <div className="hidden items-center gap-3 md:flex shrink-0">
          <button
            aria-label="Toggle theme"
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-grid bg-black/[0.03] dark:bg-white/[0.04] text-muted hover:text-foreground transition-colors"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Button href="/contact">Start a project</Button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="min-h-11 min-w-11 p-2 lg:hidden text-foreground flex items-center justify-center"
          onClick={() => setOpen(!open)}
          aria-label="Open menu"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="max-h-[calc(100svh-60px)] overflow-y-auto border-t border-grid bg-[color:var(--background)]/98 backdrop-blur-2xl px-6 py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:hidden shadow-2xl">
          {allNav.map(x => (
            <a
              onClick={() => setOpen(false)}
              key={x}
              href={hrefFor(x)}
              className={`block border-b border-grid py-4 text-sm font-semibold uppercase tracking-[.12em] ${
                currentActiveNav === x ? 'text-blue dark:text-yellow' : 'text-foreground'
              }`}
            >
              {x}
            </a>
          ))}
          <div className="mt-6 flex items-center justify-between pt-2">
            <button
              onClick={toggle}
              className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted hover:text-foreground"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
              <span>{dark ? 'Light mode' : 'Dark mode'}</span>
            </button>
            <Button href="/contact">Start a project</Button>
          </div>
        </div>
      )}
    </header>
  );
}
