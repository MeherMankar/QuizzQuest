'use client';
import { useState, useEffect, useRef } from 'react';
// useRouter might not be needed if navigation is handled by parent
// import { useRouter } from 'next/navigation'; 

// Props: questionData ({ question, ops, answer, _id (optional) }), onGameEnd (callback)
export default function CatchTheAnswerGame({ questionData, onGameEnd }) {
  // const router = useRouter(); // Only if direct navigation is still needed for some edge case
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [questionId, setQuestionId] = useState(null);

  const [basketPos, setBasketPos] = useState(50);
  const [fallingOptions, setFallingOptions] = useState([]);
  // Score here is per-game instance (per question)
  // The parent page (PlayAutoQuizGamePage) will manage the overall quiz score.
  // const [score, setScore] = useState(0); 
  const gameAreaRef = useRef(null);
  const answeredRef = useRef(false); // To prevent multiple answers for the same game instance

  // Load question from props
  useEffect(() => {
    if (questionData) {
      setQuestion(questionData.question);
      setOptions(questionData.ops);
      setCorrectAnswer(questionData.answer);
      setQuestionId(questionData._id || `ai_q_${Date.now()}`); // Use provided ID or generate one
      answeredRef.current = false; // Reset answered state for new question
      setFallingOptions([]); // Clear previous falling options
    } else if (onGameEnd) { // If no question data, maybe signal an error or end
        onGameEnd({ error: "No question data provided to game." });
    }
    // If this game is also used by viewquestions, it might still need to load from localStorage
    // For now, focusing on AI quiz flow.
  }, [questionData, onGameEnd]);

  // Spawn falling options
  useEffect(() => {
    if (!options || !options.length || answeredRef.current || !correctAnswer) return;

    const spawnOption = () => {
      // Ensure options is an array before trying to use Math.random
      if (!Array.isArray(options) || options.length === 0) return;
      const optionText = options[Math.floor(Math.random() * options.length)];
      setFallingOptions(prev => [...prev, {
        option: optionText,
        x: Math.random() * 80 + 10, // 10-90% width
        y: 0,
        id: Date.now() + Math.random(),
        correct: optionText === correctAnswer // Compare with the actual correct answer string
      }]);
    };

    const interval = setInterval(spawnOption, 1500);
    return () => clearInterval(interval);
  }, [options, correctAnswer, answeredRef]); // Added correctAnswer and answeredRef

  // Move falling options & handle catch
  useEffect(() => {
    if (answeredRef.current || !questionId) return; // Don't run if answered or no questionId

    const moveOptions = () => {
      setFallingOptions(prevFallingOpts =>
        prevFallingOpts
          .map(opt => ({ ...opt, y: opt.y + 2 }))
          .filter(opt => {
            // Check if caught in basket
            if (
              opt.y > 80 &&
              opt.x > basketPos - 10 &&
              opt.x < basketPos + 10 &&
              !answeredRef.current // Double check not answered
            ) {
              answeredRef.current = true; // Mark as answered immediately
              const caughtOptionIsCorrect = opt.correct;

              // API calls to verify and record answer
              // These should ideally use the questionId from props/state
              fetch('/api/auth/verifyanswer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  questionId: questionId, // Use questionId from state
                  selectedAnswer: opt.option,
                }),
              })
              .then(res => res.json())
              .then(verificationData => {
                return fetch('/api/auth/recordAnswer', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    questionId: questionId, // Use questionId from state
                    isCorrect: verificationData.isCorrect, // Use verified correctness
                  }),
                });
              })
              .then(() => {
                if (onGameEnd) {
                  // Pass result to parent: true if correct, false if incorrect
                  onGameEnd({ scoreIncrement: caughtOptionIsCorrect ? 1 : 0, wasCorrect: caughtOptionIsCorrect }); 
                }
              })
              .catch(error => {
                console.error('Error processing answer:', error);
                if (onGameEnd) {
                  onGameEnd({ error: "Failed to process answer", scoreIncrement: 0, wasCorrect: false });
                }
              });
              return false; // Remove caught option
            }
            return opt.y < 100; // Keep options that are still on screen
          })
      );
    };

    const gameLoop = setInterval(moveOptions, 50);
    return () => clearInterval(gameLoop);
  }, [basketPos, questionId, onGameEnd]); // Dependencies

  // Handle mouse/touch movement - remains largely the same
  useEffect(() => {
    const handleMove = (clientX) => {
      if (!gameAreaRef.current || answeredRef.current) return; // Stop if answered
      const rect = gameAreaRef.current.getBoundingClientRect();
      const pos = ((clientX - rect.left) / rect.width) * 100;
      setBasketPos(Math.max(10, Math.min(90, pos)));
    };

    const mouseMove = (e) => handleMove(e.clientX);
    const touchMove = (e) => handleMove(e.touches[0].clientX);

    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('touchmove', touchMove);
    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('touchmove', touchMove);
    };
  }, []); // No new dependencies here, but logic inside handleMove checks answeredRef

  if (!questionData) {
    return <div className="text-center p-4">Loading game or no question data...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col items-center bg-blue-100 p-2 sm:p-4"> {/* Adjusted padding for small screens */}
      <h1 className="text-xl sm:text-2xl mb-2 text-center">🧺 Catch the Answer!</h1> {/* Responsive font size and centered */}
      <p className="mb-4 font-bold text-center text-sm sm:text-base">{question}</p> {/* Responsive font size */}
      {/* Score display might be handled by parent page for overall quiz score */}
      {/* <p className="mb-2">Score: {score}</p> */}

      <div
        ref={gameAreaRef}
        className="relative w-full h-3/4 bg-blue-200 border-2 border-blue-300 rounded-lg overflow-hidden"
      >
        {fallingOptions.map(opt => (
          <div
            key={opt.id}
            className={`absolute w-auto px-1 sm:px-2 py-1 h-auto min-w-[2.5rem] sm:min-w-[3rem] min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center rounded-lg ${
              opt.correct ? 'bg-green-500' : 'bg-red-500' // Color based on actual correctness
            }`}
            style={{
              left: `${opt.x}%`,
              top: `${opt.y}%`,
              transform: 'translateX(-50%)', // Center the option horizontally
              transition: 'top 0.05s linear'
            }}
          >
            <span className="text-xs text-white text-center">{opt.option}</span>
          </div>
        ))}

        <div
          className="absolute bottom-4 w-16 sm:w-20 h-6 sm:h-8 bg-brown-500" /* Responsive basket size */
          style={{
            left: `${basketPos}%`, // Basket position centered
            transform: 'translateX(-50%)', // Center the basket
            background: 'linear-gradient(to right, #8B4513, #A0522D)',
            clipPath: 'polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)'
          }}
        ></div>
      </div>
      <p className="mt-4 text-sm">Move mouse/touch to control basket</p>
    </div>
  );
}
