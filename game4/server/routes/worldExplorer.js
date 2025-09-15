import express from 'express'
import axios from 'axios'

const router = express.Router()

// 카테고리별 Wikipedia 검색 키워드 (한국어)
const categoryKeywords = {
  places: ['관광지', '세계유산', '국립공원', '명소', '랜드마크', '지리', '유명한_장소'],
  animals: ['동물', '포유류', '조류', '파충류', '양서류', '어류', '곤충', '멸종위기종', '야생동물', '애완동물', '해양생물'],
  sports: ['스포츠', '올림픽', '월드컵', '운동선수', '축구', '야구', '농구', '테니스'],
  history: ['역사', '전쟁', '왕조', '문명', '역사적_사건', '한국사', '세계사', '고대사'],
  science: ['과학', '물리학', '화학', '생물학', '우주', '기술', '발명', '발견'],
  art: ['예술', '미술', '화가', '조각', '박물관', '음악', '건축', '예술작품'],
  nature: ['자연', '날씨', '지질학', '바다', '산', '숲', '생태계', '자연현상'],
  culture: ['문화', '축제', '전통', '음식', '언어', '신화', '민속', '의례', '한국문화']
}

// Wikipedia API 기본 URL (한국어)
const WIKI_API_BASE = 'https://ko.wikipedia.org/api/rest_v1'
const WIKI_API_QUERY = 'https://ko.wikipedia.org/w/api.php'

// 캐시 (메모리 캐시 - 실제 프로덕션에서는 Redis 등 사용 권장)
const contentCache = new Map()
const CACHE_TTL = 1000 * 60 * 30 // 30분

// Wikipedia 페이지 정보 가져오기
async function getWikipediaPage(title) {
  try {
    // 1. 페이지 요약 가져오기
    const summaryResponse = await axios.get(
      `${WIKI_API_BASE}/page/summary/${encodeURIComponent(title)}`
    )

    if (!summaryResponse.data) {
      throw new Error('No summary data')
    }

    const summary = summaryResponse.data

    // 2. 페이지 전체 내용 가져오기 (추가 정보용)
    const extractResponse = await axios.get(WIKI_API_QUERY, {
      params: {
        action: 'query',
        format: 'json',
        prop: 'extracts|pageimages|info',
        exintro: true,
        explaintext: true,
        exsectionformat: 'plain',
        piprop: 'original',
        inprop: 'url',
        titles: title
      }
    })

    const pages = extractResponse.data.query.pages
    const pageData = Object.values(pages)[0]

    // 3. 추가 이미지 가져오기 (없는 경우 대비)
    let imageUrl = summary.thumbnail?.source ||
                   pageData?.original?.source ||
                   `https://source.unsplash.com/800x400/?${encodeURIComponent(title)}`

    // 4. 데이터 포맷팅
    const content = {
      id: `wiki_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: summary.title || title,
      description: summary.extract || pageData?.extract || '설명을 불러올 수 없습니다.',
      imageUrl: imageUrl,
      location: summary.content_urls?.desktop?.page || pageData?.fullurl,
      source: '위키백과',
      facts: extractFactsFromText(pageData?.extract || summary.extract || '')
    }

    return content
  } catch (error) {
    console.error('Wikipedia API Error:', error.message)
    return null
  }
}

// 텍스트에서 흥미로운 사실 추출
function extractFactsFromText(text) {
  if (!text) return []

  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 20)
  const facts = []

  // 숫자나 특별한 정보가 포함된 문장 우선 선택
  const interestingPatterns = [
    /\d+/,  // 숫자 포함
    /최초|최대|최소|가장|유일/,  // 최상급 (한국어)
    /발견|발명|설립|창설|개발/,  // 발견/발명 (한국어)
    /만|억|천|백만/,  // 큰 숫자 (한국어)
    /세기|년|기원전|기원후/,  // 시간 관련 (한국어)
    /first|largest|smallest|oldest|newest|only/i,  // 영어 최상급 (일부 영어 콘텐츠용)
    /discovered|invented|founded|created/i,  // 영어 발견/발명
    /million|billion|thousand/i,  // 영어 큰 숫자
    /century|year|BC|AD/i  // 영어 시간 관련
  ]

  for (const sentence of sentences) {
    if (facts.length >= 4) break

    const trimmed = sentence.trim()
    if (interestingPatterns.some(pattern => pattern.test(trimmed))) {
      facts.push(trimmed)
    }
  }

  // 부족하면 일반 문장 추가
  if (facts.length < 4) {
    for (const sentence of sentences) {
      if (facts.length >= 4) break
      const trimmed = sentence.trim()
      if (!facts.includes(trimmed) && trimmed.length > 30) {
        facts.push(trimmed)
      }
    }
  }

  return facts.slice(0, 4)
}

// 카테고리별 랜덤 Wikipedia 페이지 검색
async function searchWikipediaByCategory(category) {
  try {
    const keywords = categoryKeywords[category] || categoryKeywords.places
    // 동물 카테고리의 경우 더 구체적인 키워드 사용
    let randomKeyword
    if (category === 'animals') {
      // 동물 카테고리는 더 구체적인 검색어 사용
      const animalSpecific = ['판다', '사자', '호랑이', '코끼리', '기린', '펭귄', '독수리', '고래', '상어', '나비', '개', '고양이', '늑대', '여우', '곰']
      randomKeyword = animalSpecific[Math.floor(Math.random() * animalSpecific.length)]
    } else {
      randomKeyword = keywords[Math.floor(Math.random() * keywords.length)]
    }

    // Wikipedia API로 검색
    const searchResponse = await axios.get(WIKI_API_QUERY, {
      params: {
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: randomKeyword,
        srnamespace: 0,
        srlimit: 50,  // 더 많은 결과 가져오기
        srinfo: 'totalhits',
        srprop: 'snippet'
      }
    })

    const searchResults = searchResponse.data.query.search

    if (!searchResults || searchResults.length === 0) {
      throw new Error('No search results')
    }

    // 랜덤하게 하나 선택
    const randomIndex = Math.floor(Math.random() * Math.min(searchResults.length, 20))
    const selectedArticle = searchResults[randomIndex]

    // 선택된 페이지의 상세 정보 가져오기
    const pageContent = await getWikipediaPage(selectedArticle.title)

    if (pageContent) {
      pageContent.category = category
    }

    return pageContent
  } catch (error) {
    console.error('Search Wikipedia Error:', error.message)
    return null
  }
}

// 완전 랜덤 Wikipedia 페이지 가져오기
async function getRandomWikipediaPage() {
  try {
    // Wikipedia Random API 사용
    const randomResponse = await axios.get(WIKI_API_QUERY, {
      params: {
        action: 'query',
        format: 'json',
        list: 'random',
        rnnamespace: 0,
        rnlimit: 1
      }
    })

    const randomPage = randomResponse.data.query.random[0]

    if (!randomPage) {
      throw new Error('No random page found')
    }

    // 랜덤 페이지의 상세 정보 가져오기
    const pageContent = await getWikipediaPage(randomPage.title)

    if (pageContent) {
      // 랜덤 카테고리 할당
      const categories = Object.keys(categoryKeywords)
      pageContent.category = categories[Math.floor(Math.random() * categories.length)]
    }

    return pageContent
  } catch (error) {
    console.error('Random Wikipedia Error:', error.message)
    return null
  }
}

// 랜덤 콘텐츠 가져오기 API
router.get('/random', async (req, res) => {
  try {
    const { category = 'all' } = req.query

    // 캐시 확인
    const cacheKey = `${category}_${Date.now()}`

    let content = null

    if (category === 'all') {
      // 완전 랜덤
      content = await getRandomWikipediaPage()
    } else {
      // 카테고리별 검색
      content = await searchWikipediaByCategory(category)
    }

    // 실패 시 다시 시도 (최대 3번)
    let retries = 0
    while (!content && retries < 3) {
      retries++
      console.log(`Retry ${retries}...`)

      if (category === 'all') {
        content = await getRandomWikipediaPage()
      } else {
        content = await searchWikipediaByCategory(category)
      }
    }

    // 그래도 실패하면 Unsplash에서 랜덤 이미지와 함께 기본 콘텐츠 제공
    if (!content) {
      const fallbackTopics = {
        places: '세계의 아름다운 장소',
        animals: '놀라운 동물의 세계',
        sports: '스포츠의 열정',
        history: '역사의 한 페이지',
        science: '과학의 발견',
        art: '예술의 아름다움',
        nature: '자연의 경이',
        culture: '문화의 다양성'
      }

      const topic = fallbackTopics[category] || '흥미로운 이야기'

      content = {
        id: `fallback_${Date.now()}`,
        category: category,
        title: topic,
        description: '현재 새로운 콘텐츠를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요. 세상은 놀라운 이야기로 가득합니다. 계속 탐험해보세요!',
        imageUrl: `https://source.unsplash.com/800x400/?${category}`,
        facts: [
          '지구상에는 아직 발견되지 않은 수많은 비밀이 있습니다.',
          '매일 새로운 발견과 발명이 이루어지고 있습니다.',
          '인류의 지식은 계속해서 확장되고 있습니다.',
          '호기심은 모든 발견의 시작입니다.'
        ],
        location: '',
        source: '세상 둘러보기'
      }
    }

    res.json({
      success: true,
      data: content
    })
  } catch (error) {
    console.error('World Explorer Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content',
      message: error.message
    })
  }
})

// 카테고리 정보
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { id: 'all', name: '전체', icon: '🌍', description: '모든 주제의 랜덤 콘텐츠' },
      { id: 'places', name: '장소', icon: '📍', description: '세계의 명소와 지리' },
      { id: 'animals', name: '동물', icon: '🦁', description: '야생동물과 생태계' },
      { id: 'sports', name: '스포츠', icon: '⚽', description: '스포츠와 운동선수' },
      { id: 'history', name: '역사', icon: '🏛️', description: '역사적 사건과 인물' },
      { id: 'science', name: '과학', icon: '🔬', description: '과학적 발견과 기술' },
      { id: 'art', name: '예술', icon: '🎨', description: '예술 작품과 예술가' },
      { id: 'nature', name: '자연', icon: '🌿', description: '자연 현상과 생태계' },
      { id: 'culture', name: '문화', icon: '🎭', description: '세계의 문화와 전통' }
    ]

    res.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('Categories Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error.message
    })
  }
})

// 특정 Wikipedia 페이지 가져오기 (디버깅용)
router.get('/wiki/:title', async (req, res) => {
  try {
    const { title } = req.params
    const content = await getWikipediaPage(decodeURIComponent(title))

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      })
    }

    res.json({
      success: true,
      data: content
    })
  } catch (error) {
    console.error('Wiki Page Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch page',
      message: error.message
    })
  }
})

export default router