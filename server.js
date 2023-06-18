const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const games = {};
const clients = {};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'createGame':
        // Generar un ID de partida único
        const gameId = Date.now().toString();

        // Crear una nueva partida con la información proporcionada
        games[gameId] = {
          minutos: data.minutos,
          tema: data.tema,
          host: data.username,
          players: [data.username],
          // ...
        };

        // Almacenar una referencia a la conexión WebSocket del anfitrión
        clients[data.username] = ws;

        // Enviar el ID de la partida de vuelta al cliente que creó el juego
        ws.send(JSON.stringify({ type: 'gameId', gameId }));

        // Enviar la información de la nueva partida a todos los clientes conectados
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'newGame', gameId, ...games[gameId] }));
          }
        });
        break;
      case 'joinGame':
        // Agregar el nuevo jugador a la partida
        games[data.gameId].players.push(data.username);

        // Almacenar una referencia a la conexión WebSocket del jugador
        clients[data.username] = ws;

        // Enviar un mensaje al anfitrión con el nombre de usuario del nuevo jugador
        const host = games[data.gameId].host;
        clients[host].send(JSON.stringify({ type: 'playerJoined', username: data.username }));
        break;
    }
  });
});
