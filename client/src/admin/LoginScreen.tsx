import { useState, type FormEvent } from 'react';
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, ShieldCheck, User, Zap } from 'lucide-react';
import { PAGES } from '@/lib/pageContent';
import BrandLogo from '@/components/ui/BrandLogo';
import { PAGE_ICONS } from './nav';

export default function LoginScreen({
  onLogin,
  pending,
  error,
}: {
  onLogin: (username: string, password: string) => void;
  pending: boolean;
  error: string | null;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onLogin(username.trim(), password);
  };

  return (
    <div className="adm-login">
      <section className="adm-login-art" aria-hidden="true">
        <div className="adm-login-grid" />
        <div className="adm-login-orb is-blue" />
        <div className="adm-login-orb is-yellow" />

        <div className="adm-login-brand">
          <BrandLogo size={64} />
          <em>Studio</em>
        </div>

        <div className="adm-login-copy">
          <p className="adm-login-kicker">
            <span className="adm-dot is-live" /> Content control room
          </p>
          <h2>
            Every page.
            <br />
            Every word.
            <br />
            <span>One place.</span>
          </h2>
          <p>Edit headlines, images, case studies and team profiles — and watch them go live on the website instantly.</p>
        </div>

        <div className="adm-login-float is-one">
          <span className="adm-login-float-icon">
            <Zap size={16} />
          </span>
          <div>
            <strong>Published</strong>
            <small>Home · Hero banner updated</small>
          </div>
        </div>
        <div className="adm-login-float is-two">
          <p className="adm-login-float-title">Website pages</p>
          <div className="adm-login-chips">
            {PAGES.filter((p) => p.id !== 'global').slice(0, 6).map((p) => {
              const Icon = PAGE_ICONS[p.id];
              return (
                <span key={p.id}>
                  <Icon size={12} /> {p.label}
                </span>
              );
            })}
          </div>
        </div>

        <p className="adm-login-foot">© {new Date().getFullYear()} CLYX Media · Admin CMS</p>
      </section>

      <section className="adm-login-panel">
        <form className="adm-login-card" onSubmit={submit}>
          <div className="adm-login-mobile-brand">
            <BrandLogo size={56} />
          </div>
          <span className="adm-login-badge">
            <ShieldCheck size={14} /> Secure admin access
          </span>
          <h1>Welcome back</h1>
          <p className="adm-login-sub">Sign in to manage the CLYX website.</p>

          <label className="adm-login-field">
            <span>Username</span>
            <div className={`adm-login-input${error ? ' has-error' : ''}`}>
              <User size={17} />
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>
          </label>

          <label className="adm-login-field">
            <span>Password</span>
            <div className={`adm-login-input${error ? ' has-error' : ''}`}>
              <Lock size={17} />
              <input
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>

          {error && (
            <p className="adm-login-error" role="alert">
              <AlertCircle size={16} /> {error}
            </p>
          )}

          <button type="submit" className="adm-login-submit" disabled={pending}>
            {pending ? <Loader2 size={18} className="adm-spin" /> : null}
            {pending ? 'Signing in…' : 'Sign in to dashboard'}
            {!pending && <ArrowRight size={18} />}
          </button>

          <a href="/" className="adm-login-back">
            <ArrowLeft size={15} /> Back to website
          </a>
        </form>
      </section>
    </div>
  );
}
