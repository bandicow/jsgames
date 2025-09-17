import { FC, useState, useEffect, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

interface Guess {
  number: string
  strikes: number
  balls: number
}

const NumberBaseball: FC = () => {
  const { addRecentScore, incrementTotalGames, soundEnabled } = useGameStore()

  const [targetNumber, setTargetNumber] = useState<string>('')
  const [currentGuess, setCurrentGuess] = useState('')
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [isGameOver, setIsGameOver] = useState(false)
  const [isWon, setIsWon] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [score, setScore] = useState(1000)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => {
    startNewGame()
  }, [])

  const playSound = (_type: 'click' | 'strike' | 'ball' | 'win' | 'wrong') => {
    if (!soundEnabled) return
    // Sound implementation would go here
  }

  const generateTargetNumber = (): string => {
    const digits: number[] = []
    while (digits.length < 4) {
      const digit = Math.floor(Math.random() * 10)
      if (!digits.includes(digit)) {
        digits.push(digit)
      }
    }
    return digits.join('')
  }

  const startNewGame = () => {
    setTargetNumber(generateTargetNumber())
    setCurrentGuess('')
    setGuesses([])
    setIsGameOver(false)
    setIsWon(false)
    setAttempts(0)
    setScore(1000)
    setShowHint(false)
  }

  const calculateResult = (guess: string): { strikes: number; balls: number } => {
    let strikes = 0
    let balls = 0

    for (let i = 0; i < 4; i++) {
      if (guess[i] === targetNumber[i]) {
        strikes++
      } else if (targetNumber.includes(guess[i])) {
        balls++
      }
    }

    return { strikes, balls }
  }

  const validateGuess = (guess: string): boolean => {
    if (guess.length !== 4) return false
    if (!/^\d+$/.test(guess)) return false

    // Check for duplicate digits
    const digits = new Set(guess.split(''))
    if (digits.size !== 4) return false

    // Check if already guessed
    if (guesses.some(g => g.number === guess)) return false

    return true
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!validateGuess(currentGuess)) {
      playSound('wrong')
      return
    }

    const result = calculateResult(currentGuess)
    const newGuess: Guess = {
      number: currentGuess,
      strikes: result.strikes,
      balls: result.balls
    }

    setGuesses([...guesses, newGuess])
    setAttempts(attempts + 1)
    setScore(Math.max(0, score - 50)) // Deduct 50 points per attempt

    if (result.strikes === 4) {
      // Win!
      playSound('win')
      setIsWon(true)
      setIsGameOver(true)
      incrementTotalGames()

      const finalScore = score - 50 // Current score after this attempt
      addRecentScore({
        gameType: 'number-baseball',
        score: finalScore,
        date: new Date().toISOString(),
        playerName: '플레이어'
      })
    } else if (result.strikes > 0) {
      playSound('strike')
    } else if (result.balls > 0) {
      playSound('ball')
    } else {
      playSound('wrong')
    }

    setCurrentGuess('')

    // Game over after 15 attempts
    if (attempts >= 14) {
      setIsGameOver(true)
      incrementTotalGames()
    }
  }

  const handleInputChange = (value: string) => {
    // Only allow up to 4 digits
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setCurrentGuess(value)
      playSound('click')
    }
  }

  const toggleHint = () => {
    setShowHint(!showHint)
    if (!showHint) {
      setScore(Math.max(0, score - 100)) // Deduct 100 points for hint
    }
  }

  const getResultColor = (guess: Guess) => {
    if (guess.strikes === 4) return 'text-green-500'
    if (guess.strikes > 0) return 'text-yellow-500'
    if (guess.balls > 0) return 'text-blue-500'
    return 'text-gray-500'
  }

  const getResultEmoji = (guess: Guess) => {
    if (guess.strikes === 4) return '🎯'
    if (guess.strikes > 0 && guess.balls > 0) return '😮'
    if (guess.strikes > 0) return '😊'
    if (guess.balls > 0) return '🤔'
    return '😅'
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex justify-between items-center p-4 bg-white/10 dark:bg-white/5 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">점수</p>
          <p className="text-2xl font-bold">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">시도</p>
          <p className="text-2xl font-bold">{attempts}/15</p>
        </div>
        <button
          onClick={toggleHint}
          disabled={showHint || score < 100}
          className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          <span className="text-yellow-600 dark:text-yellow-400">
            💡 힌트 (-100점)
          </span>
        </button>
      </div>

      {/* Hint Display */}
      {showHint && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
        >
          <p className="text-sm">
            💡 힌트: 첫 번째 숫자는 {parseInt(targetNumber[0]) > 5 ? '6 이상' : '5 이하'}입니다!
          </p>
        </motion.div>
      )}

      {/* Game Area */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Guess History */}
        <div className="space-y-2">
          <h4 className="font-semibold mb-3">추측 기록</h4>
          <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
            <AnimatePresence>
              {guesses.map((guess, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-white/10 dark:bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getResultEmoji(guess)}</span>
                    <span className="text-lg font-mono font-bold">{guess.number}</span>
                  </div>
                  <div className={`text-sm font-semibold ${getResultColor(guess)}`}>
                    {guess.strikes}S {guess.balls}B
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {guesses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>아직 추측이 없습니다</p>
                <p className="text-sm mt-2">4자리 숫자를 입력해보세요!</p>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <h4 className="font-semibold mb-3">숫자 입력</h4>

          {!isGameOver ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={currentGuess}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="4자리 숫자 입력"
                    className="w-full px-4 py-3 text-2xl font-mono text-center bg-white/20 dark:bg-white/10 border-2 border-transparent focus:border-blue-500 rounded-lg outline-none transition-all"
                    autoFocus
                    maxLength={4}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    {currentGuess.length}/4
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={currentGuess.length !== 4}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  추측하기
                </button>
              </form>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm">
                  <strong>규칙:</strong> 서로 다른 4자리 숫자를 맞춰보세요!
                </p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• <strong>스트라이크(S):</strong> 숫자와 위치가 모두 맞음</li>
                  <li>• <strong>볼(B):</strong> 숫자는 맞지만 위치가 다름</li>
                  <li>• <strong>아웃:</strong> 해당 숫자가 없음</li>
                </ul>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              {isWon ? (
                <>
                  <div className="text-6xl mb-2">🎉</div>
                  <h3 className="text-2xl font-bold text-green-500">정답!</h3>
                  <p className="text-lg">
                    {attempts}번 만에 맞췄습니다!
                  </p>
                  <p className="text-xl font-bold">최종 점수: {score}</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-2">😢</div>
                  <h3 className="text-2xl font-bold text-red-500">게임 오버!</h3>
                  <p className="text-lg">
                    정답은 <span className="font-mono font-bold">{targetNumber}</span> 였습니다
                  </p>
                </>
              )}

              <button
                onClick={startNewGame}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                새 게임 시작
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Number Pad (for mobile) */}
      {!isGameOver && (
        <div className="grid grid-cols-5 gap-2 md:hidden">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleInputChange(currentGuess + num)}
              disabled={currentGuess.length >= 4 || currentGuess.includes(num.toString())}
              className="p-4 bg-white/20 dark:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg font-bold text-xl"
            >
              {num}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

export default NumberBaseball