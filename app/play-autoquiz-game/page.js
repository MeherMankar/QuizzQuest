'use client';
import { useEffect, useState, useCallback } from 'react'; // Import useCallback
import { useRouter } from 'next/navigation';
import CatchTheAnswerGame from '../components/Games';
import MemoryQuizGame from '../components/Game2';
import ShootingQuizGame from '../components/Game3';
import FlappyQuizGame from '../components/Game4'; // Import Game4
import NavBar from '../components/NavBar';

export default function PlayAutoQuizGamePage() {
    const router = useRouter();
    const [aiQuestions, setAiQuestions] = useState([]);
    const [currentGameQuestionIndex, setCurrentGameQuestionIndex] = useState(0);
    const [overallScore, setOverallScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedGame, setSelectedGame] = useState(null); // To store which game component to render

    // Memoize handleGameComplete to stabilize its reference
    const handleGameComplete = useCallback((result) => {
        if (result.error) {
            console.error("Error in game:", result.error);
            router.push('/autoquiz');
            return;
        }

        setOverallScore(prev => prev + (result.scoreIncrement || 0));
        
        if (currentGameQuestionIndex < aiQuestions.length - 1) {
            setCurrentGameQuestionIndex(prev => prev + 1);
        } else {
            const finalScore = overallScore + (result.scoreIncrement || 0); // Calculate final score correctly
            alert(`AI Quiz Game Over! Final Score: ${finalScore} out of ${aiQuestions.length}`);
            localStorage.removeItem('ai_quiz_questions');
            router.push('/autoquiz'); 
        }
    }, [aiQuestions.length, currentGameQuestionIndex, overallScore, router]); // Dependencies for useCallback

    useEffect(() => {
        const storedQuestions = localStorage.getItem('ai_quiz_questions');
        if (storedQuestions) {
            const parsedQuestions = JSON.parse(storedQuestions);
            if (parsedQuestions && parsedQuestions.length > 0) {
                console.log("Retrieved questions from localStorage:", parsedQuestions); // Add this line
                setAiQuestions(parsedQuestions);
            } else {
                router.push('/autoquiz');
            }
        } else {
            router.push('/autoquiz'); 
        }
        setLoading(false);
    }, [router]);

    useEffect(() => {
        return () => {
            localStorage.removeItem('ai_quiz_questions');
        };
    }, []);

    // This useEffect was fine, no changes needed here based on the new useCallback for handleGameComplete
    // The dependencies of this useEffect [router] are correct.

    if (loading || aiQuestions.length === 0 || currentGameQuestionIndex >= aiQuestions.length) {
        return (
            <>
                <NavBar />
                <div className="min-h-screen bg-gradient-to-br from-gray\-900 to-gray\-800 p-8 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow\-500"></div>
                </div>
            </>
        );
    }

    // Get the current question based on currentGameQuestionIndex
    const currentQuestionData = aiQuestions[currentGameQuestionIndex];

    // Render game selection UI if no game is selected yet
    if (!selectedGame && !loading && aiQuestions.length > 0) {
        return (
            <>
                <NavBar />
                <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8 flex flex-col justify-center items-center">
                    <h2 className="text-4xl font-bold text-white text-center mb-10">Choose a Game for Your AI Quiz!</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <button
                            onClick={() => setSelectedGame('CatchTheAnswer')}
                            className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-6 px-10 rounded-lg shadow-xl transform transition-all hover:scale-105 text-xl"
                        >
                            🧺 Catch the Answer
                        </button>
                        <button
                            onClick={() => setSelectedGame('MemoryQuiz')}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-6 px-10 rounded-lg shadow-xl transform transition-all hover:scale-105 text-xl"
                        >
                            🧠 Memory Quiz
                        </button>
                        <button
                            onClick={() => setSelectedGame('ShootingQuiz')}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold py-6 px-10 rounded-lg shadow-xl transform transition-all hover:scale-105 text-xl"
                        >
                            🎯 Shooting Gallery
                        </button>
                        <button
                            onClick={() => setSelectedGame('FlappyQuiz')}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-6 px-10 rounded-lg shadow-xl transform transition-all hover:scale-105 text-xl"
                        >
                            🐦 Flappy Quiz
                        </button>
                    </div>
                </div>
            </>
        );
    }
    
    let GameComponent = null;
    if (selectedGame === 'CatchTheAnswer') {
        GameComponent = CatchTheAnswerGame;
    } else if (selectedGame === 'MemoryQuiz') {
        GameComponent = MemoryQuizGame;
    } else if (selectedGame === 'ShootingQuiz') {
        GameComponent = ShootingQuizGame;
    } else if (selectedGame === 'FlappyQuiz') {
        GameComponent = FlappyQuizGame;
    }


    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
                {GameComponent && currentQuestionData && (
                    <>
                        <h2 className="text-3xl font-bold text-white text-center mb-6">
                            AI Quiz: {selectedGame.replace(/([A-Z])/g, ' $1').trim()} - Question {currentGameQuestionIndex + 1} of {aiQuestions.length}
                        </h2>
                        <p className="text-xl text-yellow-400 text-center mb-8">Current Score: {overallScore}</p>
                        <div className="max-w-3xl mx-auto h-[70vh] bg-gray-800/30 rounded-lg shadow-2xl p-1"> {/* Constrain game height & add bg */}
                            <GameComponent
                                questionData={currentQuestionData}
                                onGameEnd={handleGameComplete}
                            />
                        </div>
                    </>
                )}
                 {(!GameComponent && currentQuestionData && selectedGame) && ( // Show error if game selected but component not found
 <div className="text-white text-center text-2xl">Error: Selected game component "{selectedGame}" not found or failed to load.</div>
                 )}
            </div>
        </>
    );
}
