'use client';
import { useState } from 'react';
import NavBar from '../components/NavBar';
import { motion } from 'framer-motion';

export default function AutoQuiz() {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [questions, setQuestions] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [error, setError] = useState('');

    const generateQuiz = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/auth/autogeneratequiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic: topic.trim(), numberOfQuestions: 5 }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `Quiz request failed (${response.status}).`);
            }

            if (!Array.isArray(data.questions) || data.questions.length === 0) {
                throw new Error('The quiz service returned no questions. Please try again.');
            }

            setQuestions(data.questions);
            setUserAnswers({});
            setCurrentQuestionIndex(0);
            setQuizCompleted(false);
            setScore(0);
        } catch (error) {
            setQuestions(null);
            console.error('Error generating quiz:', error);
            setError(error instanceof Error ? error.message : 'Quiz generation failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
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
            const correctAnswer = typeof question.answerIndex === 'number' ? question.answerIndex : question.ops.indexOf(question.answer);
            if (selectedAnswer === correctAnswer) {
                correctAnswers++;
            }
        });
        setScore(correctAnswers);
        setQuizCompleted(true);
    };

    const percent = questions && questions.length ? Math.round((score / questions.length) * 100) : 0;
    const dash = questions && questions.length ? (score / questions.length) * 100 : 0;

    return (
        <>
            <NavBar />
            <main className="min-h-screen bg-[#f5f2ea] px-5 pb-20 pt-10 text-[#20352b] sm:px-8">
                <div className="mx-auto max-w-4xl">
                    <motion.header
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-9"
                    >
                        <p className="mb-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#69776c]">
                            <span className="h-px w-8 bg-[#bf6544]" />
                            A focused study round
                        </p>
                        <h1 className="font-serif text-4xl font-medium tracking-tight text-[#20352b] sm:text-5xl">
                            What are you learning?
                        </h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-[#68736a] sm:text-base">
                            Enter a subject or idea. We’ll turn it into five questions to help you check what you remember.
                        </p>
                    </motion.header>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 rounded-xl border border-[#dedbd1] bg-[#fbfaf6] p-5 shadow-[0_12px_35px_rgba(39,48,41,0.05)] sm:p-7"
                    >
                        <form onSubmit={generateQuiz} className="flex flex-col gap-4">
                            <label htmlFor="quiz-topic" className="text-xs font-semibold uppercase tracking-[0.12em] text-[#59675d]">
                                Topic
                            </label>
                            <input
                                id="quiz-topic"
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                maxLength={100}
                                placeholder="For example: photosynthesis, fractions, or the French Revolution"
                                className="w-full rounded-lg border border-[#d7d5ca] bg-white px-4 py-3.5 text-[#24372c] placeholder-[#989d95] outline-none transition focus:border-[#69816e] focus:ring-2 focus:ring-[#69816e]/15"
                            />
                            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                <p className="text-xs text-[#81877f]">Five questions · Multiple choice · About 2 minutes</p>
                                <button
                                    type="submit"
                                    disabled={isLoading || topic.trim().length < 2}
                                    className="flex w-full items-center justify-center rounded-lg bg-[#294537] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e382a] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            <span>Writing your questions…</span>
                                        </>
                                    ) : (
                                        <span>Start practice <span aria-hidden="true">→</span></span>
                                    )}
                                </button>
                            </div>
                        </form>
                        {error && (
                            <p role="alert" className="mt-4 rounded-lg border border-[#e7c6ba] bg-[#fbf0eb] px-4 py-3 text-sm leading-6 text-[#8a3929]">{error}</p>
                        )}
                    </motion.div>

                    {questions && !quizCompleted && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="rounded-xl border border-[#dedbd1] bg-[#fbfaf6] p-5 shadow-[0_12px_35px_rgba(39,48,41,0.05)] sm:p-8"
                        >
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium text-[#68736a]">Question {currentQuestionIndex + 1} of {questions.length}</span>
                                    <div className="flex gap-1 sm:gap-2">
                                        {Array.from({ length: questions.length }).map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                                                    idx === currentQuestionIndex
                                                        ? 'bg-[#bf6544]'
                                                        : idx < currentQuestionIndex
                                                        ? 'bg-[#65866c]'
                                                        : 'bg-[#d9d8ce]'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                <h2 className="mb-6 text-xl font-semibold leading-snug text-[#24372c] sm:mb-8 sm:text-2xl">
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
                                                    ? 'border-[#496c55] bg-[#eaf1e9] font-semibold text-[#294537]'
                                                    : 'border border-[#e1ded4] bg-white text-[#4e5a50] hover:border-[#aab7a8] hover:bg-[#fafbf8]'
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
                                        className="rounded-lg border border-[#d6d4ca] px-5 py-2.5 text-sm font-medium text-[#59675d] transition-colors hover:bg-white disabled:opacity-45"
                                    >
                                        Previous
                                    </button>
                                    
                                    {currentQuestionIndex === questions.length - 1 ? (
                                        <button
                                            onClick={submitQuiz}
                                            disabled={Object.keys(userAnswers).length !== questions.length}
                                            className="rounded-lg bg-[#496c55] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#365841] disabled:opacity-45 sm:px-6"
                                        >
                                            Submit Quiz
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                            className="rounded-lg bg-[#294537] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1e382a] sm:px-6"
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
                            className="rounded-xl border border-[#dedbd1] bg-[#fbfaf6] p-5 shadow-[0_12px_35px_rgba(39,48,41,0.05)] sm:p-8"
                        >
                            <h2 className="mb-6 text-center font-serif text-3xl font-medium text-[#24372c] sm:mb-8 sm:text-4xl">Your practice round</h2>
                            <div className="flex justify-center items-center mb-6 sm:mb-8">
                                <div className="relative">
                                    <svg className="w-24 h-24 sm:w-32 sm:h-32" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#dedbd1" strokeWidth="3" />
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="15.9155"
                                            fill="none"
                                            stroke="#bf6544"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeDasharray={`${dash} 100`}
                                            transform="rotate(-90 18 18)"
                                        />
                                        <text x="18" y="18" textAnchor="middle" dominantBaseline="middle" fill="#24372c" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                                            {percent}%
                                        </text>
                                    </svg>
                                </div>
                            </div>
                            <p className="mb-8 text-center text-lg text-[#68736a] sm:mb-12 sm:text-xl">
                                You got <span className="font-bold text-[#294537]">{score}</span> of <span className="font-bold text-[#294537]">{questions.length}</span> right.
                            </p>
                            <div className="space-y-4 sm:space-y-6">
                                {questions.map((question, idx) => {
                                    const selectedAnswer = userAnswers[idx];
                                    const correctAnswer = typeof question.answerIndex === 'number' ? question.answerIndex : question.ops.indexOf(question.answer);
                                    const isCorrect = selectedAnswer === correctAnswer;

                                    return (
                                        <motion.div 
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`p-4 sm:p-6 rounded-lg ${
                                                isCorrect ? 'border border-[#d1e0d1] bg-[#f0f5ee]' : 'border border-[#ead5ca] bg-[#fbf1ec]'
                                            }`}
                                        >
                                            <p className="font-semibold text-md sm:text-lg mb-3 sm:mb-4">{question.question}</p>
                                            <div className="grid gap-2 sm:gap-3">
                                                {question.ops.map((option, optIdx) => (
                                                    <div
                                                        key={optIdx}
                                                        className={`p-2 sm:p-3 rounded text-sm sm:text-base ${
                                                            optIdx === correctAnswer
                                                                ? 'border border-[#cfddce] bg-[#e7f0e5] text-[#355a3d]'
                                                                : selectedAnswer === optIdx
                                                                    ? 'border border-[#e3c9bf] bg-[#f8e9e3] text-[#8a3929]'
                                                                    : 'bg-white/70 text-[#737b72]'
                                                        }`}
                                                    >
                                                        {String.fromCharCode(65 + optIdx)}. {option}
                                                    </div>
                                                ))}
                                            </div>
                                            {!isCorrect && (
                                                <p className="mt-3 text-sm text-[#42624e] sm:mt-4 sm:text-base">
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
                                    }}
                                    className="rounded-lg bg-[#294537] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e382a] sm:px-8"
                                >
                                    Create New Quiz
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
        </>
    );
}
