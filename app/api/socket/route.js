import { Server } from 'socket.io';

let io;
const rooms = {}; // Store room information

// This GET handler is mostly a placeholder for App Router.
// The main Socket.IO setup is done by initializeSocketIO, called from server.js.
export async function GET(req) {
  // In App Router, the 'res' object is not passed like in Pages Router.
  // We return a Response object.
  // This endpoint isn't strictly necessary for Socket.IO to function if server.js handles init.
  return new Response(JSON.stringify({ message: 'Socket.IO setup is handled via server.js. This is a placeholder API route.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function initializeSocketIO(httpServer) {
  if (!io) {
    io = new Server(httpServer, {
      path: '/api/socketio', // Custom path for Socket.IO
      addTrailingSlash: false,
      cors: {
        origin: "*", // Allow all origins for simplicity
        methods: ["GET", "POST"]
      }
    });
    console.log('🔌 New Socket.IO server initialized on custom HTTP server.');

    io.on('connection', (socket) => {
      console.log(`🔗 Client Connected: ${socket.id}`);
      socket.emit('connection_ack', { socketId: socket.id, message: `Welcome, client ${socket.id}` });

      socket.on('create_room', (roomName, callback) => {
        if (rooms[roomName]) {
          if (callback) callback({ error: 'Room already exists.' });
          return;
                }
                socket.join(roomName);
                rooms[roomName] = { players: [{ id: socket.id, color: 'w' }], name: roomName, full: false }; // Initialize full: false
                console.log(`${socket.id} created and joined room ${roomName} as white. Room state:`, JSON.stringify(rooms[roomName]));
                
                // Inform the creator client about the room state
                socket.emit('room_update', {
                    room: roomName,
                    players: rooms[roomName].players.map(p => ({id: p.id, color: p.color})),
                    playerCount: rooms[roomName].players.length
                });
                // Callback confirms creation; event updates detailed state. Client create_room callback doesn't use playerCount/players.
                if (callback) callback({ success: true, room: roomName, color: 'w' }); 
            });

            socket.on('join_room', (roomName, callback) => {
                if (!rooms[roomName]) {
                  if (callback) callback({ error: 'Room does not exist.' });
                  console.log(`[Socket.IO] join_room: ${socket.id} failed to join non-existent room ${roomName}.`);
                  return;
                }

                // Detailed logging before the check
                console.log(`[Socket.IO] join_room: PRE-CHECK for room "${roomName}" by ${socket.id}.`);
                console.log(`[Socket.IO] join_room: PRE-CHECK values. Room: "${roomName}", Full_Flag: ${rooms[roomName].full}, Players_Length: ${rooms[roomName].players.length}, Players_List: ${JSON.stringify(rooms[roomName].players.map(p=>p.id))}`);
                
                if (rooms[roomName].full || rooms[roomName].players.length >= 2) { 
                  if (callback) callback({ error: 'Room is full.' });
                  console.log(`[Socket.IO] join_room: ${socket.id} failed to join room "${roomName}" - already full. Evaluated: full=${rooms[roomName].full}, players.length=${rooms[roomName].players.length}`);
                  return;
                }
                
                // Ensure player is not already in the room (e.g. due to reconnect)
                if (rooms[roomName].players.find(p => p.id === socket.id)) {
                    if (callback) callback({ error: 'Already in this room.'});
                    console.log(`${socket.id} attempted to re-join room ${roomName}.`);
                    return;
                }

                const newPlayerColor = rooms[roomName].players[0].color === 'w' ? 'b' : 'w';
                socket.join(roomName);
                rooms[roomName].players.push({ id: socket.id, color: newPlayerColor });
                rooms[roomName].full = true; // Set room to full
                
                const playerInfo = rooms[roomName].players.map(p => ({id: p.id, color: p.color}));

                // Notify this player they joined
                if (callback) callback({ success: true, room: roomName, color: newPlayerColor, playerCount: 2, players: playerInfo });
                
                // Notify everyone in the room about the new state (game can start)
                io.to(roomName).emit('game_start', { room: roomName, players: playerInfo, playerCount: 2 });
                console.log(`${socket.id} joined room ${roomName} as ${newPlayerColor}. Players: ${JSON.stringify(playerInfo)}. Emitting game_start.`);
            });

            socket.on('chess_move_room', (data) => {
        if (rooms[data.room] && data.move) {
          // console.log(`Move in room ${data.room} from ${socket.id}:`, data.move);
          socket.to(data.room).emit('opponent_move_room', {move: data.move, fromPlayerId: socket.id});
        }
      });
      
      socket.on('player_color_choice', (data) => {
        // This is a client-side preference, server should ideally manage authoritative color assignment
        // For now, just log or broadcast if needed
        if(rooms[data.room]) {
            console.log(`Player ${socket.id} in room ${data.room} states preference for color ${data.color}`);
            // Could broadcast this to other player if needed for UI updates
            // socket.to(data.room).emit('opponent_color_preference', {playerId: socket.id, color: data.color});
        }
      });

      socket.on('disconnect', () => {
        console.log(`🔥 Client Disconnected: ${socket.id}`);
        for (const roomName in rooms) {
          const room = rooms[roomName];
          const playerIndex = room.players.findIndex(p => p.id === socket.id);
          if (playerIndex !== -1) {
            const disconnectedPlayer = room.players.splice(playerIndex, 1)[0]; // Get the player who disconnected
            console.log(`${socket.id} (color: ${disconnectedPlayer?.color}) left room ${roomName}. Players remaining: ${room.players.length}`);
            
            // If a player leaves, the room is no longer full
            if (room.players.length < 2) {
                room.full = false;
                console.log(`Room ${roomName} is no longer full.`);
            }

            io.to(roomName).emit('opponent_left', { 
                room: roomName, 
                playerCount: room.players.length, 
                disconnectedPlayerId: socket.id,
                remainingPlayers: room.players.map(p => ({id: p.id, color: p.color})) // Send updated player list
            });
            
            if (room.players.length === 0) {
              delete rooms[roomName];
              console.log(`Room ${roomName} is now empty and closed.`);
            }
            break; // Found the room, no need to check others
          }
        }
      });
    });
  }
  return io;
}

export { initializeSocketIO };
