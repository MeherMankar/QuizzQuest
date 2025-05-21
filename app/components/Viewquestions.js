'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "./NavBar";

export default function ViewQuestions() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [score, setScore] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch('/api/auth/questions');
                const data = await response.json();
                setQuestions(data.questions || []);
            } catch (error) {
                console.error('Error fetching questions', error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    const handleAnswerChange = (questionId, answer) => {
        setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSubmit = () => {
        let correctCount = 0;
        questions.forEach(question => {
            if (selectedAnswers[question._id] === question.answer) {
                correctCount++;
            }
        });
        setScore(correctCount);
    };

    return (
        <>
            <NavBar />
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-8 text-center">Available Questions</h1>
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                        </div>
                    ) : questions.length === 0 ? (
                        <div className="text-center text-gray-400 text-xl">
                            No questions available yet.
                        </div>
                    ) : (
                        <div>
                            <div className="grid gap-6">
                                {questions.map((question, index) => (
                                    <div
                                        key={question._id}
                                        className={`bg-gray-800 rounded-xl p-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
                                    >
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900 font-bold">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-white mb-4">
                                                    {question.question}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {question.ops.map((option, idx) => (
                                                        <label
                                                            key={idx}
                                                            className="bg-gray-700 p-3 rounded-lg text-gray-200 hover:bg-gray-600 transition-colors flex items-center"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`question-${question._id}`}
                                                                value={option}
                                                                className="mr-2"
                                                                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                                            />
                                                            {option}
                                                        </label>
                                                    ))}
                                                 </div>
                                                {score !== null && (
                                                    <div key={question._id} className="mt-4 flex items-center text-green-500">
                                                        Correct Answer: {question.answer}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                onClick={handleSubmit}
                            >
                                Submit Quiz
                            </button>
                            {score !== null && (
                                <div className="mt-6 text-white">
                                    Your Score: {score} / {questions.length}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
