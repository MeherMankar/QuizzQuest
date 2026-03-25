'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "./NavBar";

export default function ViewQuestions() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [results, setResults] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch('/api/auth/questions');
                const data = await response.json();
                if (response.ok) {
                    setQuestions(data.questions);
                } else {
                    console.error(data.error);
                }
            } catch (error) {
                console.error('Failed to fetch questions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    const handleAnswerChange = (questionId, selectedAnswer) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: selectedAnswer
        }));
    };

    const calculatePercentage = (correct, total) => {
        if (!total || !correct) return 0;
        const percentage = (correct / total) * 100;
        return Math.round(percentage * 10) / 10; // Round to 1 decimal place
    };

    const getScoreClass = (percentage) => {
        if (percentage >= 80) return 'text-green-500';
        if (percentage >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };    const handleSubmit = async () => {
        if (Object.keys(answers).length === 0) {
            alert('Please answer at least one question before submitting.');
            return;
        }
        
        setSubmitting(true);
        try {
            const response = await fetch('/api/auth/verifyanswer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ answers }),
            });

            if (!response.ok) {
                throw new Error('Failed to verify answers');
            }

            const data = await response.json();
            setScore(data.score);
            setResults(data.results);
            setShowResult(true);
        } catch (error) {
            console.error('Error submitting answers:', error);
            alert('There was an error submitting your answers. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    {showResult ? (
                        <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-lg animate-fade-in">
                            <h2 className="text-3xl font-bold text-yellow-500 mb-4 text-center">Quiz Results</h2>
                            <div className={`text-6xl font-bold mb-4 text-center ${getScoreClass(calculatePercentage(score, questions.length))}`}>
                                {calculatePercentage(score, questions.length)}%
                            </div>
                            <p className="text-gray-300 text-lg mb-6 text-center">
                                You got {score} out of {questions.length} questions correct!
                            </p>
                            <div className="space-y-6 mt-8">
                                {questions.map((question, index) => {
                                    const userAnswer = answers[question._id];
                                    const correctAnswer = question.answer;
                                    return (
                                        <div key={question._id}
                                            className={`p-6 rounded-lg ${
                                                userAnswer === correctAnswer
                                                    ? 'bg-green-900/20 border border-green-500/30'
                                                    : 'bg-red-900/20 border border-red-500/30'
                                            }`}>
                                            <h3 className="text-xl font-semibold text-white mb-3">
                                                {index + 1}. {question.question}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                {question.ops.map((option, optIndex) => {
                                                    const isUserSelected = userAnswer === option;
                                                    const isCorrect = correctAnswer === option;
                                                    return (
                                                        <div key={optIndex}
                                                            className={`p-4 rounded-lg flex justify-between items-center border-2 transition-all duration-200 ${
                                                                isUserSelected && isCorrect
                                                                    ? 'bg-green-500/20 border-green-500 text-green-700 font-bold'
                                                                : isUserSelected && !isCorrect
                                                                    ? 'bg-red-500/20 border-red-500 text-red-400 font-bold'
                                                                : isCorrect
                                                                    ? 'bg-green-500/10 border-green-500/50 text-green-400'
                                                                    : 'bg-gray-700/50 border-transparent text-gray-300'
                                                            }`}>
                                                            <span>{option}</span>
                                                            {/* Show tick/cross only on user's selected option */}
                                                            {isUserSelected && isCorrect && (
                                                                <span className="text-green-500 font-bold ml-2">✓</span>
                                                            )}
                                                            {isUserSelected && !isCorrect && (
                                                                <span className="text-red-400 font-bold ml-2">✗</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="mt-3 space-y-2">
                                                <p className="text-sm flex justify-between">
                                                    <span className="text-gray-400">Your answer: </span>
                                                    {userAnswer ? (
                                                        <span className={userAnswer === correctAnswer ? 'text-green-400' : 'text-red-400'}>
                                                            {userAnswer}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">Not answered</span>
                                                    )}
                                                </p>
                                                <p className="text-sm flex justify-between">
                                                    <span className="text-gray-400">Correct answer: </span>
                                                    <span className="text-green-400">{correctAnswer}</span>
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => {
                                    setShowResult(false);
                                    setAnswers({});
                                    setScore(null);
                                }}
                                className="mt-8 px-6 py-3 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition-all duration-200 mx-auto block"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h1 className="text-3xl font-bold text-yellow-500 text-center mb-8">Quiz Questions</h1>
                            {questions.map((question, index) => (
                                <div key={question._id} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                                    <h3 className="text-xl font-semibold text-white mb-4">
                                        {index + 1}. {question.question}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {question.ops.map((option, optIndex) => (
                                            <button
                                                key={optIndex}
                                                onClick={() => handleAnswerChange(question._id, option)}
                                                className={`p-4 rounded-lg text-left transition-all duration-200 ${
                                                    answers[question._id] === option
                                                        ? 'bg-yellow-500/20 border-2 border-yellow-500 text-white'
                                                        : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white'
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className={`w-full px-6 py-3 mt-8 bg-yellow-500 text-black rounded-lg font-semibold transition-all duration-200 ${
                                    submitting 
                                        ? 'opacity-50 cursor-not-allowed' 
                                        : 'hover:bg-yellow-400 transform hover:scale-105'
                                }`}
                            >
                                {submitting ? 'Submitting...' : 'Submit Answers'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
