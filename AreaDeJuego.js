import React, { useState, useEffect } from 'react';
import './bootstrap.css';
import './estilos.css';

/*
Arreglos para almacenar los colores y los temas
*/
const colores = ['azul', 'naranja', 'rojo', 'verde', 'amarillo', 'morado'];
const temas = ['estandar', 'caramelo', 'selva'];

/*
Funcion cuyo objetivo es generar un color aleatorio para poner dentro de la matriz.
No tiene entradas.
Retorna un elemento aleatorio del arreglo de colores.
*/
function generarColorAleatorio() {
  return colores[Math.floor(Math.random() * colores.length)];
}

/*
Funcion cuyo objetivo verificar si 2 celdas son adyacentes.
Tiene como entradas la posicion de la primera celda y la posicion de la segunda celda.
Retorna true si las celdas son adyacentes y false si no lo son.
*/
function esAdyacente([i1, j1], [i2, j2]) {
  return (
    (i1 === i2 && Math.abs(j1 - j2) === 1) ||
    (j1 === j2 && Math.abs(i1 - i2) === 1) ||
    (Math.abs(i1 - i2) === 1 && Math.abs(j1 - j2) === 1)
  );
}

/*
Funcion cuyo objetivo es extraer las imagenes correspondientes para el color y tema seleccionados.
Tiene como entradas el color de la ficha y la tematica.
Retorna un string con la ruta a la imagen con el color y tematica que se recibieron como entradas.
*/
function obtenerImagen(color, tema) {
  return `/imagenes/${tema}_${color}.png`;
}

/*
Funcion principal del componente AreaDeJuego
No tiene entradas.
Retorna un elemento JSX que muestra la interfaz de juego en solitario.
*/
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

/*
Hook de React cuyo objetivo es manejar el tiempo restante y actualizar el historial
*/
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

/*
Funcion cuyo objetivo manejar lo que pasa al hacer clic sobre una celda.
Tiene como entradas la fila y la columna de la celda seleccionada.
Si no hay fichas seleccionadas, se agrega la celda clicada a la lista de fichas seleccionadas. Si hay fichas seleccionadas
y la celda clicada tiene el mismo color que la última ficha seleccionada y es adyacente a ella, se agrega a la lista de fichas seleccionadas.
Si la celda clicada ya esta en la lista de fichas seleccionadas, se elimina de la lista.
No tiene valor de retorno
*/
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

/*
Funcion cuyo objetivo es activar la combinacion de fichas seleccionadas.
Si hay al menos 3 fichas seleccionadas, se actualiza la matriz para reemplazar las celdas correspondientes a las fichas seleccionadas con nuevos colores aleatorios.
Tambien se actualiza el puntaje sumando el cuadrado del numero de fichas seleccionadas al puntaje actual.
Finalmente, se vacia la lista de fichas seleccionadas.
No tiene entradas ni salidas
*/
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

/*
Funcion cuyo objetivo es manejar el envio del formulario para crear una nueva partida.
Tiene como entrada el evento de envio del formulario.
Dentro de la funcion, se llama a e.preventDefault() para evitar que la pagina se recargue al enviar el formulario.
Luego, se llama a la función iniciarNuevaPartida para iniciar una nueva partida.
No tiene salidas.
*/
  function manejarEnvio(e) {
    e.preventDefault();
    iniciarNuevaPartida();
  }

/*
Funcion cuyo objetivo crear una nueva partida.
Se establece el estado partidaIniciada en verdadero para indicar que la partida ha iniciado.
Tambien se reinicia el puntaje a 0 y se genera una nueva matriz de colores aleatorios.
Se establece el tiempo restante en minutos * 60 para convertir los minutos a segundos.
Se establece el estado partidaTerminada en falso y se vacia la lista de fichas seleccionadas.
No tiene entradas ni salidas.
*/
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

/*
Funcion cuyo objetivo es regresar al menu principal.
No tiene entradas ni salidas.
Establece el estado partidaIniciada en falso para indicar que la partida ha terminado y se establece el estado partidaTerminada en falso.
*/
  function volverAlMenuPrincipal() {
    setPartidaIniciada(false);
    setPartidaTerminada(false);
  }

  return (
    <div className="justify-content-center align-items-center" style={{ minHeight: '100vh' , backgroundColor: '#6E8DC0' }}>
      <div className="container" style={{ backgroundColor: '#6E8DC0' }}>
      {!partidaIniciada && (
        <>
          <form onSubmit={manejarEnvio}>
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                className="form-control"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
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
            <button type="submit" className="btn btn-primary">
              Crear partida
            </button>
          </form>
          <button
            className="btn btn-secondary"
            onClick={() => setMostrarHistorial((mostrarHistorial) => !mostrarHistorial)}
          >
            Mostrar historial
          </button>
        </>
      )}
      </div>
      <div className="container" style={{ backgroundColor: '#6E8DC0' }}>
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
                    (celdaPop && celdaPop[0] === i && celdaPop[1] === j ? 'celda-pop ' : '') +
                    (fichasSeleccionadas.some(([i2, j2]) => i === i2 && j === j2)
                      ? 'celda-seleccionada '
                      : '')
                  }
                  onClick={() => manejarClic(i, j)}
                />
              ))}
            </div>
          ))}
          <button className="btn btn-primary" onClick={activarCombinacion}>
            Activar combinación
          </button>
        </>
      )}
      </div>
      <div className="container" style={{ backgroundColor: '#6E8DC0' }}>
      {partidaTerminada && (
        <>
          <div>Fin de la partida</div>
          <div>Puntaje final: {puntaje}</div>
          <button className="btn btn-primary" onClick={iniciarNuevaPartida}>
            Reiniciar partida
          </button>
          <button className="btn btn-primary" onClick={volverAlMenuPrincipal}>
            Volver al menú principal
          </button>
        </>
      )}
      </div>
      <div className="container" style={{ backgroundColor: '#6E8DC0' }}>
      {mostrarHistorial && (
        <>
          <h2>Historial de partidas</h2>
          {historialDePartidas.map(({ nombre, minutos, tema, puntaje }, i) => (
            <div key={i}>
              Partida #{i + 1}: Nombre: {nombre}, Minutos: {minutos}, Tema: {tema}, Puntaje: {puntaje}
            </div>
          ))}
        </>
      )}
      </div>
    </div>
  );  
}

export default AreaDeJuego;