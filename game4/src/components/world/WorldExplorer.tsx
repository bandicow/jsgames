import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

// 카테고리 타입 정의
type Category = 'all' | 'places' | 'animals' | 'sports' | 'history' | 'science' | 'art' | 'nature' | 'culture'

interface WorldContent {
  id: string
  category: Category
  title: string
  description: string
  imageUrl: string
  facts?: string[]
  location?: string
  source?: string
}

const WorldExplorer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')
  const [currentContent, setCurrentContent] = useState<WorldContent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set())

  // 카테고리 정보
  const categories = [
    { id: 'all', name: '전체', icon: '🌍' },
    { id: 'places', name: '장소', icon: '📍' },
    { id: 'animals', name: '동물', icon: '🦁' },
    { id: 'sports', name: '스포츠', icon: '⚽' },
    { id: 'history', name: '역사', icon: '🏛️' },
    { id: 'science', name: '과학', icon: '🔬' },
    { id: 'art', name: '예술', icon: '🎨' },
    { id: 'nature', name: '자연', icon: '🌿' },
    { id: 'culture', name: '문화', icon: '🎭' },
  ]

  // 랜덤 콘텐츠 가져오기
  const fetchRandomContent = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        excludeIds: Array.from(viewedIds).join(',')
      })

      const response = await fetch(`/api/world-explorer/random?${params}`)
      const data = await response.json()

      if (data.success) {
        setCurrentContent(data.data)
        if (data.data) {
          setViewedIds(prev => new Set([...prev, data.data.id]))
        }
      } else {
        toast.error('콘텐츠를 불러올 수 없습니다.')
      }
    } catch (error) {
      console.error('Failed to fetch content:', error)
      toast.error('콘텐츠 로딩 실패')
    } finally {
      setIsLoading(false)
    }
  }

  // 다음 콘텐츠로 이동
  const handleNext = () => {
    fetchRandomContent()
  }

  // 카테고리 변경 시
  useEffect(() => {
    if (isOpen) {
      fetchRandomContent()
    }
  }, [isOpen, selectedCategory])

  // 모달 열기/닫기
  const toggleModal = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setViewedIds(new Set()) // 모달 열 때 조회 기록 초기화
      fetchRandomContent()
    }
  }

  return (
    <>
      {/* 메인 카드 */}
      <div
        className="glass-card p-6 cursor-pointer hover:scale-[1.02] transition-transform"
        onClick={toggleModal}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">🌏</span>
            세상 둘러보기
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            클릭하여 탐험 시작
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          장소, 동물, 스포츠, 역사 등 다양한 주제의 흥미로운 이야기를 만나보세요
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.slice(1, 6).map(cat => (
            <span key={cat.id} className="px-3 py-1 bg-white/20 dark:bg-white/10 rounded-full text-xs">
              {cat.icon} {cat.name}
            </span>
          ))}
          <span className="px-3 py-1 bg-white/20 dark:bg-white/10 rounded-full text-xs">
            +3 더보기
          </span>
        </div>
      </div>

      {/* 모달 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsOpen(false)
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span>🌏</span>
                  세상 둘러보기
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>

              {/* 카테고리 필터 */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id as Category)
                        setViewedIds(new Set())
                      }}
                      className={`px-4 py-2 rounded-full transition ${
                        selectedCategory === cat.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <span className="mr-1">{cat.icon}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 콘텐츠 영역 */}
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                {isLoading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  </div>
                ) : currentContent ? (
                  <motion.div
                    key={currentContent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* 이미지 */}
                    <div className="mb-6 rounded-lg overflow-hidden">
                      <img
                        src={currentContent.imageUrl}
                        alt={currentContent.title}
                        className="w-full h-auto max-h-96 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Image+Not+Available'
                        }}
                      />
                    </div>

                    {/* 제목과 위치 */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold mb-2">{currentContent.title}</h3>
                      {currentContent.location && typeof currentContent.location === 'string' && !currentContent.location.startsWith('http') && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <span>📍</span>
                          {currentContent.location}
                        </p>
                      )}
                    </div>

                    {/* 설명 */}
                    <div className="mb-6">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentContent.description}
                      </p>
                    </div>

                    {/* 추가 사실들 */}
                    {currentContent.facts && currentContent.facts.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <span>💡</span>
                          알고 계셨나요?
                        </h4>
                        <ul className="space-y-2">
                          {currentContent.facts.map((fact, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">{fact}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 출처 및 링크 */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {currentContent.source && (
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          출처: {currentContent.source}
                        </div>
                      )}
                      {currentContent.location && typeof currentContent.location === 'string' && currentContent.location.startsWith('http') && (
                        <a
                          href={currentContent.location}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                        >
                          <span>위키백과에서 더 보기</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96">
                    <span className="text-6xl mb-4">🌍</span>
                    <p className="text-gray-600 dark:text-gray-400">
                      카테고리를 선택하여 탐험을 시작하세요
                    </p>
                  </div>
                )}
              </div>

              {/* 하단 버튼 */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {viewedIds.size > 0 && `${viewedIds.size}개 둘러봄`}
                  </div>
                  <button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>다음 콘텐츠</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default WorldExplorer