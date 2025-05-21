'use client'

import { useEffect, useState } from 'react'
import Game1 from "../components/Games";
import Game2 from "../components/Game2";
import Game3 from "../components/Game3";
import Game4 from "../components/Game4";
import NavBar from "../components/NavBar";

export default function Page() {
  const [randomNumber, setRandomNumber] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rand = Math.floor(Math.random() * 4);
    setRandomNumber(rand);
    // Add a small delay to show loading animation
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const renderGame = () => {
    if (randomNumber === 1) return <Game1 />;
    if (randomNumber === 0) return <Game2 />;
    if (randomNumber === 2) return <Game3 />;
    if (randomNumber === 3) return <Game4 />;
    return null;
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mb-4"></div>
            <h2 className="text-2xl font-semibold text-white mb-2">Loading Your Game</h2>
            <p className="text-gray-400">Preparing a fun challenge for you...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        {randomNumber !== null ? renderGame() : (
          <div className="text-center text-white">
            <p>Something went wrong. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}
