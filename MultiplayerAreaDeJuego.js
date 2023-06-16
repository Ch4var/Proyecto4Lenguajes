import { useEffect, useState } from 'react';

const temas = ['estandar', 'caramelo', 'selva'];

function MultiplayerAreaDeJuego() {
  const [gameId, setGameId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [lockedCells, setLockedCells] = useState([]);
  const [username, setUsername] = useState('');
  const [minutos, setMinutos] = useState(0);
  const [tema, setTema] = useState(temas[0]);
  const [availableGames, setAvailableGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    // Connect to WebSocket server and listen for messages
    const socket = new WebSocket('ws://localhost:8080');
    socket.addEventListener('message', handleMessage);

    // Clean up WebSocket connection on unmount
    return () => {
      socket.removeEventListener('message', handleMessage);
      socket.close();
    };
  }, []);

  function handleMessage(event) {
    const message = JSON.parse(event.data);

    switch (message.type) {
      case 'gameId':
        setGameId(message.gameId);
        setIsHost(true);
        break;
      case 'gameState':
        setGameState(message.gameState);
        break;
      case 'lockedCells':
        setLockedCells(message.lockedCells);
        break;
      case 'newGame':
        setAvailableGames((availableGames) => [
          ...availableGames,
          { gameId: message.gameId, minutos: message.minutos, tema: message.tema },
        ]);
        break;
      case 'playerJoined':
        setPlayers((players) => [...players, message.username]);
        break;
      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }

  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }

  function handleJoinGame(gameId) {
    setGameId(gameId);

    const message = {
      type: 'joinGame',
      gameId,
      username,
    };
    sendMessage(message);
  }

  function handleCreateGame() {
    if (!username) {
      alert('Por favor ingresa tu nombre antes de crear una partida');
      return;
    }

    const message = {
      type: 'createGame',
      minutos,
      tema,
      username,
    };
    sendMessage(message);
  }

  function handleStartGame() {
    const message = {
      type: 'startGame',
      gameId,
    };
    sendMessage(message);
  }

  function handleRestartGame() {
    const message = {
      type: 'restartGame',
      gameId,
    };
    sendMessage(message);
  }

  function handleQuitGame() {
    const message = {
      type: 'quitGame',
      gameId,
      username,
    };
    sendMessage(message);
  }

  function handleCellClick(i, j) {
    if (lockedCells.some(([i2, j2]) => i === i2 && j === j2)) {
      return;
    }

    const message = {
      type: 'cellClick',
      gameId,
      i,
      j,
    };
    sendMessage(message);
  }

  function sendMessage(message) {
    const jsonMessage = JSON.stringify(message);
    const socket = new WebSocket('ws://localhost:8080');
    socket.addEventListener('open', () => {
      socket.send(jsonMessage);
      socket.close();
    });
  }

  function renderAvailableGames() {
    return (
      <div>
        <h2>Partidas disponibles:</h2>
        {availableGames.map(({ gameId, minutos, tema }) => (
          <div key={gameId}>
            <div>ID de partida: {gameId}</div>
            <div>Minutos: {minutos}</div>
            <div>Tema: {tema}</div>
            <button onClick={() => handleJoinGame(gameId)}>Unirse a la partida</button>
          </div>
        ))}
      </div>
    );
  }

  function renderPlayers() {
    return (
      <div>
        <h3>Jugadores:</h3>
        {players.map((player) => (
          <div key={player}>{player}</div>
        ))}
      </div>
    );
  }

  function renderGameBoard() {
    if (!gameState) {
      return null;
    }

    const { board } = gameState;

    return (
      <div>
        {board.map((row, i) => (
          <div key={i}>
            {row.map((cell, j) => (
              <button
                key={`${i},${j}`}
                onClick={() => handleCellClick(i, j)}
                disabled={lockedCells.some(([i2, j2]) => i === i2 && j === j2)}
              >
                {cell}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  }

  function renderScores() {
    if (!gameState) {
      return null;
    }

    const { scores } = gameState;

    return (
      <div>
        {Object.entries(scores).map(([username, score]) => (
          <div key={username}>
            {username}: {score}
          </div>
        ))}
      </div>
    );
  }

  function renderWaitingForPlayers() {
    return (
      <div>
        <h2>Esperando a que los jugadores se unan...</h2>
        <div>{renderPlayers()}</div>
        <button onClick={handleStartGame}>Iniciar partida</button>
      </div>
    );
  }

  function renderWaitingForHost() {
    return (
      <div>
        <h2>Esperando a que el anfitrión inicie la partida...</h2>
        <div>{renderPlayers()}</div>
      </div>
    );
  }

  function renderGameUI() {
    if (gameState) {
      return (
        <div>
          <div>Game ID: {gameId}</div>
          <div>Username: {username}</div>
          <div>{renderPlayers()}</div>
          <button onClick={handleStartGame}>Start Game</button>
          <button onClick={handleRestartGame}>Restart Game</button>
          <button onClick={handleQuitGame}>Quit Game</button>
          {renderGameBoard()}
          {renderScores()}
        </div>
      );
    } else if (isHost) {
      return renderWaitingForPlayers();
    } else {
      return renderWaitingForHost();
    }
  }

  return (
    <div>
      {gameId ? (
        renderGameUI()
      ) : (
        <>
          <h1>Menú principal</h1>
          <h2>Crear nueva partida:</h2>
          <label>Nombre:
            <input type="text" value={username} onChange={handleUsernameChange} />
          </label><br />
          <label>Minutos:
            <input
              type="number"
              value={minutos}
              onChange={(e) => setMinutos(Number(e.target.value))}
            />
          </label><br />
          <label>Tema:
            <select value={tema} onChange={(e) => setTema(e.target.value)}>
              {temas.map((tema) => (
                <option key={tema} value={tema}>
                  {tema}
                </option>))}
            </select></label><br />
          <button onClick={handleCreateGame}>Crear partida</button>

          {renderAvailableGames()}
        </>
      )}
    </div>
  );
}

export default MultiplayerAreaDeJuego;