import axios from 'axios'
import xml2js from 'xml2js'

// Google News RSS URLs for Korean content by category
const NEWS_RSS_URLS = {
  stock: [
    'https://news.google.com/rss/search?q=한국+주식&hl=ko&gl=KR&ceid=KR:ko',
    'https://news.google.com/rss/search?q=코스피+코스닥&hl=ko&gl=KR&ceid=KR:ko',
    'https://news.google.com/rss/search?q=삼성전자+LG전자&hl=ko&gl=KR&ceid=KR:ko'
  ],
  sports: [
    'https://news.google.com/rss/search?q=한국+스포츠&hl=ko&gl=KR&ceid=KR:ko',
    'https://news.google.com/rss/search?q=손흥민+KBO&hl=ko&gl=KR&ceid=KR:ko',
    'https://news.google.com/rss/search?q=K리그+프로야구&hl=ko&gl=KR&ceid=KR:ko'
  ],
  entertainment: [
    'https://news.google.com/rss/search?q=K-pop+한국+연예&hl=ko&gl=KR&ceid=KR:ko',
    'https://news.google.com/rss/search?q=드라마+아이돌&hl=ko&gl=KR&ceid=KR:ko',
    'https://news.google.com/rss/search?q=한국+영화+배우&hl=ko&gl=KR&ceid=KR:ko'
  ],
  weather: [
    'https://news.google.com/rss/search?q=날씨+예보+기상청&hl=ko&gl=KR&ceid=KR:ko',
    'https://news.google.com/rss/search?q=태풍+미세먼지&hl=ko&gl=KR&ceid=KR:ko',
    'https://news.google.com/rss/search?q=한국+날씨+기온&hl=ko&gl=KR&ceid=KR:ko'
  ]
}

// In-memory cache with 1-hour TTL
const newsCache = new Map()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

// XML parser instance
const parser = new xml2js.Parser()

/**
 * Clean and extract text content from HTML/XML
 * @param {string} text - Raw text content
 * @returns {string} - Cleaned text
 */
const cleanText = (text) => {
  if (!text) return ''

  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[#\w]+;/g, ' ') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 300) // Limit length for better performance
}

/**
 * Extract domain from URL for source attribution
 * @param {string} url - Article URL
 * @returns {string} - Clean source name
 */
const extractSource = (url) => {
  if (!url) return 'Google News'

  try {
    const domain = new URL(url).hostname.replace('www.', '')

    // Map common domains to Korean source names
    const sourceMap = {
      'chosun.com': '조선일보',
      'donga.com': '동아일보',
      'joongang.co.kr': '중앙일보',
      'hani.co.kr': '한겨레',
      'khan.co.kr': '경향신문',
      'mk.co.kr': '매일경제',
      'hankyung.com': '한국경제',
      'edaily.co.kr': '이데일리',
      'osen.co.kr': 'OSEN',
      'sbs.co.kr': 'SBS',
      'kbs.co.kr': 'KBS',
      'mbc.co.kr': 'MBC',
      'ytn.co.kr': 'YTN'
    }

    return sourceMap[domain] || domain
  } catch (error) {
    return 'Google News'
  }
}

/**
 * Fetch and parse RSS feed from Google News
 * @param {string} rssUrl - RSS feed URL
 * @returns {Promise<Array>} - Array of parsed articles
 */
const fetchRSSFeed = async (rssUrl) => {
  try {
    console.log(`📰 Fetching RSS feed: ${rssUrl}`)

    const response = await axios.get(rssUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
      }
    })

    const result = await parser.parseStringPromise(response.data)
    const items = result?.rss?.channel?.[0]?.item || []

    console.log(`📊 Found ${items.length} articles from ${rssUrl}`)

    return items.map((item, index) => {
      const title = cleanText(item.title?.[0] || '')
      const description = cleanText(item.description?.[0] || '')
      const link = item.link?.[0] || ''
      const pubDate = item.pubDate?.[0] || new Date().toISOString()
      const source = extractSource(link)

      return {
        id: `google_news_${Date.now()}_${index}`,
        title: title.length > 0 ? title : '제목 없음',
        summary: description.length > 0 ? description : '요약 준비 중...',
        source,
        publishedAt: new Date(pubDate).toISOString(),
        url: link,
        category: 'general', // Will be set by caller
        thumbnail: null, // Google News RSS doesn't provide images
        rawContent: description // Keep raw content for Gemini summarization
      }
    }).filter(article => article.title !== '제목 없음' && article.title.length > 10)

  } catch (error) {
    console.error(`❌ Error fetching RSS feed ${rssUrl}:`, error.message)
    return []
  }
}

/**
 * Fetch news articles for a specific category
 * @param {string} category - News category (stock, sports, entertainment, weather, all)
 * @param {number} limit - Maximum number of articles to return
 * @returns {Promise<Array>} - Array of articles
 */
export const fetchNewsByCategory = async (category, limit = 10) => {
  try {
    console.log(`🔍 Fetching news for category: ${category}, limit: ${limit}`)

    // Check cache first
    const cacheKey = `news_${category}_${limit}`
    const cached = newsCache.get(cacheKey)

    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log(`💾 Returning cached news for ${category}`)
      return cached.data
    }

    let articles = []

    if (category === 'all') {
      // Fetch from all categories
      const allCategories = ['stock', 'sports', 'entertainment', 'weather']
      const promises = allCategories.map(cat => fetchNewsByCategory(cat, Math.ceil(limit / 4)))
      const results = await Promise.all(promises)

      articles = results.flat()
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, limit)

    } else if (NEWS_RSS_URLS[category]) {
      // Fetch from specific category
      const rssUrls = NEWS_RSS_URLS[category]
      const promises = rssUrls.map(url => fetchRSSFeed(url))
      const results = await Promise.all(promises)

      articles = results.flat()
        .map(article => ({ ...article, category }))
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, limit)

    } else {
      console.warn(`⚠️ Unknown category: ${category}`)
      return []
    }

    // Cache the results
    newsCache.set(cacheKey, {
      data: articles,
      timestamp: Date.now()
    })

    console.log(`✅ Successfully fetched ${articles.length} articles for ${category}`)
    return articles

  } catch (error) {
    console.error(`❌ Error fetching news for category ${category}:`, error.message)
    return []
  }
}

/**
 * Get news statistics
 * @returns {Promise<Object>} - News statistics
 */
export const getNewsStatistics = async () => {
  try {
    const categories = ['stock', 'sports', 'entertainment', 'weather']
    const stats = {
      totalArticles: 0,
      categories: {},
      lastUpdated: new Date().toISOString(),
      updateFrequency: '1시간마다 업데이트',
      sources: []
    }

    // Get article counts for each category
    for (const category of categories) {
      const articles = await fetchNewsByCategory(category, 50)
      stats.categories[category] = articles.length
      stats.totalArticles += articles.length

      // Collect unique sources
      articles.forEach(article => {
        if (!stats.sources.includes(article.source)) {
          stats.sources.push(article.source)
        }
      })
    }

    return stats

  } catch (error) {
    console.error('❌ Error getting news statistics:', error.message)
    return {
      totalArticles: 0,
      categories: { stock: 0, sports: 0, entertainment: 0, weather: 0 },
      lastUpdated: new Date().toISOString(),
      updateFrequency: '1시간마다 업데이트',
      sources: ['Google News']
    }
  }
}

/**
 * Clear news cache (useful for testing)
 */
export const clearNewsCache = () => {
  newsCache.clear()
  console.log('🧹 News cache cleared')
}