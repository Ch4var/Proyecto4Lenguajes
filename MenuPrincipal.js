import React, { useState } from 'react';
import AreaDeJuego from './AreaDeJuego';
import MultiplayerAreaDeJuego from './MultiplayerAreaDeJuego';

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
      <div>
        <button onClick={handleSoloClick}>Jugar en solitario</button>
        <button onClick={handleMultiplayerClick}>Jugar en multijugador</button>
      </div>
    );
  }
}

export default JuegoPrincipal;
