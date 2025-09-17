import { FC, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

type Choice = 'rock' | 'paper' | 'scissors' | null
type Result = 'win' | 'lose' | 'draw' | null

const choices = [
  { id: 'rock' as Choice, emoji: '✊', name: '바위', beats: 'scissors' },
  { id: 'paper' as Choice, emoji: '✋', name: '보', beats: 'rock' },
  { id: 'scissors' as Choice, emoji: '✌️', name: '가위', beats: 'paper' }
]

const RockPaperScissors: FC = () => {
  const { addRecentScore, incrementTotalGames, incrementStreak, resetStreak, soundEnabled } = useGameStore()

  const [playerChoice, setPlayerChoice] = useState<Choice>(null)
  const [computerChoice, setComputerChoice] = useState<Choice>(null)
  const [result, setResult] = useState<Result>(null)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [wins, setWins] = useState(0)
  const [losses, setLosses] = useState(0)
  const [draws, setDraws] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (countdown === null) return

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Make computer choice after countdown
      const computerOptions: Choice[] = ['rock', 'paper', 'scissors']
      const randomChoice = computerOptions[Math.floor(Math.random() * computerOptions.length)]
      setComputerChoice(randomChoice)
      determineResult(playerChoice, randomChoice)
    }
  }, [countdown, playerChoice])

  const playSound = (type: 'click' | 'win' | 'lose' | 'draw') => {
    if (!soundEnabled) return

    // Simple sound effect simulation
    const audio = new Audio()
    const sounds = {
      click: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAADw/w==',
      win: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAACA/4DA',
      lose: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAADA/w==',
      draw: 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAADg/w=='
    }

    audio.src = sounds[type]
    audio.play().catch(() => {})
  }

  const handleChoice = (choice: Choice) => {
    if (isPlaying) return

    playSound('click')
    setIsPlaying(true)
    setPlayerChoice(choice)
    setComputerChoice(null)
    setResult(null)
    setCountdown(3)
  }

  const determineResult = (player: Choice, computer: Choice) => {
    if (!player || !computer) return

    let gameResult: Result

    if (player === computer) {
      gameResult = 'draw'
      setDraws(draws + 1)
      playSound('draw')
    } else if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      gameResult = 'win'
      setWins(wins + 1)
      setScore(score + 100)
      incrementStreak()
      playSound('win')
    } else {
      gameResult = 'lose'
      setLosses(losses + 1)
      setScore(Math.max(0, score - 50))
      resetStreak()
      playSound('lose')
    }

    setResult(gameResult)
    setIsPlaying(false)
    incrementTotalGames()

    // Save score after 10 rounds
    if (round % 10 === 0) {
      addRecentScore({
        gameType: 'rock-paper-scissors',
        score,
        date: new Date().toISOString(),
        playerName: '플레이어'
      })
    }
  }

  const playAgain = () => {
    setPlayerChoice(null)
    setComputerChoice(null)
    setResult(null)
    setRound(round + 1)
    setCountdown(null)
  }

  const resetGame = () => {
    // Save final score before reset
    if (score > 0) {
      addRecentScore({
        gameType: 'rock-paper-scissors',
        score,
        date: new Date().toISOString(),
        playerName: '플레이어'
      })
    }

    setPlayerChoice(null)
    setComputerChoice(null)
    setResult(null)
    setScore(0)
    setRound(1)
    setWins(0)
    setLosses(0)
    setDraws(0)
    setIsPlaying(false)
    setCountdown(null)
    resetStreak()
  }

  const getResultEmoji = () => {
    switch (result) {
      case 'win': return '🎉'
      case 'lose': return '😢'
      case 'draw': return '🤝'
      default: return ''
    }
  }

  const getResultMessage = () => {
    switch (result) {
      case 'win': return '승리! +100점'
      case 'lose': return '패배! -50점'
      case 'draw': return '무승부!'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Score Board */}
      <div className="flex justify-between items-center p-4 bg-white/10 dark:bg-white/5 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">점수</p>
          <p className="text-2xl font-bold">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">라운드</p>
          <p className="text-2xl font-bold">{round}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">전적</p>
          <p className="text-lg font-semibold">
            <span className="text-green-500">{wins}승</span>{' '}
            <span className="text-gray-500">{draws}무</span>{' '}
            <span className="text-red-500">{losses}패</span>
          </p>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative min-h-[300px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {countdown !== null && countdown > 0 ? (
            <motion.div
              key="countdown"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-center"
            >
              <div className="text-8xl font-bold mb-4">{countdown}</div>
              <div className="text-2xl">준비!</div>
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full"
            >
              {/* Battle Display */}
              {playerChoice && (
                <div className="flex items-center justify-around mb-8">
                  {/* Player Choice */}
                  <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-center"
                  >
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">당신</p>
                    <div className="text-8xl mb-2">
                      {choices.find(c => c.id === playerChoice)?.emoji}
                    </div>
                    <p className="font-semibold">
                      {choices.find(c => c.id === playerChoice)?.name}
                    </p>
                  </motion.div>

                  {/* VS */}
                  <div className="text-4xl font-bold text-gray-500">VS</div>

                  {/* Computer Choice */}
                  {computerChoice ? (
                    <motion.div
                      initial={{ x: 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="text-center"
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">컴퓨터</p>
                      <div className="text-8xl mb-2">
                        {choices.find(c => c.id === computerChoice)?.emoji}
                      </div>
                      <p className="font-semibold">
                        {choices.find(c => c.id === computerChoice)?.name}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">컴퓨터</p>
                      <div className="text-8xl mb-2 animate-pulse">❓</div>
                      <p className="font-semibold">선택 중...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Result Display */}
              {result && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center mb-6"
                >
                  <div className="text-6xl mb-2">{getResultEmoji()}</div>
                  <div className={`text-2xl font-bold ${
                    result === 'win' ? 'text-green-500' :
                    result === 'lose' ? 'text-red-500' :
                    'text-gray-500'
                  }`}>
                    {getResultMessage()}
                  </div>
                </motion.div>
              )}

              {/* Choice Buttons */}
              {!playerChoice && (
                <div className="text-center">
                  <p className="text-lg mb-4">선택하세요!</p>
                  <div className="flex justify-center gap-4">
                    {choices.map((choice) => (
                      <motion.button
                        key={choice.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleChoice(choice.id)}
                        disabled={isPlaying}
                        className="p-6 bg-white/20 dark:bg-white/10 rounded-xl hover:bg-white/30 dark:hover:bg-white/20 transition-all disabled:opacity-50"
                      >
                        <div className="text-6xl mb-2">{choice.emoji}</div>
                        <p className="font-semibold">{choice.name}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {result && (
                <div className="flex justify-center gap-4">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={playAgain}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    다음 라운드
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={resetGame}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    새 게임
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-sm text-center">
          💡 가위는 보를 이기고, 보는 바위를 이기고, 바위는 가위를 이깁니다!
        </p>
      </div>
    </div>
  )
}

export default RockPaperScissors