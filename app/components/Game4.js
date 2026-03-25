'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function FlappyQuizGame({ questionData, onGameEnd }) {
  const [questionText, setQuestionText] = useState('');
  const [actualCorrectAnswer, setActualCorrectAnswer] = useState('');
  const [currentQuestionId, setCurrentQuestionId] = useState('');
  
  // State for rendering
  const [birdRenderPos, setBirdRenderPos] = useState({ x: 10, y: 50 });
  const [answerElementsRender, setAnswerElementsRender] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [birdRotation, setBirdRotation] = useState(0);

  // Refs for game logic state
  const birdPosRef = useRef({ x: 10, y: 50 });
  const velocityRef = useRef(0); // Vertical velocity in %height/s
  const answerElementsRef = useRef([]);
  
  const gameAreaRef = useRef(null);
  const gameLoopIdRef = useRef(null); 
  const answeredRef = useRef(false);
  const lastTimeRef = useRef(performance.now());

  // Physics constants for delta-time scaling
  const DT_GRAVITY = 150;                   // %height / s^2 (Reverted to previously tuned value)
  const DT_JUMP_VELOCITY = -60;             // %height / s (Reverted to previously tuned value)
  const DT_MAX_FALL_SPEED = 120;            // %height / s 
  const DT_HORIZONTAL_PIPE_SPEED = 25;      // %width / s
  const DT_BIRD_ROTATION_FACTOR = 0.5;      // degrees per (%height/s) of velocity
  
  const PIPE_WIDTH_PERCENT = 8;
  const PIPE_GAP_HEIGHT_PERCENT = 28;
  const SPACE_BETWEEN_PIPES_PERCENT = 35;


  // Initialize/Reset game state when questionData changes
  useEffect(() => {
    answeredRef.current = false;
    setGameStarted(false);
    velocityRef.current = 0;
    birdPosRef.current = { x: 10, y: 50 };
    setBirdRenderPos(birdPosRef.current);
    setBirdRotation(0);
    lastTimeRef.current = performance.now(); // Reset lastTime for dt calculation

    if (!questionData || !questionData.ops || !questionData.answer) {
      if (onGameEnd && !answeredRef.current) {
        answeredRef.current = true;
        onGameEnd({ error: "Invalid question data for FlappyQuizGame" });
      }
      return;
    }

    setQuestionText(questionData.question);
    setActualCorrectAnswer(questionData.answer);
    setCurrentQuestionId(questionData._id || `ai_flappy_q_${Date.now()}`);

    const initialPipes = questionData.ops.map((option, index) => {
      const gapY = Math.random() * (100 - PIPE_GAP_HEIGHT_PERCENT - 20) + 10;
      return {
        optionText: option,
        isCorrect: option === questionData.answer,
        id: `pipegroup-${Date.now()}-${index}`,
        x: 100 + index * SPACE_BETWEEN_PIPES_PERCENT,
        topPipe: { y: 0, height: gapY },
        bottomPipe: { y: gapY + PIPE_GAP_HEIGHT_PERCENT, height: 100 - (gapY + PIPE_GAP_HEIGHT_PERCENT) },
        width: PIPE_WIDTH_PERCENT,
      };
    });
    answerElementsRef.current = initialPipes;
    setAnswerElementsRender([...initialPipes]);

  }, [questionData, onGameEnd]);


  // Game Loop using requestAnimationFrame
  const gameLoop = useCallback(() => {
    if (!gameStarted || answeredRef.current) {
      if (gameLoopIdRef.current) cancelAnimationFrame(gameLoopIdRef.current);
      return;
    }

    const currentTime = performance.now();
    let dt = (currentTime - lastTimeRef.current) / 1000.0; // Delta time in seconds
    lastTimeRef.current = currentTime;

    // Cap dt to prevent large jumps on frame skips (e.g., tab inactive)
    const MAX_DT = 1 / 30; // Max dt is 1/30th of a second
    if (dt > MAX_DT) dt = MAX_DT;

    // Bird physics
    velocityRef.current += DT_GRAVITY * dt;
    // Apply terminal velocity
    if (velocityRef.current > DT_MAX_FALL_SPEED) {
      velocityRef.current = DT_MAX_FALL_SPEED;
    }
    birdPosRef.current.y += velocityRef.current * dt;
    birdPosRef.current.y = Math.max(0, Math.min(birdPosRef.current.y, 95)); // Clamp position
    
    // Update bird rotation based on velocity
    const newRotation = Math.max(-45, Math.min(velocityRef.current * DT_BIRD_ROTATION_FACTOR, 90)); // Adjusted rotation limits

    // Move pipes
    answerElementsRef.current = answerElementsRef.current
      .map(el => ({ ...el, x: el.x - (DT_HORIZONTAL_PIPE_SPEED * dt) }))
      .filter(el => el.x > -el.width); 

    // Update React state for rendering
    setBirdRenderPos({ ...birdPosRef.current }); 
    setBirdRotation(newRotation);
    setAnswerElementsRender([...answerElementsRef.current]);

    // Collision detection
    // Bird's visual center is at birdPosRef.current.x, birdPosRef.current.y
    // Bird's visual width/height is 5% of the container.
    // For collision, let's use a slightly smaller hitbox or adjust based on visual representation.
    // Assuming birdRenderPos is top-left for collision rect:
    const birdHitboxWidth = 4; // %
    const birdHitboxHeight = 4; // %
    const birdRect = { 
        x: birdPosRef.current.x - birdHitboxWidth / 2, 
        y: birdPosRef.current.y - birdHitboxHeight / 2, 
        width: birdHitboxWidth, 
        height: birdHitboxHeight 
    };


    if (birdPosRef.current.y <= (birdHitboxHeight/2) || birdPosRef.current.y >= (95 - birdHitboxHeight/2)) { // Hit top/bottom boundary
      if (!answeredRef.current) {
        answeredRef.current = true;
        if (onGameEnd) onGameEnd({ scoreIncrement: 0, wasCorrect: false, gameOverType: 'boundary_hit' });
      }
    }

    for (const pipeGroup of answerElementsRef.current) {
      // Pipe collision boxes (top and bottom)
      const topPipeRect = { x: pipeGroup.x, y: 0, width: pipeGroup.width, height: pipeGroup.topPipe.height };
      const bottomPipeRect = { x: pipeGroup.x, y: pipeGroup.bottomPipe.y, width: pipeGroup.width, height: pipeGroup.bottomPipe.height };

      const collides = (rect1, rect2) => 
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;

      if (collides(birdRect, topPipeRect) || collides(birdRect, bottomPipeRect)) {
        if (!answeredRef.current) {
          answeredRef.current = true;
          const isCorrectHit = pipeGroup.isCorrect; // This logic might need review: hitting *any* pipe of the correct group?
                                                  // Or should it be flying *through* the correct gap?
                                                  // For now, hitting the pipe group itself is the trigger.
          
          fetch('/api/auth/verifyanswer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questionId: currentQuestionId, selectedAnswer: pipeGroup.optionText }) })
          .then(res => res.json())
          .then(verificationData => fetch('/api/auth/recordAnswer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questionId: currentQuestionId, isCorrect: verificationData.isCorrect }) }))
          .then(() => { if (onGameEnd) onGameEnd({ scoreIncrement: isCorrectHit ? 1 : 0, wasCorrect: isCorrectHit });})
          .catch(err => { console.error("FlappyQuiz API error:", err); if (onGameEnd) onGameEnd({ error: "API Error", scoreIncrement: 0, wasCorrect: false }); });
        }
        break; 
      }
    }

    if (!answeredRef.current) {
        gameLoopIdRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameStarted, currentQuestionId, actualCorrectAnswer, onGameEnd]); 

  // Effect to start/stop game loop
  useEffect(() => {
    if (gameStarted && !answeredRef.current) {
      gameLoopIdRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopIdRef.current) {
        cancelAnimationFrame(gameLoopIdRef.current);
      }
    }
    return () => {
      if (gameLoopIdRef.current) {
        cancelAnimationFrame(gameLoopIdRef.current);
      }
    };
  }, [gameStarted, gameLoop]);


  const handleUserInteraction = () => {
    if (answeredRef.current) return;
    if (!gameStarted) {
      setGameStarted(true);
      lastTimeRef.current = performance.now(); // Ensure lastTime is set when game actually starts
    }
    velocityRef.current = DT_JUMP_VELOCITY; // Corrected to use defined constant
  };
  
  if (!questionData) {
    return <div className="text-center p-4 text-white">Loading Flappy Quiz...</div>;
  }

  return (
    <div 
      className="w-full h-full bg-cyan-400 flex flex-col items-center justify-center relative overflow-hidden select-none" 
      onClick={handleUserInteraction}
      onTouchStart={(e) => { e.preventDefault(); handleUserInteraction(); }} // Prevent default for touch
      role="button" // Accessibility
      tabIndex={0} // Accessibility
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') handleUserInteraction(); }} // Accessibility
    >
      <div className='absolute top-2 md:top-4 left-1/2 -translate-x-1/2 text-center z-20 p-2'>
        <span className='bg-black/30 backdrop-blur-sm text-white p-3 rounded-md shadow-lg text-sm md:text-lg'>
            {questionText || 'Fly through the correct answer!'}
        </span>
      </div>
      {!gameStarted && <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-2xl z-10 bg-black/50 p-4 rounded-lg">Tap, Click, or Press Space/Enter to Start!</p>}

      <div ref={gameAreaRef} className="w-full h-full relative">
        <div 
          className="absolute bg-yellow-400 w-[5%] h-[5%] rounded-full shadow-lg"
          style={{
            left: `${birdRenderPos.x}%`,
            top: `${birdRenderPos.y}%`,
            transform: `translate(-50%, -50%) rotate(${birdRotation}deg)`,
            // transition: 'top 0.03s linear', // Removed for JS-driven animation
          }}
        >
          <div className="absolute w-1/4 h-1/4 bg-black rounded-full top-1/4 right-1/4"></div>
        </div>

        {answerElementsRender.map((pipeGroup) => (
          <div key={pipeGroup.id} style={{ position: 'absolute', left: `${pipeGroup.x}%`, top: '0%', width: `${pipeGroup.width}%`, height: '100%' }}>
            <div 
              className={`absolute left-0 top-0 w-full ${pipeGroup.isCorrect ? 'bg-green-500 border-green-700' : 'bg-red-600 border-red-700'} border-2 shadow-md`}
              style={{ height: `${pipeGroup.topPipe.height}%` }}
            >
                <div className="absolute bottom-0 left-0 w-full h-4 bg-black/20"></div>
            </div>
            <div 
              className={`absolute left-0 bottom-0 w-full ${pipeGroup.isCorrect ? 'bg-green-500 border-green-700' : 'bg-red-600 border-red-700'} border-2 shadow-md`}
              style={{ height: `${pipeGroup.bottomPipe.height}%` }}
            >
                <div className="absolute top-0 left-0 w-full h-4 bg-black/20"></div>
            </div>
            <div className="absolute w-full text-center text-white text-[0.6rem] sm:text-xs md:text-sm font-bold" style={{top: `${pipeGroup.topPipe.height + (PIPE_GAP_HEIGHT_PERCENT/2)}%` , transform: 'translateY(-50%)', pointerEvents: 'none', textShadow: '1px 1px 2px black'}}>
                {pipeGroup.optionText}
            </div>
          </div>
        ))}
      </div>
      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-sm z-20 bg-black/30 p-2 rounded">Tap/Click or Space/Enter to Flap!</p>
    </div>
  );
}
