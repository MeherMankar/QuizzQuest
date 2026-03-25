'use client'
import { useEffect, useState } from 'react';
import NavBar from './NavBar';
async function fetchLeaderboard() {
  try {
    const response = await fetch('/api/auth/getRankings');
    const data = await response.json();

    if (data.success) {
      console.log(data.leaderboard); 
      return data.leaderboard;
    } else {
      console.error('Failed to fetch leaderboard:', data.message);
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  }
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    async function loadLeaderboard() {
      const data = await fetchLeaderboard();
      setLeaderboard(data || []);
    }

    loadLeaderboard();
  }, []);

  return (<>
  <NavBar/>
    <div className="min-h-screen bg-gradient-to-b from-purple-800 to-black text-white flex flex-col items-center justify-center">
      <div className="bg-black bg-opacity-60 p-6 rounded-lg shadow-lg max-w-4xl w-full">
        <h2 className="text-4xl font-extrabold text-center text-purple-400 mb-6">Leaderboard</h2>
        <ul className="space-y-4">
          {leaderboard.map((user, index) => (
            <li key={user.userEmail} className="flex justify-between items-center py-2 px-4 rounded-md bg-purple-700 hover:bg-purple-600 transition-all">
              <span className="text-xl font-semibold text-purple-200">{index + 1}. {user.userEmail}</span>
              <span className="text-lg font-bold text-yellow-400">{user.score} points</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </>
  );
}
