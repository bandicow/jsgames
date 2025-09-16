import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

// In-memory cache for AI summaries with 1-hour TTL
const summaryCache = new Map()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

// Rate limiting - max 60 requests per minute (Gemini free tier limit)
let requestQueue = []
let processingQueue = false
const MAX_REQUESTS_PER_MINUTE = 60
const MINUTE_MS = 60 * 1000

/**
 * Category-specific prompts for better summarization
 */
const CATEGORY_PROMPTS = {
  stock: `다음 주식/금융 뉴스를 200자 이내로 간결하게 요약해주세요. 핵심 수치, 기업명, 변동 사항을 포함하여 투자자가 알아야 할 중요한 정보를 담아주세요:

{content}

요약:`,

  sports: `다음 스포츠 뉴스를 200자 이내로 생동감 있게 요약해주세요. 경기 결과, 선수 활약, 기록 등 스포츠 팬들이 관심 있어할 하이라이트를 포함해주세요:

{content}

요약:`,

  entertainment: `다음 연예/엔터테인먼트 뉴스를 200자 이내로 흥미롭게 요약해주세요. 출연진, 작품명, 화제성 등 대중이 관심 가질 포인트를 담아주세요:

{content}

요약:`,

  weather: `다음 날씨 뉴스를 200자 이내로 실용적으로 요약해주세요. 기온, 강수량, 주의사항 등 일상생활에 도움되는 정보를 포함해주세요:

{content}

요약:`,

  default: `다음 뉴스를 200자 이내로 핵심만 간결하게 요약해주세요. 독자가 빠르게 이해할 수 있도록 중요한 내용만 포함해주세요:

{content}

요약:`
}

/**
 * Rate limiting queue processor
 */
const processQueue = async () => {
  if (processingQueue || requestQueue.length === 0) return

  processingQueue = true

  while (requestQueue.length > 0) {
    const batchSize = Math.min(requestQueue.length, MAX_REQUESTS_PER_MINUTE)
    const batch = requestQueue.splice(0, batchSize)

    console.log(`🤖 Processing ${batch.length} Gemini requests`)

    // Process batch in parallel
    await Promise.all(batch.map(async (request) => {
      try {
        const result = await model.generateContent(request.prompt)
        const response = await result.response
        const summary = response.text().trim()

        // Cache the result
        summaryCache.set(request.cacheKey, {
          summary,
          timestamp: Date.now()
        })

        console.log(`✨ Gemini summary generated for: ${request.title?.substring(0, 50)}...`)
        request.resolve(summary)

      } catch (error) {
        console.error(`❌ Gemini summarization error for "${request.title}":`, error.message)

        // Fallback to original content if AI fails
        const fallbackSummary = request.originalContent.length > 200
          ? request.originalContent.substring(0, 200) + '...'
          : request.originalContent || '요약을 생성할 수 없습니다.'

        request.resolve(fallbackSummary)
      }
    }))

    // If there are more requests, wait a minute before processing next batch
    if (requestQueue.length > 0) {
      console.log(`⏳ Rate limiting: waiting 60 seconds before processing ${requestQueue.length} more requests...`)
      await new Promise(resolve => setTimeout(resolve, MINUTE_MS))
    }
  }

  processingQueue = false
}

/**
 * Generate AI summary for news article with rate limiting
 * @param {string} content - Original article content
 * @param {string} category - Article category for context
 * @param {string} title - Article title for logging
 * @returns {Promise<string>} - AI-generated summary
 */
export const generateAISummary = async (content, category = 'default', title = '') => {
  try {
    // Check cache first
    const cacheKey = `summary_${Buffer.from(content).toString('base64').substring(0, 32)}`
    const cached = summaryCache.get(cacheKey)

    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log(`💾 Returning cached summary for: ${title?.substring(0, 50)}...`)
      return cached.summary
    }

    // If content is too short, return as is
    if (!content || content.length < 50) {
      const fallback = content || '요약할 내용이 없습니다.'
      return fallback.length > 200 ? fallback.substring(0, 200) + '...' : fallback
    }

    // Create summarization prompt
    const promptTemplate = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.default
    const prompt = promptTemplate.replace('{content}', content.substring(0, 2000)) // Limit input length

    // Add to queue and return promise
    return new Promise((resolve) => {
      requestQueue.push({
        prompt,
        cacheKey,
        originalContent: content,
        title,
        resolve
      })

      // Start processing queue
      processQueue()
    })

  } catch (error) {
    console.error('❌ Error in generateAISummary:', error.message)

    // Return fallback summary
    const fallbackSummary = content.length > 200
      ? content.substring(0, 200) + '...'
      : content || '요약을 생성할 수 없습니다.'

    return fallbackSummary
  }
}

/**
 * Batch summarize multiple articles with intelligent batching
 * @param {Array} articles - Array of articles to summarize
 * @returns {Promise<Array>} - Articles with AI-generated summaries
 */
export const batchSummarizeArticles = async (articles) => {
  if (!articles || articles.length === 0) {
    return []
  }

  try {
    console.log(`🚀 Starting batch summarization for ${articles.length} articles`)

    // Filter articles that need summarization (not cached and have content)
    const articlesToSummarize = []
    const results = []

    for (const article of articles) {
      const cacheKey = `summary_${Buffer.from(article.rawContent || article.summary || '').toString('base64').substring(0, 32)}`
      const cached = summaryCache.get(cacheKey)

      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        // Use cached summary
        results.push({
          ...article,
          summary: cached.summary,
          aiSummarized: true
        })
      } else if (article.rawContent && article.rawContent.length > 50) {
        // Needs AI summarization
        articlesToSummarize.push(article)
      } else {
        // Use original summary/content
        results.push({
          ...article,
          summary: article.summary || article.rawContent || '내용이 없습니다.',
          aiSummarized: false
        })
      }
    }

    console.log(`📝 ${articlesToSummarize.length} articles need AI summarization, ${results.length} from cache`)

    // Generate AI summaries for remaining articles
    if (articlesToSummarize.length > 0) {
      const summaryPromises = articlesToSummarize.map(async (article) => {
        const aiSummary = await generateAISummary(
          article.rawContent,
          article.category,
          article.title
        )

        return {
          ...article,
          summary: aiSummary,
          aiSummarized: true
        }
      })

      const summarizedArticles = await Promise.all(summaryPromises)
      results.push(...summarizedArticles)
    }

    // Sort by original order and return
    const sortedResults = results.sort((a, b) => {
      const indexA = articles.findIndex(article => article.id === a.id)
      const indexB = articles.findIndex(article => article.id === b.id)
      return indexA - indexB
    })

    console.log(`✅ Batch summarization completed: ${sortedResults.filter(a => a.aiSummarized).length}/${sortedResults.length} AI-summarized`)
    return sortedResults

  } catch (error) {
    console.error('❌ Error in batch summarization:', error.message)

    // Return articles with fallback summaries
    return articles.map(article => ({
      ...article,
      summary: article.rawContent || article.summary || '요약을 생성할 수 없습니다.',
      aiSummarized: false
    }))
  }
}

/**
 * Get Gemini service status and statistics
 * @returns {Object} - Service status information
 */
export const getGeminiStatus = () => {
  return {
    available: !!process.env.GEMINI_API_KEY,
    cacheSize: summaryCache.size,
    queueSize: requestQueue.length,
    isProcessing: processingQueue,
    rateLimit: `${MAX_REQUESTS_PER_MINUTE}/minute`,
    cacheHitRate: summaryCache.size > 0 ? '계산 중...' : '0%'
  }
}

/**
 * Clear summary cache (useful for testing)
 */
export const clearSummaryCache = () => {
  summaryCache.clear()
  console.log('🧹 Summary cache cleared')
}

/**
 * Health check for Gemini service
 * @returns {Promise<boolean>} - Service health status
 */
export const healthCheck = async () => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY not found')
      return false
    }

    // Test with a simple prompt
    const testResult = await model.generateContent('안녕하세요. 간단히 "안녕하세요"라고 답해주세요.')
    const response = await testResult.response
    const text = response.text()

    console.log('✅ Gemini health check passed:', text.substring(0, 50))
    return true

  } catch (error) {
    console.error('❌ Gemini health check failed:', error.message)
    return false
  }
}