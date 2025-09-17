import { FC, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

type Player = 'X' | 'O' | null
type Board = Player[]
type Difficulty = 'easy' | 'medium' | 'hard'

const TicTacToe: FC = () => {
  const { addRecentScore, incrementTotalGames, soundEnabled } = useGameStore()

  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X')
  const [winner, setWinner] = useState<Player>(null)
  const [winningLine, setWinningLine] = useState<number[]>([])
  const [isDraw, setIsDraw] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [score, setScore] = useState({ player: 0, ai: 0, draws: 0 })
  const [isThinking, setIsThinking] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [streak, setStreak] = useState(0)

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ]

  const playSound = (_type: 'move' | 'win' | 'lose' | 'draw') => {
    if (!soundEnabled) return
    // Sound implementation would go here
  }

  const checkWinner = useCallback((board: Board): Player => {
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinningLine(pattern)
        return board[a]
      }
    }
    return null
  }, [])

  const checkDraw = (board: Board): boolean => {
    return board.every(cell => cell !== null)
  }

  const getEmptyCells = (board: Board): number[] => {
    return board.map((cell, index) => cell === null ? index : null)
      .filter(index => index !== null) as number[]
  }

  const minimax = (board: Board, depth: number, isMaximizing: boolean, alpha: number, beta: number): number => {
    const winner = checkWinner(board)

    if (winner === 'O') return 10 - depth
    if (winner === 'X') return depth - 10
    if (checkDraw(board)) return 0

    if (isMaximizing) {
      let maxScore = -Infinity
      const emptyCells = getEmptyCells(board)

      for (const index of emptyCells) {
        board[index] = 'O'
        const score = minimax(board, depth + 1, false, alpha, beta)
        board[index] = null
        maxScore = Math.max(score, maxScore)
        alpha = Math.max(alpha, score)
        if (beta <= alpha) break // Alpha-beta pruning
      }
      return maxScore
    } else {
      let minScore = Infinity
      const emptyCells = getEmptyCells(board)

      for (const index of emptyCells) {
        board[index] = 'X'
        const score = minimax(board, depth + 1, true, alpha, beta)
        board[index] = null
        minScore = Math.min(score, minScore)
        beta = Math.min(beta, score)
        if (beta <= alpha) break // Alpha-beta pruning
      }
      return minScore
    }
  }

  const getAIMove = useCallback((board: Board): number => {
    const emptyCells = getEmptyCells(board)

    if (difficulty === 'easy') {
      // Random move with 70% chance, smart move with 30% chance
      if (Math.random() < 0.7) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)]
      }
    } else if (difficulty === 'medium') {
      // Random move with 30% chance, smart move with 70% chance
      if (Math.random() < 0.3) {
        return emptyCells[Math.floor(Math.random() * emptyCells.length)]
      }
    }

    // Use minimax for smart moves (hard always uses this)
    let bestScore = -Infinity
    let bestMove = emptyCells[0]

    for (const index of emptyCells) {
      board[index] = 'O'
      const score = minimax([...board], 0, false, -Infinity, Infinity)
      board[index] = null

      if (score > bestScore) {
        bestScore = score
        bestMove = index
      }
    }

    return bestMove
  }, [difficulty, checkWinner])

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isDraw || currentPlayer !== 'X' || isThinking) return

    const newBoard = [...board]
    newBoard[index] = 'X'
    setBoard(newBoard)
    playSound('move')

    const gameWinner = checkWinner(newBoard)
    if (gameWinner) {
      handleGameEnd(gameWinner)
      return
    }

    if (checkDraw(newBoard)) {
      handleDraw()
      return
    }

    setCurrentPlayer('O')
    setIsThinking(true)
  }

  useEffect(() => {
    if (currentPlayer === 'O' && !winner && !isDraw && gameStarted) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove([...board])
        const newBoard = [...board]
        newBoard[aiMove] = 'O'
        setBoard(newBoard)
        playSound('move')

        const gameWinner = checkWinner(newBoard)
        if (gameWinner) {
          handleGameEnd(gameWinner)
        } else if (checkDraw(newBoard)) {
          handleDraw()
        } else {
          setCurrentPlayer('X')
          setIsThinking(false)
        }
      }, 500 + Math.random() * 500) // AI thinks for 0.5-1 second

      return () => clearTimeout(timer)
    }
  }, [currentPlayer, board, winner, isDraw, gameStarted, checkWinner, getAIMove])

  const handleGameEnd = (winner: Player) => {
    setWinner(winner)
    incrementTotalGames()

    if (winner === 'X') {
      playSound('win')
      setScore({ ...score, player: score.player + 1 })
      setStreak(streak + 1)

      const gameScore = 100 + (streak * 20) + (difficulty === 'hard' ? 50 : difficulty === 'medium' ? 30 : 10)
      addRecentScore({
        gameType: 'tic-tac-toe',
        score: gameScore,
        date: new Date().toISOString(),
        playerName: '플레이어'
      })
    } else {
      playSound('lose')
      setScore({ ...score, ai: score.ai + 1 })
      setStreak(0)
    }
  }

  const handleDraw = () => {
    setIsDraw(true)
    playSound('draw')
    setScore({ ...score, draws: score.draws + 1 })
    incrementTotalGames()
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer('X')
    setWinner(null)
    setWinningLine([])
    setIsDraw(false)
    setIsThinking(false)
    setGameStarted(true)
  }

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'hard': return 'text-red-500'
      default: return ''
    }
  }

  const getDifficultyEmoji = () => {
    switch (difficulty) {
      case 'easy': return '😊'
      case 'medium': return '🤔'
      case 'hard': return '😈'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats and Difficulty */}
      <div className="flex justify-between items-center p-4 bg-white/10 dark:bg-white/5 rounded-lg">
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">플레이어</p>
            <p className="text-2xl font-bold text-blue-500">{score.player}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">무승부</p>
            <p className="text-2xl font-bold text-gray-500">{score.draws}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">AI</p>
            <p className="text-2xl font-bold text-red-500">{score.ai}</p>
          </div>
        </div>

        {streak > 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">연승</p>
            <p className="text-2xl font-bold text-orange-500">🔥 {streak}</p>
          </div>
        )}

        <div className="flex gap-2">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
            <button
              key={level}
              onClick={() => {
                setDifficulty(level)
                resetGame()
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                difficulty === level
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20'
              }`}
            >
              {level === 'easy' ? '쉬움' : level === 'medium' ? '보통' : '어려움'}
            </button>
          ))}
        </div>
      </div>

      {/* Game Board */}
      <div className="relative max-w-sm mx-auto">
        {/* Difficulty Indicator */}
        <div className={`text-center mb-4 ${getDifficultyColor()}`}>
          <span className="text-3xl mr-2">{getDifficultyEmoji()}</span>
          <span className="text-lg font-semibold">
            {difficulty === 'easy' ? '쉬운 AI' : difficulty === 'medium' ? '보통 AI' : '어려운 AI'}
          </span>
        </div>

        {/* Board Grid */}
        <div className="grid grid-cols-3 gap-2 bg-gray-400 dark:bg-gray-600 p-2 rounded-lg">
          {board.map((cell, index) => (
            <motion.button
              key={index}
              whileHover={!cell && !winner && !isDraw && currentPlayer === 'X' ? { scale: 1.05 } : {}}
              whileTap={!cell && !winner && !isDraw && currentPlayer === 'X' ? { scale: 0.95 } : {}}
              onClick={() => handleCellClick(index)}
              disabled={!!cell || !!winner || isDraw || currentPlayer !== 'X'}
              className={`
                aspect-square rounded-lg flex items-center justify-center text-5xl font-bold
                transition-all duration-200
                ${winningLine.includes(index)
                  ? 'bg-green-400 dark:bg-green-600'
                  : 'bg-white dark:bg-gray-800'
                }
                ${!cell && !winner && !isDraw && currentPlayer === 'X'
                  ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                  : 'cursor-not-allowed'
                }
              `}
            >
              <AnimatePresence mode="wait">
                {cell && (
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    className={cell === 'X' ? 'text-blue-500' : 'text-red-500'}
                  >
                    {cell}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {/* Game Status */}
        <AnimatePresence mode="wait">
          {!gameStarted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg"
            >
              <div className="text-center text-white p-8">
                <h3 className="text-3xl font-bold mb-4">틱택토</h3>
                <p className="mb-4">AI와 대결하세요!</p>
                <button
                  onClick={() => {
                    resetGame()
                    setGameStarted(true)
                  }}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                >
                  게임 시작
                </button>
              </div>
            </motion.div>
          )}

          {(winner || isDraw) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-lg"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center text-white p-8"
              >
                <div className="text-6xl mb-4">
                  {winner === 'X' ? '🎉' : winner === 'O' ? '😢' : '🤝'}
                </div>
                <h3 className="text-3xl font-bold mb-2">
                  {winner === 'X' ? '승리!' : winner === 'O' ? '패배!' : '무승부!'}
                </h3>
                {winner === 'X' && streak > 1 && (
                  <p className="text-lg mb-2">🔥 {streak}연승 중!</p>
                )}
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors mt-4"
                >
                  다시 플레이
                </button>
              </motion.div>
            </motion.div>
          )}

          {isThinking && currentPlayer === 'O' && !winner && !isDraw && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-white font-semibold animate-pulse">AI가 생각중...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-center">
          💡 당신은 X, AI는 O입니다. 3개를 연속으로 놓아 승리하세요! 난이도를 선택하여 도전해보세요.
        </p>
      </div>
    </div>
  )
}

export default TicTacToe