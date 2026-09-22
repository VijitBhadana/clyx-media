import { Route, Switch } from 'wouter';
import LandingV1 from './pages/LandingV1';
import About from './pages/About';
import ServicesPage from './pages/ServicesPage';
import Portfolio from './pages/Portfolio';
import Contact from './pages/Contact';
import CaseStudies from './pages/CaseStudies';
import Creators from './pages/Creators';
import Blog from './pages/Blog';
import Careers from './pages/Careers';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
export default function App(){return <Switch><Route path="/" component={LandingV1}/><Route path="/admin" component={Admin}/><Route path="/admin/" component={Admin}/><Route path="/about" component={About}/><Route path="/services" component={ServicesPage}/><Route path="/portfolio" component={Portfolio}/><Route path="/case-studies" component={CaseStudies}/><Route path="/creators" component={Creators}/><Route path="/blog" component={Blog}/><Route path="/careers" component={Careers}/><Route path="/contact" component={Contact}/><Route component={NotFound}/></Switch>}
