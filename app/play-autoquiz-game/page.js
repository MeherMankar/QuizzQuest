'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CatchTheAnswerGame from '../components/Games';
import MemoryQuizGame from '../components/Game2';
import ShootingQuizGame from '../components/Game3';
import FlappyQuizGame from '../components/Game4';
import NavBar from '../components/NavBar';

export default function PlayAutoQuizGamePage() {
    const router = useRouter();
    const [aiQuestions, setAiQuestions] = useState([]);
    const [currentGameQuestionIndex, setCurrentGameQuestionIndex] = useState(0);
    const [overallScore, setOverallScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedGame, setSelectedGame] = useState(null);

    useEffect(() => {
        try {
            const storedQuestions = localStorage.getItem('ai_quiz_questions');
            if (!storedQuestions) {
                router.push('/autoquiz');
                return;
            }

            const parsedQuestions = JSON.parse(storedQuestions);
            if (!parsedQuestions || parsedQuestions.length === 0) {
                router.push('/autoquiz');
                return;
            }

            setAiQuestions(parsedQuestions);
            setLoading(false);
        } catch (error) {
            console.error("Error loading questions:", error);
            router.push('/autoquiz');
        }
    }, [router]);

    const handleGameComplete = useCallback((result) => {
        if (result.error) {
            console.error("Game error:", result.error);
            return;
        }

        setOverallScore(prev => prev + (result.scoreIncrement || 0));
        
        setTimeout(() => {
            if (currentGameQuestionIndex < aiQuestions.length - 1) {
                setCurrentGameQuestionIndex(prev => prev + 1);
            } else {
                const finalScore = overallScore + (result.scoreIncrement || 0);
                const percentage = ((finalScore / aiQuestions.length) * 100).toFixed(1);
                alert(`Quiz Complete! Score: ${finalScore}/${aiQuestions.length} (${percentage}%)`);
                localStorage.removeItem('ai_quiz_questions');
                router.push('/autoquiz');
            }
        }, 1000); // Add delay to show result
    }, [aiQuestions.length, currentGameQuestionIndex, overallScore, router]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            localStorage.removeItem('ai_quiz_questions');
        };
    }, []);

    if (loading || aiQuestions.length === 0 || currentGameQuestionIndex >= aiQuestions.length) {
        return (
            <>
                <NavBar />
                <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                </div>
            </>
        );
    }

    const currentQuestionData = aiQuestions[currentGameQuestionIndex];

    if (!selectedGame) {
        return (
            <>
                <NavBar />
                <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
                    <div className="max-w-4xl mx-auto flex flex-col items-center">
                        <h2 className="text-4xl font-bold text-white text-center mb-8">Choose Your Game Type</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            <button
                                onClick={() => setSelectedGame('CatchTheAnswer')}
                                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                <div className="text-2xl mb-2">🧺 Catch the Answer</div>
                                <div className="text-sm opacity-75">Catch falling correct answers</div>
                            </button>
                            <button
                                onClick={() => setSelectedGame('MemoryQuiz')}
                                className="bg-purple-600 hover:bg-purple-500 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                <div className="text-2xl mb-2">🧠 Memory Quiz</div>
                                <div className="text-sm opacity-75">Test your memory skills</div>
                            </button>
                            <button
                                onClick={() => setSelectedGame('ShootingQuiz')}
                                className="bg-red-600 hover:bg-red-500 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                <div className="text-2xl mb-2">🎯 Shooting Gallery</div>
                                <div className="text-sm opacity-75">Shoot the correct answers</div>
                            </button>
                            <button
                                onClick={() => setSelectedGame('FlappyQuiz')}
                                className="bg-cyan-500 hover:bg-cyan-400 text-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                            >
                                <div className="text-2xl mb-2">🐦 Flappy Quiz</div>
                                <div className="text-sm opacity-75">Navigate through answers</div>
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    let GameComponent;
    switch (selectedGame) {
        case 'CatchTheAnswer':
            GameComponent = CatchTheAnswerGame;
            break;
        case 'MemoryQuiz':
            GameComponent = MemoryQuizGame;
            break;
        case 'ShootingQuiz':
            GameComponent = ShootingQuizGame;
            break;
        case 'FlappyQuiz':
            GameComponent = FlappyQuizGame;
            break;
        default:
            GameComponent = null;
    }

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
                {GameComponent && currentQuestionData && (
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-6">
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Question {currentGameQuestionIndex + 1} of {aiQuestions.length}
                            </h2>
                            <p className="text-yellow-400 text-xl">
                                Score: {overallScore}/{currentGameQuestionIndex}
                            </p>
                        </div>
                        <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden">
                            <GameComponent
                                questionData={currentQuestionData}
                                onGameEnd={handleGameComplete}
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
