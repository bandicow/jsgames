import { FC, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ActivityData {
  id: string
  title: string
  description: string
  date: string
  location: string
  category: 'festival' | 'sports'
  image?: string
  link?: string
}

interface ActivityCardProps {
  className?: string
}

const ActivityCard: FC<ActivityCardProps> = ({ className = '' }) => {
  const [activities, setActivities] = useState<ActivityData[]>([])
  const [currentActivity, setCurrentActivity] = useState<ActivityData | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'festival' | 'sports'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const categories = [
    { id: 'all', label: '전체', icon: '🎯' },
    { id: 'festival', label: '축제', icon: '🎪' },
    { id: 'sports', label: '스포츠', icon: '⚽' }
  ]

  // 액티비티 데이터 로드
  const loadActivities = async (category: string = 'all') => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/activity/search?category=${category}&limit=10`)
      const data = await response.json()

      if (data.success) {
        setActivities(data.data.activities)
        // 첫 번째 액티비티를 현재 선택으로 설정
        if (data.data.activities.length > 0) {
          setCurrentActivity(data.data.activities[0])
        }
      } else {
        throw new Error(data.error || '액티비티 정보를 가져올 수 없습니다.')
      }
    } catch (error) {
      console.error('Failed to load activities:', error)
      setError(error instanceof Error ? error.message : '액티비티 로드에 실패했습니다.')
      setActivities([])
      setCurrentActivity(null)
    } finally {
      setIsLoading(false)
    }
  }

  // 랜덤 액티비티 선택
  const getRandomActivity = () => {
    if (activities.length === 0) return

    const randomIndex = Math.floor(Math.random() * activities.length)
    setCurrentActivity(activities[randomIndex])
  }

  // 초기 로드
  useEffect(() => {
    loadActivities(selectedCategory)
  }, [selectedCategory])

  const getCategoryEmoji = (category: 'festival' | 'sports') => {
    return category === 'festival' ? '🎪' : '⚽'
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card p-6 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 ${className}`}
    >
      {/* 카드 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="text-xl font-bold">액티비티</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              한국의 축제와 스포츠 정보
            </p>
          </div>
        </div>
        {currentActivity && (
          <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
            <span>{getCategoryEmoji(currentActivity.category)}</span>
            <span>{currentActivity.category === 'festival' ? '축제' : '스포츠'}</span>
          </div>
        )}
      </div>

      {/* 카테고리 선택 */}
      <div className="flex space-x-2 mb-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as 'all' | 'festival' | 'sports')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
              selectedCategory === category.id
                ? 'bg-blue-500/20 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-200/20 dark:hover:bg-gray-700/20'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline hover:no-underline"
          >
            닫기
          </button>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">액티비티 정보를 가져오는 중...</p>
        </div>
      )}

      {/* 현재 액티비티 정보 */}
      {!isLoading && currentActivity && (
        <div className="mb-4">
          {currentActivity.image && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img
                src={currentActivity.image}
                alt={currentActivity.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">{currentActivity.title}</h4>
              <span className="text-xl">{getCategoryEmoji(currentActivity.category)}</span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {currentActivity.description}
            </p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <span>📅</span>
                  <span>{formatDate(currentActivity.date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>📍</span>
                  <span>{currentActivity.location}</span>
                </div>
              </div>
            </div>

            {currentActivity.link && (
              <a
                href={currentActivity.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                <span>자세히 보기</span>
                <span>→</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="space-y-2">
        {/* 랜덤 액티비티 */}
        <button
          onClick={getRandomActivity}
          disabled={isLoading || activities.length === 0}
          className="w-full glass-button p-3 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            <span>🎲</span>
            <span>랜덤 액티비티</span>
          </span>
          <span className="text-sm">
            {activities.length}개 활동
          </span>
        </button>

        {/* 전체 목록 토글 */}
        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            disabled={isLoading || activities.length === 0}
            className="w-full glass-button p-3 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <span>📋</span>
              <span>전체 목록</span>
            </span>
            <span className="text-sm">
              {showDetails ? '▼' : '▶'}
            </span>
          </button>

          {/* 확장된 목록 */}
          {showDetails && activities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden"
            >
              <div className="max-h-64 overflow-y-auto space-y-2 p-3 bg-white/10 dark:bg-white/5 rounded-lg">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => setCurrentActivity(activity)}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      currentActivity?.id === activity.id
                        ? 'bg-blue-500/20 border border-blue-500/30'
                        : 'hover:bg-white/10 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span>{getCategoryEmoji(activity.category)}</span>
                          <h5 className="font-medium truncate text-sm">{activity.title}</h5>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {activity.location} • {formatDate(activity.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 빈 상태 */}
      {!isLoading && activities.length === 0 && !error && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            해당 카테고리의 액티비티를 찾을 수 없습니다
          </p>
          <button
            onClick={() => loadActivities(selectedCategory)}
            className="glass-button px-4 py-2 rounded-lg text-sm"
          >
            다시 시도
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default ActivityCard