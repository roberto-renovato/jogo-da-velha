import { useEffect, useState } from "react";

function Square({value, onSquareClick}) {
  return <button onClick={onSquareClick} className="square">{value}</button>;
}

function Board({hostId, isYourTurn, xIsNext, squares, onPlay, onReset, connected}) {
  

  function handleClick(i) {
    if (!isYourTurn || squares[i] || calculateWinner(squares)) return;

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  const isFinished = calculateFinished(squares);
  const winner = calculateWinner(squares);
  let status;
  status = winner
    ? 'Vencedor: ' + winner
    : isFinished
    ? 'Empate'
    : 'Próximo: ' + (xIsNext ? 'X' : 'O');

  return (
    <>
      {hostId && 
      <div className="status">
        <a href={'https://' + window.location.host + '?peerId=' + hostId}>Compartilhe esse link</a>
      </div>}

      {hostId && 
      (connected
      ? <div className="status">Conectado!</div>
      : <div className="status">Aguardando conexão...</div>)}
      
      <div className="status">{status}</div>

      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)}/>
        <Square value={squares[1]} onSquareClick={() => handleClick(1)}/>
        <Square value={squares[2]} onSquareClick={() => handleClick(2)}/>
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)}/>
        <Square value={squares[4]} onSquareClick={() => handleClick(4)}/>
        <Square value={squares[5]} onSquareClick={() => handleClick(5)}/>
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)}/>
        <Square value={squares[7]} onSquareClick={() => handleClick(7)}/>
        <Square value={squares[8]} onSquareClick={() => handleClick(8)}/>
      </div>
      <div>
        {(winner || isFinished) && <button onClick={onReset}>Reiniciar</button>}
      </div>
    </>
  );
}

export default function Game({peer, localConn}) {
  const [isYourTurn, setIsYourTurn] = useState(true);
  const [xIsNext, setXIsNext] = useState(true);
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [hostId, setHostId] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    window.xIsNext = xIsNext;
  }, [xIsNext]);

  useEffect(() => {
    window.squares = squares;
  }, [squares]);

  useEffect(() => {
    if (localConn) {
      console.log('registrando para local conn: ' + localConn);
      window.conn.on("data", handleData);
      return () => {
        console.log('desregistrando para local conn: ' + localConn);
        window.conn.off("data");
      }
    }
    else {
      window.peer.on('open', function(id) {
        console.log('My peer ID is: ' + id);
        setHostId(peer.id);
      });

      console.log('registrando para remote conn');
      peer.on("connection", (conn) => {
        setConnected(true);
        conn.on("data", handleData);
        window.conn = conn;
      });
      return () => {
        console.log('desregistrando para remote conn');
        window.peer.off("open");
        window.peer.off("connection");
      }
    }
  }, []);

  console.log('xIsNext atual: ' + xIsNext);

  function handleData(data) {
    console.log('handling data:');
    console.log(data);

    const squares = window.squares;
    const nextSquares = JSON.parse(data);

    let nextXisNext = window.xIsNext;
    console.log('nextXIsNext no inicio:' + nextXisNext);
    console.log('squares no inicio:' + squares);
    console.log('Finished: ' + calculateFinished(squares));
    if (calculateWinner(squares) || calculateFinished(squares)) {
      console.log('setando nextXIsNext para TRUE');
      nextXisNext = true;
    }

    console.log('invertendo nextXIsNext para:' + !nextXisNext);
    nextXisNext = !nextXisNext;

    setIsYourTurn(true);    
    setSquares(nextSquares);
    setXIsNext(nextXisNext);
  }

  function handlePlay(nextSquares) {
    if (!window.conn) {
      alert('Esperando conexão...');
      return;
    }

    window.conn.send(JSON.stringify(nextSquares));
    setXIsNext(!xIsNext);
    setIsYourTurn(false);
    setSquares(nextSquares);
  }

  function handleReset() {
    setIsYourTurn(true);
    setXIsNext(true);
    setSquares(Array(9).fill(null));
  }

  return (
    <Board
      hostId={hostId}
      isYourTurn={isYourTurn}
      squares={squares}
      xIsNext={xIsNext}
      onPlay={handlePlay}
      onReset={handleReset}
      connected={connected}
    />
  );
}

function calculateFinished(squares) {
  return !(squares.some((square) => square === null));
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}