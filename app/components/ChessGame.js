'use client';

import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import io from 'socket.io-client';

const DIFFICULTY_LEVELS = {
  1: { name: 'Easy', skill: 0, depth: 2 },
  2: { name: 'Medium', skill: 4, depth: 4 },
  3: { name: 'Hard', skill: 8, depth: 6 },
  4: { name: 'Expert', skill: 12, depth: 10 },
  5: { name: 'Master', skill: 16, depth: 15 },
  6: { name: 'God Level', skill: 20, depth: 20 },
};

export default function ChessGame() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [status, setStatus] = useState('');
  const [history, setHistory] = useState([]);
  const [boardWidth, setBoardWidth] = useState(500);
  const [playerColor, setPlayerColor] = useState('w');
  const [gameMode, setGameMode] = useState('human'); // 'human', 'ai', 'online'
  const [aiDifficulty, setAiDifficulty] = useState(3);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [roomID, setRoomID] = useState('');
  const [inputRoomID, setInputRoomID] = useState('');
  const [onlineStatus, setOnlineStatus] = useState('Disconnected');
  const socketRef = useRef(null); 


  // Simple AI move generation
  const makeAiMove = () => {
    if (game.isGameOver()) return;
    
    setIsAiThinking(true);
    
    setTimeout(() => {
      const moves = game.moves();
      if (moves.length === 0) {
        setIsAiThinking(false);
        return;
      }
      
      let selectedMove;
      
      if (aiDifficulty <= 2) {
        // Easy: Random move
        selectedMove = moves[Math.floor(Math.random() * moves.length)];
      } else if (aiDifficulty <= 4) {
        // Medium: Prefer captures
        const captures = moves.filter(move => move.includes('x'));
        selectedMove = captures.length > 0 ? 
          captures[Math.floor(Math.random() * captures.length)] :
          moves[Math.floor(Math.random() * moves.length)];
      } else {
        // Hard: Basic evaluation
        let bestMove = moves[0];
        let bestScore = -Infinity;
        
        for (const move of moves.slice(0, 10)) { // Limit for performance
          const tempGame = new Chess(game.fen());
          tempGame.move(move);
          
          let score = 0;
          if (tempGame.isCheckmate()) score = 1000;
          else if (tempGame.inCheck()) score = 50;
          else if (move.includes('x')) score = 30;
          
          if (score > bestScore) {
            bestScore = score;
            bestMove = move;
          }
        }
        selectedMove = bestMove;
      }
      
      safeGameMutate((g) => {
        g.move(selectedMove);
      });
      
      setIsAiThinking(false);
    }, 500 + aiDifficulty * 200); // Thinking time based on difficulty
  };

  // Update game state and trigger AI moves
  useEffect(() => {
    updateStatus();
    setHistory(game.history({ verbose: true }));
    
    // Trigger AI move if it's AI's turn
    if (gameMode === 'ai' && game.turn() !== playerColor && !game.isGameOver() && !isAiThinking) {
      makeAiMove();
    }
  }, [fen, gameMode, playerColor, isAiThinking]);

  // Handle board resize
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      setBoardWidth(screenWidth < 600 ? screenWidth - 30 : screenWidth < 1024 ? 450 : 560);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const safeGameMutate = (modify) => {
    setGame((g) => {
      const currentFen = g.fen();
      const update = new Chess(currentFen);
      modify(update);
      setFen(update.fen());
      return update;
    });
  };

  const updateStatus = () => {
    const turn = game.turn() === 'w' ? 'White' : 'Black';
    
    if (game.isCheckmate()) {
      setStatus(`Checkmate! ${turn === 'White' ? 'Black' : 'White'} wins.`);
    } else if (game.isDraw()) {
      setStatus('Draw!');
    } else {
      let statusText = `${turn}'s turn`;
      if (game.inCheck()) statusText += ` (in check)`;
      
      if (gameMode === 'ai') {
        if (game.turn() !== playerColor) {
          statusText = isAiThinking ? 'AI is thinking...' : 'AI turn';
        } else {
          statusText = 'Your turn';
        }
      }
      
      setStatus(statusText);
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    if (game.isGameOver()) return false;
    if (gameMode === 'ai' && (isAiThinking || game.turn() !== playerColor)) return false;
    
    let moveSuccessful = false;
    
    safeGameMutate((g) => {
      try {
        const moveResult = g.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
        if (moveResult) moveSuccessful = true;
      } catch (e) {
        // Invalid move
      }
    });
    
    return moveSuccessful;
  };

  const resetGame = () => {
    safeGameMutate((g) => g.reset());
  };

  const undoMove = () => {
    if (gameMode === 'online' || isAiThinking || history.length === 0) return;
    
    const numUndos = gameMode === 'ai' && game.turn() === playerColor && history.length >= 2 ? 2 : 1;
    
    safeGameMutate((g) => {
      for (let i = 0; i < numUndos && g.history().length > 0; i++) {
        g.undo();
      }
    });
  };

  return (
    <div className="flex flex-col items-center w-full p-4 bg-gray-800 rounded-lg">
      <div className="w-full mb-4 p-3 bg-gray-700 rounded text-center font-semibold">
        {status}
      </div>
      
      <div className="flex flex-wrap justify-center gap-3 mb-4">
        <button 
          onClick={() => { setGameMode('human'); resetGame(); }}
          className={`px-4 py-2 rounded font-semibold ${
            gameMode === 'human' ? 'bg-green-500 text-white' : 'bg-gray-600 hover:bg-gray-500'
          }`}
        >
          2 Players
        </button>
        <button 
          onClick={() => { setGameMode('ai'); setPlayerColor('w'); resetGame(); }}
          className={`px-4 py-2 rounded font-semibold ${
            gameMode === 'ai' ? 'bg-blue-500 text-white' : 'bg-gray-600 hover:bg-gray-500'
          }`}
        >
          vs AI
        </button>
        <button 
          onClick={() => { setGameMode('online'); resetGame(); }}
          className={`px-4 py-2 rounded font-semibold ${
            gameMode === 'online' ? 'bg-purple-500 text-white' : 'bg-gray-600 hover:bg-gray-500'
          }`}
        >
          Online
        </button>
      </div>

      {gameMode === 'ai' && (
        <div className="flex items-center gap-4 mb-4">
          <label className="text-gray-300">Difficulty:</label>
          <select
            value={aiDifficulty}
            onChange={(e) => setAiDifficulty(parseInt(e.target.value))}
            className="px-3 py-1 bg-gray-600 text-white rounded"
          >
            {Object.entries(DIFFICULTY_LEVELS).map(([level, details]) => (
              <option key={level} value={level}>{details.name}</option>
            ))}
          </select>
          <button
            onClick={() => setPlayerColor(playerColor === 'w' ? 'b' : 'w')}
            className="px-3 py-1 bg-yellow-500 text-black rounded"
          >
            Play as {playerColor === 'w' ? 'Black' : 'White'}
          </button>
        </div>
      )}

      {gameMode === 'online' && (
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Room ID"
              value={inputRoomID}
              onChange={(e) => setInputRoomID(e.target.value.toUpperCase())}
              className="px-3 py-2 bg-gray-600 text-white rounded"
              maxLength={6}
            />
            <button className="px-4 py-2 bg-blue-500 text-white rounded">Join</button>
          </div>
          <button className="px-4 py-2 bg-green-500 text-white rounded">Create Room</button>
          <p className="text-sm text-gray-400">Status: {onlineStatus}</p>
        </div>
      )}

      <div style={{ width: boardWidth, maxWidth: 'calc(100vw - 20px)' }}>
        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          boardWidth={boardWidth}
          arePiecesDraggable={!game.isGameOver() && (gameMode !== 'ai' || (game.turn() === playerColor && !isAiThinking))}
          boardOrientation={playerColor === 'w' ? 'white' : 'black'}
        />
      </div>
      
      <div className="flex gap-3 mt-4">
        <button
          onClick={resetGame}
          className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded"
        >
          Reset
        </button>
        <button
          onClick={undoMove}
          disabled={history.length === 0 || isAiThinking || gameMode === 'online'}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Undo
        </button>
      </div>
    </div>
  );
}
