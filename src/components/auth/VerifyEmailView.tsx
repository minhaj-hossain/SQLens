'use client';
/**
 * VerifyEmailView — the themed email-verification hub for SQLens.
 *
 * Three states, all rendered in the app's "execution plan" design system
 * (graphite surfaces, single gold accent, monospace labels):
 *   1. `check-inbox` — account awaiting verification; resend with one click.
 *   2. `verifying`   — session still loading (brief).
 *   3. `verified`    — success; after clicking the email link Better Auth has
 *                      already verified + signed the user in
 *                      (autoSignInAfterVerification) and redirected here.
 *
 * Reached from: sign-up success, the email link's callbackURL, the sign-in
 * "verify your email first" error, and direct visits to /verify-email.
 */
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Mail, MailWarning, RefreshCw } from 'lucide-react';
import { authClient } from '../../lib/auth-client';

type Stage = 'verifying' | 'check-inbox' | 'verified';

export const VerifyEmailView: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const emailParam = searchParams.get('email');
  const [stage, setStage] = useState<Stage>('verifying');
  const [email, setEmail] = useState('');
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Resolve the stage once the session query settles.
  useEffect(() => {
    if (sessionLoading) return;
    const user = session?.user;
    if (user) {
      setEmail((e) => e || user.email);
      setStage(user.emailVerified ? 'verified' : 'check-inbox');
    } else if (emailParam) {
      setEmail((e) => e || emailParam);
      setStage('check-inbox');
    } else {
      // Direct visit with no session and no email hint — still show the
      // check-inbox card; the email field lets the user request a link.
      setStage('check-inbox');
    }
  }, [session, sessionLoading, emailParam]);

  const handleResend = useCallback(async () => {
    if (!email || resendState === 'sending') return;
    setResendState('sending');
    try {
      // Core Better Auth endpoint (the v1.7 client doesn't type an
      // `emailVerification` namespace, so we hit the same route directly).
      const res = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, callbackURL: '/verify-email' }),
      });
      setResendState(res.ok ? 'sent' : 'error');
    } catch {
      setResendState('error');
    }
  }, [email, resendState]);

  const verified = stage === 'verified';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-ink flex flex-col"
    >
      {/* Top-left back arrow → back to the homepage */}
      <header className="w-full max-w-[460px] mx-auto px-6 pt-6">
        <Link
          href="/"
          aria-label="Back to homepage"
          className="w-9 h-9 -ml-2 flex items-center justify-center rounded-lg text-text-dim hover:text-text hover:bg-surface-2 transition"
        >
          <ArrowLeft className="w-[18px] h-[18px]" />
        </Link>
      </header>

      <main className="flex items-center justify-center px-6 sm:px-10 py-10 sm:py-14 flex-1">
        <div className="w-full max-w-[400px]">
          {/* Brand — same lockup as the auth screens */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <BrandMark />
            <span className="font-display font-bold text-[19px] tracking-tight text-text">
              SQL<span className="text-func">ens</span>
            </span>
          </div>

          <div className="bg-surface border border-border rounded-[14px] p-7 flex flex-col items-center text-center">
            {/* Stage icon */}
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 ${
                verified
                  ? 'bg-[var(--accent-dim)] border border-[var(--accent-line)]'
                  : 'bg-surface-2 border border-border'
              }`}
            >
              {stage === 'verifying' ? (
                <span className="w-[18px] h-[18px] rounded-full border-2 border-[var(--accent-line)] border-t-func animate-spin" />
              ) : verified ? (
                <Check className="w-6 h-6 text-func" strokeWidth={2.5} />
              ) : (
                <Mail className="w-6 h-6 text-text-dim" strokeWidth={1.8} />
              )}
            </div>

            {/* Mono step label — mirrors the site's section labels */}
            <span className="font-mono text-[11px] tracking-[0.08em] uppercase text-func mb-2">
              {verified ? '-- verified' : stage === 'verifying' ? '-- checking' : '-- step 1 of 1'}
            </span>

            {stage === 'verifying' && (
              <>
                <h1 className="font-display font-semibold text-[22px] text-text">Checking your account…</h1>
                <p className="text-text-dim text-[13.5px] leading-[1.6] mt-2">
                  Confirming your verification status.
                </p>
              </>
            )}

            {stage === 'verified' && (
              <>
                <h1 className="font-display font-semibold text-[22px] text-text">Email verified</h1>
                <p className="text-text-dim text-[13.5px] leading-[1.6] mt-2">
                  You&apos;re all set,{' '}
                  <span className="text-text font-medium">{session?.user?.name || 'learner'}</span>. Your
                  progress now syncs across every device you sign in on.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="mt-6 w-full bg-func text-ink font-bold text-[14.5px] py-3 rounded-[8px] flex items-center justify-center gap-2 shadow-[0_8px_24px_-10px_rgba(244,196,48,0.4)] hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(244,196,48,0.55)] transition cursor-pointer"
                >
                  Start learning
                </button>
              </>
            )}


            {stage === 'check-inbox' && (
              <>
                <h1 className="font-display font-semibold text-[22px] text-text">Check your inbox</h1>
                <p className="text-text-dim text-[13.5px] leading-[1.6] mt-2">
                  We sent a verification link to
                  {email ? (
                    <>
                      {' '}
                      <span className="text-text font-medium break-all">{email}</span>
                    </>
                  ) : (
                    ' your email address'
                  )}
                  . Click it to activate your account.
                </p>

                {/* Unknown / adjustable email — direct visits can enter theirs */}
                {!session?.user && (
                  <div className="w-full flex flex-col gap-[7px] mt-5 text-left">
                    <label
                      className="font-mono text-[11.5px] tracking-[0.03em] text-text-dim uppercase"
                      htmlFor="ve-email"
                    >
                      Email address
                    </label>
                    <input
                      id="ve-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (resendState !== 'idle') setResendState('idle');
                      }}
                      className="w-full bg-surface-2 border border-border rounded-[8px] px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-func focus:ring-[3px] focus:ring-[rgba(244,196,48,0.18)] transition"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendState === 'sending' || !email}
                  className="mt-5 w-full bg-func text-ink font-bold text-[14.5px] py-3 rounded-[8px] flex items-center justify-center gap-2 shadow-[0_8px_24px_-10px_rgba(244,196,48,0.4)] hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(244,196,48,0.55)] transition disabled:opacity-60 disabled:transform-none cursor-pointer"
                >
                  {resendState === 'sending' ? (
                    <span className="w-[15px] h-[15px] rounded-full border-2 border-[rgba(10,13,18,0.25)] border-t-ink animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-[15px] h-[15px]" strokeWidth={2.5} />
                      Resend verification email
                    </>
                  )}
                </button>

                {/* Inline status, styled like the auth error/success hints */}
                {resendState === 'sent' && (
                  <div className="mt-4 w-full flex items-start gap-2 font-mono text-xs text-text-dim bg-surface-2 border border-border px-3 py-2 rounded-[8px]">
                    <Mail className="w-[14px] h-[14px] shrink-0 mt-px text-func" strokeWidth={2.5} />
                    <span className="leading-snug">Verification email sent — check your inbox.</span>
                  </div>
                )}
                {resendState === 'error' && (
                  <div className="mt-4 w-full flex items-start gap-2 font-mono text-xs text-error bg-error/10 border border-error/30 px-3 py-2 rounded-[8px]">
                    <MailWarning className="w-[14px] h-[14px] shrink-0 mt-px" strokeWidth={2.5} />
                    <span className="leading-snug">Couldn&apos;t send right now. Please try again.</span>
                  </div>
                )}
              </>
            )}
          </div>

          <p className="text-center text-[13px] text-text-dim mt-6">
            Wrong address or need a new account?{' '}
            <Link href="/signup" className="text-func font-semibold hover:underline">
              Sign up again
            </Link>
          </p>
        </div>
      </main>
    </motion.div>
  );
};

/* ========================================================================== */
/* Shared bits                                                                 */
/* ========================================================================== */

/** Same magnifier brand mark used on the auth screens. */
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

