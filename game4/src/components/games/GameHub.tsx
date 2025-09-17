import { FC, useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, GameType } from '../../store/gameStore'

// Lazy load game components
const RockPaperScissors = lazy(() => import('./RockPaperScissors'))
const NumberBaseball = lazy(() => import('./NumberBaseball'))
const MemoryCard = lazy(() => import('./MemoryCard'))
const ReactionTest = lazy(() => import('./ReactionTest'))
const Game2048 = lazy(() => import('./Game2048'))
const TicTacToe = lazy(() => import('./TicTacToe'))

interface GameInfo {
  id: GameType
  title: string
  titleKr: string
  emoji: string
  description: string
  difficulty: '쉬움' | '보통' | '어려움'
  playerCount: '1인' | '2인' | '1-2인'
  estimatedTime: string
  color: string
}

const GAMES: GameInfo[] = [
  {
    id: 'rock-paper-scissors',
    title: 'Rock Paper Scissors',
    titleKr: '가위바위보',
    emoji: '✂️',
    description: '컴퓨터와 대결하는 가위바위보 게임',
    difficulty: '쉬움',
    playerCount: '1인',
    estimatedTime: '1-2분',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'number-baseball',
    title: 'Number Baseball',
    titleKr: '숫자 야구',
    emoji: '⚾',
    description: '숫자를 추리하는 논리 게임',
    difficulty: '보통',
    playerCount: '1인',
    estimatedTime: '5-10분',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'memory-card',
    title: 'Memory Card',
    titleKr: '카드 매칭',
    emoji: '🃏',
    description: '날씨 테마 카드 짝 맞추기',
    difficulty: '쉬움',
    playerCount: '1인',
    estimatedTime: '3-5분',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'reaction-test',
    title: 'Reaction Test',
    titleKr: '반응속도 테스트',
    emoji: '⚡',
    description: '당신의 반응속도를 측정하세요',
    difficulty: '쉬움',
    playerCount: '1인',
    estimatedTime: '1분',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: '2048',
    title: '2048',
    titleKr: '2048 퍼즐',
    emoji: '🔢',
    description: '같은 숫자를 합쳐 2048을 만드세요',
    difficulty: '보통',
    playerCount: '1인',
    estimatedTime: '10-20분',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'tic-tac-toe',
    title: 'Tic Tac Toe',
    titleKr: '틱택토',
    emoji: '⭕',
    description: '3목 전략 게임',
    difficulty: '쉬움',
    playerCount: '2인',
    estimatedTime: '2-3분',
    color: 'from-red-500 to-pink-500'
  }
]

const GameHub: FC = () => {
  const { currentGame, setCurrentGame, highScores, totalGamesPlayed, soundEnabled, toggleSound } = useGameStore()
  const [selectedGameInfo, setSelectedGameInfo] = useState<GameInfo | null>(null)

  const handleGameSelect = (game: GameInfo) => {
    setSelectedGameInfo(game)
    setCurrentGame(game.id)
  }

  const handleBackToHub = () => {
    setCurrentGame(null)
    setSelectedGameInfo(null)
  }

  const renderGame = () => {
    if (!currentGame) return null

    const gameComponents = {
      'rock-paper-scissors': <RockPaperScissors />,
      'number-baseball': <NumberBaseball />,
      'memory-card': <MemoryCard />,
      'reaction-test': <ReactionTest />,
      '2048': <Game2048 />,
      'tic-tac-toe': <TicTacToe />
    }

    return gameComponents[currentGame]
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300"
    >
      <AnimatePresence mode="wait">
        {!currentGame ? (
          <motion.div
            key="hub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="text-4xl">🎮</div>
                <div>
                  <h3 className="text-2xl font-bold">미니게임 천국</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    총 {totalGamesPlayed}회 플레이 • 6개 게임
                  </p>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                title={soundEnabled ? '소리 끄기' : '소리 켜기'}
              >
                {soundEnabled ? '🔊' : '🔇'}
              </button>
            </div>

            {/* Game Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {GAMES.map((game) => (
                <motion.div
                  key={game.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${game.color} p-4 cursor-pointer shadow-lg`}
                  onClick={() => handleGameSelect(game)}
                >
                  {/* High Score Badge */}
                  {highScores[game.id] > 0 && (
                    <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white">
                      🏆 {game.id === 'reaction-test'
                        ? `${highScores[game.id]}ms`
                        : highScores[game.id].toLocaleString()}
                    </div>
                  )}

                  <div className="text-white">
                    <div className="text-5xl mb-3">{game.emoji}</div>
                    <h4 className="text-lg font-bold mb-1">{game.titleKr}</h4>
                    <p className="text-sm opacity-90 mb-3">{game.description}</p>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="bg-white/20 px-2 py-1 rounded-full">
                        {game.difficulty}
                      </span>
                      <span className="bg-white/20 px-2 py-1 rounded-full">
                        {game.playerCount}
                      </span>
                      <span className="bg-white/20 px-2 py-1 rounded-full">
                        {game.estimatedTime}
                      </span>
                    </div>
                  </div>

                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 p-4 bg-white/10 dark:bg-white/5 rounded-lg">
              <h4 className="text-sm font-semibold mb-3">🏆 최고 기록</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                {GAMES.filter(g => highScores[g.id] > 0).map(game => (
                  <div key={game.id} className="flex items-center gap-2">
                    <span>{game.emoji}</span>
                    <span className="text-gray-600 dark:text-gray-400">{game.titleKr}:</span>
                    <span className="font-semibold">
                      {game.id === 'reaction-test'
                        ? `${highScores[game.id]}ms`
                        : highScores[game.id].toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Game Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleBackToHub}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
              >
                <span>←</span>
                <span>게임 목록</span>
              </button>

              {selectedGameInfo && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedGameInfo.emoji}</span>
                  <h3 className="text-xl font-bold">{selectedGameInfo.titleKr}</h3>
                </div>
              )}

              <button
                onClick={toggleSound}
                className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                title={soundEnabled ? '소리 끄기' : '소리 켜기'}
              >
                {soundEnabled ? '🔊' : '🔇'}
              </button>
            </div>

            {/* Game Component */}
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="text-4xl mb-3">⏳</div>
                    <p className="text-gray-600 dark:text-gray-400">게임을 불러오는 중...</p>
                  </div>
                </div>
              }
            >
              {renderGame()}
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default GameHub