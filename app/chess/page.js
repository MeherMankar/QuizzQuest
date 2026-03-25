'use client';

import ChessGame from '../components/ChessGame';
import NavBar from '../components/NavBar';

export default function ChessPage() {
    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-8 space-y-4">
                        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent animate-fade-in">
                            Chess Game
                        </h1>
                        <p className="text-lg text-gray-300 animate-slide-up">
                            Challenge your mind with a game of chess
                        </p>
                    </div>

                    <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 shadow-lg transform hover:scale-[1.01] transition-all duration-300">
                        <ChessGame />
                    </div>
                </div>
            </div>
        </>
    );
}
