'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import NavBar from '../components/NavBar';
import { LoadingSpinner } from '../components/LoadingComponents';

export default function StatisticsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchStats();
    }
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
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">Please sign in to view statistics</div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">Your Statistics</h1>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl sm:text-4xl font-bold text-amber-400">{stats?.stats.totalQuizzes || 0}</div>
              <div className="text-sm text-gray-400 mt-2">Total Quizzes</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl sm:text-4xl font-bold text-green-400">{stats?.stats.averageScore || 0}%</div>
              <div className="text-sm text-gray-400 mt-2">Average Score</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl sm:text-4xl font-bold text-blue-400">#{stats?.stats.rank || 0}</div>
              <div className="text-sm text-gray-400 mt-2">Global Rank</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-3xl sm:text-4xl font-bold text-purple-400">{stats?.stats.perfectScores || 0}</div>
              <div className="text-sm text-gray-400 mt-2">Perfect Scores</div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Achievements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {stats?.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg text-center transition-all ${
                    achievement.unlocked
                      ? 'bg-amber-500/20 border-2 border-amber-500'
                      : 'bg-gray-700/50 border-2 border-gray-600 opacity-50'
                  }`}
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <div className="text-sm font-semibold text-white">{achievement.name}</div>
                  {achievement.unlocked && (
                    <div className="text-xs text-amber-400 mt-1">Unlocked!</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quiz History */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Quiz History</h2>
            {stats?.quizHistory.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No quiz history yet. Start taking quizzes!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Quiz</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Score</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Correct</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {stats?.quizHistory.map((quiz) => (
                      <tr key={quiz.id} className="hover:bg-gray-750">
                        <td className="px-4 py-3 text-sm text-white">{quiz.quizTitle}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            quiz.score >= 80 ? 'bg-green-500/20 text-green-400' :
                            quiz.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {quiz.score}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
                          {quiz.correctAnswers}/{quiz.totalQuestions}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(quiz.completedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Category Performance */}
          {stats?.categories.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">Performance by Category</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.categories.map((category, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{category.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Average Score</span>
                      <span className="text-xl font-bold text-amber-400">{category.averageScore}%</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-400">Quizzes Taken</span>
                      <span className="text-sm text-white">{category.quizzesTaken}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
