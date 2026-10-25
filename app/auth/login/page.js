'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.64 5.93c4.46-4.12 7.13-10.2 7.13-17.58Z" />
      <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.88.93 7.57 2.56 10.78l7.97-6.19Z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.87l-7.65-5.93c-2.13 1.43-4.86 2.3-8.25 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const returnUrl = searchParams.get('returnUrl') || '/';
  const switchedRole = searchParams.get('switchedRole');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signIn('google', { callbackUrl: returnUrl });
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setError('Could not start Google sign-in. Please try again.');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to sign up');

        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        if (result?.error) throw new Error('Account created, but sign-in failed. Please sign in with your new account.');
        router.push(returnUrl);
      } else {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });
        if (result?.error) throw new Error('Invalid email or password');
        if (switchedRole) await new Promise(resolve => setTimeout(resolve, 1000));
        router.push(returnUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (switchedRole) setError(`Please sign in again to switch to ${switchedRole} role`);
  }, [switchedRole]);

  return (
    <main className="-mt-[var(--navbar-h)] min-h-screen bg-[#f5f2ea] px-5 py-8 text-[#20352b] sm:px-8 sm:py-12">
      <div className="mx-auto grid min-h-[min(720px,calc(100vh-var(--navbar-h)-6rem))] max-w-6xl overflow-hidden rounded-2xl border border-[#dedbd1] bg-[#fbfaf6] shadow-[0_24px_80px_rgba(39,48,41,0.08)] lg:grid-cols-[1fr_0.88fr]">
        <section className="relative flex flex-col justify-between overflow-hidden bg-[#294537] p-7 text-[#f5f2ea] sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-10 -top-14 h-52 w-52 rounded-full border border-white/10" />

          <button
            type="button"
            onClick={() => router.push('/')}
            className="relative flex w-fit items-center gap-2.5 text-left"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f2ea] font-serif text-xl font-bold text-[#294537]">Q</span>
            <span className="text-lg font-semibold tracking-[-0.04em]">QuizzQuest</span>
          </button>

          <div className="relative my-12 max-w-lg lg:my-0">
            <p className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d5dfd4]">
              <span className="h-px w-8 bg-[#df987b]" />
              Learn at your own pace
            </p>
            <h1 className="font-serif text-4xl font-medium leading-[1.08] tracking-[-0.035em] sm:text-5xl">
              A few good questions can change what you remember.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-[#d5dfd4]">
              Sign in to pick up where you left off, practice a topic, or build a question set for your class.
            </p>

            <div className="mt-9 max-w-sm rounded-xl border border-white/15 bg-white/[0.07] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d5dfd4]">A small step counts</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f2ea] font-serif text-lg font-bold text-[#294537]">?</span>
                <div>
                  <p className="text-sm font-medium text-white">One topic. Five questions.</p>
                  <p className="mt-0.5 text-xs text-[#d5dfd4]">Start with what you are learning today.</p>
                </div>
              </div>
            </div>
          </div>

          <p className="relative text-xs text-[#c0d0c2]">QuizzQuest · Practice with purpose</p>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a15b40]">
                {isSignUp ? 'Get started' : 'Welcome back'}
              </p>
              <h2 className="font-serif text-3xl font-medium tracking-tight text-[#20352b] sm:text-4xl">
                {isSignUp ? 'Create your account.' : 'Good to have you back.'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#717a71]">
                {isSignUp ? 'A little practice goes a long way.' : 'Sign in to continue learning.'}
              </p>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <label htmlFor="login-name" className="mb-1.5 block text-xs font-semibold text-[#536157]">Name</label>
                  <input
                    id="login-name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-[#d7d5ca] bg-white px-4 py-3 text-sm text-[#24372c] outline-none transition placeholder:text-[#9a9e96] focus:border-[#69816e] focus:ring-2 focus:ring-[#69816e]/15"
                    placeholder="Your name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold text-[#536157]">Email</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-[#d7d5ca] bg-white px-4 py-3 text-sm text-[#24372c] outline-none transition placeholder:text-[#9a9e96] focus:border-[#69816e] focus:ring-2 focus:ring-[#69816e]/15"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold text-[#536157]">Password</label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-lg border border-[#d7d5ca] bg-white px-4 py-3 text-sm text-[#24372c] outline-none transition placeholder:text-[#9a9e96] focus:border-[#69816e] focus:ring-2 focus:ring-[#69816e]/15"
                  placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                />
              </div>

              {error && (
                <div role="alert" className="rounded-lg border border-[#e7c6ba] bg-[#fbf0eb] px-4 py-3 text-sm leading-5 text-[#8a3929]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#294537] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e382a] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#e2dfd5]" />
              <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#92968e]">or continue with</span>
              <span className="h-px flex-1 bg-[#e2dfd5]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#d7d5ca] bg-white px-5 py-3 text-sm font-semibold text-[#435247] transition-colors hover:border-[#aeb9ac] hover:bg-[#fdfcf9] disabled:cursor-not-allowed disabled:opacity-55"
            >
              <GoogleMark />
              Continue with Google
            </button>

            <p className="mt-7 text-center text-sm text-[#727a72]">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                className="font-semibold text-[#a15b40] underline-offset-4 transition-colors hover:text-[#82452f] hover:underline"
              >
                {isSignUp ? 'Sign in' : 'Create one'}
              </button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="-mt-[var(--navbar-h)] flex min-h-screen items-center justify-center bg-[#f5f2ea]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-[#d7d5ca] border-t-[#496c55]" />
          <p className="text-sm text-[#69746b]">Getting things ready…</p>
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
