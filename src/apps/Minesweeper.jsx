
import React, { useState, useEffect, useCallback } from 'react';
import { Flag, Bomb, RefreshCw } from 'lucide-react';

const LEVELS = {
    BEGINNER: { rows: 9, cols: 9, mines: 10 },
    INTERMEDIATE: { rows: 16, cols: 16, mines: 40 },
    EXPERT: { rows: 16, cols: 30, mines: 99 }
};

const Minesweeper = () => {
    const [level, setLevel] = useState(LEVELS.BEGINNER);
    const [grid, setGrid] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [win, setWin] = useState(false);
    const [minesLeft, setMinesLeft] = useState(level.mines);
    const [time, setTime] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    const initGrid = useCallback(() => {
        const newGrid = Array(level.rows).fill().map(() => Array(level.cols).fill().map(() => ({
            isMine: false,
            revealed: false,
            flagged: false,
            neighborMines: 0
        })));

        // Place mines
        let minesPlaced = 0;
        while (minesPlaced < level.mines) {
            const r = Math.floor(Math.random() * level.rows);
            const c = Math.floor(Math.random() * level.cols);
            if (!newGrid[r][c].isMine) {
                newGrid[r][c].isMine = true;
                minesPlaced++;
            }
        }

        // Calculate neighbors
        for (let r = 0; r < level.rows; r++) {
            for (let c = 0; c < level.cols; c++) {
                if (!newGrid[r][c].isMine) {
                    let count = 0;
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            if (r + i >= 0 && r + i < level.rows && c + j >= 0 && c + j < level.cols) {
                                if (newGrid[r + i][c + j].isMine) count++;
                            }
                        }
                    }
                    newGrid[r][c].neighborMines = count;
                }
            }
        }

        setGrid(newGrid);
        setGameOver(false);
        setWin(false);
        setMinesLeft(level.mines);
        setTime(0);
        setTimerActive(false);
    }, [level]);

    useEffect(() => {
        initGrid();
    }, [initGrid]);

    useEffect(() => {
        let interval;
        if (timerActive && !gameOver && !win) {
            interval = setInterval(() => setTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive, gameOver, win]);

    const reveal = (r, c) => {
        if (gameOver || win || grid[r][c].revealed || grid[r][c].flagged) return;

        if (!timerActive) setTimerActive(true);

        const newGrid = [...grid.map(row => [...row])];

        if (newGrid[r][c].isMine) {
            setGameOver(true);
            revealAllMines(newGrid);
            return;
        }

        const revealEmpty = (row, col) => {
            if (row < 0 || row >= level.rows || col < 0 || col >= level.cols || newGrid[row][col].revealed || newGrid[row][col].flagged) return;

            newGrid[row][col].revealed = true;

            if (newGrid[row][col].neighborMines === 0) {
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        revealEmpty(row + i, col + j);
                    }
                }
            }
        };

        revealEmpty(r, c);
        setGrid(newGrid);

        // Check win
        const totalCells = level.rows * level.cols;
        const revealedCount = newGrid.flat().filter(cell => cell.revealed).length;
        if (revealedCount === totalCells - level.mines) {
            setWin(true);
        }
    };

    const revealAllMines = (newGrid) => {
        newGrid.forEach(row => row.forEach(cell => {
            if (cell.isMine) cell.revealed = true;
        }));
        setGrid(newGrid);
    };

    const toggleFlag = (e, r, c) => {
        e.preventDefault();
        if (gameOver || win || grid[r][c].revealed) return;

        const newGrid = [...grid.map(row => [...row])];
        newGrid[r][c].flagged = !newGrid[r][c].flagged;
        setGrid(newGrid);
        setMinesLeft(prev => newGrid[r][c].flagged ? prev - 1 : prev + 1);
    };

    return (
        <div className="minesweeper-app" style={{ padding: '10px', background: '#ece9d8', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="ms-stats" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '5px 10px', background: 'silver', border: '2px inset white', marginBottom: '10px' }}>
                <div style={{ background: 'black', color: 'red', padding: '2px 5px', fontSize: '20px', fontFamily: 'monospace' }}>{minesLeft.toString().padStart(3, '0')}</div>
                <button onClick={initGrid} style={{ padding: '2px', background: 'silver', border: '2px outset white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {gameOver ? '😵' : win ? '😎' : '🙂'}
                </button>
                <div style={{ background: 'black', color: 'red', padding: '2px 5px', fontSize: '20px', fontFamily: 'monospace' }}>{time.toString().padStart(3, '0')}</div>
            </div>
            <div className="ms-grid" style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${level.cols}, 20px)`,
                gridTemplateRows: `repeat(${level.rows}, 20px)`,
                border: '3px inset white'
            }}>
                {grid.map((row, r) => row.map((cell, c) => (
                    <div
                        key={`${r}-${c}`}
                        onClick={() => reveal(r, c)}
                        onContextMenu={(e) => toggleFlag(e, r, c)}
                        style={{
                            width: '20px',
                            height: '20px',
                            border: '1px solid #7b7b7b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            ...(cell.revealed ? {
                                background: '#bdbdbd',
                                border: '1px solid #999'
                            } : {
                                background: '#bdbdbd',
                                borderTop: '2px solid white',
                                borderLeft: '2px solid white',
                                borderRight: '2px solid #7b7b7b',
                                borderBottom: '2px solid #7b7b7b'
                            })
                        }}
                    >
                        {cell.revealed ? (
                            cell.isMine ? <Bomb size={14} color="black" /> : (cell.neighborMines > 0 ? cell.neighborMines : '')
                        ) : (
                            cell.flagged ? <Flag size={12} color="red" /> : ''
                        )}
                    </div>
                )))}
            </div>
        </div>
    );
};

export default Minesweeper;
