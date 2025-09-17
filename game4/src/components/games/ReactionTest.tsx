import { FC, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

type GameState = 'waiting' | 'ready' | 'tooEarly' | 'result'

const ReactionTest: FC = () => {
  const { addRecentScore, incrementTotalGames, soundEnabled } = useGameStore()

  const [gameState, setGameState] = useState<GameState>('waiting')
  const [startTime, setStartTime] = useState<number>(0)
  const [reactionTime, setReactionTime] = useState<number>(0)
  const [attempts, setAttempts] = useState<number[]>([])
  const [currentRound, setCurrentRound] = useState(1)
  const [timeoutId, setTimeoutId] = useState<number | null>(null)

  const playSound = (_type: 'ready' | 'click' | 'early' | 'complete') => {
    if (!soundEnabled) return
    // Sound implementation would go here
  }

  const startTest = () => {
    setGameState('ready')
    setReactionTime(0)

    // Random delay between 2-5 seconds
    const delay = Math.random() * 3000 + 2000

    const id = window.setTimeout(() => {
      setGameState('waiting')
      setStartTime(Date.now())
      playSound('ready')
    }, delay)

    setTimeoutId(id)
  }

  const handleClick = () => {
    if (gameState === 'waiting' && startTime > 0) {
      // Correct click - measure reaction time
      const time = Date.now() - startTime
      setReactionTime(time)
      setGameState('result')
      setAttempts([...attempts, time])
      playSound('click')

      if (currentRound >= 5) {
        // Game complete after 5 attempts
        completeGame()
      }
    } else if (gameState === 'ready') {
      // Clicked too early
      if (timeoutId) {
        clearTimeout(timeoutId)
        setTimeoutId(null)
      }
      setGameState('tooEarly')
      playSound('early')
    }
  }

  const nextRound = () => {
    setCurrentRound(currentRound + 1)
    setGameState('waiting')
    setStartTime(0)
  }

  const completeGame = () => {
    const avgTime = Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)

    incrementTotalGames()
    playSound('complete')

    addRecentScore({
      gameType: 'reaction-test',
      score: avgTime,
      date: new Date().toISOString(),
      playerName: '플레이어'
    })
  }

  const resetGame = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setGameState('waiting')
    setStartTime(0)
    setReactionTime(0)
    setAttempts([])
    setCurrentRound(1)
  }

  const tryAgain = () => {
    setGameState('waiting')
    setStartTime(0)
  }

  const getAverageTime = () => {
    if (attempts.length === 0) return 0
    return Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)
  }

  const getReactionEmoji = (time: number) => {
    if (time < 200) return '⚡'
    if (time < 250) return '🚀'
    if (time < 300) return '🏃'
    if (time < 400) return '🚶'
    return '🐢'
  }

  const getReactionRating = (time: number) => {
    if (time < 200) return '번개같은 반응속도!'
    if (time < 250) return '매우 빠름!'
    if (time < 300) return '빠름!'
    if (time < 400) return '평균'
    return '조금 느림'
  }

  const getBackgroundColor = () => {
    switch (gameState) {
      case 'ready':
        return 'from-red-500 to-pink-500'
      case 'waiting':
        return startTime > 0 ? 'from-green-500 to-emerald-500' : 'from-blue-500 to-cyan-500'
      case 'tooEarly':
        return 'from-orange-500 to-amber-500'
      case 'result':
        return 'from-purple-500 to-indigo-500'
      default:
        return 'from-blue-500 to-cyan-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex justify-between items-center p-4 bg-white/10 dark:bg-white/5 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">라운드</p>
          <p className="text-2xl font-bold">{currentRound}/5</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">시도</p>
          <p className="text-2xl font-bold">{attempts.length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">평균</p>
          <p className="text-2xl font-bold">
            {getAverageTime() > 0 ? `${getAverageTime()}ms` : '-'}
          </p>
        </div>
      </div>

      {/* Main Game Area */}
      <motion.div
        className={`relative min-h-[400px] rounded-2xl bg-gradient-to-br ${getBackgroundColor()} p-8 cursor-pointer select-none transition-all duration-300`}
        onClick={handleClick}
        whileTap={{ scale: 0.98 }}
      >
        <div className="h-full flex flex-col items-center justify-center text-white">
          <AnimatePresence mode="wait">
            {gameState === 'waiting' && startTime === 0 && (
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-4"
              >
                <div className="text-6xl mb-4">⚡</div>
                <h3 className="text-3xl font-bold">반응속도 테스트</h3>
                <p className="text-xl">화면이 초록색으로 변하면 클릭하세요!</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    startTest()
                  }}
                  className="px-8 py-4 bg-white/20 hover:bg-white/30 rounded-xl text-xl font-semibold transition-colors"
                >
                  시작하기
                </button>
              </motion.div>
            )}

            {gameState === 'ready' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-4"
              >
                <div className="text-6xl mb-4">✋</div>
                <h3 className="text-3xl font-bold">기다리세요...</h3>
                <p className="text-xl">초록색이 될 때까지 기다려주세요</p>
              </motion.div>
            )}

            {gameState === 'waiting' && startTime > 0 && (
              <motion.div
                key="go"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-4"
              >
                <div className="text-8xl mb-4">👆</div>
                <h3 className="text-4xl font-bold">지금 클릭!</h3>
              </motion.div>
            )}

            {gameState === 'tooEarly' && (
              <motion.div
                key="early"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-4"
              >
                <div className="text-6xl mb-4">😅</div>
                <h3 className="text-3xl font-bold">너무 빨랐어요!</h3>
                <p className="text-xl">초록색이 될 때까지 기다려주세요</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    tryAgain()
                  }}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-lg font-semibold transition-colors"
                >
                  다시 시도
                </button>
              </motion.div>
            )}

            {gameState === 'result' && (
              <motion.div
                key="result"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-4"
              >
                <div className="text-8xl mb-4">{getReactionEmoji(reactionTime)}</div>
                <h3 className="text-5xl font-bold">{reactionTime}ms</h3>
                <p className="text-2xl">{getReactionRating(reactionTime)}</p>

                <div className="flex gap-4 justify-center mt-6">
                  {currentRound < 5 ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        nextRound()
                      }}
                      className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-lg font-semibold transition-colors"
                    >
                      다음 라운드 ({currentRound}/5)
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        resetGame()
                      }}
                      className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl text-lg font-semibold transition-colors"
                    >
                      새 게임
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Results History */}
      {attempts.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold">시도 기록</h4>
          <div className="flex gap-2 flex-wrap">
            {attempts.map((time, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="px-4 py-2 bg-white/10 dark:bg-white/5 rounded-lg flex items-center gap-2"
              >
                <span className="text-2xl">{getReactionEmoji(time)}</span>
                <span className="font-semibold">{time}ms</span>
              </motion.div>
            ))}
          </div>

          {attempts.length >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">게임 완료!</p>
                  <p className="text-2xl font-bold">평균: {getAverageTime()}ms</p>
                </div>
                <div className="text-4xl">{getReactionEmoji(getAverageTime())}</div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-sm text-center">
          💡 팁: 화면에 집중하고 손가락을 준비하세요. 평균 반응속도는 200-300ms입니다!
        </p>
      </div>
    </div>
  )
}

export default ReactionTest