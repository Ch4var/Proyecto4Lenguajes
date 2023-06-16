const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const games = {};
const clients = {};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'createGame':
        // Generate a unique game ID
        const gameId = Date.now().toString();

        // Create a new game with the provided information
        games[gameId] = {
          minutos: data.minutos,
          tema: data.tema,
          host: data.username,
          players: [data.username],
          // ...
        };

        // Store a reference to the host's WebSocket connection
        clients[data.username] = ws;

        // Send the game ID back to the client that created the game
        ws.send(JSON.stringify({ type: 'gameId', gameId }));

        // Send the new game information to all connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'newGame', gameId, ...games[gameId] }));
          }
        });
        break;
      case 'joinGame':
        // Add the new player to the game
        games[data.gameId].players.push(data.username);

        // Store a reference to the player's WebSocket connection
        clients[data.username] = ws;

        // Send a message to the host with the new player's username
        const host = games[data.gameId].host;
        clients[host].send(JSON.stringify({ type: 'playerJoined', username: data.username }));
        break;
      // ...
    }
  });
});