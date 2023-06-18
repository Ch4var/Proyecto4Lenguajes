import React, { useState } from 'react';
import AreaDeJuego from './AreaDeJuego';
import MultiplayerAreaDeJuego from './MultiplayerAreaDeJuego';
import './bootstrap.css';

function JuegoPrincipal() {
  const [modoDeJuego, setModoDeJuego] = useState(null);

  function handleSoloClick() {
    setModoDeJuego('solo');
  }

  function handleMultiplayerClick() {
    setModoDeJuego('multiplayer');
  }

  if (modoDeJuego === 'solo') {
    return <AreaDeJuego />;
  } else if (modoDeJuego === 'multiplayer') {
    return <MultiplayerAreaDeJuego />;
  } else {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#6E8DC0' }}>
        <h2 className="mt-4">Match3 Game</h2>
        <div className="d-grid gap-2 col-6 mx-auto mt-4">
          <button className="btn btn-dark" onClick={handleSoloClick}>Jugar en solitario</button>
          <button className="btn btn-dark" onClick={handleMultiplayerClick}>Jugar en multijugador</button>
        </div>
      </div>
    );
  }
}

export default JuegoPrincipal;
