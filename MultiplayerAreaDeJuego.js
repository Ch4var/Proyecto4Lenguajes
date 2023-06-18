import { useEffect, useState } from 'react';

const temas = ['estandar', 'caramelo', 'selva'];

/*
Función principal del componente MultiplayerAreaDeJuego
No tiene entradas.
Retorna un elemento JSX que muestra la interfaz de juego multijugador.
*/
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

/*
Hook de react que se usa para conectarse al servidor websocket y escuchar los mensajes
*/
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
      socket.close();
    };
  }, []);

/*
Funcion cuyo objetivo es manejar los eventos que recibe por medio del websocket
Recibe el evento como entrada y segun el evento que recibio, hace ciertas cosas
No tiene salidas.
*/
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
        console.warn(`Tipo de mensaje desconocido: ${message.type}`);
    }
  }

/*
Función cuyo objetivo es manejar el cambio de nombre de usuario
Recibe el evento como entrada y actualiza el estado del nombre de usuario con el valor del evento
No tiene salidas.
*/
  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }

/*
Función cuyo objetivo es manejar el evento de unirse a una partida
Recibe el ID de la partida como entrada y envía un mensaje al servidor para unirse a la partida
No tiene salidas.
*/
  function handleJoinGame(gameId) {
    setGameId(gameId);

    const message = {
      type: 'joinGame',
      gameId,
      username,
    };
    sendMessage(message);
  }

/*
Función cuyo objetivo es manejar el evento de crear una partida
No tiene entradas.
Envía un mensaje al servidor para crear una nueva partida con los valores seleccionados por el usuario
No tiene salidas.
*/
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

/*
Función cuyo objetivo es manejar el evento de iniciar una partida
No tiene entradas.
Envía un mensaje al servidor para iniciar la partida actual
No tiene salidas.
*/
  function handleStartGame() {
    const message = {
      type: 'startGame',
      gameId,
    };
    sendMessage(message);
  }

/*
Función cuyo objetivo es manejar el evento de reiniciar una partida
No tiene entradas.
Envía un mensaje al servidor para reiniciar la partida actual
No tiene salidas.
*/
  function handleRestartGame() {
    const message = {
      type: 'restartGame',
      gameId,
    };
    sendMessage(message);
  }

/*
Función cuyo objetivo es manejar el evento de salir de una partida
No tiene entradas.
Envía un mensaje al servidor para salir de la partida actual
No tiene salidas.
*/
  function handleQuitGame() {
    const message = {
      type: 'quitGame',
      gameId,
      username,
    };
    sendMessage(message);
  }

/*
Función cuyo objetivo es manejar el evento de hacer clic en una celda del tablero de juego
Recibe las coordenadas de la celda como entrada y envía un mensaje al servidor para actualizar el estado del juego
No tiene salidas.
*/
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

/*
Función cuyo objetivo es enviar un mensaje al servidor websocket
Recibe el mensaje como entrada y lo envía al servidor en formato JSON
No tiene salidas.
*/
  function sendMessage(message) {
    const jsonMessage = JSON.stringify(message);
    const socket = new WebSocket('ws://localhost:8080');
    socket.addEventListener('open', () => {
      socket.send(jsonMessage);
      socket.close();
    });
  }

/*
Función cuyo objetivo es renderizar las partidas disponibles para unirse
No tiene entradas.
Retorna un elemento JSX que muestra las partidas disponibles y un botón para unirse a cada una.
*/
  function renderAvailableGames() {
    return (
      <div className="container" style={{ backgroundColor: '#6E8DC0' }}>
        <h2>Partidas disponibles:</h2>
        {availableGames.map(({ gameId, minutos, tema }) => (
          <div key={gameId}>
            <div>ID de partida: {gameId}</div>
            <div>Minutos: {minutos}</div>
            <div>Tema: {tema}</div>
            <button className="btn btn-primary" onClick={() => handleJoinGame(gameId)}>
              Unirse a la partida
            </button>
          </div>
        ))}
      </div>
    );    
  }

/*
Función cuyo objetivo es renderizar los jugadores en la partida
No tiene entradas.
Retorna un elemento JSX que muestra los jugadores en la partida.
*/
  function renderPlayers() {
    return (
      <div className="container" style={{ backgroundColor: '#6E8DC0' }}>
        <h3>Jugadores:</h3>
        {players.map((player) => (
          <div key={player}>{player}</div>
        ))}
      </div>
    );    
  }

/*
Función cuyo objetivo es renderizar el tablero de juego
No tiene entradas.
Retorna un elemento JSX que muestra el tablero de juego con botones para cada celda.
*/
  function renderGameBoard() {
    if (!gameState) {
      return null;
    }

    const { board } = gameState;

    return (
      <div className="container" style={{ backgroundColor: '#6E8DC0' }}>
        {board.map((row, i) => (
          <div key={i}>
            {row.map((cell, j) => (
              <button
                key={`${i},${j}`}
                onClick={() => handleCellClick(i, j)}
                disabled={lockedCells.some(([i2, j2]) => i === i2 && j === j2)}
                className="btn btn-primary"
              >
                {cell}
              </button>
            ))}
          </div>
        ))}
      </div>
    );    
  }

/*
Función cuyo objetivo es renderizar los puntajes de los jugadores
No tiene entradas.
Retorna un elemento JSX que muestra los puntajes de los jugadores.
*/
  function renderScores() {
    if (!gameState) {
      return null;
    }

    const { scores } = gameState;

    return (
      <div className="container" style={{ backgroundColor: '#6E8DC0' }}>
        {Object.entries(scores).map(([username, score]) => (
          <div key={username}>
            {username}: {score}
          </div>
        ))}
      </div>
    );
  }

/*
Función cuyo objetivo es renderizar la pantalla de espera para que los jugadores se unan a la partida
No tiene entradas.
Retorna un elemento JSX que muestra una pantalla de espera y un botón para iniciar la partida.
*/
  function renderWaitingForPlayers() {
    return (
      <div className="container" style={{ backgroundColor: '#6E8DC0' }}>
        <h2>Esperando a que los jugadores se unan...</h2>
        <div>{renderPlayers()}</div>
        <button onClick={handleStartGame}>Iniciar partida</button>
      </div>
    );
  }

/*
Función cuyo objetivo es renderizar la pantalla de espera para que el anfitrión inicie la partida
No tiene entradas.
Retorna un elemento JSX que muestra una pantalla de espera y una lista de jugadores en la partida.
*/
  function renderWaitingForHost() {
    return (
      <div className="container" style={{ backgroundColor: '#6E8DC0' }}>
        <h2>Esperando a que el anfitrión inicie la partida...</h2>
        <div>{renderPlayers()}</div>
      </div>
    );
  }

/*
Función cuyo objetivo es renderizar la interfaz de juego
No tiene entradas.
Retorna un elemento JSX que muestra la interfaz de juego con botones para iniciar, reiniciar y salir de la partida, el tablero de juego y los puntajes.
*/
  function renderGameUI() {
    if (gameState) {
      return (
        <div className="container" style={{ backgroundColor: '#6E8DC0' }}>
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
    <div className="justify-content-center align-items-center" style={{ minHeight: '100vh' , backgroundColor: '#6E8DC0' }}>
    <div className="container" style={{ backgroundColor: '#6E8DC0' }}>
      {gameId ? (
        renderGameUI()
      ) : (
        <>
          <h1>Menú principal</h1>
          <h2>Crear nueva partida:</h2>
          <div className="form-group">
            <label>Nombre:</label>
            <input type="text" className="form-control" value={username} onChange={handleUsernameChange} />
          </div>
          <div className="form-group">
            <label>Minutos:</label>
            <input
              type="number"
              className="form-control"
              value={minutos}
              onChange={(e) => setMinutos(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>Tema:</label>
            <select className="form-control" value={tema} onChange={(e) => setTema(e.target.value)}>
              {temas.map((tema) => (
                <option key={tema} value={tema}>
                  {tema}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleCreateGame}>
            Crear partida
          </button>
  
          {renderAvailableGames()}
        </>
      )}
    </div>
    </div>
  );  
}

export default MultiplayerAreaDeJuego;