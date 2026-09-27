import { lazy, Suspense, useEffect, useState, type ComponentType } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import ErrorBoundary from './components/ErrorBoundary';
import { useClientNavigation } from './hooks/useClientNavigation';
import './lib/introLoader';

type PageModule = { default: ComponentType<any> };

/**
 * A code-split page that can be downloaded ahead of time. Once its code is in, it renders straight away instead
 * of flashing the loading screen, so switching pages feels instant.
 */
function page(load: () => Promise<PageModule>) {
  let loaded: ComponentType<any> | undefined;
  const fetchPage = () => load().then((m) => { loaded = m.default; return m; });
  const Lazy = lazy(fetchPage);
  // Chosen once per mount, so a page that mounted through Lazy is never swapped (and remounted) mid-visit.
  function Page(props: object) {
    const [Component] = useState<ComponentType<any>>(() => loaded ?? Lazy);
    return <Component {...props} />;
  }
  return Object.assign(Page, { preload: () => { if (!loaded) fetchPage().catch(() => {}); } });
}

const LandingV1 = page(() => import('./pages/LandingV1'));
const About = page(() => import('./pages/About'));
const ServicesPage = page(() => import('./pages/ServicesPage'));
const Portfolio = page(() => import('./pages/Portfolio'));
const Contact = page(() => import('./pages/Contact'));
const CaseStudies = page(() => import('./pages/CaseStudies'));
const Creators = page(() => import('./pages/Creators'));
const Blog = page(() => import('./pages/Blog'));
const BlogPost = page(() => import('./pages/BlogPost'));
const Careers = page(() => import('./pages/Careers'));
const Admin = lazy(() => import('./admin/AdminApp'));
const NotFound = page(() => import('./pages/NotFound'));

// The public pages are small; fetching them while the browser is idle makes every menu click instant.
// The admin panel is left out: visitors never need it.
const PUBLIC_PAGES = [LandingV1, About, ServicesPage, Portfolio, CaseStudies, Creators, Blog, BlogPost, Careers, Contact, NotFound];

function usePreloadPages() {
  useEffect(() => {
    const run = () => PUBLIC_PAGES.forEach((p) => p.preload());
    const idle = (cb: () => void) =>
      'requestIdleCallback' in window ? window.requestIdleCallback(cb, { timeout: 4000 }) : setTimeout(cb, 2000) as unknown as number;
    let handle: number | undefined;
    const start = () => { handle = idle(run); };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      if (handle === undefined) return;
      if ('cancelIdleCallback' in window) window.cancelIdleCallback(handle);
      else clearTimeout(handle);
    };
  }, []);
}

function RouteFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background, #050505)',
      }}
      aria-label="Loading"
      role="status"
    />
  );
}

export default function App() {
  const [location] = useLocation();
  useClientNavigation();
  usePreloadPages();
  return (
    // Keyed by route so a page that crashed does not keep showing the error screen on the next page.
    <ErrorBoundary key={location}>
      <Suspense fallback={<RouteFallback />}>
        <Switch>
          <Route path="/" component={LandingV1} />
          <Route path="/admin" component={Admin} />
          <Route path="/admin/" component={Admin} />
          <Route path="/about" component={About} />
          <Route path="/services" component={ServicesPage} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/case-studies" component={CaseStudies} />
          <Route path="/creators" component={Creators} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:slug" component={BlogPost} />
          <Route path="/careers" component={Careers} />
          <Route path="/contact" component={Contact} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}
