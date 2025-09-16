import { FC, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface NewsArticle {
  id: string
  title: string
  summary: string
  source: string
  publishedAt: string
  category: 'stock' | 'sports' | 'entertainment' | 'weather'
  url?: string
  thumbnail?: string
}

interface NewsCardProps {
  className?: string
}

const NewsCard: FC<NewsCardProps> = ({ className = '' }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [currentArticle, setCurrentArticle] = useState<NewsArticle | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'stock' | 'sports' | 'entertainment' | 'weather'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const categories = [
    { id: 'all', label: '전체', icon: '📰' },
    { id: 'stock', label: '주식', icon: '📈' },
    { id: 'sports', label: '스포츠', icon: '⚽' },
    { id: 'entertainment', label: '연예', icon: '🎭' },
    { id: 'weather', label: '날씨', icon: '🌤️' }
  ]

  // 뉴스 데이터 로드
  const loadNews = async (category: string = 'all') => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/news/search?category=${category}&limit=10`)
      const data = await response.json()

      if (data.success) {
        setArticles(data.data.articles)
        // 첫 번째 기사를 현재 선택으로 설정
        if (data.data.articles.length > 0) {
          setCurrentArticle(data.data.articles[0])
        }
      } else {
        throw new Error(data.error || '뉴스 정보를 가져올 수 없습니다.')
      }
    } catch (error) {
      console.error('Failed to load news:', error)
      setError(error instanceof Error ? error.message : '뉴스 로드에 실패했습니다.')
      setArticles([])
      setCurrentArticle(null)
    } finally {
      setIsLoading(false)
    }
  }

  // 랜덤 뉴스 선택
  const getRandomNews = () => {
    if (articles.length === 0) return

    const randomIndex = Math.floor(Math.random() * articles.length)
    setCurrentArticle(articles[randomIndex])
  }

  // 초기 로드
  useEffect(() => {
    loadNews(selectedCategory)
  }, [selectedCategory])

  const getCategoryEmoji = (category: 'stock' | 'sports' | 'entertainment' | 'weather') => {
    const emojiMap = {
      stock: '📈',
      sports: '⚽',
      entertainment: '🎭',
      weather: '🌤️'
    }
    return emojiMap[category]
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

      if (diffInHours < 1) {
        return '방금 전'
      } else if (diffInHours < 24) {
        return `${diffInHours}시간 전`
      } else {
        return date.toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric'
        })
      }
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
          <div className="text-3xl">📰</div>
          <div>
            <h3 className="text-xl font-bold">AI 뉴스 요약</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              실시간 뉴스를 AI가 요약해드립니다
            </p>
          </div>
        </div>
        {currentArticle && (
          <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
            <span>{getCategoryEmoji(currentArticle.category)}</span>
            <span>{formatDate(currentArticle.publishedAt)}</span>
          </div>
        )}
      </div>

      {/* 카테고리 선택 */}
      <div className="flex space-x-2 mb-4 flex-wrap">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as 'all' | 'stock' | 'sports' | 'entertainment' | 'weather')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1 mb-2 ${
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
          <p className="text-gray-600 dark:text-gray-400">최신 뉴스를 분석하는 중...</p>
        </div>
      )}

      {/* 현재 뉴스 기사 */}
      {!isLoading && currentArticle && (
        <div className="mb-4">
          {currentArticle.thumbnail && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img
                src={currentArticle.thumbnail}
                alt={currentArticle.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h4 className="text-lg font-semibold leading-tight">{currentArticle.title}</h4>
              <span className="text-xl ml-2">{getCategoryEmoji(currentArticle.category)}</span>
            </div>

            <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">🤖 AI 요약</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentArticle.summary}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <span>📰</span>
                  <span>{currentArticle.source}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>⏰</span>
                  <span>{formatDate(currentArticle.publishedAt)}</span>
                </div>
              </div>
            </div>

            {currentArticle.url && (
              <a
                href={currentArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                <span>전체 기사 보기</span>
                <span>→</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="space-y-2">
        {/* 랜덤 뉴스 */}
        <button
          onClick={getRandomNews}
          disabled={isLoading || articles.length === 0}
          className="w-full glass-button p-3 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            <span>🎲</span>
            <span>다른 뉴스 보기</span>
          </span>
          <span className="text-sm">
            {articles.length}개 기사
          </span>
        </button>

        {/* 전체 목록 토글 */}
        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            disabled={isLoading || articles.length === 0}
            className="w-full glass-button p-3 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              <span>📋</span>
              <span>헤드라인 목록</span>
            </span>
            <span className="text-sm">
              {showDetails ? '▼' : '▶'}
            </span>
          </button>

          {/* 확장된 목록 */}
          {showDetails && articles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden"
            >
              <div className="max-h-64 overflow-y-auto space-y-2 p-3 bg-white/10 dark:bg-white/5 rounded-lg">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => setCurrentArticle(article)}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      currentArticle?.id === article.id
                        ? 'bg-blue-500/20 border border-blue-500/30'
                        : 'hover:bg-white/10 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span>{getCategoryEmoji(article.category)}</span>
                          <h5 className="font-medium truncate text-sm">{article.title}</h5>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                          {article.source} • {formatDate(article.publishedAt)}
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
      {!isLoading && articles.length === 0 && !error && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📰</div>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            해당 카테고리의 뉴스를 찾을 수 없습니다
          </p>
          <button
            onClick={() => loadNews(selectedCategory)}
            className="glass-button px-4 py-2 rounded-lg text-sm"
          >
            다시 시도
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default NewsCard