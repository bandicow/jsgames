import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWeatherStore } from '../../store/weatherStore'
import { useMusicStore } from '../../store/musicStore'
import toast from 'react-hot-toast'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  category: string
  difficulty: string
}

interface QuizTopic {
  id: string
  name: string
  icon: string
  recommended?: boolean
}

interface QuizResult {
  questionId: string
  userAnswer: number
  correctAnswer: number
  isCorrect: boolean
  explanation: string
  correctOption: string
}

const AIQuizCard: React.FC = () => {
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [results, setResults] = useState<QuizResult[]>([])
  const [showResult, setShowResult] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('medium')
  const [topics, setTopics] = useState<QuizTopic[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [quizCount, setQuizCount] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)

  const { weather } = useWeatherStore()
  const { currentSong } = useMusicStore()

  // 현재 날씨 context 가져오기
  const getWeatherContext = () => {
    if (!weather) return null
    const weatherMain = weather.condition?.toLowerCase() || 'sunny'
    const temp = weather.temperature || 20

    if (weatherMain.includes('rain')) return 'rain_lofi'
    if (weatherMain.includes('snow')) return 'snow_cozy'
    if (weatherMain.includes('cloud')) return 'cloudy_chill'
    if (weatherMain.includes('storm') || weatherMain.includes('thunder')) return 'storm_energetic'
    if (weatherMain.includes('mist') || weatherMain.includes('fog')) return 'mist_ambient'
    if (temp > 30) return 'heat_tropical'
    if (temp < 5) return 'cold_warmup'
    return 'sunny_upbeat'
  }

  // 주제 목록 가져오기
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const weatherContext = getWeatherContext()
        const response = await fetch(
          `/api/quiz-ai/topics${weatherContext ? `?weather=${weatherContext}` : ''}`
        )
        const data = await response.json()
        if (data.success) {
          setTopics(data.data.topics)
          // 처음 로드 시에만 추천 주제를 기본으로 선택
          if (selectedTopic === null) {
            const recommended = data.data.topics.find((t: QuizTopic) => t.recommended)
            if (recommended) {
              setSelectedTopic(recommended.id)
            } else if (data.data.topics.length > 0) {
              setSelectedTopic(data.data.topics[0].id)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch topics:', error)
      }
    }
    fetchTopics()
  }, [weather])

  // AI로 퀴즈 생성
  const generateQuiz = async () => {
    setIsGenerating(true)
    setIsLoading(true)
    setShowSettings(false)

    // 디버깅: 선택된 주제 확인
    const selectedTopicData = topics.find(t => t.id === selectedTopic)
    const topicToSend = selectedTopicData?.name || selectedTopic || '일반상식'
    console.log('Selected topic ID:', selectedTopic)
    console.log('Selected topic data:', selectedTopicData)
    console.log('Topic being sent to API:', topicToSend)

    try {
      const response = await fetch('/api/quiz-ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topicToSend,
          difficulty: selectedDifficulty,
          count: quizCount,
          weather: getWeatherContext(),
          language: 'korean'
        })
      })

      const data = await response.json()

      if (!data.success) {
        // API 키가 설정되지 않은 경우 안내
        if (data.setup) {
          toast.error(
            <div className="space-y-2">
              <p className="font-semibold">Gemini API 키 설정이 필요합니다!</p>
              <ol className="text-sm space-y-1">
                {data.setup.steps.map((step: string, index: number) => (
                  <li key={index} className="text-xs">{step}</li>
                ))}
              </ol>
            </div>,
            { duration: 10000 }
          )
        } else {
          toast.error(data.error || '퀴즈 생성에 실패했습니다')
        }
        setIsGenerating(false)
        setIsLoading(false)
        return
      }

      setQuestions(data.data.questions)
      setCurrentQuestionIndex(0)
      setSelectedAnswer(null) // 선택된 답변 초기화
      setShowResult(false) // 결과 표시 초기화
      setResults([])
      setIsQuizActive(true)
      toast.success(`${data.data.questions.length}개의 퀴즈가 생성되었습니다!`)
    } catch (error) {
      console.error('Quiz generation error:', error)
      toast.error('퀴즈 생성 중 오류가 발생했습니다')
    } finally {
      setIsGenerating(false)
      setIsLoading(false)
    }
  }

  // 답변 확인
  const checkAnswer = async () => {
    if (selectedAnswer === null) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/quiz-ai/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: questions[currentQuestionIndex].id,
          answer: selectedAnswer
        })
      })

      const data = await response.json()
      if (data.success) {
        const result = data.data
        setResults([...results, result])
        setShowResult(true)

        // 피드백 메시지
        if (result.isCorrect) {
          toast.success('정답입니다! 🎉')
        } else {
          toast.error(`틀렸습니다. 정답은 "${result.correctOption}"입니다.`)
        }
      }
    } catch (error) {
      console.error('Answer check error:', error)
      toast.error('답변 확인 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  // 다음 문제로
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      // 퀴즈 종료
      showFinalResults()
    }
  }

  // 최종 결과 표시
  const showFinalResults = () => {
    const correctCount = results.filter(r => r.isCorrect).length
    const totalCount = results.length
    const percentage = Math.round((correctCount / totalCount) * 100)

    toast.success(
      <div className="space-y-2">
        <p className="font-semibold">퀴즈 완료!</p>
        <p className="text-sm">정답률: {percentage}% ({correctCount}/{totalCount})</p>
        {percentage >= 80 && <p className="text-xs">🏆 훌륭합니다!</p>}
        {percentage >= 60 && percentage < 80 && <p className="text-xs">👍 잘했어요!</p>}
        {percentage < 60 && <p className="text-xs">💪 다시 도전해보세요!</p>}
      </div>,
      { duration: 5000 }
    )

    setIsQuizActive(false)
    setQuestions([])
    setResults([])
    setShowResult(false)
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentResult = showResult ? results[results.length - 1] : null

  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-orange-500',
    expert: 'bg-red-500'
  }

  const difficultyNames = {
    easy: '쉬움',
    medium: '보통',
    hard: '어려움',
    expert: '전문가'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          🤖 AI 퀴즈 (Gemini)
        </h3>
        {weather && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            날씨: {weather.description || weather.condition}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isQuizActive ? (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {!showSettings ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  AI가 현재 날씨와 시간에 맞는 퀴즈를 생성합니다!
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                  >
                    퀴즈 설정하기
                  </button>
                  <button
                    onClick={generateQuiz}
                    disabled={isGenerating}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isGenerating ? '생성 중...' : '빠른 시작'}
                  </button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">퀴즈 설정</h4>

                {/* 주제 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    주제 선택
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {topics.map(topic => (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopic(topic.id)}
                        className={`p-2 rounded-lg text-xs font-medium transition-all ${
                          selectedTopic === topic.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                        } ${topic.recommended ? 'ring-2 ring-yellow-400' : ''}`}
                      >
                        <span className="block text-lg mb-1">{topic.icon}</span>
                        <span>{topic.name}</span>
                        {topic.recommended && (
                          <span className="block text-[10px] mt-1">추천</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 난이도 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    난이도
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(difficultyNames).map(([key, name]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedDifficulty(key)}
                        className={`p-2 rounded-lg text-sm font-medium transition-all ${
                          selectedDifficulty === key
                            ? `${difficultyColors[key as keyof typeof difficultyColors]} text-white`
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 문제 수 선택 */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    문제 수: {quizCount}개
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={quizCount}
                    onChange={(e) => setQuizCount(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={generateQuiz}
                    disabled={isGenerating}
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isGenerating ? '생성 중...' : '퀴즈 생성'}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* 진행 상황 */}
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>
                문제 {currentQuestionIndex + 1} / {questions.length}
              </span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                  difficultyColors[currentQuestion?.difficulty as keyof typeof difficultyColors] || 'bg-gray-500'
                }`}>
                  {difficultyNames[currentQuestion?.difficulty as keyof typeof difficultyNames] || '보통'}
                </span>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                  {currentQuestion?.category}
                </span>
              </div>
            </div>

            {/* 진행 바 */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* 질문 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
                {currentQuestion?.question}
              </p>
            </div>

            {/* 선택지 */}
            <div className="space-y-2">
              {currentQuestion?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showResult && setSelectedAnswer(index)}
                  disabled={showResult || isLoading}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    showResult
                      ? currentResult?.correctAnswer === index
                        ? 'bg-green-100 border-2 border-green-500 text-green-800'
                        : selectedAnswer === index && !currentResult?.isCorrect
                        ? 'bg-red-100 border-2 border-red-500 text-red-800'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      : selectedAnswer === index
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 text-blue-800 dark:text-blue-200'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200'
                  } ${(showResult || isLoading) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {String.fromCharCode(65 + index)}. {option}
                    </span>
                    {showResult && currentResult?.correctAnswer === index && (
                      <span className="text-green-600">✓</span>
                    )}
                    {showResult && selectedAnswer === index && !currentResult?.isCorrect && (
                      <span className="text-red-600">✗</span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* 설명 */}
            {showResult && currentResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl ${
                  currentResult.isCorrect ? 'bg-green-50' : 'bg-yellow-50'
                }`}
              >
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  💡 {currentResult.explanation}
                </p>
              </motion.div>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsQuizActive(false)
                  setQuestions([])
                  setResults([])
                  setShowResult(false)
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                종료
              </button>
              {!showResult ? (
                <button
                  onClick={checkAnswer}
                  disabled={selectedAnswer === null || isLoading}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? '확인 중...' : '정답 확인'}
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  {currentQuestionIndex < questions.length - 1 ? '다음 문제' : '결과 보기'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 로딩 오버레이 */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center"
        >
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-600 dark:text-gray-400">AI가 퀴즈를 생성하고 있습니다...</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default AIQuizCard