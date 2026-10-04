import { useCallback, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { ExternalLink, GraduationCap, Images, LayoutDashboard, LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { adminToken, ADMIN_LOGOUT_EVENT } from '@/lib/api';
import { trpc } from '@/lib/trpc';
import { PAGES, pageById, type PageId } from '@/lib/pageContent';
import { useAdminContent, useSaveBlock } from '@/admin/useAdminData';
import LoginScreen from '@/admin/LoginScreen';
import Dashboard from '@/admin/Dashboard';
import PageEditor from '@/admin/PageEditor';
import MediaLibrary from '@/admin/MediaLibrary';
import CourseOrders from '@/admin/CourseOrders';
import { PAGE_ICONS } from '@/admin/nav';
import { Confirm } from '@/admin/ui';
import BrandLogo from '@/components/ui/BrandLogo';
import '../admin-theme.css';

type View = { kind: 'dashboard' } | { kind: 'media' } | { kind: 'orders' } | { kind: 'page'; id: PageId };

// The open screen lives in the URL hash (#/page/about), so a reload keeps you where you were.
function viewFromHash(): View {
  const [, kind, id] = window.location.hash.replace(/^#/, '').split('/');
  if (kind === 'media') return { kind: 'media' };
  if (kind === 'orders') return { kind: 'orders' };
  if (kind === 'page' && PAGES.some((p) => p.id === id)) return { kind: 'page', id: id as PageId };
  return { kind: 'dashboard' };
}
const hashFor = (view: View) => (view.kind === 'page' ? `#/page/${view.id}` : view.kind === 'media' ? '#/media' : view.kind === 'orders' ? '#/orders' : '#/');
const sameView = (a: View, b: View) => hashFor(a) === hashFor(b);

type Theme = 'light' | 'dark';
const THEME_KEY = 'clyx-admin-theme';
function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // storage unavailable
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!adminToken.get());
  const [loginError, setLoginError] = useState<string | null>(null);
  const login = trpc.auth.login.useMutation();
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // storage unavailable
    }
  }, [theme]);

  // The saved login expired or was rejected by the backend: back to the login form.
  useEffect(() => {
    const onLogout = () => setIsLoggedIn(false);
    window.addEventListener(ADMIN_LOGOUT_EVENT, onLogout);
    return () => window.removeEventListener(ADMIN_LOGOUT_EVENT, onLogout);
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const { token } = await login.mutateAsync({ username, password });
      adminToken.set(token);
      setLoginError(null);
      setIsLoggedIn(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setLoginError(/too many/i.test(message) ? message : 'Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="adm" data-theme={theme}>
      <Toaster position="top-right" theme={theme} richColors closeButton />
      {isLoggedIn ? (
        <Console theme={theme} onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} onLogout={() => {
          adminToken.clear();
          setIsLoggedIn(false);
        }} />
      ) : (
        <LoginScreen onLogin={handleLogin} pending={login.isPending} error={loginError} />
      )}
    </div>
  );
}

function Console({ theme, onToggleTheme, onLogout }: { theme: Theme; onToggleTheme: () => void; onLogout: () => void }) {
  const { content, refetch } = useAdminContent(true);
  const saveBlock = useSaveBlock(refetch);
  const [view, setView] = useState<View>(viewFromHash);
  const [dirty, setDirty] = useState(false);
  const [pendingView, setPendingView] = useState<View | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const go = useCallback(
    (next: View) => {
      setMenuOpen(false);
      if (sameView(next, view)) return;
      if (dirty) {
        setPendingView(next);
        return;
      }
      setView(next);
      window.history.replaceState(null, '', hashFor(next));
      document.querySelector('.adm-main')?.scrollTo({ top: 0 });
    },
    [view, dirty],
  );

  const onDirtyChange = useCallback((d: boolean) => setDirty(d), []);

  const navItem = (target: View, label: string, Icon: typeof LayoutDashboard, extra?: string) => {
    const active = sameView(target, view);
    return (
      <button key={label} type="button" className={`adm-nav-item${active ? ' is-active' : ''}`} onClick={() => go(target)}>
        <span className="adm-nav-icon">
          <Icon size={17} />
        </span>
        <span className="adm-nav-label">{label}</span>
        {extra && <span className="adm-nav-extra">{extra}</span>}
      </button>
    );
  };

  const title = view.kind === 'page' ? pageById(view.id).label : view.kind === 'media' ? 'Media' : view.kind === 'orders' ? 'Course orders' : 'Dashboard';

  return (
    <div className={`adm-shell${menuOpen ? ' menu-open' : ''}`}>
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <a href="/" target="_blank" rel="noreferrer" className="adm-logo" aria-label="CLYX Media site">
            <BrandLogo size={42} />
          </a>
          <span className="adm-brand-tag">Admin</span>
          <button type="button" className="adm-icon-btn adm-sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="adm-nav">
          <p className="adm-nav-title">Overview</p>
          {navItem({ kind: 'dashboard' }, 'Dashboard', LayoutDashboard)}

          <p className="adm-nav-title">Sales</p>
          {navItem({ kind: 'orders' }, 'Course orders', GraduationCap)}

          <p className="adm-nav-title">Website pages</p>
          {PAGES.filter((p) => p.id !== 'global').map((p) => navItem({ kind: 'page', id: p.id }, p.label, PAGE_ICONS[p.id], p.route))}

          <p className="adm-nav-title">Site-wide</p>
          {navItem({ kind: 'page', id: 'global' }, pageById('global').label, PAGE_ICONS.global, 'all pages')}

          <p className="adm-nav-title">Library</p>
          {navItem({ kind: 'media' }, 'Media', Images)}
        </nav>

        <div className="adm-sidebar-foot">
          <div className="adm-user">
            <span className="adm-avatar">A</span>
            <div>
              <strong>Admin</strong>
              <small>
                <span className="adm-dot is-live" /> Signed in
              </small>
            </div>
            <button type="button" className="adm-icon-btn is-glass" onClick={onLogout} title="Sign out" aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="adm-scrim" onClick={() => setMenuOpen(false)} />

      <div className="adm-body">
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <button type="button" className="adm-icon-btn adm-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu size={19} />
            </button>
            <div className="adm-crumbs">
              <span>Admin</span>
              <span className="adm-crumb-sep">/</span>
              {view.kind === 'page' && (
                <>
                  <span>Pages</span>
                  <span className="adm-crumb-sep">/</span>
                </>
              )}
              <strong>{title}</strong>
            </div>
          </div>
          <div className="adm-topbar-right">
            <span className="adm-sync">
              <span className={`adm-dot ${content ? 'is-live' : 'is-warn'}`} />
              {content ? 'Live synced' : 'Connecting…'}
            </span>
            <button type="button" className="adm-icon-btn is-outline" onClick={onToggleTheme} aria-label="Toggle theme" title="Toggle theme">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a className="adm-btn is-outline" href="/" target="_blank" rel="noreferrer">
              <span className="adm-hide-sm">View website</span> <ExternalLink size={14} />
            </a>
          </div>
        </header>

        <main className="adm-main">
          {!content ? (
            <div className="adm-page">
              <div className="adm-hero is-skeleton" />
              <div className="adm-stats">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="adm-stat is-skeleton" />
                ))}
              </div>
            </div>
          ) : view.kind === 'dashboard' ? (
            <Dashboard content={content} onOpenPage={(id) => go({ kind: 'page', id })} />
          ) : view.kind === 'media' ? (
            <MediaLibrary />
          ) : view.kind === 'orders' ? (
            <CourseOrders />
          ) : (
            <PageEditor page={pageById(view.id)} content={content} refetch={refetch} saveBlock={saveBlock} onDirtyChange={onDirtyChange} />
          )}
        </main>
      </div>

      <Confirm
        open={!!pendingView}
        title="Leave without publishing?"
        message="You have unsaved changes on this page. If you leave now they will be lost."
        confirmLabel="Discard & leave"
        onCancel={() => setPendingView(null)}
        onConfirm={() => {
          const next = pendingView;
          setPendingView(null);
          setDirty(false);
          if (next) {
            setView(next);
            window.history.replaceState(null, '', hashFor(next));
          }
        }}
      />
    </div>
  );
}
