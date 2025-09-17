import { FC, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore'

interface Card {
  id: number
  emoji: string
  name: string
  isFlipped: boolean
  isMatched: boolean
}

const weatherEmojis = [
  { emoji: '☀️', name: '태양' },
  { emoji: '🌧️', name: '비' },
  { emoji: '⛈️', name: '폭풍' },
  { emoji: '🌈', name: '무지개' },
  { emoji: '❄️', name: '눈' },
  { emoji: '🌪️', name: '토네이도' },
  { emoji: '🌊', name: '파도' },
  { emoji: '⚡', name: '번개' }
]

const MemoryCard: FC = () => {
  const { addRecentScore, incrementTotalGames, soundEnabled } = useGameStore()

  const [cards, setCards] = useState<Card[]>([])
  const [selectedCards, setSelectedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [isGameComplete, setIsGameComplete] = useState(false)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [score, setScore] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [combo, setCombo] = useState(0)

  useEffect(() => {
    initializeGame()
  }, [])

  useEffect(() => {
    if (!isGameComplete) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [startTime, isGameComplete])

  useEffect(() => {
    if (selectedCards.length === 2) {
      checkForMatch()
    }
  }, [selectedCards])

  const playSound = (_type: 'flip' | 'match' | 'wrong' | 'win') => {
    if (!soundEnabled) return
    // Sound implementation would go here
  }

  const initializeGame = () => {
    // Create pairs of cards
    const gameCards: Card[] = []
    weatherEmojis.forEach((weather, index) => {
      gameCards.push({
        id: index * 2,
        emoji: weather.emoji,
        name: weather.name,
        isFlipped: false,
        isMatched: false
      })
      gameCards.push({
        id: index * 2 + 1,
        emoji: weather.emoji,
        name: weather.name,
        isFlipped: false,
        isMatched: false
      })
    })

    // Shuffle cards
    const shuffled = gameCards.sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setSelectedCards([])
    setMoves(0)
    setMatchedPairs(0)
    setIsGameComplete(false)
    setStartTime(Date.now())
    setElapsedTime(0)
    setScore(0)
    setCombo(0)
  }

  const handleCardClick = (cardId: number) => {
    if (isChecking) return

    const card = cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return
    if (selectedCards.length >= 2) return

    playSound('flip')

    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    )
    setCards(newCards)
    setSelectedCards([...selectedCards, cardId])
  }

  const checkForMatch = () => {
    if (selectedCards.length !== 2) return

    setIsChecking(true)
    const [first, second] = selectedCards
    const firstCard = cards.find(c => c.id === first)
    const secondCard = cards.find(c => c.id === second)

    if (!firstCard || !secondCard) return

    setMoves(moves + 1)

    setTimeout(() => {
      if (firstCard.emoji === secondCard.emoji) {
        // Match found!
        playSound('match')
        const newCards = cards.map(c =>
          c.id === first || c.id === second
            ? { ...c, isMatched: true }
            : c
        )
        setCards(newCards)
        setMatchedPairs(matchedPairs + 1)
        setCombo(combo + 1)

        // Calculate score with combo bonus
        const baseScore = 100
        const comboBonus = combo * 20
        const timeBonus = Math.max(0, 200 - elapsedTime)
        const moveBonus = Math.max(0, 100 - moves * 2)
        const roundScore = baseScore + comboBonus + timeBonus + moveBonus
        setScore(score + roundScore)

        // Check if game is complete
        if (matchedPairs + 1 === weatherEmojis.length) {
          completeGame()
        }
      } else {
        // No match
        playSound('wrong')
        setCombo(0)
        const newCards = cards.map(c =>
          c.id === first || c.id === second
            ? { ...c, isFlipped: false }
            : c
        )
        setCards(newCards)
      }

      setSelectedCards([])
      setIsChecking(false)
    }, 1000)
  }

  const completeGame = () => {
    setIsGameComplete(true)
    playSound('win')
    incrementTotalGames()

    // Calculate final score
    const finalScore = score + (1000 - elapsedTime * 10) + (500 - moves * 20)
    setScore(Math.max(0, finalScore))

    addRecentScore({
      gameType: 'memory-card',
      score: Math.max(0, finalScore),
      date: new Date().toISOString(),
      playerName: '플레이어'
    })
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyEmoji = () => {
    if (moves <= 20) return '🏆'
    if (moves <= 30) return '🥈'
    if (moves <= 40) return '🥉'
    return '😊'
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex justify-between items-center p-4 bg-white/10 dark:bg-white/5 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">이동</p>
          <p className="text-2xl font-bold">{moves}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">매치</p>
          <p className="text-2xl font-bold">{matchedPairs}/{weatherEmojis.length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">시간</p>
          <p className="text-2xl font-bold">{formatTime(elapsedTime)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">점수</p>
          <p className="text-2xl font-bold">{score}</p>
        </div>
        {combo > 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">콤보</p>
            <p className="text-2xl font-bold text-orange-500">x{combo}</p>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto">
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              layout
              initial={{ rotateY: 0 }}
              animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleCardClick(card.id)}
              className={`
                relative aspect-square cursor-pointer
                ${card.isMatched ? 'pointer-events-none' : ''}
              `}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Card Back */}
              <motion.div
                className={`
                  absolute inset-0 rounded-lg
                  ${card.isFlipped || card.isMatched
                    ? 'invisible'
                    : 'visible bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                  }
                  flex items-center justify-center text-white text-4xl font-bold
                  shadow-lg transition-all
                `}
                style={{ backfaceVisibility: 'hidden' }}
              >
                ?
              </motion.div>

              {/* Card Front */}
              <motion.div
                className={`
                  absolute inset-0 rounded-lg
                  ${card.isFlipped || card.isMatched
                    ? 'visible'
                    : 'invisible'
                  }
                  ${card.isMatched
                    ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                    : 'bg-gradient-to-br from-yellow-400 to-orange-500'
                  }
                  flex items-center justify-center text-5xl
                  shadow-lg
                `}
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {card.emoji}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Game Complete Modal */}
      <AnimatePresence>
        {isGameComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
            onClick={initializeGame}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className="text-6xl mb-2">{getDifficultyEmoji()}</div>
                <h3 className="text-3xl font-bold text-green-500">완료!</h3>

                <div className="space-y-2">
                  <p className="text-lg">
                    <strong>시간:</strong> {formatTime(elapsedTime)}
                  </p>
                  <p className="text-lg">
                    <strong>이동 수:</strong> {moves}
                  </p>
                  <p className="text-2xl font-bold text-blue-500">
                    최종 점수: {score}
                  </p>
                </div>

                <button
                  onClick={initializeGame}
                  className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                >
                  다시 플레이
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {!isGameComplete && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-center">
            💡 같은 날씨 카드 두 개를 찾아 짝을 맞추세요! 콤보를 이어가면 보너스 점수를 얻습니다.
          </p>
        </div>
      )}
    </div>
  )
}

export default MemoryCard