'use client'
import { useEffect, useState } from 'react';
import NavBar from './NavBar';

async function fetchLeaderboard() {
  try {
    const response = await fetch('/api/auth/getRankings');
    const data = await response.json();
    if (data.success) {
      return data.leaderboard;
    } else {
      console.error('Failed to fetch leaderboard:', data.message);
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  }
}

const rankMedal = (index) => {
  if (index === 0) return '🥇';
  if (index === 1) return '🥈';
  if (index === 2) return '🥉';
  return `#${index + 1}`;
};

const getDisplayName = (user) => {
  if (user.userName && user.userName.trim()) return user.userName;
  if (user.userEmail) {
    const parts = user.userEmail.split('@');
    return parts[0];
  }
  return 'Anonymous';
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      const data = await fetchLeaderboard();
      setLeaderboard(data || []);
      setLoading(false);
    }
    loadLeaderboard();
  }, []);

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white pt-6 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
              Leaderboard
            </h1>
            <p className="text-gray-400">Top performers across all quizzes</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-amber-500"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No scores recorded yet. Be the first!</div>
          ) : (
            <ul className="space-y-3">
              {leaderboard.map((user, index) => (
                <li
                  key={user.userEmail}
                  className={`flex items-center justify-between rounded-xl px-6 py-4 transition-all duration-200 ${
                    index === 0
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40'
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-400/10 to-gray-500/10 border border-gray-400/30'
                      : index === 2
                      ? 'bg-gradient-to-r from-orange-900/20 to-amber-900/20 border border-orange-700/30'
                      : 'bg-gray-800/50 border border-gray-700/30 hover:border-gray-600/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl w-10 text-center">{rankMedal(index)}</span>
                    <span className={`font-semibold text-lg ${index < 3 ? 'text-white' : 'text-gray-300'}`}>
                      {getDisplayName(user)}
                    </span>
                  </div>
                  <span className={`font-bold text-lg ${index === 0 ? 'text-amber-400' : 'text-gray-300'}`}>
                    {user.score} pts
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
