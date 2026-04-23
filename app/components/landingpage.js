"use client";
import NavBar from "./NavBar";
import "../global.css";
import { useRouter } from 'next/navigation';
import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from 'react';

const TICKER_ITEMS = [
  'Interactive Games', 'AI-Powered Quizzes', 'Chess Arena', 
  'Leaderboards', 'Progress Tracking', 'Teacher Dashboard',
  'Memory Challenges', 'Auto Quiz', 'Real-time Stats',
];

function Ticker() {
  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-gray-950/80 py-2.5 my-10">
      <div className="flex animate-marquee gap-8 whitespace-nowrap">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-600">
            <span className="h-1 w-1 rounded-full bg-amber-500/60" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: '🎮',
    title: 'Four Game Modes',
    body: 'Catch the Answer, Memory Cards, Classic MCQ, and Snake Quiz — each teaching the same content differently.',
    accent: 'border-l-amber-500',
  },
  {
    icon: '🤖',
    title: 'AI Quiz Generator',
    body: 'Type any topic and our AI builds a full quiz in seconds. Great for last-minute revision.',
    accent: 'border-l-purple-500',
  },
  {
    icon: '♟️',
    title: 'Chess Arena',
    body: 'Take a break with chess puzzles and games built right into the platform.',
    accent: 'border-l-green-500',
  },
  {
    icon: '📊',
    title: 'Live Statistics',
    body: 'See your scores, accuracy, rank, and achievement badges update in real time.',
    accent: 'border-l-blue-500',
  },
  {
    icon: '🏆',
    title: 'Leaderboard',
    body: 'Compete with classmates and climb the rankings. Top 3 get medal badges.',
    accent: 'border-l-rose-500',
  },
  {
    icon: '👩‍🏫',
    title: 'Teacher Tools',
    body: 'Create question banks, assign quizzes, and track student performance.',
    accent: 'border-l-teal-500',
  },
];

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      const profilePic = session.user?.image;
      const userName = session.user?.name;
      if (profilePic) localStorage.setItem("userProfilePic", profilePic);
      if (userName) localStorage.setItem("userName", userName);

      fetch('/api/auth/user_roles', { method: 'GET' })
        .then(r => r.json())
        .then(async data => {
          if (data.role === null) {
            await fetch('/api/auth/user_roles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: 'student' }),
            });
            setRole('student');
          } else {
            setRole(data.role);
          }
        })
        .catch(() => setRole('student'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setRole(null);
      localStorage.removeItem("userProfilePic");
      localStorage.removeItem("userName");
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <NavBar />

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[30%] h-[600px] w-[600px] rounded-full bg-amber-600/[0.04] blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[20%] h-[500px] w-[500px] rounded-full bg-purple-600/[0.04] blur-[120px]" />
      </div>

      <main className="max-w-5xl mx-auto px-4 pt-10 pb-20">

        {/* Hero — editorial */}
        <div className="mb-6 max-w-3xl">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight animate-slide-up">
            Stop reading.<br />
            <span
              className="inline-block"
              style={{
                backgroundImage: 'linear-gradient(135deg, #fbbf24 0%, #f97316 35%, #fb7185 65%, #a855f7 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradShift 4s ease infinite',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: 'none',
                filter: 'drop-shadow(0 0 30px rgba(245,158,11,0.3))',
              }}
            >
              Start&nbsp;playing.
            </span>
          </h1>
        </div>

        <p className="text-gray-500 max-w-xl text-lg leading-relaxed mb-10 animate-slide-up delay-200">
          QuizzQuest turns your syllabus into games, challenges, and competitions —
          so you actually <span className="text-gray-300 font-medium">remember</span> what you study.
        </p>

        {/* CTA */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-700 border-t-amber-400" />
              Loading...
            </div>
          ) : !session ? (
            <>
              <button
                onClick={() => signIn()}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-7 py-3.5 font-bold text-gray-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 hover:shadow-amber-500/40 text-sm"
              >
                Get started free →
              </button>
              <button
                onClick={() => router.push('/autoquiz')}
                className="rounded-xl border border-white/10 px-7 py-3.5 font-medium text-gray-400 text-sm transition-all hover:border-white/20 hover:text-white"
              >
                Try AI quiz — no login
              </button>
            </>
          ) : (
            <>
              {role === 'student' && (
                <>
                  <button
                    onClick={() => router.push('/solvingarea')}
                    className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-7 py-3.5 font-bold text-gray-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 text-sm"
                  >
                    🎮 Play now →
                  </button>
                  <button
                    onClick={() => router.push('/quizzes')}
                    className="rounded-xl border border-white/10 px-7 py-3.5 font-medium text-gray-400 text-sm transition-all hover:border-white/20 hover:text-white"
                  >
                    Browse quizzes
                  </button>
                </>
              )}
              {role === 'teacher' && (
                <>
                  <button
                    onClick={() => router.push('/teacher/questions')}
                    className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-7 py-3.5 font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:scale-105 text-sm"
                  >
                    ✨ Create questions →
                  </button>
                  <button
                    onClick={() => router.push('/viewquestions')}
                    className="rounded-xl border border-white/10 px-7 py-3.5 font-medium text-gray-400 text-sm transition-all hover:border-white/20 hover:text-white"
                  >
                    Manage quizzes
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {session && (
          <p className="text-xs text-gray-700 mb-2">
            Welcome back, <span className="text-gray-500">{session.user?.name?.split(' ')[0]}</span> ·{' '}
            <span className="capitalize">{role}</span> account
          </p>
        )}

        {/* Ticker */}
        <Ticker />

        {/* Features — intentionally staggered, not uniform grid */}
        <div className="mb-14">
          <div className="flex items-baseline gap-4 mb-6">
            <h2 className="text-2xl font-black text-white">What's inside</h2>
            <span className="text-xs font-mono text-gray-700">6 features</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`group rounded-xl border-l-2 ${f.accent} border-r border-t border-b border-white/5 bg-gray-900/60 p-5 transition-all hover:bg-gray-900 hover:border-r-white/10`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-white text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom band — for guests only */}
        {!session && (
          <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-black text-white mb-1">Ready to try it?</h3>
              <p className="text-gray-600 text-sm">Free for students. No credit card. Just sign in.</p>
            </div>
            <button
              onClick={() => signIn()}
              className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 font-bold text-gray-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 text-sm"
            >
              Sign up free →
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
