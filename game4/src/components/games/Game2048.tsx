import { FC, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

type Direction = 'up' | 'down' | 'left' | 'right'

const Game2048: FC = () => {
  const { addRecentScore, incrementTotalGames, soundEnabled } = useGameStore()

  const [board, setBoard] = useState<number[][]>([])
  const [score, setScore] = useState(0)
  const [bestTile, setBestTile] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [hasWon, setHasWon] = useState(false)
  const [moves, setMoves] = useState(0)

  useEffect(() => {
    initGame()
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault()
          move('up')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault()
          move('down')
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault()
          move('left')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault()
          move('right')
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [board, gameOver])

  const playSound = (_type: 'move' | 'merge' | 'win' | 'gameover') => {
    if (!soundEnabled) return
    // Sound implementation would go here
  }

  const initGame = () => {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0))
    addRandomTile(newBoard)
    addRandomTile(newBoard)
    setBoard(newBoard)
    setScore(0)
    setBestTile(0)
    setGameOver(false)
    setHasWon(false)
    setMoves(0)
  }

  const addRandomTile = (board: number[][]) => {
    const emptyCells: [number, number][] = []
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          emptyCells.push([i, j])
        }
      }
    }

    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      board[row][col] = Math.random() < 0.9 ? 2 : 4
    }
  }

  const slideArray = (arr: number[]): [number[], number] => {
    // Remove zeros
    let filtered = arr.filter(val => val !== 0)
    let scoreIncrease = 0

    // Merge adjacent equal tiles
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2
        scoreIncrease += filtered[i]
        filtered.splice(i + 1, 1)
      }
    }

    // Add zeros to the end
    while (filtered.length < 4) {
      filtered.push(0)
    }

    return [filtered, scoreIncrease]
  }

  const move = (direction: Direction) => {
    let newBoard = board.map(row => [...row])
    let moved = false
    let scoreIncrease = 0

    switch (direction) {
      case 'left':
        for (let i = 0; i < 4; i++) {
          const [newRow, points] = slideArray(newBoard[i])
          scoreIncrease += points
          if (JSON.stringify(newRow) !== JSON.stringify(newBoard[i])) {
            moved = true
          }
          newBoard[i] = newRow
        }
        break

      case 'right':
        for (let i = 0; i < 4; i++) {
          const reversed = [...newBoard[i]].reverse()
          const [newRow, points] = slideArray(reversed)
          scoreIncrease += points
          const finalRow = newRow.reverse()
          if (JSON.stringify(finalRow) !== JSON.stringify(newBoard[i])) {
            moved = true
          }
          newBoard[i] = finalRow
        }
        break

      case 'up':
        for (let j = 0; j < 4; j++) {
          const column = [newBoard[0][j], newBoard[1][j], newBoard[2][j], newBoard[3][j]]
          const [newColumn, points] = slideArray(column)
          scoreIncrease += points
          for (let i = 0; i < 4; i++) {
            if (newBoard[i][j] !== newColumn[i]) {
              moved = true
            }
            newBoard[i][j] = newColumn[i]
          }
        }
        break

      case 'down':
        for (let j = 0; j < 4; j++) {
          const column = [newBoard[0][j], newBoard[1][j], newBoard[2][j], newBoard[3][j]]
          const reversed = column.reverse()
          const [newColumn, points] = slideArray(reversed)
          scoreIncrease += points
          const finalColumn = newColumn.reverse()
          for (let i = 0; i < 4; i++) {
            if (newBoard[i][j] !== finalColumn[i]) {
              moved = true
            }
            newBoard[i][j] = finalColumn[i]
          }
        }
        break
    }

    if (moved) {
      addRandomTile(newBoard)
      setBoard(newBoard)
      setScore(score + scoreIncrease)
      setMoves(moves + 1)

      if (scoreIncrease > 0) {
        playSound('merge')
      } else {
        playSound('move')
      }

      // Update best tile
      const maxTile = Math.max(...newBoard.flat())
      setBestTile(Math.max(bestTile, maxTile))

      // Check win condition
      if (maxTile >= 2048 && !hasWon) {
        setHasWon(true)
        playSound('win')
        completeGame()
      }

      // Check game over
      if (!canMove(newBoard)) {
        setGameOver(true)
        playSound('gameover')
        completeGame()
      }
    }
  }

  const canMove = (board: number[][]): boolean => {
    // Check for empty cells
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return true
      }
    }

    // Check for possible merges
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const current = board[i][j]
        // Check right
        if (j < 3 && board[i][j + 1] === current) return true
        // Check down
        if (i < 3 && board[i + 1][j] === current) return true
      }
    }

    return false
  }

  const completeGame = () => {
    incrementTotalGames()
    addRecentScore({
      gameType: '2048',
      score,
      date: new Date().toISOString(),
      playerName: '플레이어'
    })
  }

  const getTileColor = (value: number): string => {
    const colors: { [key: number]: string } = {
      0: 'bg-gray-200 dark:bg-gray-700',
      2: 'bg-gray-300 dark:bg-gray-600',
      4: 'bg-gray-400 dark:bg-gray-500',
      8: 'bg-orange-300',
      16: 'bg-orange-400',
      32: 'bg-orange-500',
      64: 'bg-orange-600',
      128: 'bg-yellow-400',
      256: 'bg-yellow-500',
      512: 'bg-yellow-600',
      1024: 'bg-green-500',
      2048: 'bg-green-600',
      4096: 'bg-purple-500',
      8192: 'bg-purple-600'
    }
    return colors[value] || 'bg-purple-700'
  }

  const getTileTextColor = (value: number): string => {
    return value <= 4 ? 'text-gray-700 dark:text-gray-200' : 'text-white'
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex justify-between items-center p-4 bg-white/10 dark:bg-white/5 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">점수</p>
          <p className="text-2xl font-bold">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">최고 타일</p>
          <p className="text-2xl font-bold">{bestTile}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">이동</p>
          <p className="text-2xl font-bold">{moves}</p>
        </div>
        <button
          onClick={initGame}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
        >
          새 게임
        </button>
      </div>

      {/* Game Board */}
      <div className="relative max-w-md mx-auto">
        <div className="bg-gray-400 dark:bg-gray-600 p-2 rounded-lg">
          <div className="grid grid-cols-4 gap-2">
            {board.map((row, i) =>
              row.map((value, j) => (
                <motion.div
                  key={`${i}-${j}`}
                  animate={{ scale: value > 0 ? 1 : 0.9 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center
                    ${getTileColor(value)}
                    ${getTileTextColor(value)}
                    font-bold text-2xl
                    transition-all duration-200
                  `}
                >
                  {value > 0 && value}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Game Over Overlay */}
        {(gameOver || hasWon) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center"
          >
            <div className="text-center text-white p-8">
              <div className="text-6xl mb-4">{hasWon ? '🎉' : '😢'}</div>
              <h3 className="text-3xl font-bold mb-2">
                {hasWon ? '승리!' : '게임 오버'}
              </h3>
              <p className="text-xl mb-4">최종 점수: {score}</p>
              <button
                onClick={initGame}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
              >
                다시 플레이
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls (for mobile) */}
      <div className="max-w-xs mx-auto">
        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <button
            onClick={() => move('up')}
            className="p-4 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            ↑
          </button>
          <div></div>
          <button
            onClick={() => move('left')}
            className="p-4 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            ←
          </button>
          <button
            onClick={() => move('down')}
            className="p-4 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            ↓
          </button>
          <button
            onClick={() => move('right')}
            className="p-4 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            →
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-sm text-center">
          💡 화살표 키(↑↓←→) 또는 WASD로 타일을 움직이세요. 같은 숫자를 합쳐 2048을 만드세요!
        </p>
      </div>
    </div>
  )
}

export default Game2048