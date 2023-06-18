import React, { useState } from 'react';
import AreaDeJuego from './AreaDeJuego';
import MultiplayerAreaDeJuego from './MultiplayerAreaDeJuego';
import './bootstrap.css';

/*
Funcion cuyo objetivo es cargar el archivo AreaDeJuego o MultiplayerAreaDeJuego segun la opcion seleccionada.
No tiene entradas ni salidas, solo toma el modo de juego que el usuario selecciona al presionar el respectivo boton
*/
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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' , backgroundColor: '#6E8DC0' }}>
        <button className="btn btn-dark" onClick={handleSoloClick}>Jugar en solitario</button>
        <button className="btn btn-dark" onClick={handleMultiplayerClick}>Jugar en multijugador</button>
      </div>
    );
  }
}

export default JuegoPrincipal;
