import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ArrowLeft, Check, Eye, EyeOff, Mail } from 'lucide-react';
import { authClient } from '../../lib/auth-client';

interface AuthViewProps {
  mode: 'signin' | 'signup' | null;
  onSetMode: (mode: 'signin' | 'signup') => void;
  onBack: () => void;
  /** Called after a successful sign-in/sign-up; origin tells which form fired. */
  onSuccess: (origin: 'signin' | 'signup') => void;
}

/**
 * Auth pages — a faithful port of the provided HTML design, mapped onto the
 * app's existing design tokens. Rendered as its own full page (no left brand
 * panel, no modal overlay): a top-left back arrow + a centered brand and
 * tabbed Sign In / Create Account form. Wired to Better Auth (email/password,
 * MongoDB adapter) via `src/lib/auth-client`.
 */
export const AuthView: React.FC<AuthViewProps> = ({ mode, onSetMode, onBack, onSuccess }) => {
  const [tab, setTab] = useState<'signin' | 'signup'>(mode ?? 'signup');

  // Keep internal tab in sync if opened directly to one mode.
  useEffect(() => {
    if (mode) setTab(mode);
  }, [mode]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-ink flex flex-col"
    >
      {/* Top-left back arrow → returns to the homepage */}
      <header className="w-full max-w-[460px] mx-auto px-6 pt-6">
        <button
          onClick={onBack}
          aria-label="Back to homepage"
          className="w-9 h-9 -ml-2 flex items-center justify-center rounded-lg text-text-dim hover:text-text hover:bg-surface-2 transition cursor-pointer"
        >
          <ArrowLeft className="w-[18px] h-[18px]" />
        </button>
      </header>

      {/* Centered brand + tabbed form */}
      <main className="flex items-center justify-center px-6 sm:px-10 py-10 sm:py-14 flex-1">
        <div className="w-full max-w-[400px]">
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <BrandMark />
            <span className="font-display font-bold text-[19px] tracking-tight text-text">
              SQL<span className="text-func">ens</span>
            </span>
          </div>

          <AuthTabs tab={tab} onTabChange={setTab} />

          {tab === 'signin' ? (
            <SignInForm onSwitch={() => setTab('signup')} onSuccess={onSuccess} />
          ) : (
            <SignUpForm onSwitch={() => setTab('signin')} onSuccess={onSuccess} />
          )}
        </div>
      </main>
    </motion.div>
  );
};

/* ========================================================================== */
/* Shared bits                                                                 */
/* ========================================================================== */

function BrandMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 30 30" fill="none" className="shrink-0">
      <circle cx="12.5" cy="12.5" r="9" stroke="var(--func)" strokeWidth="2" />
      <line x1="19" y1="19" x2="26" y2="26" stroke="var(--func)" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="8" y1="10.5" x2="17" y2="10.5" stroke="#d8d8d3" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8" y1="14.5" x2="15" y2="14.5" stroke="#d8d8d3" strokeWidth="1.6" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

function AuthTabs({ tab, onTabChange }: { tab: 'signin' | 'signup'; onTabChange: (t: 'signin' | 'signup') => void }) {
  return (
    <div className="relative flex bg-surface border border-border rounded-full p-1 mb-8 select-none">
      <span
        aria-hidden
        className={`absolute top-1 left-1 w-[calc(50%-4px)] h-[calc(100%-8px)] bg-ink border border-border rounded-full transition-transform duration-200 ease-out ${
          tab === 'signup' ? 'translate-x-full' : ''
        }`}
      />
      <button
        type="button"
        onClick={() => onTabChange('signin')}
        className={`relative flex-1 py-2 rounded-full text-[13.5px] font-semibold transition-colors cursor-pointer ${
          tab === 'signin' ? 'text-func' : 'text-text-dim hover:text-text'
        }`}
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => onTabChange('signup')}
        className={`relative flex-1 py-2 rounded-full text-[13.5px] font-semibold transition-colors cursor-pointer ${
          tab === 'signup' ? 'text-func' : 'text-text-dim hover:text-text'
        }`}
      >
        Sign Up
      </button>
    </div>
  );
}
function OAuthButtons() {
  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        className="w-full flex items-center justify-center gap-2.5 bg-surface border border-border rounded-[8px] px-3.5 py-2.5 text-sm font-medium text-text hover:bg-surface-2 transition cursor-pointer"
      >
        <svg width="17" height="17" viewBox="0 0 48 48">
          <path fill="#e6e6e2" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
          <path fill="#55554f" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#93938e" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z" />
          <path fill="#d8d8d3" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
        </svg>
        <span>Continue with Google</span>
      </button>
      <button
        type="button"
        className="w-full flex items-center justify-center gap-2.5 bg-surface border border-border rounded-[8px] px-3.5 py-2.5 text-sm font-medium text-text hover:bg-surface-2 transition cursor-pointer"
      >
        <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
        </svg>
        <span>Continue with GitHub</span>
      </button>
    </div>
  );
}

function Divider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-text-faint font-mono text-[11px]">
      <span className="flex-1 h-px bg-border" />
      {text}
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 font-mono text-xs text-error bg-error/10 border border-error/30 px-3 py-2 rounded-[8px]"
    >
      <AlertCircle className="w-[14px] h-[14px] shrink-0 mt-px" strokeWidth={2.5} />
      <span className="leading-snug">{message}</span>
    </div>
  );
}

/* ========================================================================== */
/* Sign In                                                                     */
/* ========================================================================== */

function SignInForm({ onSwitch, onSuccess }: { onSwitch: () => void; onSuccess: (origin: 'signin' | 'signup') => void }) {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setNeedsVerification(false);
    try {
      const res = await authClient.signIn.email({ email, password, rememberMe });
      if (res.error) {
        // Unverified email — the server refuses sign-in until the inbox link
        // has been clicked; point the user at the verification hub.
        if (res.error.message === 'EMAIL_NOT_VERIFIED') {
          setNeedsVerification(true);
          setError('Please verify your email address before signing in. We sent you a link when you signed up.');
        }
        // Blocked accounts are rejected server-side with ACCOUNT_BLOCKED.
        else if (res.error.message === 'ACCOUNT_BLOCKED' || res.error.status === 403) {
          setError(
            'This account has been suspended by an administrator. If you believe this is a mistake, contact the site administrator.'
          );
        } else {
          setError(res.error.message ?? 'Unable to sign in. Check your email and password.');
        }
        setLoading(false);
        return;
      }
      // Success — component unmounts as the app navigates back home.
      onSuccess('signin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-[18px]" onSubmit={handleSubmit} noValidate>
      <div>
        <h2 className="font-display font-semibold text-[22px] mb-1">Welcome back</h2>
        <p className="text-text-dim text-[13.5px] mb-1">Day 2 is waiting — pick up right where you left off.</p>
      </div>

      <OAuthButtons />

      <Divider text="or sign in with email" />

      <div className="flex flex-col gap-[7px]">
        <label className="font-mono text-[11.5px] tracking-[0.03em] text-text-dim uppercase" htmlFor="si-email">Email</label>
        <input
          id="si-email"
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface border border-border rounded-[8px] px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-func focus:ring-[3px] focus:ring-[rgba(244,196,48,0.18)] transition"
        />
      </div>

      <div className="flex flex-col gap-[7px]">
        <label className="font-mono text-[11.5px] tracking-[0.03em] text-text-dim uppercase" htmlFor="si-pw">Password</label>
        <div className="relative">
          <input
            id="si-pw"
            type={showPw ? 'text' : 'password'}
            placeholder="⬢⬢⬢⬢⬢⬢⬢⬢"
            data-pw
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface border border-border rounded-[8px] px-3.5 py-2.5 pr-10 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-func focus:ring-[3px] focus:ring-[rgba(244,196,48,0.18)] transition"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-dim p-1 cursor-pointer"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff className="w-[17px] h-[17px]" /> : <Eye className="w-[17px] h-[17px]" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-[13px] text-text-dim cursor-pointer">
          <input
            type="checkbox"
            className="w-[15px] h-[15px] accent-func"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </label>
        <button type="button" className="text-[12.5px] text-text-dim hover:text-func transition cursor-pointer">
          Forgot password?
        </button>
      </div>

      {/* Unverified email → themed notice with a link to the verification hub */}
      {needsVerification && (
        <a
          href={`/verify-email?email=${encodeURIComponent(email)}`}
          className="flex items-start gap-2 font-mono text-xs text-text-dim bg-surface-2 border border-[var(--accent-line)] px-3 py-2.5 rounded-[8px] hover:bg-surface-3 transition"
        >
          <Mail className="w-[14px] h-[14px] shrink-0 mt-px text-func" strokeWidth={2.5} />
          <span className="leading-snug">
            Need the link again? <span className="text-func">Resend your verification email →</span>
          </span>
        </a>
      )}

      <ErrorMessage message={error} />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-func text-ink font-bold text-[14.5px] py-3 rounded-[8px] flex items-center justify-center gap-2 shadow-[0_8px_24px_-10px_rgba(244,196,48,0.4)] hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(244,196,48,0.55)] transition disabled:opacity-60 disabled:transform-none cursor-pointer"
      >
        {loading ? (
          <span className="w-[15px] h-[15px] rounded-full border-2 border-[rgba(10,13,18,0.25)] border-t-ink animate-spin" />
        ) : (
          <>Sign in</>
        )}
      </button>

      <p className="text-center text-[13px] text-text-dim">
        New to SQLens?{' '}
        <button type="button" onClick={onSwitch} className="text-func font-semibold hover:underline cursor-pointer">
          Create an account
        </button>
      </p>
    </form>
  );
}

/* ========================================================================== */
/* Sign Up                                                                     */
/* ========================================================================== */

const strengthNames = ['', 'Weak', 'Good', 'Strong'];
const strengthColors = ['', 'var(--error)', 'var(--text-dim)', 'var(--func)'];

function getPasswordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 1;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw)) score++;
  return score;
}

function SignUpForm({ onSwitch, onSuccess }: { onSwitch: () => void; onSuccess: (origin: 'signin' | 'signup') => void }) {
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [strength, setStrength] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStrength(getPasswordStrength(pw));
  }, [pw]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || (pw2.length > 0 && pw2 !== pw)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authClient.signUp.email({ name, email, password: pw });
      if (res.error) {
        setError(res.error.message ?? 'Unable to create your account. Please try again.');
        setLoading(false);
        return;
      }
      // Success — component unmounts as the app navigates to the themed
      // verification hub (check your inbox / resend).
      onSuccess('signup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-[18px]" onSubmit={handleSubmit} noValidate>
      <div>
        <h2 className="font-display font-semibold text-[22px] mb-1">Create your account</h2>
        <p className="text-text-dim text-[13.5px] mb-1">Join 38 Days of hands-on SQL. No credit card, no excuses.</p>
      </div>

      <OAuthButtons />

      <Divider text="or sign up with email" />

      <div className="flex flex-col gap-[7px]">
        <label className="font-mono text-[11.5px] tracking-[0.03em] text-text-dim uppercase" htmlFor="su-name">Full name</label>
        <input
          id="su-name"
          type="text"
          placeholder="Ada Lovelace"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-surface border border-border rounded-[8px] px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-func focus:ring-[3px] focus:ring-[rgba(244,196,48,0.18)] transition"
        />
      </div>

      <div className="flex flex-col gap-[7px]">
        <label className="font-mono text-[11.5px] tracking-[0.03em] text-text-dim uppercase" htmlFor="su-email">Email</label>
        <input
          id="su-email"
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface border border-border rounded-[8px] px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-func focus:ring-[3px] focus:ring-[rgba(244,196,48,0.18)] transition"
        />
      </div>

      <div className="flex flex-col gap-[7px]">
        <label className="font-mono text-[11.5px] tracking-[0.03em] text-text-dim uppercase" htmlFor="su-pw">Password</label>
        <div className="relative">
          <input
            id="su-pw"
            type={showPw ? 'text' : 'password'}
            placeholder="⬢⬢⬢⬢⬢⬢⬢⬢"
            data-pw
            required
            minLength={8}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="w-full bg-surface border border-border rounded-[8px] px-3.5 py-2.5 pr-10 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-func focus:ring-[3px] focus:ring-[rgba(244,196,48,0.18)] transition"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-dim p-1 cursor-pointer"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff className="w-[17px] h-[17px]" /> : <Eye className="w-[17px] h-[17px]" />}
          </button>
        </div>

        {/* Password strength meter */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex gap-1 flex-1">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className="flex-1 h-[3px] rounded-full transition-colors duration-200"
                style={{ background: strength >= i && pw.length ? strengthColors[strength] : 'var(--surface-3)' }}
              />
            ))}
          </div>
          <span className="font-mono text-[11px]" style={{ color: strength && pw.length ? strengthColors[strength] : 'var(--text-faint)' }}>
            {pw.length ? strengthNames[strength] : '\u00A0'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-[7px]">
        <label className="font-mono text-[11.5px] tracking-[0.03em] text-text-dim uppercase" htmlFor="su-pw2">Confirm password</label>
        <div className="relative">
          <input
            id="su-pw2"
            type={showPw2 ? 'text' : 'password'}
            placeholder="⬢⬢⬢⬢⬢⬢⬢⬢"
            data-pw
            required
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            className={`w-full bg-surface border rounded-[8px] px-3.5 py-2.5 pr-10 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-func focus:ring-[3px] focus:ring-[rgba(244,196,48,0.18)] transition ${pw2.length > 0 && pw2 !== pw ? 'border-error' : 'border-border'}`}
          />
          <button
            type="button"
            onClick={() => setShowPw2((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-text-dim p-1 cursor-pointer"
            aria-label={showPw2 ? 'Hide password' : 'Show password'}
          >
            {showPw2 ? <EyeOff className="w-[17px] h-[17px]" /> : <Eye className="w-[17px] h-[17px]" />}
          </button>
        </div>
        {pw2.length > 0 && pw2 !== pw && (
          <span className="font-mono text-[11.5px] text-error">Passwords don't match.</span>
        )}
      </div>

      <label className="flex items-start gap-2 text-[12.5px] text-text-dim leading-[1.5] cursor-pointer">
        <input type="checkbox" required className="w-[15px] h-[15px] accent-func mt-0.5" />
        <span>
          I agree to the <a href="#" className="text-func">Terms</a> and <a href="#" className="text-func">Privacy Policy</a>
        </span>
      </label>

      <ErrorMessage message={error} />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-func text-ink font-bold text-[14.5px] py-3 rounded-[8px] flex items-center justify-center gap-2 shadow-[0_8px_24px_-10px_rgba(244,196,48,0.4)] hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(244,196,48,0.55)] transition disabled:opacity-60 disabled:transform-none cursor-pointer"
      >
        {loading ? (
          <span className="w-[15px] h-[15px] rounded-full border-2 border-[rgba(10,13,18,0.25)] border-t-ink animate-spin" />
        ) : (
          <>Create account</>
        )}
      </button>

      <p className="text-center text-[13px] text-text-dim">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-func font-semibold hover:underline cursor-pointer">
          Sign in
        </button>
      </p>
    </form>
  );
}