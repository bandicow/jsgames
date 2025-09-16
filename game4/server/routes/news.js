import express from 'express'
import { fetchNewsByCategory, getNewsStatistics } from '../services/newsService.js'
import { batchSummarizeArticles, getGeminiStatus, healthCheck } from '../services/geminiService.js'

const router = express.Router()

// 뉴스 검색 엔드포인트 - 실시간 Google News + Gemini AI 요약
router.get('/search', async (req, res) => {
  try {
    const { category = 'all', limit = 10 } = req.query
    const parsedLimit = Math.min(parseInt(limit) || 10, 50) // Max 50 articles

    console.log(`🔍 Real-time news request: category=${category}, limit=${parsedLimit}`)

    // Fetch real-time news from Google News RSS
    const articles = await fetchNewsByCategory(category, parsedLimit)

    if (articles.length === 0) {
      return res.json({
        success: true,
        data: {
          articles: [],
          total: 0,
          category,
          timestamp: new Date().toISOString(),
          message: '현재 해당 카테고리의 뉴스를 찾을 수 없습니다. 잠시 후 다시 시도해주세요.'
        }
      })
    }

    console.log(`📰 Fetched ${articles.length} articles, starting AI summarization...`)

    // Generate AI summaries with Gemini
    const summarizedArticles = await batchSummarizeArticles(articles)

    // Add thumbnail based on category if not present
    const finalArticles = summarizedArticles.map(article => ({
      ...article,
      thumbnail: article.thumbnail || getCategoryThumbnail(article.category)
    }))

    console.log(`✅ Successfully processed ${finalArticles.length} articles with AI summaries`)

    res.json({
      success: true,
      data: {
        articles: finalArticles,
        total: finalArticles.length,
        category,
        timestamp: new Date().toISOString(),
        aiPowered: true,
        summary: `${finalArticles.filter(a => a.aiSummarized).length}개 기사가 AI로 요약되었습니다.`
      }
    })

  } catch (error) {
    console.error('❌ Real-time news search error:', error.message)
    res.status(500).json({
      success: false,
      error: error.message || '실시간 뉴스 검색에 실패했습니다.',
      timestamp: new Date().toISOString()
    })
  }
})

// 뉴스 상세 정보 엔드포인트
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params

    console.log(`📖 News detail request: ${id}`)

    // For real-time system, we need to fetch fresh data
    // Since Google News doesn't provide permanent IDs,
    // we'll return a message directing users to the original article

    // Extract category and search for similar article
    const idParts = id.split('_')
    const category = idParts[1] || 'all'

    const articles = await fetchNewsByCategory(category, 20)
    const article = articles.find(a => a.id === id) || articles[0]

    if (!article) {
      return res.status(404).json({
        success: false,
        error: '요청하신 기사를 찾을 수 없습니다. 실시간 뉴스 특성상 기사 ID가 변경될 수 있습니다.',
        suggestion: '메인 뉴스 목록에서 최신 기사를 확인해주세요.'
      })
    }

    // Enhance article with AI summary if needed
    const [enhancedArticle] = await batchSummarizeArticles([article])

    res.json({
      success: true,
      data: {
        ...enhancedArticle,
        fullContent: enhancedArticle.summary,
        aiEnhanced: true,
        disclaimer: '실시간 뉴스는 Google News에서 제공되며, AI가 요약한 내용입니다.'
      }
    })

  } catch (error) {
    console.error('❌ News detail error:', error.message)
    res.status(500).json({
      success: false,
      error: error.message || '뉴스 상세 조회에 실패했습니다.'
    })
  }
})

// 뉴스 통계 엔드포인트 - 실시간 데이터 기반
router.get('/stats', async (_, res) => {
  try {
    console.log('📊 Real-time news statistics request')

    const stats = await getNewsStatistics()
    const geminiStatus = getGeminiStatus()

    res.json({
      success: true,
      data: {
        ...stats,
        aiService: {
          status: geminiStatus.available ? 'active' : 'inactive',
          cacheSize: geminiStatus.cacheSize,
          queueSize: geminiStatus.queueSize,
          rateLimit: geminiStatus.rateLimit
        },
        disclaimer: '실시간 Google News 기반 통계'
      }
    })

  } catch (error) {
    console.error('❌ News statistics error:', error.message)
    res.status(500).json({
      success: false,
      error: error.message || '뉴스 통계 조회에 실패했습니다.'
    })
  }
})

// AI 서비스 상태 확인 엔드포인트
router.get('/ai-status', async (_, res) => {
  try {
    const status = getGeminiStatus()
    const health = await healthCheck()

    res.json({
      success: true,
      data: {
        ...status,
        healthy: health,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ AI status check error:', error.message)
    res.status(500).json({
      success: false,
      error: error.message || 'AI 서비스 상태 확인에 실패했습니다.'
    })
  }
})

// 캐시 관리 엔드포인트 (개발/테스트용)
router.post('/clear-cache', async (_, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: '프로덕션 환경에서는 캐시 삭제가 제한됩니다.'
      })
    }

    const { clearNewsCache } = await import('../services/newsService.js')
    const { clearSummaryCache } = await import('../services/geminiService.js')

    clearNewsCache()
    clearSummaryCache()

    res.json({
      success: true,
      message: '모든 뉴스 캐시가 삭제되었습니다.'
    })

  } catch (error) {
    console.error('❌ Cache clear error:', error.message)
    res.status(500).json({
      success: false,
      error: error.message || '캐시 삭제에 실패했습니다.'
    })
  }
})

// 카테고리별 썸네일 생성 (fallback)
const getCategoryThumbnail = (category) => {
  const thumbnailMap = {
    stock: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop&crop=center',
    sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop&crop=center',
    entertainment: 'https://images.unsplash.com/photo-1489599558410-4423b9e0e8b8?w=400&h=300&fit=crop&crop=center',
    weather: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=300&fit=crop&crop=center'
  }

  return thumbnailMap[category] || thumbnailMap.stock
}

export default router