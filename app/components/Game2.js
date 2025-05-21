'use client';

import { useEffect, useRef, useState } from 'react';
// import { useRouter } from 'next/navigation'; // Not needed if onGameEnd is used
import kaboom from 'kaboom';

// Props: questionData ({ question, ops, answer, _id (optional) }), onGameEnd (callback)
export default function MemoryQuizGame({ questionData, onGameEnd }) {
    const [questionText, setQuestionText] = useState('');
    const [actualCorrectAnswer, setActualCorrectAnswer] = useState('');
    const [currentQuestionId, setCurrentQuestionId] = useState('');
    const [displayOptions, setDisplayOptions] = useState([]); // Options shown in Kaboom
    
    const [resultMessage, setResultMessage] = useState('');
    const [showResultPopup, setShowResultPopup] = useState(false);
    const [wasCorrectInPopup, setWasCorrectInPopup] = useState(false);
    
    const kRef = useRef(null);
    // const router = useRouter(); // Not needed

    useEffect(() => {
        if (!questionData || !questionData.ops || !questionData.answer) {
            if (onGameEnd) onGameEnd({ error: "Invalid question data for MemoryQuizGame" });
            return;
        }

        setQuestionText(questionData.question);
        setActualCorrectAnswer(questionData.answer);
        setCurrentQuestionId(questionData._id || `ai_mem_q_${Date.now()}`);
        
        // Fetch similar options and merge with provided options
        async function prepareOptions() {
            let baseOptions = questionData.ops;
            try {
                const response = await fetch('/api/auth/getsimilaroptions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: baseOptions }), // Send original options
                });
                const data = await response.json();
                if (data.success && data.options) {
                    // Ensure the correct answer is always present
                    const allFetchedOptions = [...new Set([...baseOptions, ...data.options])];
                    if (!allFetchedOptions.includes(questionData.answer)) {
                        allFetchedOptions.push(questionData.answer); // Add if missing
                        // Shuffle or place strategically if needed
                    }
                    // Limit to 9 options for the game grid, prioritizing correct answer
                    const finalOptions = [questionData.answer];
                    const otherOptions = allFetchedOptions.filter(op => op !== questionData.answer);
                    for(let i=0; i < Math.min(8, otherOptions.length); i++) {
                        finalOptions.push(otherOptions[i]);
                    }
                    // Shuffle finalOptions before setting
                    setDisplayOptions(finalOptions.sort(() => Math.random() - 0.5));

                } else {
                    setDisplayOptions(baseOptions.includes(questionData.answer) ? baseOptions : [...baseOptions, questionData.answer].sort(() => Math.random() - 0.5).slice(0,9));
                }
            } catch (error) {
                console.error('Error fetching similar options:', error);
                setDisplayOptions(baseOptions.includes(questionData.answer) ? baseOptions : [...baseOptions, questionData.answer].sort(() => Math.random() - 0.5).slice(0,9));
            }
        }
        prepareOptions();
        setShowResultPopup(false); // Reset for new question
        setResultMessage('');
    }, [questionData, onGameEnd]);


    useEffect(() => {
        // Wait for result popup to show, then call onGameEnd after a delay
        if (showResultPopup) {
            const timer = setTimeout(() => {
                if (onGameEnd) {
                    onGameEnd({ scoreIncrement: wasCorrectInPopup ? 1 : 0, wasCorrect: wasCorrectInPopup });
                }
            }, 2000); // Show result for 2 seconds

            return () => clearTimeout(timer);
        }
    }, [showResultPopup, wasCorrectInPopup, onGameEnd]);

    useEffect(() => {
        if (displayOptions.length === 0 || !currentQuestionId) return;

        const gameCanvasId = `gameCanvas-${currentQuestionId}`; // Unique ID for canvas
        let kInstance = kRef.current;

        if (kInstance) {
            try { kInstance.quit(); } catch (e) { console.warn("Kaboom cleanup error:", e); }
        }

        const gameContainer = document.getElementById('gameContainer-memory');
        if (!gameContainer) {
            console.error("Game container 'gameContainer-memory' not found.");
            if(onGameEnd) onGameEnd({error: "Game container not found"});
            return;
        }
        gameContainer.innerHTML = ''; // Clear previous canvas
        const canvas = document.createElement('canvas');
        canvas.id = gameCanvasId;
        // canvas.className = 'absolute top-0 left-0 w-full h-full'; // Let Kaboom handle sizing
        gameContainer.appendChild(canvas);
        
        kInstance = kaboom({
            global: false,
            width: gameContainer.clientWidth || 800, // Use container width
            height: gameContainer.clientHeight || 600, // Use container height
            canvas: canvas,
            background: [20, 20, 20],
            debug: false,
        });
        kRef.current = kInstance;
        const k = kInstance;

        const centerX = k.width() / 2;
        const centerY = k.height() / 2;
        const boxWidth = Math.min(180, k.width()/4.5); // Responsive box width
        const boxHeight = Math.min(90, k.height()/7);
        const boxSpacing = Math.min(30, k.width()/25);

        const maxBoxesPerRow = 3;
        const numOptions = Math.min(displayOptions.length, 9);
        const numRows = Math.ceil(numOptions / maxBoxesPerRow);
        const numCols = numOptions > 0 ? Math.min(numOptions, maxBoxesPerRow) : 0;

        const gridWidth = (numCols * boxWidth) + ((numCols - 1) * boxSpacing);
        const gridHeight = (numRows * boxHeight) + ((numRows - 1) * boxSpacing);
        const startX = centerX - (gridWidth / 2);
        const startY = centerY - (gridHeight / 2);

        const boxes = [];
        const textLabels = [];
        let gameInteractionAllowed = false; // Control when user can click

        function flipCard(box, textLabel, showText = false) {
            if (box.isFlipping) return;
            box.isFlipping = true;

            if (textLabel) textLabel.hidden = !showText; // Show text if revealing, hide if flipping back

            k.tween(box.scale.x, 0.01, 0.15, (val) => box.scale.x = val, () => {
                box.color = showText ? k.rgb(70, 70, 200) : k.rgb(50, 50, 150); // Different color if text is shown
                if (showText) box.isRevealed = true; else box.isFlipped = true;
                
                k.tween(box.scale.x, 1, 0.15, (val) => box.scale.x = val, () => {
                    box.isFlipping = false;
                    if (showText && !gameInteractionAllowed) { // After initial reveal, allow interaction
                        // This logic might need adjustment if cards are flipped back before interaction
                    }
                });
            });
        }
        
        displayOptions.forEach((option, index) => {
            if (index >= 9) return; // Max 9 cards
            const row = Math.floor(index / maxBoxesPerRow);
            const col = index % maxBoxesPerRow;
            const x = startX + (col * (boxWidth + boxSpacing));
            const y = startY + (row * (boxHeight + boxSpacing));

            const box = k.add([
                k.rect(boxWidth, boxHeight), k.pos(x, y), k.color(0, 0, 0),
                k.outline(3, k.rgb(255, 255, 255)), k.area(), k.scale(1),
                "optionBox", { optionValue: option, isFlipped: false, isRevealed: false, isFlipping: false }
            ]);
            
            const label = k.add([
                k.text(option, { size: Math.min(18, boxHeight/3.5), width: boxWidth * 0.9, align: "center" }),
                k.pos(x + boxWidth / 2, y + boxHeight / 2), k.anchor("center"),
                k.color(255, 255, 255), "optionText", { boxRef: box }
            ]);
            textLabels.push(label);
            
            box.onClick(async () => {
                if (!gameInteractionAllowed || box.isRevealed || box.isFlipping || showResultPopup) return;
                
                // Reveal the card clicked by user
                flipCard(box, label, true);
                gameInteractionAllowed = false; // Prevent further clicks until result processed

                const isCorrect = box.optionValue === actualCorrectAnswer;
                
                try {
                    await fetch('/api/auth/verifyanswer', { /* ... */ body: JSON.stringify({ questionId: currentQuestionId, selectedAnswer: box.optionValue }) });
                    await fetch('/api/auth/recordAnswer', { /* ... */ body: JSON.stringify({ questionId: currentQuestionId, isCorrect }) });
                    
                    setWasCorrectInPopup(isCorrect);
                    setResultMessage(isCorrect ? 'Correct!' : 'Wrong!');
                } catch (err) {
                    console.error("API error during answer verification:", err);
                    setWasCorrectInPopup(false);
                    setResultMessage('API Error');
                } finally {
                    setShowResultPopup(true); // This will trigger the useEffect to call onGameEnd
                }
            });
            boxes.push(box);
        });

        // Initial reveal phase
        k.wait(1, () => { // Wait 1 sec before starting reveal
            boxes.forEach((box, index) => {
                const textLabel = textLabels.find(t => t.boxRef === box);
                k.wait(index * 0.15, () => flipCard(box, textLabel, true)); // Reveal with text
            });

            // After all cards are revealed, wait, then flip them back
            k.wait(1 + (boxes.length * 0.15) + 3, () => { // Total reveal time + 3s viewing time
                 boxes.forEach((box, index) => {
                    const textLabel = textLabels.find(t => t.boxRef === box);
                    k.wait(index * 0.15, () => flipCard(box, textLabel, false)); // Flip back, hide text
                });
                // After all cards flipped back, allow interaction
                k.wait(boxes.length * 0.15 + 0.5, () => {
                    gameInteractionAllowed = true;
                });
            });
        });
        
        return () => { // Cleanup
            if (kRef.current) {
                try { kRef.current.quit(); } catch (e) { console.warn("Kaboom cleanup error on unmount:", e); }
                kRef.current = null;
            }
        };
    }, [displayOptions, currentQuestionId, actualCorrectAnswer, onGameEnd]); // Kaboom effect

    if (!questionData) {
        return <div className="text-center p-4 text-white">Loading Memory Game...</div>;
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
            <div className='absolute text-xl md:text-2xl p-2 w-full text-center z-10 top-2 md:top-4'>
                <span className='bg-slate-700/70 backdrop-blur-sm text-white p-3 rounded-md shadow-lg'>
                    {questionText || 'Memorize the options, then select the correct one!'}
                </span>
            </div>

            {showResultPopup && (
                <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 
                               text-4xl md:text-6xl font-bold p-6 md:p-8 rounded-xl shadow-2xl animate-bounce
                               ${wasCorrectInPopup ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {resultMessage}
                </div>
            )}
            {/* Ensure gameContainer has a defined size for Kaboom canvas */}
            <div id="gameContainer-memory" className='w-full h-[calc(100%-5rem)] md:h-[calc(100%-6rem)] mt-[5rem] md:mt-[6rem] relative'>
                {/* Kaboom canvas will be injected here */}
            </div>
        </div>
    );
}
