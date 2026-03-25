'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function CatchTheAnswerGame({ questionData, onGameEnd }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [questionId, setQuestionId] = useState(null);
  const [basketPos, setBasketPos] = useState(50);
  const [fallingOptions, setFallingOptions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const gameAreaRef = useRef(null);
  const answeredRef = useRef(false);
  const gameInProgressRef = useRef(true);
  const startTime = useRef(Date.now());
  const gameTimeoutRef = useRef(null);
  const dropIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Load question from props
  useEffect(() => {
    if (questionData) {
      setQuestion(questionData.question);
      setOptions(questionData.ops);
      setCorrectAnswer(questionData.answer);
      setQuestionId(questionData._id || `ai_q_${Date.now()}`);
      answeredRef.current = false;
      setFallingOptions([]);
      setTimeLeft(30);
      gameInProgressRef.current = true;
      startTime.current = Date.now();
      
      // Start game timeout
      gameTimeoutRef.current = setTimeout(() => {
        if (!answeredRef.current && gameInProgressRef.current) {
          answeredRef.current = true;
          gameInProgressRef.current = false;
          if (onGameEnd) {
            onGameEnd({ scoreIncrement: 0, wasCorrect: false, timedOut: true });
          }
        }
      }, 30000);
    } else if (onGameEnd) {
      onGameEnd({ error: "No question data provided to game." });
    }
  }, [questionData, onGameEnd]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      gameInProgressRef.current = false;
      if (gameTimeoutRef.current) clearTimeout(gameTimeoutRef.current);
      if (dropIntervalRef.current) clearInterval(dropIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const startGame = useCallback(() => {
    if (!gameInProgressRef.current) return;

    const createFallingOption = () => {
      if (!gameInProgressRef.current) return;
      
      // Limit max falling options to prevent overflow
      setFallingOptions(prev => {
        if (prev.length >= 5) return prev; // Max 5 options at once
        
        const randomOption = options[Math.floor(Math.random() * options.length)];
        const newOption = {
          text: randomOption,
          x: Math.random() * 80 + 10, // Keep within 10-90% of screen width
          y: 0,
          speed: 1.5 + Math.random() * 1,
          id: Date.now() + Math.random(),
          isCorrect: randomOption === correctAnswer
        };
        return [...prev, newOption];
      });
    };

    // Start dropping options
    dropIntervalRef.current = setInterval(() => {
      if (!gameInProgressRef.current) {
        clearInterval(dropIntervalRef.current);
        return;
      }
      createFallingOption();
    }, 2500);

    // Timer countdown
    const timerInterval = setInterval(() => {
      if (!gameInProgressRef.current) {
        clearInterval(timerInterval);
        return;
      }
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          if (!answeredRef.current) {
            answeredRef.current = true;
            gameInProgressRef.current = false;
            if (onGameEnd) {
              onGameEnd({ scoreIncrement: 0, wasCorrect: false, timedOut: true });
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Animation frame for moving options
    const updateGame = () => {
      if (!gameInProgressRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        return;
      }

      setFallingOptions(prevOptions => {
        return prevOptions.map(option => ({
          ...option,
          y: option.y + option.speed
        })).filter(option => option.y < 100); // Remove options that fall off screen
      });

      animationFrameRef.current = requestAnimationFrame(updateGame);
    };
    animationFrameRef.current = requestAnimationFrame(updateGame);

    // Cleanup function
    return () => {
      if (dropIntervalRef.current) clearInterval(dropIntervalRef.current);
      if (timerInterval) clearInterval(timerInterval);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [options, correctAnswer, onGameEnd]);

  // Game area event handlers
  useEffect(() => {
    if (!gameAreaRef.current) return;

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const gameArea = gameAreaRef.current;
      const rect = gameArea.getBoundingClientRect();
      const relativeX = touch.clientX - rect.left;
      const maxX = gameArea.offsetWidth - 100;
      setBasketPos(Math.max(0, Math.min(relativeX, maxX)));
    };

    const handleMouseMove = (e) => {
      const gameArea = gameAreaRef.current;
      const rect = gameArea.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const maxX = gameArea.offsetWidth - 100;
      setBasketPos(Math.max(0, Math.min(relativeX, maxX)));
    };

    const gameArea = gameAreaRef.current;
    gameArea.addEventListener('touchmove', handleTouchMove, { passive: false });
    gameArea.addEventListener('mousemove', handleMouseMove);

    return () => {
      gameArea.removeEventListener('touchmove', handleTouchMove);
      gameArea.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Start game when component mounts
  useEffect(() => {
    const cleanup = startGame();
    return () => {
      if (cleanup) cleanup();
    };
  }, [startGame]);



  // Check for collisions between basket and falling options
  useEffect(() => {
    if (!gameAreaRef.current || answeredRef.current) return;

    fallingOptions.forEach(option => {
      if (answeredRef.current) return;

      // Improved collision detection using percentage-based coordinates
      const basketLeft = basketPos - 5; // Basket width consideration
      const basketRight = basketPos + 5;
      const basketTop = 85; // Basket is at 85% from top
      
      if (
        option.y >= basketTop &&
        option.x >= basketLeft &&
        option.x <= basketRight
      ) {
        // Collision detected
        answeredRef.current = true;
        gameInProgressRef.current = false;

        const isCorrect = option.text === correctAnswer;
        
        // Handle the answer
        const handleAnswer = async () => {
          try {
            await fetch('/api/auth/verifyanswer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                questionId: questionId,
                selectedAnswer: option.text,
              }),
            });

            await fetch('/api/auth/recordAnswer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                questionId: questionId,
                isCorrect: isCorrect,
              }),
            });

            if (onGameEnd) {
              onGameEnd({
                scoreIncrement: isCorrect ? 1 : 0,
                wasCorrect: isCorrect
              });
            }
          } catch (error) {
            console.error('Error processing answer:', error);
            if (onGameEnd) {
              onGameEnd({
                error: "Failed to process answer",
                scoreIncrement: 0,
                wasCorrect: false
              });
            }
          }
        };

        handleAnswer();
        setFallingOptions([]); // Clear options
      }
    });
  }, [fallingOptions, basketPos, correctAnswer, questionId, onGameEnd]);

  if (!questionData) {
    return <div className="text-center p-4 text-white">Loading game...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col items-center bg-gray-800/50 backdrop-blur-lg p-4 rounded-xl">
      <h2 className="text-xl sm:text-2xl mb-2 text-white text-center font-bold">🧺 Catch the Answer!</h2>
      <div className="text-lg font-bold text-yellow-400 mb-2">Time: {timeLeft}s</div>
      <p className="mb-4 text-lg text-center text-gray-200 max-w-2xl">{question}</p>

      <div
        ref={gameAreaRef}
        className="relative w-full h-[60vh] bg-gray-900/50 border-2 border-yellow-500/30 rounded-xl overflow-hidden"
      >
        {fallingOptions.map(opt => (
          <div
            key={opt.id}
            className="absolute px-3 py-2 min-w-[6rem] text-center rounded-lg shadow-lg"
            style={{
              left: `${opt.x}%`,
              top: `${opt.y}%`,
              transform: 'translate(-50%, -50%)',
              background: opt.isCorrect ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)',
              border: `2px solid ${opt.isCorrect ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'}`,
            }}
          >
            <span className="text-sm text-white font-semibold">{opt.text}</span>
          </div>
        ))}

        <div
          className="absolute w-20 h-8 transition-all duration-100"
          style={{
            left: `${basketPos}%`,
            bottom: '1rem',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(to right, rgba(234, 179, 8, 0.8), rgba(234, 179, 8, 0.6))',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        ></div>
      </div>

      <p className="mt-4 text-sm text-gray-400">Move your cursor or touch to control the basket</p>
    </div>
  );
}
