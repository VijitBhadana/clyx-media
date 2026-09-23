import { lazy, Suspense } from 'react';
import { Route, Switch } from 'wouter';
import ErrorBoundary from './components/ErrorBoundary';

const LandingV1 = lazy(() => import('./pages/LandingV1'));
const About = lazy(() => import('./pages/About'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Contact = lazy(() => import('./pages/Contact'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const Creators = lazy(() => import('./pages/Creators'));
const Blog = lazy(() => import('./pages/Blog'));
const Careers = lazy(() => import('./pages/Careers'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

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
  return (
    <ErrorBoundary>
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
          <Route path="/careers" component={Careers} />
          <Route path="/contact" component={Contact} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}
