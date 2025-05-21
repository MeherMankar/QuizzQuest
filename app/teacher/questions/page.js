'use client';
import { useState, useEffect } from 'react';
import NavBar from "../../components/NavBar";

export default function Page() {
    const [options, setOptions] = useState([]);
    const [currentOption, setCurrentOption] = useState('');
    const [questions, setQuestions] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [question, setQuestion] = useState('');
    const [similarQuestions, setSimilarQuestions] = useState([]);
    const [topic, setTopic] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [numberOfQuestions, setNumberOfQuestions] = useState(5);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch('/api/auth/questions');
                const data = await response.json();
                if (response.ok && data.questions) {
                    setQuestions(data.questions);
                } else {
                    console.error('Error fetching questions:', data.error);
                }
            } catch (error) {
                console.error('Failed to fetch questions', error);
            }
        };

        fetchQuestions();
    }, []);

    const handleAddOption = () => {
        if (options.length < 4 && currentOption.trim() !== "") {
            setOptions([...options, currentOption]);
            setCurrentOption("");
        }
    };

    const handleProblem = () => {
        if (correctAnswer.trim() !== '' && options.length === 4 && question.trim() !== '') {
            setQuestions(prevQuestions => [
                ...prevQuestions,
                { question, options: options.slice(), answer: correctAnswer }
            ]);

            setTimeout(() => {
                setOptions([]);
                setQuestion('');
                setCorrectAnswer('');
            }, 100);
        }
    };

    const handleSubmitSet = async () => {
        if (questions.length === 0) {
            console.warn("No questions to submit!");
            return;
        }

        try {
            const formattedQuestions = questions.map(q => ({
                question: q.question,
                ops: Array.isArray(q.options) ? [...q.options] : [],
                answer: q.answer
            }));

            const response = await fetch('/api/auth/questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ questions: formattedQuestions })
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Questions added successfully:', data);
                setQuestions([]);
            } else {
                console.error('Error adding questions:', data.error);
            }
        } catch (error) {
            console.error('Failed to send questions', error);
        }
    };

    const fetchSimilarQuestions = async (input) => {
        if (!input.trim()) {
            setSimilarQuestions([]);
            return;
        }

        try {
            const response = await fetch('/api/auth/getsimilarquestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: input }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setSimilarQuestions(data.similarQuestions.slice(0, 3)); // Limit to 3 suggestions
            } else {
                console.error('Error fetching similar questions:', data.error);
                setSimilarQuestions([]);
            }
        } catch (error) {
            console.error('Failed to fetch similar questions', error);
            setSimilarQuestions([]);
        }
    };

    const handleAutoGenerate = async () => {
        if (!topic.trim()) {
            alert("Please enter a topic first!");
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch("/api/auth/autogeneratequiz", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ topic, numberOfQuestions }),
            });

            const data = await response.json();
            if (response.ok && data.questions) {
                const transformedQuestions = data.questions.map(apiQ => ({
                    question: apiQ.question,
                    options: apiQ.ops || apiQ.options || [], // Standardize to 'options'
                    answer: apiQ.answer
                }));
                setQuestions(prevQuestions => [...prevQuestions, ...transformedQuestions]);
            } else {
                console.error("Error generating questions:", data.error || "No questions returned");
                alert("Failed to generate questions. Please try again.");
            }
        } catch (error) {
            console.error("Failed to generate questions", error);
            alert("Failed to generate questions. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClearQuestions = async () => {
        try {
            const response = await fetch('/api/auth/questions', {
                method: 'DELETE',
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Questions cleared successfully:', data);
                setQuestions([]);
            } else {
                console.error('Error clearing questions:', data.error);
            }
        } catch (error) {
            console.error('Failed to clear questions', error);
        }
    };

    return (
        <>
            <NavBar />
            <div
                style={{
                    backgroundImage: `url("/wavy_smoothed.png")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backdropFilter: "blur(10px)",
                    width: "100%",
                    minHeight: "91.5vh" 
                }}
                className="flex flex-col items-center justify-center" 
            >
                <div className='flex flex-col lg:flex-row items-center lg:items-start justify-center min-h-full w-full backdrop-blur-md p-4 sm:p-6 md:p-8'>
                    {/* Main Question Form Section */}
                    <div className="flex flex-col items-center bg-black text-white rounded-lg shadow-lg p-6 sm:p-8 w-full max-w-xl lg:max-w-2xl">
                        {/* Auto-generate section */}
                        <div className="flex flex-col w-full mb-4 space-y-2">
                            <input
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="outline-none border text-black rounded-md p-3 focus:ring-2 focus:ring-blue-500 w-full"
                                placeholder="Enter topic for auto-generation (e.g., 'JavaScript Basics')"
                            />
                            <button 
                                 className={`bg-green-500 text-white rounded-lg px-6 py-2.5 font-semibold hover:bg-green-400 transition duration-200 shadow-md ${isGenerating ? "opacity-50 cursor-not-allowed" : ""} w-full`}
                                onClick={handleAutoGenerate}
                                disabled={isGenerating}
                            >
                                {isGenerating ? "Generating..." : "Auto Generate Questions"}
                            </button>
                            <input
                                type="number"
                                value={numberOfQuestions}
                                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value, 10))}
                                min="1"
                                defaultValue="5"
                                className="outline-none border text-black rounded-md p-3 focus:ring-2 focus:ring-blue-500 w-20"
                            />
                        </div>
                        <div className="text-lg font-semibold my-4 text-yellow-400">- OR -</div>
                        {/* Manual question input section */}
                        <input
                            onChange={(e) => {
                                setQuestion(e.target.value);
                                fetchSimilarQuestions(e.target.value);
                            }}
                            value={question}
                            className="outline-none w-full border text-black rounded-md mb-3 p-3 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your question"
                        />
                        <input
                            value={currentOption}
                            className="outline-none w-full border text-black rounded-md mb-3 p-3 focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setCurrentOption(e.target.value)}
                            placeholder="Enter an option"
                        />
                        <input
                            value={correctAnswer}
                            onChange={(e) => setCorrectAnswer(e.target.value)}
                            className="outline-none w-full border text-black rounded-md mb-4 p-3 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter the correct answer (must be one of the options)"
                        />
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-4 w-full">
                            <button className="bg-slate-700 text-white hover:bg-slate-600 py-2.5 px-6 rounded-lg font-semibold transition duration-200 shadow-md w-full sm:w-auto" onClick={handleProblem}>
                                Add Problem
                            </button>
                            <button className="bg-slate-700 text-white hover:bg-slate-600 py-2.5 px-6 rounded-lg font-semibold transition duration-200 shadow-md w-full sm:w-auto" onClick={handleAddOption}>
                                Add Option
                            </button>
                            <button className="bg-yellow-500 text-black hover:bg-yellow-400 py-2.5 px-6 rounded-lg font-semibold transition duration-200 shadow-md w-full sm:w-auto" onClick={handleSubmitSet}>
                                Submit This Set
                            </button>
                            <button className="bg-red-500 text-white hover:bg-red-400 py-2.5 px-6 rounded-lg font-semibold transition duration-200 shadow-md w-full sm:w-auto" onClick={handleClearQuestions}>
                                Clear Questions
                            </button>
                        </div>
                        {options.length > 0 && (
                            <div className="overflow-y-auto max-h-[150px] sm:max-h-[200px] w-full mt-4 space-y-1">
                                {options.map((option, i) => (
                                    <div className="p-2 rounded border border-yellow-400 w-full text-sm sm:text-base" key={i}>
                                        {i + 1}. {option}
                                    </div>
                                ))}
                            </div>
                        )}
                        {questions.length > 0 && (
                            <div className="mt-5 w-full space-y-3">
                                {questions.map((q, index) => (
                                    <div className="flex flex-col text-white rounded-md p-3 sm:p-4 border border-gray-700" key={index}>
                                        <div className="text-md sm:text-lg font-semibold text-yellow-300"><strong>Question:</strong> {q.question || 'N/A'}</div>
                                        <ul className="flex flex-col space-y-1 mt-2 text-sm sm:text-base">
                                            {q.options && Array.isArray(q.options) ? (
                                                q.options.map((option, i) => (
                                                    <li className="p-1" key={i}>{i + 1}. {option}</li>
                                                ))
                                            ) : (
                                                <li className="p-1 text-gray-400">No options available.</li>
                                            )}
                                        </ul>
                                        <div className="text-sm text-green-400 mt-1">Correct: {q.answer || 'N/A'}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Similar Questions Sidebar */}
                    <div className="flex flex-col bg-gray-800 text-white rounded-md p-4 sm:p-6 w-full max-w-md lg:w-72 xl:w-80 mt-8 lg:mt-0 lg:ml-8">
                        <h3 className="text-yellow-400 font-semibold mb-2 text-lg sm:text-xl">Similar Questions:</h3>
                        {similarQuestions.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                                {similarQuestions.map((q, index) => (
                                    <li key={index} className="text-sm sm:text-base">{q}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm sm:text-base text-gray-400">Type a question to see suggestions.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
