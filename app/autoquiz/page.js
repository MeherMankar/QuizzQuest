'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import NavBar from '../components/NavBar';
import { motion } from 'framer-motion';

export default function AutoQuiz() {
    const router = useRouter(); // Initialize useRouter
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [questions, setQuestions] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [error, setError] = useState('');
    const [selectedGameMode, setSelectedGameMode] = useState(null); // 'standard' or 'game'
    const [selectedModel, setSelectedModel] = useState("mistralai/Mixtral-8x7B-Instruct-v0.1"); // Default model

    const availableModels = [
        { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", name: "Mixtral 8x7B Instruct" },
        { id: "mistralai/Mistral-7B-Instruct-v0.2", name: "Mistral 7B Instruct" },
        { id: "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO", name: "Nous Hermes 2 Mixtral DPO" },
        { id: "meta-llama/Llama-3-8b-chat-hf", name: "Llama 3 8B Chat" }
    ];

    const generateQuiz = async () => {
        setSelectedGameMode(null); // Reset game mode selection
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/auth/autogeneratequiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic, model: selectedModel }), // Send selected model
            });
            const data = await response.json();
            if (data.questions) {
                setQuestions(data.questions);
                setUserAnswers({});
                setCurrentQuestionIndex(0);
                setQuizCompleted(false);
                setScore(0);
                // setSelectedGameMode(null); // User will choose after generation
            } else {
                setError(data.error || 'Failed to generate quiz. Please try again.');
                setQuestions(null); // Clear any old questions on error
            }
        } catch (error) {
            setQuestions(null); // Clear any old questions on error
            console.error('Error generating quiz:', error);
            setError('Failed to generate quiz. Please try again.');
        }
        setIsLoading(false);
    };

    const handleAnswerSelect = (questionIndex, answerIndex) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionIndex]: answerIndex
        }));
    };

    const submitQuiz = () => {
        let correctAnswers = 0;
        questions.forEach((question, index) => {
            const selectedAnswer = userAnswers[index];
            const correctAnswer = question.ops.indexOf(question.answer);
            if (selectedAnswer === correctAnswer) {
                correctAnswers++;
            }
        });
        setScore(correctAnswers);
        setQuizCompleted(true);
    };

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 sm:p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400"
                    >
                        AI-Powered Quiz Generator
                    </motion.h1>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 sm:p-8 mb-8 shadow-xl"
                    >
                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => {
                                    console.log("Input changed:", e.target.value);
                                    setTopic(e.target.value);
                                }}
                                placeholder="Enter any topic (e.g., 'Quantum Physics', 'Ancient History')"
                                className="w-full px-4 sm:px-6 py-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:bg-gray-700/70 transition-all"
                            />
                            <div className="flex flex-col sm:flex-row gap-4">
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full sm:flex-1 px-4 sm:px-6 py-3 rounded-lg bg-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:bg-gray-700/70 transition-all appearance-none"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em' }}
                                >
                                    {availableModels.map(model => (
                                        <option key={model.id} value={model.id} className="bg-gray-800 text-white">
                                            {model.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={generateQuiz}
                                    disabled={isLoading || !topic}
                                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-yellow-500/20 flex items-center justify-center" // Added flex for centering button content
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-t-2 border-gray-900 rounded-full animate-spin mr-2" /> {/* Use self-closing tag */}
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <span>Generate Quiz</span>
                                    )}
                            </button>
                            </div> {/* Add missing closing div for inner flex */}
                        </div> {/* This now correctly closes the outer flex div */}
                        {error && (
                            <p className="mt-4 text-red-400 text-center">{error}</p>
                        )}
                    </motion.div>

                    {questions && !selectedGameMode && !quizCompleted && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 sm:p-8 mb-8 shadow-xl text-center"
                        >
                            <h2 className="text-xl sm:text-2xl font-semibold mb-6">Quiz Ready! How do you want to proceed?</h2>
                            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                                <button
                                    onClick={() => setSelectedGameMode('standard')}
                                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors shadow-lg hover:shadow-yellow-500/20"
                                >
                                    Start Standard Quiz
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedGameMode('game');
                                        // For now, just log. Later, this will redirect to a game page.
                                        console.log("Selected game mode. Questions:", questions);
                                        console.log("Storing questions in localStorage:", questions); // Add this line
                                        // Store questions in localStorage for the game page
                                        localStorage.setItem('ai_quiz_questions', JSON.stringify(questions));
                                        router.push('/play-autoquiz-game'); // Navigate to the game page
                                    }}
                                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-500 transition-colors shadow-lg hover:shadow-purple-600/20"
                                >
                                    Play a Game
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {questions && selectedGameMode === 'standard' && !quizCompleted && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-xl"
                        >
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm sm:text-base text-gray-400">Question {currentQuestionIndex + 1} of {questions.length}</span>
                                    <div className="flex gap-1 sm:gap-2">
                                        {Array.from({ length: questions.length }).map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                                                    idx === currentQuestionIndex
                                                        ? 'bg-yellow-500'
                                                        : idx < currentQuestionIndex
                                                        ? 'bg-green-500/50'
                                                        : 'bg-gray-600'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6 sm:mb-8">
                                    {questions[currentQuestionIndex].question}
                                </h2>

                                <div className="grid gap-3 sm:gap-4">
                                    {questions[currentQuestionIndex].ops.map((option, idx) => (
                                        <motion.button
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            onClick={() => handleAnswerSelect(currentQuestionIndex, idx)}
                                            className={`p-3 sm:p-4 rounded-lg text-left transition-all transform hover:scale-[1.02] text-sm sm:text-base ${
                                                userAnswers[currentQuestionIndex] === idx
                                                    ? 'bg-yellow-500 text-gray-900 font-semibold'
                                                    : 'bg-gray-700/50 text-white hover:bg-gray-700/70'
                                            }`}
                                        >
                                            {String.fromCharCode(65 + idx)}. {option}
                                        </motion.button>
                                    ))}
                                </div>

                                <div className="mt-8 flex justify-between">
                                    <button
                                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                                        disabled={currentQuestionIndex === 0}
                                        className="px-6 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-700/70 disabled:opacity-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    
                                    {currentQuestionIndex === questions.length - 1 ? (
                                        <button
                                            onClick={submitQuiz}
                                            disabled={Object.keys(userAnswers).length !== questions.length}
                                            className="px-4 py-2 sm:px-6 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 disabled:opacity-50 transition-colors text-sm sm:text-base"
                                        >
                                            Submit Quiz
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                            className="px-4 py-2 sm:px-6 sm:py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors text-sm sm:text-base"
                                        >
                                            Next
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {quizCompleted && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-xl"
                        >
                            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Quiz Results</h2>
                            <div className="flex justify-center items-center mb-6 sm:mb-8">
                                <div className="relative">
                                    <svg className="w-24 h-24 sm:w-32 sm:h-32" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845
                                                a 15.9155 15.9155 0 0 1 0 31.831
                                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#4B5563" // gray-600
                                            strokeWidth="3"
                                        />
                                        <path
                                            d="M18 2.0845
                                                a 15.9155 15.9155 0 0 1 0 31.831
                                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#EAB308" // yellow-500
                                            strokeWidth="3"
                                            strokeDasharray={`${(score / questions.length) * 100}, 100`}
                                        />
                                        <text x="18" y="20.35" className="text-3xl sm:text-5xl font-bold" textAnchor="middle" fill="white">
                                            {Math.round((score / questions.length) * 100)}%
                                        </text>
                                    </svg>
                                </div>
                            </div>
                            <p className="text-xl sm:text-2xl text-center mb-8 sm:mb-12">
                                You scored <span className="text-yellow-400 font-bold">{score}</span> out of <span className="text-yellow-400 font-bold">{questions.length}</span>
                            </p>
                            <div className="space-y-4 sm:space-y-6">
                                {questions.map((question, idx) => {
                                    const selectedAnswer = userAnswers[idx];
                                    const correctAnswer = question.ops.indexOf(question.answer);
                                    const isCorrect = selectedAnswer === correctAnswer;

                                    return (
                                        <motion.div 
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`p-4 sm:p-6 rounded-lg ${
                                                isCorrect ? 'bg-green-900/30' : 'bg-red-900/30'
                                            }`}
                                        >
                                            <p className="font-semibold text-md sm:text-lg mb-3 sm:mb-4">{question.question}</p>
                                            <div className="grid gap-2 sm:gap-3">
                                                {question.ops.map((option, optIdx) => (
                                                    <div
                                                        key={optIdx}
                                                        className={`p-2 sm:p-3 rounded text-sm sm:text-base ${
                                                            optIdx === correctAnswer
                                                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                                                : selectedAnswer === optIdx
                                                                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                                                    : 'bg-gray-700/30 text-gray-400'
                                                        }`}
                                                    >
                                                        {String.fromCharCode(65 + optIdx)}. {option}
                                                    </div>
                                                ))}
                                            </div>
                                            {!isCorrect && (
                                                <p className="mt-3 sm:mt-4 text-sm sm:text-base text-green-400">
                                                    <span className="font-semibold">Correct answer:</span> {question.answer}
                                                </p>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={() => {
                                        setQuestions(null);
                                        setUserAnswers({});
                                        setQuizCompleted(false);
                                        setTopic('');
                                        setSelectedGameMode(null); // Reset game mode
                                    }}
                                    className="px-6 sm:px-8 py-3 bg-yellow-500 text-gray-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors shadow-lg hover:shadow-yellow-500/20"
                                >
                                    Create New Quiz
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
}
