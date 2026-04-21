'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import NavBar from '../components/NavBar';

const GAME_MODES = [
  {
    id: 'catch',
    emoji: '🧺',
    title: 'Catch the Answer',
    description: 'Move your basket to catch falling correct answers before time runs out.',
    difficulty: 'Easy',
    diffColor: 'text-green-400 bg-green-500/10 border-green-500/20',
    cardGlow: 'hover:border-green-500/50 hover:shadow-green-500/10',
    tag: 'Reflexes',
    time: '30s',
  },
  {
    id: 'memory',
    emoji: '🧠',
    title: 'Memory Quiz',
    description: 'Memorise the answer cards — then find the correct one after they flip!',
    difficulty: 'Medium',
    diffColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    cardGlow: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
    tag: 'Memory',
    time: '60s',
  },
  {
    id: 'mcq',
    emoji: '📝',
    title: 'Classic MCQ',
    description: 'Traditional multiple-choice quiz. Read carefully and pick the right answer.',
    difficulty: 'Easy',
    diffColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    cardGlow: 'hover:border-blue-500/50 hover:shadow-blue-500/10',
    tag: 'Knowledge',
    time: 'Untimed',
  },
  {
    id: 'snake',
    emoji: '🐍',
    title: 'Snake Quiz',
    description: 'Guide the snake to eat the correct answer. Wrong ones shrink you!',
    difficulty: 'Hard',
    diffColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    cardGlow: 'hover:border-rose-500/50 hover:shadow-rose-500/10',
    tag: 'Strategy',
    time: '45s',
  },
];

const QUICK_ACTIONS = [
  {
    icon: '⚡',
    label: 'Quick Play',
    sub: 'Random game, random topic',
    color: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/20 hover:shadow-amber-500/40',
    path: '/solvingarea',
  },
  {
    icon: '🤖',
    label: 'AI Quiz',
    sub: 'Generate quiz on any topic',
    color: 'from-purple-500 to-pink-500',
    shadow: 'shadow-purple-500/20 hover:shadow-purple-500/40',
    path: '/autoquiz',
  },
  {
    icon: '📋',
    label: 'View Questions',
    sub: 'Take a teacher-made quiz',
    color: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/20 hover:shadow-blue-500/40',
    path: '/viewquestions',
  },
];

export default function QuizzesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (session) {
      fetch('/api/auth/user_stats')
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setStats(data.stats); })
        .catch(() => {});
    }
  }, [session]);

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-950 pt-4 pb-16 px-4">
        {/* Ambient background blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[20%] h-[500px] w-[500px] rounded-full bg-amber-600/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[10%] h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-600 mb-2 font-mono">/ quizzes</p>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
              Choose how you<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">want to learn</span>
            </h1>
            {session && stats && (
              <p className="mt-3 text-gray-500 text-sm">
                You've completed <span className="text-amber-400 font-semibold">{stats.totalQuizzes || 0}</span> quizzes · Average score <span className="text-green-400 font-semibold">{stats.averageScore || 0}%</span>
              </p>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.path)}
                className={`group relative overflow-hidden rounded-xl border border-white/5 bg-gray-900 p-5 text-left transition-all duration-200 hover:scale-[1.02] shadow-lg ${action.shadow}`}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${action.color} opacity-0`} style={{opacity: 0}} />
                <div className="relative">
                  <div className="text-2xl mb-3">{action.icon}</div>
                  <div className="font-bold text-white text-sm">{action.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{action.sub}</div>
                </div>
                <div className={`absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r ${action.color} group-hover:w-full transition-all duration-300`} />
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-xs text-gray-600 font-mono uppercase tracking-widest">Game Modes</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          {/* Game modes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GAME_MODES.map((mode) => (
              <div
                key={mode.id}
                className={`group relative rounded-2xl border border-white/5 bg-gray-900/80 p-6 cursor-pointer transition-all duration-200 hover:scale-[1.015] shadow-xl ${mode.cardGlow} hover:shadow-xl`}
                onClick={() => router.push('/solvingarea')}
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{mode.emoji}</div>
                  <div className="flex gap-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${mode.diffColor}`}>
                      {mode.difficulty}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-white/10 text-gray-500">
                      {mode.time}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{mode.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{mode.description}</p>

                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-700" />
                    {mode.tag}
                  </span>
                  <span className="text-xs text-gray-600 group-hover:text-amber-400 transition-colors font-medium">
                    Play now →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer tip */}
          <p className="mt-8 text-center text-xs text-gray-700">
            💡 Quick Play selects a game mode and topic randomly — perfect when you can't decide!
          </p>
        </div>
      </div>
    </>
  );
}
