'use client';

import { useEffect, useRef, useState } from 'react';
// import { useRouter } from 'next/navigation'; // Not needed if onGameEnd is used
import kaboom from 'kaboom';

// Props: questionData ({ question, ops, answer, _id (optional) }), onGameEnd (callback)
export default function ShootingQuizGame({ questionData, onGameEnd }) {
    const [questionText, setQuestionText] = useState('');
    const [currentQuestionId, setCurrentQuestionId] = useState('');
    const [optionsToDisplay, setOptionsToDisplay] = useState([]);
    const [actualCorrectAnswer, setActualCorrectAnswer] = useState('');
    
    const kRef = useRef(null);
    const gameEndedRef = useRef(false); // To prevent multiple onGameEnd calls

    useEffect(() => {
        gameEndedRef.current = false; // Reset for new game instance
        if (!questionData || !questionData.ops || !questionData.answer) {
            if (onGameEnd && !gameEndedRef.current) {
                gameEndedRef.current = true;
                onGameEnd({ error: "Invalid question data for ShootingQuizGame" });
            }
            return;
        }

        setQuestionText(questionData.question);
        setCurrentQuestionId(questionData._id || `ai_shoot_q_${Date.now()}`);
        setActualCorrectAnswer(questionData.answer);
        // Shuffle options to make game unpredictable, ensure correct answer is included
        const shuffledOps = [...questionData.ops].sort(() => Math.random() - 0.5);
        setOptionsToDisplay(shuffledOps);

    }, [questionData, onGameEnd]);

    useEffect(() => {
        if (optionsToDisplay.length === 0 || !currentQuestionId || !actualCorrectAnswer) return;
        
        gameEndedRef.current = false; // Ensure it's reset when Kaboom instance starts

        let kInstance = kRef.current;
        if (kInstance) {
            try { kInstance.quit(); } catch (e) { console.warn("Kaboom cleanup error:", e); }
        }

        const gameContainer = document.getElementById('gameContainer-shooting');
        if (!gameContainer) {
            console.error("Game container 'gameContainer-shooting' not found.");
            if(onGameEnd && !gameEndedRef.current) {
                gameEndedRef.current = true;
                onGameEnd({error: "Game container not found"});
            }
            return;
        }
        gameContainer.innerHTML = ''; 
        const canvas = document.createElement('canvas');
        // canvas.id will be set by kaboom if not provided
        gameContainer.appendChild(canvas);
        
        kInstance = kaboom({
            global: false,
            width: gameContainer.clientWidth || 800,
            height: gameContainer.clientHeight || 600,
            canvas: canvas,
            background: [20, 20, 20],
        });
        kRef.current = kInstance;
        const k = kInstance;

        const canvasWidth = k.width();
        const canvasHeight = k.height();

        const instructions = k.add([
            k.text("LEFT/RIGHT to move, SPACE to shoot!", { size: Math.min(24, canvasWidth/30), width: canvasWidth * 0.9, align: "center" }),
            k.pos(canvasWidth / 2, canvasHeight / 2), k.anchor("center"), k.color(255, 255, 255), "instructions",
        ]);
        k.wait(3, () => instructions.destroy());

        const player = k.add([
            k.rect(Math.min(60, canvasWidth/15), Math.min(30, canvasHeight/25)), k.pos(canvasWidth / 2, canvasHeight - 60),
            k.color(0, 255, 0), k.area(), "player",
        ]);

        k.onKeyDown("left", () => player.move(-400, 0));
        k.onKeyDown("right", () => player.move(400, 0));
        k.onKeyPress("space", () => {
            if (gameEndedRef.current) return; // Don't shoot if game ended
            k.add([
                k.circle(Math.min(6, canvasWidth/150)), k.pos(player.pos.x + player.width / 2, player.pos.y),
                k.color(255, 255, 255), k.area(), k.move(k.vec2(0, -1), 1000), "bullet",
            ]);
        });

        optionsToDisplay.forEach((option, index) => {
            const boxWidth = Math.min(120, canvasWidth/7);
            const boxHeight = Math.min(60, canvasHeight/12);
            const startX = index % 2 === 0 ? boxWidth/2 : canvasWidth - (boxWidth*1.5);
            const directionX = startX < canvasWidth / 2 ? 1 : -1;
            const y = 60 + index * (boxHeight + 15);
            const speedX = 150 + Math.random() * 80;

            const box = k.add([
                k.rect(boxWidth, boxHeight), k.pos(startX, y), k.color(0, 0, 255),
                k.outline(2, k.rgb(255, 255, 255)), k.area(), "box",
                { optionValue: option, directionX, speedX }
            ]);
            const label = k.add([
                k.text(option, { size: Math.min(14, boxHeight/3), width: boxWidth * 0.9, align: "center" }),
                k.pos(box.pos.x + boxWidth / 2, box.pos.y + boxHeight / 2),
                k.anchor("center"), k.color(255, 255, 255),
            ]);
            box.onUpdate(() => {
                if (gameEndedRef.current) return;
                box.move(box.directionX * box.speedX, 0);
                if (box.pos.x < 0 || box.pos.x + box.width > canvasWidth) {
                    box.directionX *= -1;
                }
                label.pos = box.pos.add(box.width / 2, box.height / 2);
            });
        });

        k.onCollide("bullet", "box", async (bullet, box) => {
            if (gameEndedRef.current) return;
            gameEndedRef.current = true; // Mark game as ended on first hit

            bullet.destroy();
            // box.destroy(); // Optional: destroy box on hit, or leave it
            
            const selectedAnswer = box.optionValue;
            const isCorrect = selectedAnswer === actualCorrectAnswer;

            try {
                await fetch('/api/auth/verifyanswer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questionId: currentQuestionId, selectedAnswer }) });
                await fetch('/api/auth/recordAnswer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questionId: currentQuestionId, isCorrect }) });
                if (onGameEnd) onGameEnd({ scoreIncrement: isCorrect ? 1 : 0, wasCorrect: isCorrect });
            } catch (error) {
                console.error('Error processing answer:', error);
                if (onGameEnd) onGameEnd({ error: "API error", scoreIncrement: 0, wasCorrect: false });
            }
        });
        
        const gameDuration = 20; // seconds
        const timerText = k.add([
            k.text(`Time: ${gameDuration}`, {size: Math.min(20, canvasWidth/35)}),
            k.pos(canvasWidth - 10, 10),
            k.anchor("topright"),
            k.color(255,255,0)
        ]);
        let timeLeft = gameDuration;
        const timerInterval = k.loop(1, () => {
            if (gameEndedRef.current) {
                timerInterval.cancel(); // Stop timer if game ended by collision
                return;
            }
            timeLeft--;
            timerText.text = `Time: ${timeLeft}`;
            if (timeLeft <= 0) {
                timerInterval.cancel();
                if (!gameEndedRef.current) { // If game hasn't ended by collision
                    gameEndedRef.current = true;
                    if (onGameEnd) onGameEnd({ scoreIncrement: 0, wasCorrect: false, timedOut: true });
                }
            }
        });


        return () => { // Cleanup
            if (kRef.current) {
                try { kRef.current.quit(); } catch (e) { console.warn("Kaboom cleanup error on unmount:", e); }
                kRef.current = null;
            }
        };
    }, [optionsToDisplay, currentQuestionId, actualCorrectAnswer, onGameEnd]);


    if (!questionData) {
        return <div className="text-center p-4 text-white">Loading Shooting Game...</div>;
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
            <div className='absolute text-xl md:text-2xl p-2 w-full text-center z-10 top-2 md:top-4'>
                <span className='bg-slate-700/70 backdrop-blur-sm text-white p-3 rounded-md shadow-lg'>
                    {questionText || 'Shoot the correct answer!'}
                </span>
            </div>
            <div id="gameContainer-shooting" className='w-full h-[calc(100%-5rem)] md:h-[calc(100%-6rem)] mt-[5rem] md:mt-[6rem] relative'>
                {/* Kaboom canvas will be injected here */}
            </div>
        </div>
    );
}
