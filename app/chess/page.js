'use client';

import ChessGame from '../components/ChessGame';
import NavBar from '../components/NavBar'; // Assuming you have a NavBar component

export default function ChessPage() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 sm:p-6 md:p-8 flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl font-bold my-6 sm:my-8">Chess Game</h1>
        <ChessGame />
      </div>
    </>
  );
}
