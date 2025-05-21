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
  const [aiPlayer, setAiPlayer] = useState(null); 
  const [difficulty, setDifficulty] = useState(3); 
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isStockfishReady, setIsStockfishReady] = useState(false);
  const [selectedAiEngine, setSelectedAiEngine] = useState('stockfish'); // 'stockfish', 'lc0', 'komodo'

  const stockfishWorkerRef = useRef(null);
  const socketRef = useRef(null);
  const [aiMessage, setAiMessage] = useState(''); // Message for non-stockfish AI

  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const [roomID, setRoomID] = useState('');
  const [inputRoomID, setInputRoomID] = useState(''); 
  const [playerOnlineColor, setPlayerOnlineColor] = useState(null); 
  const [onlineStatus, setOnlineStatus] = useState('Disconnected');
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false); 


  // Initialize AI Engine & Handle Engine Change
  useEffect(() => {
    // Clear previous AI state/worker if engine or mode changes
    if (stockfishWorkerRef.current) {
      stockfishWorkerRef.current.terminate();
      stockfishWorkerRef.current = null;
      setIsStockfishReady(false);
      console.log('[ChessGame] Terminated existing Stockfish worker.');
    }
    setAiMessage(''); // Clear any previous AI messages

    // Setup AI based on selection
    if (typeof Worker !== 'undefined' && !isOnlineMode && aiPlayer) {
      if (selectedAiEngine === 'stockfish') {
        const worker = new Worker('/stockfish/stockfish.js', {
          locateFile: (file) => {
            return `/stockfish/${file}`;
          },
        });
        stockfishWorkerRef.current = worker;
        console.log('[ChessGame] Creating Stockfish worker for AI player:', aiPlayer);

        worker.onmessage = (event) => {
                const message = event.data;
                if (message === 'uciok') {
                    worker.postMessage('isready');
                } else if (message === 'readyok') {
                  setIsStockfishReady(true);
                  console.log('[ChessGame] Stockfish ready.');
                  // Trigger move if it's AI's turn upon becoming ready
                  if (aiPlayer === game.turn() && !game.isGameOver() && !isAiThinking) {
                    console.log('[ChessGame] Triggering AI move from worker ready state.');
                    triggerAiMove();
                  }
                } else if (message.startsWith('bestmove')) {
                  const bestMove = message.split(' ')[1];
                  console.log('[ChessGame] Stockfish bestmove received:', bestMove);
                  if (bestMove && bestMove !== '(none)') {
                    safeGameMutate((g) => { g.move(bestMove, { sloppy: true }); });
                  }
                  setIsAiThinking(false);
                } else {
                   // console.log('[ChessGame] Stockfish worker message:', message); // Optional: Log other messages
                }
            };

            worker.onerror = (error) => {
                // Log the full error object for more details
                console.error('[ChessGame] Stockfish worker initialization failed:', error);
                // Try to log specific properties if available
                if (error && error.message) {
                    console.error('[ChessGame] Error message:', error.message);
                }
                if (error && error.filename) {
                    console.error('[ChessGame] Error filename:', error.filename);
                }
                if (error && error.lineno) {
                    console.error('[ChessGame] Error lineno:', error.lineno);
                }
                setAiMessage('Error initializing Stockfish worker. Check console for details.'); // Update message
                setIsAiThinking(false);
            };

            console.log('[ChessGame] Sending UCI commands to Stockfish worker.');
            worker.postMessage('uci');

        } else if (selectedAiEngine === 'lc0') {
            console.log('[ChessGame] Leela Chess Zero selected. Requires server-side integration.');
            setAiMessage('Leela Chess Zero requires server-side setup (not implemented).');
            // Disable AI play for this engine for now
            setIsAiThinking(false);
            setIsStockfishReady(false); // Ensure Stockfish state is false
        } else if (selectedAiEngine === 'komodo') {
            console.log('[ChessGame] Komodo selected. Requires server-side integration or WASM build.');
            setAiMessage('Komodo requires server-side setup or a WASM build (not implemented).');
            // Disable AI play for this engine for now
            setIsAiThinking(false);
            setIsStockfishReady(false); // Ensure Stockfish state is false
        }
    } else if (aiPlayer && isOnlineMode) {
        console.log('[ChessGame] Online mode active, AI player logic skipped.');
    } else if (!aiPlayer) {
         console.log('[ChessGame] No AI player selected (2P offline or initial state).');
    } else if (typeof Worker === 'undefined') {
         console.error('[ChessGame] Web Workers not supported in this browser.');
         setAiMessage('Web Workers not supported. Cannot run client-side AI.');
    }

    // Cleanup function
    return () => {
      if (stockfishWorkerRef.current) {
        console.log('[ChessGame] Cleanup: Terminating Stockfish worker.');
        stockfishWorkerRef.current.terminate();
        stockfishWorkerRef.current = null;
      }
      setIsStockfishReady(false);
    };
  }, [aiPlayer, isOnlineMode, selectedAiEngine]); // Dependency: selectedAiEngine added

  // Socket.IO setup
  useEffect(() => {
    if (isOnlineMode) {
      const socket = io({ path: '/api/socketio', autoConnect: true }); 
      socketRef.current = socket;
      setOnlineStatus('Connecting...');

      socket.on('connect', () => {
        setOnlineStatus(`Connected: ${socket.id}`);
        console.log(`[ChessGame] Socket connected: ${socket.id}`);
        if (roomID) { 
            console.log(`[ChessGame] Attempting to validate/join room ${roomID} on connect (if needed).`);
        }
      });

      socket.on('connection_ack', (data) => console.log('[ChessGame] Connection Ack:', data.message));
      
      socket.on('room_joined', (data) => {
        console.log('[ChessGame] Event: room_joined', data);
        setRoomID(data.room); 
        setInputRoomID(data.room); 
        setPlayerOnlineColor(data.color);
        setOnlinePlayers(data.players || [{id: socket.id, color: data.color}]);
        setOnlineStatus(`In Room: ${data.room} as ${data.color}`);
        if (data.playerCount === 2) {
            setStatus("Game started! Your turn if applicable.");
        } else {
            setStatus(`Waiting for opponent in room ${data.room}...`);
        }
      });

      socket.on('room_update', (data) => {
        console.log('[ChessGame] Event: room_update received:', data);
        const myPlayerId = socketRef.current?.id;
      
        if (myPlayerId && data.players?.find(p => p.id === myPlayerId) && !roomID && isOnlineMode) {
            console.log(`[ChessGame] Setting initial roomID to ${data.room} for creator via room_update.`);
            setRoomID(data.room);
            setInputRoomID(data.room); 
        }
      
        if (data.room === roomID || (data.room === inputRoomID && myPlayerId && data.players?.find(p => p.id === myPlayerId))) {
            setOnlinePlayers(data.players || []);
            const myPlayerInfo = data.players?.find(p => p.id === myPlayerId);
      
            if (myPlayerInfo && myPlayerInfo.color) {
                setPlayerOnlineColor(myPlayerInfo.color);
            }
      
            if (data.playerCount === 2) {
                const myColorDisplay = myPlayerInfo?.color === 'w' ? 'White' : (myPlayerInfo?.color === 'b' ? 'Black' : 'Unknown');
                setStatus(`Game in progress. You are ${myColorDisplay}. Room: ${data.room}`);
            } else if (data.playerCount === 1) {
                if (myPlayerInfo) { 
                    setStatus(`Waiting for opponent in room ${data.room}...`);
                } else {
                    console.log(`[ChessGame] room_update for room ${data.room} (1 player), but I'm not that player.`);
                }
            }
        } else {
            console.log(`[ChessGame] room_update for room ${data.room} ignored. My current roomID: ${roomID}.`);
        }
      });
            
      socket.on('opponent_left', (data) => {
        console.log('[ChessGame] Event: opponent_left', data);
        if(data.room === roomID) {
            setOnlinePlayers(prev => prev.filter(p => p.id !== data.disconnectedPlayerId));
            setStatus(`Opponent left room ${data.room}. The room is now closed.`);
            // Clear the room ID as the game session is over/interrupted
            setRoomID(''); 
            setInputRoomID(''); // Also clear the input field if it showed the old room ID
            setPlayerOnlineColor(null); // Reset color assignment
        }
      });

      socket.on('game_start', (data) => {
        console.log('[ChessGame] Event: game_start', data);
        if(data.room === roomID) {
            setOnlinePlayers(data.players);
            const myInfo = data.players.find(p => p.id === socket.id); 
            if (myInfo) setPlayerOnlineColor(myInfo.color);
            setOnlineStatus(`Game started in room ${data.room}! You are ${myInfo?.color}.`);
            resetGame(true); 
        }
      });

      socket.on('room_error', (data) => {
        console.error('[ChessGame] Room Error:', data.message);
        alert(`Room Error: ${data.message}`);
        setOnlineStatus(`Error: ${data.message}`);
      });

      socket.on('opponent_move_room', (data) => {
        console.log('[ChessGame] Opponent move received:', data);
        if (game.turn() !== playerOnlineColor && data.fromPlayerId !== socketRef.current?.id && data.move) {
            safeGameMutate((g) => {
                g.move(data.move);
            });
        }
      });
      
      socket.on('connect_error', (err) => {
        setOnlineStatus(`Connection Error: ${err.message}`);
        console.error('Socket connection error:', err);
      });
      socket.on('disconnect', (reason) => {
        setOnlineStatus(`Disconnected: ${reason}`);
      });
      
      return () => {
        console.log('[ChessGame] Disconnecting socket due to mode change or unmount.');
        socket.disconnect();
        socketRef.current = null;
      };
    } else if (socketRef.current) { 
        console.log('[ChessGame] Online mode off, ensuring socket is disconnected.');
        socketRef.current.disconnect();
        socketRef.current = null;
    }
  }, [isOnlineMode, game, roomID, playerOnlineColor]); 

  // Update Status & Trigger AI Move on FEN change (if applicable)
  useEffect(() => {
    updateStatus(); // Update status regardless of whose turn
    setHistory(game.history({ verbose: true }));

    // Trigger AI move only if conditions are met
    if (
      !isOnlineMode &&
      selectedAiEngine === 'stockfish' && // Only for stockfish for now
      isStockfishReady &&
      aiPlayer === game.turn() &&
      !game.isGameOver() &&
      !isAiThinking
    ) {
      console.log(`[ChessGame] FEN changed to ${fen}. It's AI's turn (${aiPlayer}). Triggering move.`);
      triggerAiMove();
    } else if (!isOnlineMode && aiPlayer === game.turn() && selectedAiEngine !== 'stockfish') {
        console.log(`[ChessGame] AI's turn, but selected engine (${selectedAiEngine}) is not ready or requires server.`);
        // Optionally update status here if needed
    }
  }, [fen]); // Reworked dependencies: fen is the primary trigger for board updates. Other states are checked inside.

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 600) { setBoardWidth(screenWidth - 30); }
      else if (screenWidth < 1024) { setBoardWidth(450); }
      else { setBoardWidth(560); }
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

  function updateStatus() {
    let newStatus = '';
    const turn = game.turn() === 'w' ? 'White' : 'Black';

    if (game.isCheckmate()) {
      newStatus = `Checkmate! ${turn === 'White' ? 'Black' : 'White'} wins.`;
    } else if (game.isDraw()) {
      newStatus = 'Draw!';
      if (game.isStalemate()) newStatus += ' (Stalemate)';
      if (game.isThreefoldRepetition()) newStatus += ' (Threefold Repetition)';
      if (game.isInsufficientMaterial()) newStatus += ' (Insufficient Material)';
    } else {
      newStatus = `${turn}'s turn.`;
      if (game.inCheck()) newStatus += ` ${turn} is in check.`;

      if (!isOnlineMode) {
        if (aiPlayer === game.turn()) {
            if (selectedAiEngine === 'stockfish' && isAiThinking) {
                newStatus = `AI (Stockfish - ${DIFFICULTY_LEVELS[difficulty].name}) is thinking...`;
            } else if (selectedAiEngine !== 'stockfish') {
                newStatus = `AI (${selectedAiEngine === 'lc0' ? 'LCZero' : 'Komodo'}) selected. ${aiMessage || 'Server setup needed.'}`;
            } else {
                 newStatus = `AI (${DIFFICULTY_LEVELS[difficulty].name}) turn. Waiting for AI...`; // e.g. if not ready yet
            }
        } else if (aiPlayer) {
             newStatus = `Your turn (vs ${selectedAiEngine === 'stockfish' ? `Stockfish ${DIFFICULTY_LEVELS[difficulty].name}` : (selectedAiEngine === 'lc0' ? 'LCZero' : 'Komodo')}).`;
        } else {
             newStatus = `${turn}'s turn (2 Player Offline).`; // 2 Player offline
        }
      } else { // Online Mode Status
        if (roomID && onlinePlayers.length < 2) {
            newStatus = `Room ${roomID}: Waiting for opponent... You are ${playerOnlineColor === 'w' ? "White" : (playerOnlineColor === 'b' ? "Black" : "determining...")}.`;
        } else if (roomID && onlinePlayers.length === 2) {
            if (game.turn() === playerOnlineColor) {
                newStatus = `Your turn (${playerOnlineColor === 'w' ? 'White' : 'Black'}). Room: ${roomID}`;
            } else {
                newStatus = `Waiting for opponent (${game.turn() === 'w' ? 'White' : 'Black'}). Room: ${roomID}`;
            }
        } else { 
            newStatus = "Online mode. Create or join a room.";
        }
      }
    }
    setStatus(newStatus);
  }

 function triggerAiMove() {
    // Check common pre-conditions first
    if (game.isGameOver() || aiPlayer !== game.turn() || isOnlineMode) {
      console.log(`[ChessGame] triggerAiMove: Pre-condition failed. GameOver: ${game.isGameOver()}, AITurn: ${aiPlayer === game.turn()}, IsOnline: ${isOnlineMode}`);
      setIsAiThinking(false); // Ensure thinking state is reset if conditions fail
      return;
    }

    console.log(`[ChessGame] triggerAiMove: Called for ${selectedAiEngine}. AI is ${aiPlayer}, current turn: ${game.turn()}`);

    if (selectedAiEngine === 'stockfish') {
      if (!stockfishWorkerRef.current || !isStockfishReady) {
        console.error(`[ChessGame] Stockfish worker not available or not ready for move. Worker: ${!!stockfishWorkerRef.current}, Ready: ${isStockfishReady}`);
        setIsAiThinking(false);
        // Optionally set a status message here
        return;
      }
      setIsAiThinking(true); // Set thinking state only when actually sending command
      const currentSkill = DIFFICULTY_LEVELS[difficulty].skill;
      const currentDepth = DIFFICULTY_LEVELS[difficulty].depth;
      console.log(`[ChessGame] Sending move request to Stockfish. Skill: ${currentSkill}, Depth: ${currentDepth}, FEN: ${game.fen()}`);
      stockfishWorkerRef.current.postMessage('setoption name Skill Level value ' + currentSkill);
      // Ensure previous commands are processed before sending position/go
      stockfishWorkerRef.current.postMessage('isready'); // Ask again to ensure it's ready for position/go
      stockfishWorkerRef.current.postMessage('position fen ' + game.fen());
      stockfishWorkerRef.current.postMessage('go depth ' + currentDepth);

    } else if (selectedAiEngine === 'lc0' || selectedAiEngine === 'komodo') {
      console.log(`[ChessGame] triggerAiMove: ${selectedAiEngine} selected, but requires server-side integration.`);
      // No move will be made, ensure thinking state is false
      setIsAiThinking(false);
      // Update status message if needed via setAiMessage or directly setting status
      setAiMessage(`${selectedAiEngine === 'lc0' ? 'LCZero' : 'Komodo'} requires server setup.`);
    }
  }

  function onDrop(sourceSquare, targetSquare) {
    if (game.isGameOver()) return false;
    if (!isOnlineMode && (isAiThinking || game.turn() === aiPlayer)) return false;
    if (isOnlineMode && (!socketRef.current || game.turn() !== playerOnlineColor || onlinePlayers.length < 2)) return false;

    let moveSuccessful = false;
    let moveData = null;

    safeGameMutate((g) => {
      try {
        const moveResult = g.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
        if (moveResult) {
            moveSuccessful = true;
            moveData = { from: sourceSquare, to: targetSquare, promotion: 'q', fen: g.fen() }; 
        }
      } catch (e) { /* Invalid move */ }
    });

    if (moveSuccessful && isOnlineMode && socketRef.current && moveData) {
      socketRef.current.emit('chess_move_room', { room: roomID, move: moveData });
    }
    return moveSuccessful;
  }

  function resetGame(isOnlineReset = false) {
    safeGameMutate((g) => { g.reset(); });
    if (!isOnlineMode && aiPlayer === 'w' && isStockfishReady) { 
        console.log("[ChessGame] Reset game, AI is White, attempting AI move.");
        setTimeout(triggerAiMove, 250); 
    } else if (!isOnlineMode && aiPlayer === 'w' && !isStockfishReady) {
        console.log("[ChessGame] Reset game, AI is White, but AI not ready yet.");
    }
  }

  function undoMove() {
    if (isOnlineMode || isAiThinking || history.length === 0) return; 
    const numUndos = (aiPlayer && game.turn() !== aiPlayer && history.length >=1 ) ? 2 : 1;
    if (history.length >= numUndos) {
        safeGameMutate((g) => {
            for(let i=0; i<numUndos; i++) { g.undo(); }
        });
    }
  }

  const handlePlayAs = (color) => {
    setPlayerColor(color); 
    if (!isOnlineMode) {
    setAiPlayer(color === 'w' ? 'b' : 'w');
    // Don't reset selectedAiEngine here, let the user choose
    resetGame();
  } else {
        console.log("[ChessGame] 'Play as' button clicked in online mode. Board orientation set.");
    }
  };

  const handleDifficultyChange = (e) => {
    setDifficulty(parseInt(e.target.value, 10));
    // If AI is thinking, might need to interrupt and restart with new difficulty?
    // For simplicity now, it only affects the *next* move.
  };

  const handleEngineChange = (e) => {
    setSelectedAiEngine(e.target.value);
    // The useEffect hook watching selectedAiEngine will handle worker/state changes.
    resetGame(); // Reset game when engine changes
  };

  const toggleOnlineMode = () => {
    const newIsOnlineMode = !isOnlineMode;
    setIsOnlineMode(newIsOnlineMode); 
    setAiPlayer(null); 
    setPlayerOnlineColor(null); 
    setOnlinePlayers([]);
    setRoomID(''); 
    setInputRoomID('');
    setIsJoiningRoom(false); 
    resetGame();
  };
  
  const handleCreateRoom = () => {
    if (isJoiningRoom) return; 
    if (!socketRef.current || !socketRef.current.connected) {
        alert("Socket not connected. Please wait a moment and try again.");
        if (socketRef.current && !socketRef.current.connected) socketRef.current.connect();
        return;
    }
    const newRoomID = Math.random().toString(36).substring(2, 8).toUpperCase();
    setInputRoomID(newRoomID); 
    setRoomID(newRoomID);      
    
    socketRef.current.emit('create_room', newRoomID, (response) => {
        console.log('[ChessGame] create_room callback:', response);
        if (response.error) {
            alert(`Error creating room: ${response.error}`);
            setOnlineStatus(`Error: ${response.error}`);
            setRoomID(''); 
        }
    });
  };

  const handleJoinRoom = () => {
    if (isJoiningRoom) return; 
    if (!socketRef.current || !socketRef.current.connected) {
        alert("Socket not connected. Please wait or ensure online mode is active.");
        if (socketRef.current && !socketRef.current.connected) socketRef.current.connect();
        return;
    }
    const targetRoomID = inputRoomID.trim();
    // Validate Room ID format (6 uppercase alphanumeric characters)
    const roomIDRegex = /^[A-Z0-9]{6}$/;
    if (!roomIDRegex.test(targetRoomID)) {
        alert("Invalid Room ID format. Please enter a 6-character uppercase alphanumeric ID.");
        return;
    }

    if (targetRoomID) { // Check remains, though regex already ensures non-empty
        setIsJoiningRoom(true);
        socketRef.current.emit('join_room', targetRoomID, (response) => {
            console.log('[ChessGame] join_room callback:', response);
            if (response.error) {
                alert(`Error joining room: ${response.error}`);
                setOnlineStatus(`Error: ${response.error}`);
            }
            setIsJoiningRoom(false); 
        });
    } else {
      alert("Please enter a Room ID to join.");
    }
  };

  return (
    <div className="flex flex-col items-center w-full p-2 md:p-4 bg-slate-800 rounded-lg shadow-2xl">
      <div className="w-full mb-3 p-3 bg-slate-700 rounded text-center text-base sm:text-lg font-semibold min-h-[3em] break-words">
        {status}
      </div>
      
      <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 mb-4 items-center w-full">
        <button onClick={toggleOnlineMode} className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold ${isOnlineMode ? 'bg-teal-500 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>
            {isOnlineMode ? 'Go Offline' : 'Play Online'}
        </button>
        {!isOnlineMode && (
            <>
                <button onClick={() => handlePlayAs('w')} className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold ${!isOnlineMode && aiPlayer === 'b' ? 'bg-green-500 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>Play as White (vs AI)</button>
                <button onClick={() => handlePlayAs('b')} className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold ${!isOnlineMode && aiPlayer === 'w' ? 'bg-green-500 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>Play as Black (vs AI)</button>
                <button onClick={() => { setAiPlayer(null); setIsOnlineMode(false); resetGame(); }} className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold ${!aiPlayer && !isOnlineMode ? 'bg-green-500 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>2 Player Offline</button>
            </>
        )}
         {/* AI Engine Selector - Show only in offline AI mode */}
         {!isOnlineMode && aiPlayer && (
            <div className="w-full sm:w-auto">
                <label htmlFor="aiEngine" className="mr-2 font-semibold text-gray-300">AI Engine:</label>
                <select
                    id="aiEngine"
                    value={selectedAiEngine}
                    onChange={handleEngineChange}
                    className="px-3 py-2 rounded-lg bg-slate-600 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                    <option value="stockfish">Stockfish (Browser)</option>
                    <option value="lc0">Leela Chess Zero (Server Needed)</option>
                    <option value="komodo">Komodo (Server/WASM Needed)</option>
                </select>
            </div>
         )}
      </div>


      {isOnlineMode && (
        <div className="flex flex-col items-center gap-3 mb-4 w-full max-w-md">
          <div className="flex flex-wrap justify-center gap-3 w-full">
            <input
                type="text" 
                placeholder="Enter Room ID to Join" 
                value={inputRoomID} 
                onChange={(e) => setInputRoomID(e.target.value.trim().toUpperCase())}
                className="flex-grow px-3 py-2 rounded-lg bg-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                maxLength={6} 
            />
            <button 
                onClick={handleJoinRoom} 
                disabled={!inputRoomID.trim() || isJoiningRoom} 
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-semibold disabled:opacity-50"
            >
                {isJoiningRoom ? 'Joining...' : 'Join Room'}
            </button>
          </div>
          <button 
            onClick={handleCreateRoom}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold w-full sm:w-auto"
          >
            Create New Room
          </button>
          {roomID && <p className="text-sm text-gray-300 mt-2">Current Room ID: <span className="font-bold text-yellow-400">{roomID}</span> (Share with opponent)</p>}
          <p className="text-sm text-gray-400 w-full text-center mt-1">Online Status: {onlineStatus}</p>
            {playerOnlineColor && <p className="text-green-400 text-center">You are playing as {playerOnlineColor === 'w' ? 'White' : 'Black'}.</p>}
            {onlinePlayers.length === 2 && playerOnlineColor && <p className="text-cyan-400 text-center">Opponent connected! Game on.</p>}
            {onlinePlayers.length < 2 && roomID && <p className="text-yellow-400 text-center">Waiting for opponent...</p>}
        </div>
      )}

      {/* AI Controls Row - Show only in offline AI mode */}
      {!isOnlineMode && aiPlayer && (
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 mb-4 w-full">
            {/* Difficulty Selector */}
            <div className="flex items-center">
                <label htmlFor="difficulty" className="mr-2 font-semibold text-gray-300">Difficulty:</label>
                <select
                    id="difficulty"
                    value={difficulty}
                    onChange={handleDifficultyChange}
                    disabled={selectedAiEngine !== 'stockfish'} // Disable if not stockfish for now
                    className="px-3 py-2 rounded-lg bg-slate-600 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-60"
                >
                    {Object.entries(DIFFICULTY_LEVELS).map(([level, details]) => (
                        <option key={level} value={level}>{details.name}</option>
                    ))}
                </select>
            </div>
             {/* AI Message Area */}
             {aiMessage && (
                <div className="text-yellow-400 text-sm font-semibold p-2 bg-slate-700 rounded">
                    {aiMessage}
                </div>
             )}
        </div>
      )}


      <div style={{ width: boardWidth, maxWidth: 'calc(100vw - 20px)' }}>
        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          boardWidth={boardWidth}
          arePiecesDraggable={
            !game.isGameOver() &&
            (isOnlineMode
                ? game.turn() === playerOnlineColor && onlinePlayers.length === 2 // Online: Your turn & opponent present
                : (!aiPlayer || // Offline 2P: Always draggable
                   (game.turn() !== aiPlayer && selectedAiEngine === 'stockfish' && !isAiThinking) || // Offline vs Stockfish: Your turn & AI not thinking
                   (game.turn() !== aiPlayer && selectedAiEngine !== 'stockfish') // Offline vs Other AI: Your turn (AI move handled differently)
                  )
            )
          }
          boardOrientation={isOnlineMode ? (playerOnlineColor === 'w' ? 'white' : 'black') : (playerColor === 'w' ? 'white' : 'black')}
        />
      </div>
      <div className="mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full max-w-xs sm:max-w-none justify-center">
        <button
          onClick={() => resetGame(isOnlineMode)}
          className="w-full sm:w-auto px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg shadow-md transition-colors"
        >
          Reset
        </button>
        <button
          onClick={undoMove}
          disabled={history.length === 0 || isAiThinking || isOnlineMode || selectedAiEngine !== 'stockfish'} // Disable undo if AI is not stockfish or online
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Undo
        </button>
      </div>
    </div>
  );
}
