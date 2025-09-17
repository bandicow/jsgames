import { FC, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface HoroscopeData {
  sign: string
  sign_info: {
    name_kr: string
    name_en: string
    dates: string
    element: string
    symbol: string
  }
  day: string
  current_date: string
  date_range: string
  description: string
  description_kr: string
  compatibility: string
  mood: string
  color: string
  lucky_number: number
  lucky_time: string
  generated_at: string
  source: 'aztro_api' | 'fallback'
}

interface HoroscopeCardProps {
  className?: string
}

const ZODIAC_SIGNS = [
  { sign: 'aries', name_kr: '양자리', symbol: '♈', element: 'fire' },
  { sign: 'taurus', name_kr: '황소자리', symbol: '♉', element: 'earth' },
  { sign: 'gemini', name_kr: '쌍둥이자리', symbol: '♊', element: 'air' },
  { sign: 'cancer', name_kr: '게자리', symbol: '♋', element: 'water' },
  { sign: 'leo', name_kr: '사자자리', symbol: '♌', element: 'fire' },
  { sign: 'virgo', name_kr: '처녀자리', symbol: '♍', element: 'earth' },
  { sign: 'libra', name_kr: '천칭자리', symbol: '♎', element: 'air' },
  { sign: 'scorpio', name_kr: '전갈자리', symbol: '♏', element: 'water' },
  { sign: 'sagittarius', name_kr: '궁수자리', symbol: '♐', element: 'fire' },
  { sign: 'capricorn', name_kr: '염소자리', symbol: '♑', element: 'earth' },
  { sign: 'aquarius', name_kr: '물병자리', symbol: '♒', element: 'air' },
  { sign: 'pisces', name_kr: '물고기자리', symbol: '♓', element: 'water' }
]

const HoroscopeCard: FC<HoroscopeCardProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'horoscope' | 'tarot'>('horoscope')
  const [selectedSign, setSelectedSign] = useState<string>('leo')
  const [horoscopeData, setHoroscopeData] = useState<HoroscopeData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [selectedDay, setSelectedDay] = useState<'today' | 'tomorrow' | 'yesterday'>('today')

  // 타로카드 관련 상태
  const [tarotCards, setTarotCards] = useState<any[]>([])
  const [isLoadingTarot, setIsLoadingTarot] = useState(false)
  const [selectedCardCount, setSelectedCardCount] = useState<1 | 3>(1)

  // API 호출 함수
  const fetchHoroscope = async (sign: string, day: string) => {
    setIsLoading(true)
    try {
      // 현재 호스트에 따라 API URL 동적 설정
      const apiBaseUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3005'
        : `http://${window.location.hostname}:3005`

      const response = await fetch(`${apiBaseUrl}/api/horoscope/daily`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sign, day }),
      })

      const result = await response.json()
      if (result.success) {
        setHoroscopeData(result.data)
        setIsFlipped(true)
      } else {
        console.error('운세 조회 실패:', result.error)
      }
    } catch (error) {
      console.error('운세 조회 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 타로카드 API 호출 함수
  const fetchTarotCards = async (count: number) => {
    setIsLoadingTarot(true)
    try {
      // 현재 호스트에 따라 API URL 동적 설정
      const apiBaseUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3005'
        : `http://${window.location.hostname}:3005`

      const response = await fetch(`${apiBaseUrl}/api/horoscope/tarot/random?count=${count}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      if (result.success) {
        setTarotCards(result.data.cards)
        setIsFlipped(true)
      } else {
        console.error('타로카드 조회 실패:', result.error)
      }
    } catch (error) {
      console.error('타로카드 조회 오류:', error)
    } finally {
      setIsLoadingTarot(false)
    }
  }

  // 별자리 선택 시 자동으로 운세 조회
  useEffect(() => {
    if (selectedSign && activeTab === 'horoscope') {
      fetchHoroscope(selectedSign, selectedDay)
      setIsFlipped(false) // 새 별자리 선택시 카드 뒷면으로 리셋
    }
  }, [selectedSign, selectedDay, activeTab])

  // 탭 변경 시 초기화
  useEffect(() => {
    setIsFlipped(false)
    if (activeTab === 'tarot' && tarotCards.length === 0) {
      fetchTarotCards(selectedCardCount)
    }
  }, [activeTab])

  // 원소별 색상 매핑
  const getElementColor = (element: string) => {
    const colors = {
      fire: 'from-red-500 to-orange-500',
      earth: 'from-green-500 to-yellow-500',
      air: 'from-blue-500 to-cyan-500',
      water: 'from-blue-600 to-purple-500'
    }
    return colors[element as keyof typeof colors] || 'from-purple-500 to-pink-500'
  }

  // 별자리 원소 가져오기
  const getSignElement = (sign: string) => {
    const signData = ZODIAC_SIGNS.find(s => s.sign === sign)
    return signData?.element || 'air'
  }

  return (
    <div className={`horoscope-card-section ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 space-y-6"
      >
        {/* 타이틀 */}
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            ✨ 신비로운 점술 ✨
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            별들과 카드가 전하는 신비로운 메시지
          </p>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex justify-center space-x-1 bg-white/10 dark:bg-white/5 rounded-full p-1">
          <button
            onClick={() => setActiveTab('horoscope')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === 'horoscope'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/20'
            }`}
          >
            🌟 별자리 운세
          </button>
          <button
            onClick={() => setActiveTab('tarot')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeTab === 'tarot'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-white/20'
            }`}
          >
            🔮 타로카드
          </button>
        </div>

        {/* 운세 탭 컨텐츠 */}
        {activeTab === 'horoscope' && (
          <>
            {/* 날짜 선택 */}
            <div className="flex justify-center space-x-2">
              {(['yesterday', 'today', 'tomorrow'] as const).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedDay === day
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {day === 'yesterday' && '어제'}
                  {day === 'today' && '오늘'}
                  {day === 'tomorrow' && '내일'}
                </button>
              ))}
            </div>

            {/* 별자리 선택 그리드 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {ZODIAC_SIGNS.map((zodiac) => (
                <motion.button
                  key={zodiac.sign}
                  onClick={() => setSelectedSign(zodiac.sign)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    selectedSign === zodiac.sign
                      ? `bg-gradient-to-br ${getElementColor(zodiac.element)} text-white shadow-lg`
                      : 'bg-white/10 hover:bg-white/20 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">{zodiac.symbol}</div>
                  <div className="text-xs font-medium">{zodiac.name_kr}</div>
                </motion.button>
              ))}
            </div>
          </>
        )}

        {/* 타로카드 탭 컨텐츠 */}
        {activeTab === 'tarot' && (
          <>
            {/* 카드 수 선택 */}
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setSelectedCardCount(1)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCardCount === 1
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-white/20'
                }`}
              >
                🔮 원카드
              </button>
              <button
                onClick={() => setSelectedCardCount(3)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCardCount === 3
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-white/20'
                }`}
              >
                ✨ 쓰리카드
              </button>
            </div>

            {/* 타로카드 뽑기 버튼 */}
            <div className="text-center">
              <motion.button
                onClick={() => fetchTarotCards(selectedCardCount)}
                disabled={isLoadingTarot}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {isLoadingTarot ? '🔮 카드 뽑는 중...' : '🃏 타로카드 뽑기'}
              </motion.button>
            </div>
          </>
        )}

        {/* 카드 표시 영역 */}
        <div className="flex justify-center">
          <div className="relative perspective-1000">
            <AnimatePresence mode="wait">
              {!isFlipped || (activeTab === 'horoscope' && !horoscopeData) || (activeTab === 'tarot' && tarotCards.length === 0) ? (
                // 카드 뒷면 (신비로운 디자인)
                <motion.div
                  key="back"
                  initial={{ rotateY: 0 }}
                  exit={{ rotateY: 180 }}
                  className="w-80 h-96 relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl shadow-2xl">
                    {/* 신비로운 배경 패턴 */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="w-full h-full bg-gradient-to-br from-yellow-400/30 to-transparent rounded-2xl"></div>
                      <div className="absolute top-4 left-4 text-6xl text-yellow-300/50">✦</div>
                      <div className="absolute top-8 right-6 text-4xl text-blue-300/50">✧</div>
                      <div className="absolute bottom-8 left-8 text-5xl text-purple-300/50">✦</div>
                      <div className="absolute bottom-4 right-4 text-3xl text-pink-300/50">✧</div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl text-white/10">
                        {ZODIAC_SIGNS.find(z => z.sign === selectedSign)?.symbol}
                      </div>
                    </div>

                    {/* 카드 중앙 디자인 */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="text-6xl text-yellow-300 mb-4"
                      >
                        ✦
                      </motion.div>
                      <h3 className="text-2xl font-bold mb-2">
                        {activeTab === 'horoscope' ? '신비의 별자리' : '신비의 타로'}
                      </h3>
                      <p className="text-lg opacity-80">
                        {activeTab === 'horoscope'
                          ? ZODIAC_SIGNS.find(z => z.sign === selectedSign)?.name_kr
                          : `${selectedCardCount}장의 카드`
                        }
                      </p>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-4xl mt-4"
                      >
                        {activeTab === 'horoscope'
                          ? ZODIAC_SIGNS.find(z => z.sign === selectedSign)?.symbol
                          : '🔮'
                        }
                      </motion.div>

                      {(isLoading || isLoadingTarot) && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mt-4 text-2xl text-yellow-300"
                        >
                          ⟳
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                // 카드 앞면
                <motion.div
                  key="front"
                  initial={{ rotateY: 180 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-80 min-h-[500px] relative"
                >
                  {/* 운세 결과 */}
                  {activeTab === 'horoscope' && horoscopeData && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${getElementColor(getSignElement(selectedSign))} rounded-2xl shadow-2xl p-6 text-white`}>
                      <div className="h-full flex flex-col">
                        {/* 헤더 */}
                        <div className="text-center mb-4">
                          <div className="text-4xl mb-2">{horoscopeData.sign_info.symbol}</div>
                          <h3 className="text-xl font-bold">{horoscopeData.sign_info.name_kr}</h3>
                          <p className="text-sm opacity-80">{horoscopeData.date_range}</p>
                        </div>

                        {/* 운세 설명 */}
                        <div className="flex-1 space-y-3">
                          <div className="bg-white/20 rounded-lg p-3">
                            <p className="text-sm leading-relaxed">
                              {horoscopeData.description_kr}
                            </p>
                          </div>

                          {/* 상세 정보 */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-white/15 rounded-lg p-2">
                              <div className="opacity-80">기분</div>
                              <div className="font-semibold">{horoscopeData.mood}</div>
                            </div>
                            <div className="bg-white/15 rounded-lg p-2">
                              <div className="opacity-80">행운의 색</div>
                              <div className="font-semibold">{horoscopeData.color}</div>
                            </div>
                            <div className="bg-white/15 rounded-lg p-2">
                              <div className="opacity-80">행운의 숫자</div>
                              <div className="font-semibold">{horoscopeData.lucky_number}</div>
                            </div>
                            <div className="bg-white/15 rounded-lg p-2">
                              <div className="opacity-80">궁합</div>
                              <div className="font-semibold">{horoscopeData.compatibility}</div>
                            </div>
                          </div>

                          <div className="bg-white/15 rounded-lg p-2">
                            <div className="text-xs opacity-80">행운의 시간</div>
                            <div className="text-sm font-semibold">{horoscopeData.lucky_time}</div>
                          </div>
                        </div>

                        {/* 푸터 */}
                        <div className="text-center text-xs opacity-60 mt-2">
                          {horoscopeData.current_date} · {selectedDay === 'today' ? '오늘' : selectedDay === 'tomorrow' ? '내일' : '어제'}의 운세
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 타로카드 결과 */}
                  {activeTab === 'tarot' && tarotCards.length > 0 && (
                    <div className="space-y-4">
                      {tarotCards.map((card, index) => (
                        <motion.div
                          key={`${card.name_short}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 rounded-2xl shadow-2xl p-6 text-white"
                        >
                          <div className="text-center mb-4">
                            <h3 className="text-xl font-bold mb-2">{card.name}</h3>
                            <p className="text-sm opacity-80">{card.type === 'major' ? 'Major Arcana' : 'Minor Arcana'}</p>
                            {card.suit && <p className="text-xs opacity-60 capitalize">{card.suit}</p>}
                          </div>

                          <div className="space-y-3">
                            <div className="bg-white/20 rounded-lg p-3">
                              <h4 className="text-sm font-semibold mb-2">정방향 의미</h4>
                              <p className="text-xs leading-relaxed">{card.meaning_up_kr}</p>
                            </div>

                            <div className="bg-white/15 rounded-lg p-3">
                              <h4 className="text-sm font-semibold mb-2">역방향 의미</h4>
                              <p className="text-xs leading-relaxed">{card.meaning_rev_kr}</p>
                            </div>

                            <div className="bg-white/10 rounded-lg p-3">
                              <h4 className="text-sm font-semibold mb-2">해석</h4>
                              <p className="text-xs leading-relaxed">{card.desc_kr}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 카드를 다시 뒤집는 버튼 */}
            {isFlipped && ((activeTab === 'horoscope' && horoscopeData) || (activeTab === 'tarot' && tarotCards.length > 0)) && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => {
                  setIsFlipped(false)
                  if (activeTab === 'tarot') {
                    setTarotCards([])
                  }
                }}
                className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300"
              >
                {activeTab === 'horoscope' ? '다른 운세 보기 🔮' : '다른 카드 뽑기 🃏'}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default HoroscopeCard