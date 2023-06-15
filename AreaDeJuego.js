import React, { useState, useEffect } from 'react';
import './estilos.css';

const colores = ['azul', 'naranja', 'rojo', 'verde', 'amarillo', 'morado'];
const temas = ['estandar', 'caramelo', 'selva'];

function generarColorAleatorio() {
  return colores[Math.floor(Math.random() * colores.length)];
}

function esAdyacente([i1, j1], [i2, j2]) {
  return (
    (i1 === i2 && Math.abs(j1 - j2) === 1) ||
    (j1 === j2 && Math.abs(i1 - i2) === 1) ||
    (Math.abs(i1 - i2) === 1 && Math.abs(j1 - j2) === 1)
  );
}

function obtenerImagen(color, tema) {
  return `/imagenes/${tema}_${color}.png`;
}

function AreaDeJuego() {
  const [matriz, setMatriz] = useState(
    Array.from({ length: 9 }, () =>
      Array.from({ length: 7 }, () => generarColorAleatorio())
    )
  );
  const [fichasSeleccionadas, setFichasSeleccionadas] = useState([]);
  const [puntaje, setPuntaje] = useState(0);
  const [nombre, setNombre] = useState('');
  const [minutos, setMinutos] = useState(0);
  const [tema, setTema] = useState(temas[0]);
  const [partidaIniciada, setPartidaIniciada] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(minutos * 60);
  const [partidaTerminada, setPartidaTerminada] = useState(false);
  const [historialDePartidas, setHistorialDePartidas] = useState([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [celdaPop, setCeldaPop] = useState(null);

  useEffect(() => {
    if (partidaIniciada && tiempoRestante > 0) {
      const id = setInterval(() => {
        setTiempoRestante((tiempoRestante) => tiempoRestante - 1);
      }, 1000);
      return () => clearInterval(id);
    } else if (partidaIniciada && tiempoRestante === 0) {
      setPartidaTerminada(true);
      setHistorialDePartidas((historialDePartidas) => [
        ...historialDePartidas,
        { nombre, minutos, tema, puntaje },
      ]);
    }
  }, [partidaIniciada, tiempoRestante]);

  function manejarClic(i, j) {
    if (fichasSeleccionadas.length === 0) {
      setFichasSeleccionadas([[i, j]]);
    } else if (
      matriz[i][j] === matriz[fichasSeleccionadas[fichasSeleccionadas.length - 1][0]][fichasSeleccionadas[fichasSeleccionadas.length - 1][1]] &&
      esAdyacente([i, j], fichasSeleccionadas[fichasSeleccionadas.length - 1])
    ) {
      if (!fichasSeleccionadas.some(([i2, j2]) => i === i2 && j === j2)) {
        setFichasSeleccionadas((fichasSeleccionadas) => [...fichasSeleccionadas, [i, j]]);
      }
    } else if (fichasSeleccionadas.some(([i2, j2]) => i === i2 && j === j2)) {
      setFichasSeleccionadas((fichasSeleccionadas) =>
        fichasSeleccionadas.filter(([i2, j2]) => i !== i2 || j !== j2)
      );
    }
    setCeldaPop([i,j]);
  }

  function activarCombinacion() {
    if (fichasSeleccionadas.length >= 3) {
      setMatriz((matriz) =>
        matriz.map((fila, i) =>
          fila.map((color, j) =>
            fichasSeleccionadas.some(([i2, j2]) => i === i2 && j === j2)
              ? generarColorAleatorio()
              : color
          )
        )
      );
      setPuntaje((puntaje) => puntaje + fichasSeleccionadas.length ** 2);
      setFichasSeleccionadas([]);
    }
  }

  function manejarEnvio(e) {
    e.preventDefault();
    iniciarNuevaPartida();
  }

  function iniciarNuevaPartida() {
    setPartidaIniciada(true);
    setPuntaje(0);
    setMatriz(
      Array.from({ length: 9 }, () =>
        Array.from({ length: 7 }, () => generarColorAleatorio())
      )
    );
    setTiempoRestante(minutos * 60);
    setPartidaTerminada(false);
    setFichasSeleccionadas([]);
  }

  function volverAlMenuPrincipal() {
    setPartidaIniciada(false);
    setPartidaTerminada(false);
  }

  return (
    <div>
      {!partidaIniciada && (
        <>
          <form onSubmit={manejarEnvio}>
            <label>
              Nombre:
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </label>
            <br />
            <label>
              Minutos:
              <input
                type="number"
                value={minutos}
                onChange={(e) => setMinutos(Number(e.target.value))}
              />
            </label>
            <br />
            <label>
              Tema:
              <select value={tema} onChange={(e) => setTema(e.target.value)}>
                {temas.map((tema) => (
                  <option key={tema} value={tema}>
                    {tema}
                  </option>
                ))}
              </select>
            </label>
            <br />
            <button type="submit">Crear partida</button>
          </form>
          <button onClick={() => setMostrarHistorial((mostrarHistorial) => !mostrarHistorial)}>
            Mostrar historial
          </button>
        </>
      )}
      {partidaIniciada && !partidaTerminada && (
        <>
          <div>Tiempo restante: {tiempoRestante}</div>
          <div>Puntaje: {puntaje}</div>
          {matriz.map((fila, i) => (
  <div key={i}>
    {fila.map((color, j) => (
      <img
        key={j}
        src={obtenerImagen(color, tema)}
        alt={color}
        className={
          (celdaPop && celdaPop[0] === i && celdaPop[1] === j ? 'celda-pop' : '') +
          (fichasSeleccionadas.some(([i2, j2]) => i === i2 && j === j2)
            ? ' celda-seleccionada'
            : '')
        }
        onClick={() => manejarClic(i, j)}
      />
    ))}
  </div>
))}

          <button onClick={activarCombinacion}>Activar combinación</button>
        </>
      )}
      {partidaTerminada && (
        <>
          <div>Fin de la partida</div>
          <div>Puntaje final: {puntaje}</div>
          <button onClick={iniciarNuevaPartida}>Reiniciar partida</button>
          <button onClick={volverAlMenuPrincipal}>Volver al menú principal</button>
        </>
      )}
      {mostrarHistorial && (
        <>
          <h2>Historial de partidas</h2>
          {historialDePartidas.map(({ nombre, minutos, tema, puntaje }, i) => (
            <div key={i}>
              Partida #{i + 1}: Nombre: {nombre}, Minutos: {minutos}, Tema: {tema}, Puntaje:{' '}
              {puntaje}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default AreaDeJuego;