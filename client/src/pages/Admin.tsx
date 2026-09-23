import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Film,
  Zap,
  Users,
  MessageSquareQuote,
  Briefcase,
  Star,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  ExternalLink,
  Sun,
  Moon,
  Sparkles,
  Target,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { adminToken, ADMIN_LOGOUT_EVENT } from '@/lib/api';
import { trpc } from '@/lib/trpc';
import { useAdminContent, useSaveBlock, useServerList } from '@/admin/useAdminData';
import { ImageUploadButton } from '@/admin/ImageUploadButton';
import '../admin-theme.css';

type SectionTab =
  | 'dashboard'
  | 'campaigns'
  | 'case-studies'
  | 'headlines-stats'
  | 'blog'
  | 'team'
  | 'testimonials'
  | 'careers'
  | 'creators';

interface CampaignItem {
  id: string;
  client: string;
  category: string;
  roas: string;
  spend: string;
  status: 'Active' | 'Scaling' | 'Optimizing' | 'Completed';
  img?: string;
  hidden: boolean;
}

interface BlogPostItem {
  id: string;
  title: string;
  tag: string;
  date: string;
  readTime: string;
  hidden: boolean;
}

interface CaseStudyItem {
  id: string;
  brand: string;
  category: string;
  headline: string;
  result: string;
  image?: string;
  hidden: boolean;
}

interface StatItem {
  id: string;
  value: string;
  label: string;
  hidden: boolean;
}

interface TeamItem {
  id: string;
  name: string;
  role: string;
  bio: string;
  img?: string;
  hidden: boolean;
}

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  quote: string;
  hidden: boolean;
}

interface CareerItem {
  id: string;
  title: string;
  type: string;
  detail: string;
  hidden: boolean;
}

interface CreatorItem {
  id: string;
  name: string;
  handle: string;
  platform: string;
  reach: string;
  image?: string;
  hidden: boolean;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<SectionTab>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!adminToken.get());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const login = trpc.auth.login.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token } = await login.mutateAsync({ username, password });
      adminToken.set(token);
      setLoginError(false);
      setIsLoggedIn(true);
    } catch {
      setLoginError(true);
    }
  };

  // The saved login expired or was rejected by the backend: back to the login form.
  useEffect(() => {
    const onLogout = () => setIsLoggedIn(false);
    window.addEventListener(ADMIN_LOGOUT_EVENT, onLogout);
    return () => window.removeEventListener(ADMIN_LOGOUT_EVENT, onLogout);
  }, []);

  // Theme support
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('clyx-theme', 'dark');
      localStorage.setItem('clyx_standalone_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('clyx-theme', 'light');
      localStorage.setItem('clyx_standalone_theme', 'light');
    }
  };

  // All content lives in the backend database; every add / edit / hide / delete below is saved there.
  const { content, refetch } = useAdminContent(isLoggedIn);
  const saveBlock = useSaveBlock(refetch);

  // 1. Case Studies
  const [caseStudies, setCaseStudies] = useServerList<CaseStudyItem>('caseStudies', content, refetch, 'start');

  // 2. Headlines & Stats
  const [stats, setStats] = useServerList<StatItem>('stats', content, refetch);

  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubtext, setHeroSubtext] = useState('');
  useEffect(() => {
    const hero = content?.blocks?.hero;
    if (!hero) return;
    setHeroHeadline(hero.headline ?? '');
    setHeroSubtext(hero.sub ?? '');
  }, [content]);

  const saveHero = () => {
    const hero = content?.blocks?.hero;
    if (hero && hero.headline === heroHeadline && hero.sub === heroSubtext) return;
    saveBlock('hero', { headline: heroHeadline, sub: heroSubtext });
  };

  // 3. Team
  const [team, setTeam] = useServerList<TeamItem>('team', content, refetch);

  // 4. Testimonials
  const [testimonials, setTestimonials] = useServerList<TestimonialItem>('testimonials', content, refetch);

  // 5. Careers
  const [careers, setCareers] = useServerList<CareerItem>('careers', content, refetch);

  // 6. Creators
  const [creators, setCreators] = useServerList<CreatorItem>('creators', content, refetch);

  // Campaigns
  const [campaigns, setCampaigns] = useServerList<CampaignItem>('campaigns', content, refetch, 'start');

  // Blog Posts
  const [posts, setPosts] = useServerList<BlogPostItem>('blog', content, refetch, 'start');

  // Active editing state for in-place edit modals/forms
  const [editingId, setEditingId] = useState<string | null>(null);

  // Generic togglers
  const toggleHide = (listName: string, id: string) => {
    if (listName === 'campaigns') {
      setCampaigns((prev) =>
        prev.map((x) => (x.id === id ? { ...x, hidden: !x.hidden } : x))
      );
    } else if (listName === 'case-studies') {
      setCaseStudies((prev) =>
        prev.map((x) => (x.id === id ? { ...x, hidden: !x.hidden } : x))
      );
    } else if (listName === 'stats') {
      setStats((prev) =>
        prev.map((x) => (x.id === id ? { ...x, hidden: !x.hidden } : x))
      );
    } else if (listName === 'blog') {
      setPosts((prev) =>
        prev.map((x) => (x.id === id ? { ...x, hidden: !x.hidden } : x))
      );
    } else if (listName === 'team') {
      setTeam((prev) =>
        prev.map((x) => (x.id === id ? { ...x, hidden: !x.hidden } : x))
      );
    } else if (listName === 'testimonials') {
      setTestimonials((prev) =>
        prev.map((x) => (x.id === id ? { ...x, hidden: !x.hidden } : x))
      );
    } else if (listName === 'careers') {
      setCareers((prev) =>
        prev.map((x) => (x.id === id ? { ...x, hidden: !x.hidden } : x))
      );
    } else if (listName === 'creators') {
      setCreators((prev) =>
        prev.map((x) => (x.id === id ? { ...x, hidden: !x.hidden } : x))
      );
    }
  };

  const deleteItem = (listName: string, id: string) => {
    if (listName === 'campaigns') setCampaigns((p) => p.filter((x) => x.id !== id));
    if (listName === 'case-studies') setCaseStudies((p) => p.filter((x) => x.id !== id));
    if (listName === 'stats') setStats((p) => p.filter((x) => x.id !== id));
    if (listName === 'blog') setPosts((p) => p.filter((x) => x.id !== id));
    if (listName === 'team') setTeam((p) => p.filter((x) => x.id !== id));
    if (listName === 'testimonials') setTestimonials((p) => p.filter((x) => x.id !== id));
    if (listName === 'careers') setCareers((p) => p.filter((x) => x.id !== id));
    if (listName === 'creators') setCreators((p) => p.filter((x) => x.id !== id));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[color:var(--background)] flex items-center justify-center p-4 text-foreground">
        <div className="max-w-md w-full bg-card p-8 rounded-xl border border-border shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {loginError && <p className="text-red-500 text-sm">Invalid username or password</p>}
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel min-h-screen bg-[color:var(--background)] text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-grid bg-[color:var(--background)]/90 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <a href="/" className="display text-2xl font-bold tracking-tighter text-foreground">
            CLYX<span className="text-yellow">.</span>
          </a>
          <span className="rounded-full bg-blue/10 dark:bg-yellow/10 px-2.5 py-0.5 text-xs font-mono font-bold text-blue dark:text-yellow uppercase tracking-wider">
            Admin CMS
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex items-center gap-2 text-xs text-green-500 font-mono font-bold">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live Synced
          </span>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-grid text-muted hover:text-foreground hover:bg-muted/10 transition-colors"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/', '_blank')}
            className="h-9 gap-1.5 rounded-full text-xs font-semibold"
          >
            View Live Website <ExternalLink size={14} />
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 shrink-0 border-r border-grid p-4 hidden md:flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted">
                Core Management
              </p>
              <nav className="mt-2 space-y-1">
                <button
                  onClick={() => { setActiveTab('dashboard'); setEditingId(null); }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors',
                    activeTab === 'dashboard'
                      ? 'bg-blue text-white dark:bg-yellow dark:text-dark shadow-md'
                      : 'text-muted hover:text-foreground hover:bg-muted/10'
                  )}
                >
                  <LayoutDashboard size={16} /> Dashboard Overview
                </button>

                <button
                  onClick={() => { setActiveTab('campaigns'); setEditingId(null); }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors',
                    activeTab === 'campaigns'
                      ? 'bg-blue text-white dark:bg-yellow dark:text-dark shadow-md'
                      : 'text-muted hover:text-foreground hover:bg-muted/10'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Target size={16} /> Campaigns
                  </span>
                  <span className="text-[10px] font-mono opacity-70">
                    {campaigns.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('case-studies'); setEditingId(null); }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors',
                    activeTab === 'case-studies'
                      ? 'bg-blue text-white dark:bg-yellow dark:text-dark shadow-md'
                      : 'text-muted hover:text-foreground hover:bg-muted/10'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Film size={16} /> Case Studies
                  </span>
                  <span className="text-[10px] font-mono opacity-70">
                    {caseStudies.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('headlines-stats'); setEditingId(null); }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors',
                    activeTab === 'headlines-stats'
                      ? 'bg-blue text-white dark:bg-yellow dark:text-dark shadow-md'
                      : 'text-muted hover:text-foreground hover:bg-muted/10'
                  )}
                >
                  <Zap size={16} /> Headlines & Stats
                </button>
              </nav>
            </div>

            <div>
              <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-muted">
                Content & Brand
              </p>
              <nav className="mt-2 space-y-1">
                <button
                  onClick={() => { setActiveTab('blog'); setEditingId(null); }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors',
                    activeTab === 'blog'
                      ? 'bg-blue text-white dark:bg-yellow dark:text-dark shadow-md'
                      : 'text-muted hover:text-foreground hover:bg-muted/10'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <BookOpen size={16} /> Blog Articles
                  </span>
                  <span className="text-[10px] font-mono opacity-70">{posts.length}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('team'); setEditingId(null); }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors',
                    activeTab === 'team'
                      ? 'bg-blue text-white dark:bg-yellow dark:text-dark shadow-md'
                      : 'text-muted hover:text-foreground hover:bg-muted/10'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Users size={16} /> Leadership / Team
                  </span>
                  <span className="text-[10px] font-mono opacity-70">{team.length}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('testimonials'); setEditingId(null); }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors',
                    activeTab === 'testimonials'
                      ? 'bg-blue text-white dark:bg-yellow dark:text-dark shadow-md'
                      : 'text-muted hover:text-foreground hover:bg-muted/10'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <MessageSquareQuote size={16} /> Testimonials
                  </span>
                  <span className="text-[10px] font-mono opacity-70">{testimonials.length}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('careers'); setEditingId(null); }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors',
                    activeTab === 'careers'
                      ? 'bg-blue text-white dark:bg-yellow dark:text-dark shadow-md'
                      : 'text-muted hover:text-foreground hover:bg-muted/10'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Briefcase size={16} /> Careers Roster
                  </span>
                  <span className="text-[10px] font-mono opacity-70">{careers.length}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('creators'); setEditingId(null); }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors',
                    activeTab === 'creators'
                      ? 'bg-blue text-white dark:bg-yellow dark:text-dark shadow-md'
                      : 'text-muted hover:text-foreground hover:bg-muted/10'
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Star size={16} /> Creators Bench
                  </span>
                  <span className="text-[10px] font-mono opacity-70">{creators.length}</span>
                </button>
              </nav>
            </div>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 max-w-6xl mx-auto">
              <div>
                <span className="text-xs font-mono font-bold text-yellow uppercase tracking-[0.2em]">
                  Overview & Growth Metrics
                </span>
                <h1 className="display text-3xl md:text-4xl font-bold mt-1">
                  Real-time health of your agency footprint
                </h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-grid bg-muted/10 p-5">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted">Active Campaigns</p>
                  <p className="display text-3xl font-bold mt-2">{campaigns.length}</p>
                  <p className="text-xs text-blue dark:text-yellow font-semibold mt-1">
                    {campaigns.filter((x) => !x.hidden).length} Scaling in Meta / TikTok
                  </p>
                </div>

                <div className="rounded-2xl border border-grid bg-muted/10 p-5">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted">Case Studies</p>
                  <p className="display text-3xl font-bold mt-2">{caseStudies.length}</p>
                  <p className="text-xs text-blue dark:text-yellow font-semibold mt-1">
                    {caseStudies.filter((x) => !x.hidden).length} Published proofs
                  </p>
                </div>

                <div className="rounded-2xl border border-grid bg-muted/10 p-5">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted">Blog Articles</p>
                  <p className="display text-3xl font-bold mt-2">{posts.length}</p>
                  <p className="text-xs text-blue dark:text-yellow font-semibold mt-1">
                    {posts.filter((x) => !x.hidden).length} Live insights
                  </p>
                </div>

                <div className="rounded-2xl border border-grid bg-muted/10 p-5">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted">Creator Talent</p>
                  <p className="display text-3xl font-bold mt-2">{creators.length}</p>
                  <p className="text-xs text-green-500 font-semibold mt-1">
                    {creators.filter((x) => !x.hidden).length} Ready for whitelisting
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="display text-3xl font-bold">Paid Campaigns Hub</h1>
                  <p className="text-sm text-muted">Manage active client scaling sprints, budgets, and real-time ROAS</p>
                </div>
                <Button
                  onClick={() => {
                    const client = prompt('Client name (e.g. Kulture Skin):');
                    if (!client) return;
                    const category = prompt('Campaign type / Channel (e.g. Meta Reels & UGC):') || 'Paid Meta & TikTok';
                    const roas = prompt('ROAS metric (e.g. 3.6x):') || '3.5x';
                    const spend = prompt('Monthly spend (e.g. $50,000 / mo):') || '$30,000 / mo';
                    const newCmp: CampaignItem = {
                      id: `cmp-${Date.now()}`,
                      client,
                      category,
                      roas,
                      spend,
                      status: 'Scaling',
                      hidden: false,
                    };
                    setCampaigns([newCmp, ...campaigns]);
                  }}
                  className="rounded-full bg-blue text-white dark:bg-yellow dark:text-dark gap-1.5 text-xs font-semibold"
                >
                  <Plus size={15} /> Launch Campaign
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((cmp) => (
                  <div
                    key={cmp.id}
                    className={cn(
                      'rounded-2xl border border-grid p-6 bg-muted/5 flex flex-col justify-between space-y-4 transition-opacity',
                      cmp.hidden && 'opacity-40 bg-muted/2'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase bg-blue/10 dark:bg-yellow/10 text-blue dark:text-yellow px-2 py-0.5 rounded font-bold">
                          {cmp.status}
                        </span>
                        {cmp.hidden && (
                          <span className="text-[10px] font-mono uppercase bg-muted/20 px-2 py-0.5 rounded text-muted">
                            Hidden from site
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold mt-2">{cmp.client}</h3>
                      <p className="text-xs text-muted font-mono">{cmp.category}</p>

                      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-grid">
                        <div>
                          <p className="text-[10px] font-mono uppercase text-muted">Blended ROAS</p>
                          <p className="text-xl font-bold text-blue dark:text-yellow mt-0.5">{cmp.roas}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono uppercase text-muted">Ad Spend Pace</p>
                          <p className="text-xl font-bold text-foreground mt-0.5">{cmp.spend}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-grid pt-4">
                      <ImageUploadButton
                        onUploaded={(url) => setCampaigns((p) => p.map((x) => (x.id === cmp.id ? { ...x, img: url } : x)))}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newRoas = prompt('Edit ROAS:', cmp.roas);
                          const newSpend = prompt('Edit monthly spend:', cmp.spend);
                          if (newRoas || newSpend) {
                            setCampaigns((p) =>
                              p.map((x) =>
                                x.id === cmp.id
                                  ? { ...x, roas: newRoas || x.roas, spend: newSpend || x.spend }
                                  : x
                              )
                            );
                          }
                        }}
                        className="rounded-full text-xs gap-1"
                      >
                        <Pencil size={12} /> Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleHide('campaigns', cmp.id)}
                        className="rounded-full text-xs gap-1"
                      >
                        {cmp.hidden ? <Eye size={12} /> : <EyeOff size={12} />}
                        {cmp.hidden ? 'Show' : 'Hide'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Remove campaign for ${cmp.client}?`)) {
                            deleteItem('campaigns', cmp.id);
                          }
                        }}
                        className="rounded-full text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CASE STUDIES */}
          {activeTab === 'case-studies' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="display text-3xl font-bold">Case Studies Manager</h1>
                  <p className="text-sm text-muted">Add, edit, hide, or remove client scale outcomes</p>
                </div>
                <Button
                  onClick={() => {
                    const brand = prompt('Enter client brand name:');
                    if (!brand) return;
                    const result = prompt('Enter outcome metric (e.g. 3.9x ROAS):') || '3.5x ROAS';
                    const headline = prompt('Enter headline:') || 'Scaled creator performance loop.';
                    const newCs: CaseStudyItem = {
                      id: `cs-${Date.now()}`,
                      brand,
                      category: 'Performance / D2C',
                      headline,
                      result,
                      hidden: false,
                    };
                    setCaseStudies([newCs, ...caseStudies]);
                  }}
                  className="rounded-full bg-blue text-white dark:bg-yellow dark:text-dark gap-1.5 text-xs font-semibold"
                >
                  <Plus size={15} /> Add Case Study
                </Button>
              </div>

              <div className="space-y-4">
                {caseStudies.map((cs) => (
                  <div
                    key={cs.id}
                    className={cn(
                      'rounded-2xl border border-grid p-6 bg-muted/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-opacity',
                      cs.hidden && 'opacity-40 bg-muted/2'
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold">{cs.brand}</h3>
                        <span className="text-xs text-muted font-mono">/ {cs.category}</span>
                        {cs.hidden && (
                          <span className="text-[10px] font-mono uppercase bg-muted/20 px-2 py-0.5 rounded text-muted">
                            Hidden from site
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted">{cs.headline}</p>
                      <p className="text-xs font-mono font-bold text-blue dark:text-yellow pt-1">
                        Outcome: {cs.result}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <ImageUploadButton
                        iconSize={13}
                        onUploaded={(url) => setCaseStudies((p) => p.map((x) => (x.id === cs.id ? { ...x, image: url } : x)))}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newResult = prompt('Edit verified outcome:', cs.result);
                          if (newResult) {
                            setCaseStudies((p) =>
                              p.map((x) => (x.id === cs.id ? { ...x, result: newResult } : x))
                            );
                          }
                        }}
                        className="rounded-full text-xs gap-1"
                      >
                        <Pencil size={13} /> Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleHide('case-studies', cs.id)}
                        className="rounded-full text-xs gap-1"
                      >
                        {cs.hidden ? <Eye size={13} /> : <EyeOff size={13} />}
                        {cs.hidden ? 'Show' : 'Hide'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Delete case study for ${cs.brand}?`)) {
                            deleteItem('case-studies', cs.id);
                          }
                        }}
                        className="rounded-full text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: HEADLINES & STATS */}
          {activeTab === 'headlines-stats' && (
            <div className="space-y-8 max-w-6xl mx-auto">
              <div>
                <h1 className="display text-3xl font-bold">Headlines & Live Stats</h1>
                <p className="text-sm text-muted">Directly tune proof metrics and website copy</p>
              </div>

              {/* Hero Copy Card */}
              <div className="rounded-2xl border border-grid p-6 bg-muted/5 space-y-4">
                <h3 className="text-base font-bold">Main Hero Headline Copy</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted font-mono uppercase">Primary Headline</label>
                    <Input
                      value={heroHeadline}
                      onChange={(e) => setHeroHeadline(e.target.value)}
                      onBlur={saveHero}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted font-mono uppercase">Supporting Subtext</label>
                    <Textarea
                      value={heroSubtext}
                      onChange={(e) => setHeroSubtext(e.target.value)}
                      onBlur={saveHero}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Proof Strip Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold">Proof Band Numbers</h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      const value = prompt('Enter stat value (e.g. 5.2x):');
                      if (!value) return;
                      const label = prompt('Enter description:') || 'Verified metric';
                      setStats([...stats, { id: `st-${Date.now()}`, value, label, hidden: false }]);
                    }}
                    className="rounded-full bg-blue text-white dark:bg-yellow dark:text-dark gap-1 text-xs"
                  >
                    <Plus size={14} /> Add Metric
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.map((s) => (
                    <div
                      key={s.id}
                      className={cn(
                        'rounded-2xl border border-grid p-5 bg-muted/5 flex flex-col justify-between space-y-4',
                        s.hidden && 'opacity-40'
                      )}
                    >
                      <div>
                        <p className="display text-4xl font-bold text-foreground">{s.value}</p>
                        <p className="text-xs text-muted mt-2">{s.label}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-grid pt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const val = prompt('Edit number:', s.value);
                            if (val) {
                              setStats((p) => p.map((x) => (x.id === s.id ? { ...x, value: val } : x)));
                            }
                          }}
                          className="text-xs h-7 px-2"
                        >
                          <Pencil size={12} className="mr-1" /> Edit
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHide('stats', s.id)}
                          className="text-xs h-7 px-2"
                        >
                          {s.hidden ? <Eye size={12} /> : <EyeOff size={12} />}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem('stats', s.id)}
                          className="text-xs h-7 px-2 text-red-500"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: BLOG */}
          {activeTab === 'blog' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="display text-3xl font-bold">Blog & Journal Articles</h1>
                  <p className="text-sm text-muted">Create, edit, archive, or publish articles on /blog</p>
                </div>
                <Button
                  onClick={() => {
                    const title = prompt('Article headline:');
                    if (!title) return;
                    const tag = prompt('Tag/Topic (e.g. Performance, Creator economy):') || 'Growth';
                    const date = prompt('Publish date (e.g. 15.09.25):') || '20.09.25';
                    const readTime = prompt('Read time (e.g. 5 min read):') || '4 min read';
                    const newPost: BlogPostItem = {
                      id: `post-${Date.now()}`,
                      title,
                      tag,
                      date,
                      readTime,
                      hidden: false,
                    };
                    setPosts([newPost, ...posts]);
                  }}
                  className="rounded-full bg-blue text-white dark:bg-yellow dark:text-dark gap-1.5 text-xs font-semibold"
                >
                  <Plus size={15} /> Write New Article
                </Button>
              </div>

              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className={cn(
                      'rounded-2xl border border-grid p-6 bg-muted/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-opacity',
                      post.hidden && 'opacity-40 bg-muted/2'
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono uppercase bg-blue/10 dark:bg-yellow/10 text-blue dark:text-yellow px-2 py-0.5 rounded font-bold">
                          {post.tag}
                        </span>
                        <span className="text-xs text-muted font-mono">{post.date}</span>
                        <span className="text-xs text-muted font-mono">· {post.readTime}</span>
                        {post.hidden && (
                          <span className="text-[10px] font-mono uppercase bg-muted/20 px-2 py-0.5 rounded text-muted">
                            Draft / Hidden
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold pt-1">{post.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newTitle = prompt('Edit title:', post.title);
                          const newTag = prompt('Edit tag:', post.tag);
                          if (newTitle || newTag) {
                            setPosts((p) =>
                              p.map((x) =>
                                x.id === post.id
                                  ? { ...x, title: newTitle || x.title, tag: newTag || x.tag }
                                  : x
                              )
                            );
                          }
                        }}
                        className="rounded-full text-xs gap-1"
                      >
                        <Pencil size={12} /> Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleHide('blog', post.id)}
                        className="rounded-full text-xs gap-1"
                      >
                        {post.hidden ? <Eye size={12} /> : <EyeOff size={12} />}
                        {post.hidden ? 'Publish' : 'Hide'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Delete article: "${post.title}"?`)) {
                            deleteItem('blog', post.id);
                          }
                        }}
                        className="rounded-full text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TEAM */}
          {activeTab === 'team' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="display text-3xl font-bold">Leadership & Team</h1>
                  <p className="text-sm text-muted">Manage partner profiles, roles, and biographies</p>
                </div>
                <Button
                  onClick={() => {
                    const name = prompt('Enter full name:');
                    if (!name) return;
                    const role = prompt('Enter role (e.g. Creative Director):') || 'Partner';
                    const bio = prompt('Enter short bio:') || 'Directing growth and creative systems.';
                    setTeam([...team, { id: `tm-${Date.now()}`, name, role, bio, hidden: false }]);
                  }}
                  className="rounded-full bg-blue text-white dark:bg-yellow dark:text-dark gap-1.5 text-xs font-semibold"
                >
                  <Plus size={15} /> Add Team Member
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {team.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'rounded-2xl border border-grid p-6 bg-muted/5 flex flex-col justify-between space-y-4',
                      m.hidden && 'opacity-40'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="display text-2xl font-bold">{m.name}</h3>
                        {m.hidden && (
                          <span className="text-[9px] font-mono uppercase bg-muted/20 px-1.5 py-0.5 rounded text-muted">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono font-bold text-blue dark:text-yellow uppercase tracking-wider mt-1">
                        {m.role}
                      </p>
                      <p className="text-xs text-muted mt-3 leading-relaxed">{m.bio}</p>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-grid pt-4">
                      <ImageUploadButton
                        className="rounded-full text-xs h-8 gap-1"
                        onUploaded={(url) => setTeam((p) => p.map((x) => (x.id === m.id ? { ...x, img: url } : x)))}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newBio = prompt('Edit biography:', m.bio);
                          if (newBio) {
                            setTeam((p) => p.map((x) => (x.id === m.id ? { ...x, bio: newBio } : x)));
                          }
                        }}
                        className="rounded-full text-xs h-8"
                      >
                        <Pencil size={12} className="mr-1" /> Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleHide('team', m.id)}
                        className="rounded-full text-xs h-8"
                      >
                        {m.hidden ? <Eye size={12} /> : <EyeOff size={12} />}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Remove ${m.name}?`)) deleteItem('team', m.id);
                        }}
                        className="rounded-full text-xs h-8 text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TESTIMONIALS */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="display text-3xl font-bold">Client Reviews & Testimonials</h1>
                  <p className="text-sm text-muted">Quotes from founder partners featured in the marquee track</p>
                </div>
                <Button
                  onClick={() => {
                    const name = prompt('Client name:');
                    if (!name) return;
                    const role = prompt('Role / Brand:') || 'Founder';
                    const quote = prompt('Testimonial quote:') || 'Working with CLYX scaled our creative engine.';
                    setTestimonials([
                      ...testimonials,
                      { id: `ts-${Date.now()}`, name, role, quote, hidden: false },
                    ]);
                  }}
                  className="rounded-full bg-blue text-white dark:bg-yellow dark:text-dark gap-1.5 text-xs font-semibold"
                >
                  <Plus size={15} /> Add Testimonial
                </Button>
              </div>

              <div className="space-y-4">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      'rounded-2xl border border-grid p-6 bg-muted/5 flex flex-col md:flex-row md:items-center justify-between gap-4',
                      t.hidden && 'opacity-40'
                    )}
                  >
                    <div className="max-w-2xl space-y-1">
                      <p className="display text-lg font-semibold italic text-foreground">“{t.quote}”</p>
                      <p className="text-xs font-bold text-blue dark:text-yellow pt-1">
                        {t.name} <span className="text-muted font-normal">· {t.role}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const quote = prompt('Edit quote:', t.quote);
                          if (quote) {
                            setTestimonials((p) =>
                              p.map((x) => (x.id === t.id ? { ...x, quote } : x))
                            );
                          }
                        }}
                        className="rounded-full text-xs"
                      >
                        <Pencil size={12} className="mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleHide('testimonials', t.id)}
                        className="rounded-full text-xs"
                      >
                        {t.hidden ? <Eye size={12} /> : <EyeOff size={12} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem('testimonials', t.id)}
                        className="rounded-full text-xs text-red-500"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CAREERS */}
          {activeTab === 'careers' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="display text-3xl font-bold">Careers & Job Openings</h1>
                  <p className="text-sm text-muted">Post or archive roles displayed on the /careers page</p>
                </div>
                <Button
                  onClick={() => {
                    const title = prompt('Role title (e.g. Lead Media Buyer):');
                    if (!title) return;
                    const type = prompt('Location/Type (e.g. Full-time / Remote):') || 'Full-time / Remote';
                    const detail = prompt('Brief description:') || 'Lead paid media scaling sprints.';
                    setCareers([...careers, { id: `cr-${Date.now()}`, title, type, detail, hidden: false }]);
                  }}
                  className="rounded-full bg-blue text-white dark:bg-yellow dark:text-dark gap-1.5 text-xs font-semibold"
                >
                  <Plus size={15} /> Post New Role
                </Button>
              </div>

              <div className="space-y-4">
                {careers.map((c) => (
                  <div
                    key={c.id}
                    className={cn(
                      'rounded-2xl border border-grid p-6 bg-muted/5 flex flex-col md:flex-row md:items-center justify-between gap-4',
                      c.hidden && 'opacity-40'
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold">{c.title}</h3>
                        <span className="text-xs font-mono text-muted uppercase tracking-wider">
                          {c.type}
                        </span>
                        {c.hidden && (
                          <span className="text-[10px] font-mono uppercase bg-muted/20 px-2 py-0.5 rounded text-muted">
                            Archived
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted mt-1 max-w-xl">{c.detail}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const detail = prompt('Edit description:', c.detail);
                          if (detail) {
                            setCareers((p) => p.map((x) => (x.id === c.id ? { ...x, detail } : x)));
                          }
                        }}
                        className="rounded-full text-xs"
                      >
                        <Pencil size={12} className="mr-1" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleHide('careers', c.id)}
                        className="rounded-full text-xs"
                      >
                        {c.hidden ? <Eye size={12} /> : <EyeOff size={12} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem('careers', c.id)}
                        className="rounded-full text-xs text-red-500"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CREATORS */}
          {activeTab === 'creators' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="display text-3xl font-bold">Creator Network Bench</h1>
                  <p className="text-sm text-muted">Manage whitelisted handles and creative talent</p>
                </div>
                <Button
                  onClick={() => {
                    const name = prompt('Creator name:');
                    if (!name) return;
                    const handle = prompt('Social handle (e.g. @creator):') || '@creator';
                    const platform = prompt('Platform (Instagram, TikTok, YouTube):') || 'Instagram';
                    const reach = prompt('Reach (e.g. 500K):') || '500K';
                    setCreators([
                      ...creators,
                      { id: `c-${Date.now()}`, name, handle, platform, reach, hidden: false },
                    ]);
                  }}
                  className="rounded-full bg-blue text-white dark:bg-yellow dark:text-dark gap-1.5 text-xs font-semibold"
                >
                  <Plus size={15} /> Add Creator
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {creators.map((cr) => (
                  <div
                    key={cr.id}
                    className={cn(
                      'rounded-2xl border border-grid p-5 bg-muted/5 flex flex-col justify-between space-y-4',
                      cr.hidden && 'opacity-40'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted">
                        <span>{cr.platform}</span>
                        <span>{cr.reach}</span>
                      </div>
                      <h4 className="text-lg font-bold mt-2">{cr.name}</h4>
                      <p className="text-xs font-mono text-blue dark:text-yellow">{cr.handle}</p>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-grid pt-3">
                      <ImageUploadButton
                        variant="ghost"
                        className="text-xs h-7 px-2 gap-1"
                        onUploaded={(url) => setCreators((p) => p.map((x) => (x.id === cr.id ? { ...x, image: url } : x)))}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHide('creators', cr.id)}
                        className="text-xs h-7 px-2"
                      >
                        {cr.hidden ? <Eye size={12} /> : <EyeOff size={12} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem('creators', cr.id)}
                        className="text-xs h-7 px-2 text-red-500"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
