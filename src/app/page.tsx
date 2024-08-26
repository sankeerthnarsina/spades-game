
"use client"; // Add this at the top
import React, { useState, useEffect } from 'react';

export default function Home() {
  const [players, setPlayers] = useState<string[]>([]);
  const [tableData2, setTableData2] = useState<number[][]>([]);
  const [inputValue, setInputValue] = useState('');
  const [roundNumber, setRoundNumber] = useState<number>(0);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [showBidsInputWindow, setShowBidsInputWindow] = useState(false);
  const [showWinsInputWindow, setShowWinsInputWindow] = useState(false);
  const [bidsFormData, setBidsFormData] = useState<{ [key: string]: number }>({});
  const [winsFormData, setWinsFormData] = useState<{ [key: string]: number }>({});
  const [isTableCollapsed, setIsTableCollapsed] = useState(true);
  // Load state from localStorage when the component mounts
  useEffect(() => {

    const savedPlayers = localStorage.getItem('players');
    const savedTableData = localStorage.getItem('tableData2');
    const savedRoundNumber = localStorage.getItem('roundNumber');
    const savedIsGameStarted = localStorage.getItem('isGameStarted');

    if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
    if (savedTableData) setTableData2(JSON.parse(savedTableData));
    if (savedRoundNumber !== 'undefined') setRoundNumber(JSON.parse(savedRoundNumber)) || setRoundNumber(0); 
    if (savedIsGameStarted !== 'undefined') setIsGameStarted(JSON.parse(savedIsGameStarted)) || setIsGameStarted(false);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('tableData2', JSON.stringify(tableData2));
  }, [tableData2]);

  useEffect(() => {
    localStorage.setItem('roundNumber', JSON.stringify(roundNumber));
  }, [roundNumber]);

  useEffect(() => {
    localStorage.setItem('isGameStarted', JSON.stringify(isGameStarted));
  }, [isGameStarted]);

  const handleBidInputChangeForAPlayer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBidsFormData({ ...bidsFormData, [name]: Number(value) });
  };

  const handleWinInputChangeForAPlayer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWinsFormData({ ...winsFormData, [name]: Number(value) });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleAddHeader = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setPlayers([...players, inputValue.trim()]);
      setInputValue(''); // Clear the input field
    }
  };

  const handleStartGameButton = () => {
    setIsGameStarted(true);
  };

  const handleEndButton = () => {
    setIsGameStarted(false);
    setPlayers([]);
    setInputValue('');
    setBidsFormData({});
    setWinsFormData({});
    setTableData2([]);
    localStorage.removeItem('players');
    localStorage.removeItem('tableData2');
    localStorage.removeItem('roundNumber');
    localStorage.removeItem('isGameStarted');
  };

  const handleBidsStart = () => {
    setRoundNumber(roundNumber + 1);
    setShowBidsInputWindow(true);
  };

  const handleBidsEnd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let newRow = new Array(players.length * 3).fill(0);
    players.forEach((player, index) => {
      newRow[index * 3] = bidsFormData[player];
    });

    const newMatrix = [...tableData2, newRow];
    setTableData2(newMatrix);
    setShowBidsInputWindow(false);
  };

  const handleWinsStart = () => {
    setShowWinsInputWindow(true);
  };

  const toggleTableCollapse = () => {
    setIsTableCollapsed(!isTableCollapsed);
  };

  const handleWinsEnd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const copy = [...tableData2];
    players.forEach((player, index) => {
      const bidsColumn = index * 3 + 0;
      const winsColumn = index * 3 + 1;
      const roundsColumn = index * 3 + 2;
      let total = 0;
      copy[roundNumber - 1][winsColumn] = winsFormData[player];
      if (copy[roundNumber - 1][bidsColumn] === copy[roundNumber - 1][winsColumn]) {
        total = 10 * copy[roundNumber - 1][bidsColumn];
      } else if (copy[roundNumber - 1][bidsColumn] > copy[roundNumber - 1][winsColumn]) {
        total = -10 * copy[roundNumber - 1][bidsColumn];
      } else if (copy[roundNumber - 1][bidsColumn] < copy[roundNumber - 1][winsColumn]) {
        total = 10 * copy[roundNumber - 1][bidsColumn];
        const toSubtract = 10 * (copy[roundNumber - 1][winsColumn] - copy[roundNumber - 1][bidsColumn]);
        total -= toSubtract;
      }
      copy[roundNumber - 1][roundsColumn] = total;
    });
    setTableData2(copy);
    setShowWinsInputWindow(false);
  };

  const calculateTotalScoreForPlayer = (playerIndex: number) => {
    return tableData2.reduce((total, row) => total + row[playerIndex * 3 + 2], 0);
  };

  // Generate column headers dynamically
  const renderHeaders = () => {
    let headers = [];
    for (let i = 0; i < players.length; i++) {
      const totalScore = calculateTotalScoreForPlayer(i);
      headers.push(
        <th key={`player-${i}`} colSpan={3}>
          {players[i]} <br /><span className="totalScore">Total: {totalScore}</span>
        </th>
      );
    }
    return (
      <tr className="tableHeader">
        {headers}
      </tr>
    );
  };

  // Generate sub-column headers dynamically
  const renderSubHeaders = () => {
    let subHeaders = [];

    for (let i = 0; i < players.length; i++) {
      for (let j = 0; j < 3; j++) {
        subHeaders.push(
          <th
            key={`sub-${i}-${j}`}
          >
            {['Bids', 'Wins', 'Round score'][j]}
          </th>
        );
      }
    }

    return (
      <tr className="tableSubHeader">
        {subHeaders}
      </tr>
    );
  };

  return (
    <main>
      <h1> Game of Spades</h1>
      {!isGameStarted && <div>
        <h1>Enter Player/Team names</h1>
        <br></br>
        <form onSubmit={handleAddHeader}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter a name"
          />
          &nbsp;
          <button type="submit" className="addButton">Add</button>
        </form>

        <br></br>
        <ol>
          {players.map((player, index) => (
            <li key={index}>{index + 1}. {player}</li>
          ))}
        </ol>
        <br></br>
        <button type="button" className="startEndGameButton" onClick={handleStartGameButton}>Start the game</button>

      </div>}

      {isGameStarted && <div>
        <button type="button" className="submitButton" onClick={handleBidsStart}>Enter Bids</button>
        <button type="button" className="submitButton" onClick={handleWinsStart}>Enter Wins</button>
        </div>
}

      {isGameStarted && <div>
        <button type="button" className="submitButton" onClick={toggleTableCollapse}>
          {isTableCollapsed ? 'Expand Table' : 'Collapse Table'}
        </button>
        {!isTableCollapsed && (
          <table style={{ borderCollapse: 'separate', width: '80%', marginTop: '5%', marginLeft: '5%' }}>
            <thead>
              {renderHeaders()}
              {renderSubHeaders()}
            </thead>
            <tbody>
              {tableData2.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} style={{ border: '1px solid black', padding: '8px' }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <br></br>
        <button type="button" className="startEndGameButton" onClick={handleEndButton}>End the game</button>
      </div>}

      {showBidsInputWindow && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Enter Bids for all players</h2>
            <form onSubmit={handleBidsEnd}>
              {players.map((player, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <label>
                    {player}:
                    <input
                      type="number"
                      name={player}
                      onChange={handleBidInputChangeForAPlayer}
                      style={{ marginLeft: '10px' }}
                    />
                  </label>
                </div>
              ))}

              <button type="submit" style={{ marginTop: '20px', padding: '10px 20px' }}>
                Submit
              </button>
            </form>
            <button className="closeButton" onClick={() => setShowBidsInputWindow(false)}>Close</button>
          </div>
        </div>)}

      {showWinsInputWindow && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Enter Wins for all players</h2>
            <form onSubmit={handleWinsEnd}>
              {players.map((player, index) => (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <label>
                    {player}:
                    <input
                      type="number"
                      name={player}
                      onChange={handleWinInputChangeForAPlayer}
                      style={{ marginLeft: '10px' }}
                    />
                  </label>
                </div>
              ))}

              <button type="submit" style={{ marginTop: '20px', padding: '10px 20px' }}>
                Submit
              </button>
            </form>
            <button className="closeButton" onClick={() => setShowWinsInputWindow(false)}>Close</button>
          </div>
        </div>)}
    </main>
  );
}
