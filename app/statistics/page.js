'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import NavBar from '../components/NavBar';
import { LoadingSpinner } from '../components/LoadingComponents';

function ScoreBar({ value, max = 100, color = 'bg-amber-500' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function StatisticsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) fetchStats();
  }, [session]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/auth/user_stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-xl font-bold text-white mb-2">Stats are private</h2>
            <p className="text-gray-500 text-sm">Sign in to see your performance, achievements, and quiz history.</p>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  const overviewCards = [
    {
      value: stats?.stats.totalQuizzes ?? 0,
      label: 'Quizzes Taken',
      icon: '📝',
      color: 'text-amber-400',
      bar: 'bg-amber-500',
      sub: 'all time',
    },
    {
      value: `${stats?.stats.averageScore ?? 0}%`,
      label: 'Avg Score',
      icon: '🎯',
      color: 'text-green-400',
      bar: 'bg-green-500',
      sub: 'across all quizzes',
      barVal: stats?.stats.averageScore ?? 0,
    },
    {
      value: `#${stats?.stats.rank ?? '—'}`,
      label: 'Global Rank',
      icon: '🏆',
      color: 'text-blue-400',
      bar: 'bg-blue-500',
      sub: 'on the leaderboard',
    },
    {
      value: stats?.stats.perfectScores ?? 0,
      label: 'Perfect Scores',
      icon: '⭐',
      color: 'text-rose-400',
      bar: 'bg-rose-500',
      sub: '100% scores',
    },
  ];

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-950 pt-4 pb-16 px-4">
        {/* Ambient blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
          <div className="absolute top-0 right-[-5%] h-[400px] w-[400px] rounded-full bg-teal-600/5 blur-[100px]" />
          <div className="absolute bottom-0 left-[-5%] h-[400px] w-[400px] rounded-full bg-amber-600/5 blur-[100px]" />
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-600 mb-2 font-mono">/ statistics</p>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Performance</span>
            </h1>
            <p className="text-gray-600 mt-2 text-sm">
              Logged in as <span className="text-gray-400">{session?.user?.name}</span>
            </p>
          </div>

          {/* Overview cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            {overviewCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-white/5 bg-gray-900/80 p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{card.icon}</span>
                  <span className="text-xs text-gray-600">{card.sub}</span>
                </div>
                <div className={`text-3xl font-black ${card.color}`}>{card.value}</div>
                <div className="text-xs text-gray-500 font-medium">{card.label}</div>
                <ScoreBar value={typeof card.barVal === 'number' ? card.barVal : 50} color={card.bar} />
              </div>
            ))}
          </div>

          {/* Achievements */}
          {stats?.achievements?.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-white">Achievements</h2>
                <span className="text-xs text-gray-600 font-mono">
                  {stats.achievements.filter(a => a.unlocked).length}/{stats.achievements.length} unlocked
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {stats.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`rounded-xl p-4 text-center border transition-all ${
                      achievement.unlocked
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-white/[0.02] border-white/5 opacity-40 grayscale'
                    }`}
                  >
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <div className="text-xs font-semibold text-white leading-snug">{achievement.name}</div>
                    {achievement.unlocked && (
                      <div className="text-[10px] text-amber-400 mt-1 font-mono">✓ unlocked</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category performance */}
          {stats?.categories?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-4">Performance by Category</h2>
              <div className="space-y-3">
                {stats.categories.map((cat, i) => (
                  <div key={i} className="rounded-xl border border-white/5 bg-gray-900/80 px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{cat.name}</span>
                      <span className="text-sm font-bold text-amber-400">{cat.averageScore}%</span>
                    </div>
                    <ScoreBar value={cat.averageScore} color="bg-amber-500" />
                    <div className="mt-1.5 text-xs text-gray-600">{cat.quizzesTaken} quiz{cat.quizzesTaken !== 1 ? 'zes' : ''} taken</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz history */}
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Recent History</h2>
            {!stats?.quizHistory?.length ? (
              <div className="rounded-2xl border border-white/5 bg-gray-900/50 p-10 text-center">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-gray-500 text-sm">No quiz history yet.</p>
                <p className="text-gray-700 text-xs mt-1">Start taking quizzes to see your history here.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[540px] text-sm">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        {['Quiz', 'Score', 'Correct', 'Date'].map(h => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stats.quizHistory.map((quiz) => (
                        <tr key={quiz.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3.5 text-gray-200 font-medium">{quiz.quizTitle}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              quiz.score >= 80 ? 'bg-green-500/15 text-green-400' :
                              quiz.score >= 60 ? 'bg-amber-500/15 text-amber-400' :
                              'bg-red-500/15 text-red-400'
                            }`}>
                              {quiz.score}%
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-400">{quiz.correctAnswers}/{quiz.totalQuestions}</td>
                          <td className="px-5 py-3.5 text-gray-600 font-mono text-xs">
                            {new Date(quiz.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
