import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'

const router = express.Router()

// Gemini API는 라우트 핸들러 내에서 초기화
let genAI = null

const getGenAI = () => {
  if (!genAI) {
    console.log('Initializing Gemini with API key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing')
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
  }
  return genAI
}

// 현재 시간대 판단
const getCurrentTimeContext = () => {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}

// 날씨에 따른 퀴즈 주제 추천
const getWeatherBasedTopics = (weather) => {
  const weatherTopics = {
    sunny_upbeat: ['스포츠', '야외활동', '여행', '자연', '에너지'],
    rain_lofi: ['문학', '예술', '음악', '철학', '역사'],
    cloudy_chill: ['과학', '기술', '우주', '미스터리', '심리학'],
    snow_cozy: ['요리', '문화', '전통', '가족', '겨울스포츠'],
    storm_energetic: ['모험', '생존', '극한상황', '재난대비', '기상학'],
    mist_ambient: ['신화', '전설', '미스터리', '판타지', '고대문명'],
    heat_tropical: ['여름휴가', '해양', '열대지역', '수상스포츠', '열대과일'],
    cold_warmup: ['겨울준비', '건강', '온열음식', '패션', '난방']
  }

  return weatherTopics[weather] || ['일반상식', '과학', '역사', '문화', '지리']
}

// 난이도에 따른 프롬프트 조정
const getDifficultyPrompt = (difficulty) => {
  const prompts = {
    easy: '초등학생도 이해할 수 있는 쉬운 수준',
    medium: '일반 성인이 알만한 중간 수준',
    hard: '전문 지식이 필요한 어려운 수준',
    expert: '해당 분야 전문가 수준의 매우 어려운'
  }
  return prompts[difficulty] || prompts.medium
}

// Gemini를 사용한 퀴즈 생성
const generateQuizWithGemini = async (options) => {
  const {
    topic = '일반상식',
    difficulty = 'medium',
    count = 5,
    weather = null,
    timeContext = getCurrentTimeContext(),
    language = 'korean'
  } = options

  const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash' })

  // 날씨 기반 주제 추천 - 사용자 선택을 우선시
  const weatherTopics = weather ? getWeatherBasedTopics(weather) : []
  // 사용자가 선택한 주제를 항상 사용
  const finalTopic = topic

  console.log('Topic processing in generateQuizWithGemini:')
  console.log('- User selected topic:', topic)
  console.log('- Weather recommended topics:', weatherTopics)
  console.log('- Final topic (using user selection):', finalTopic)

  const prompt = `
    ${language === 'korean' ? '한국어로' : 'In English'} ${finalTopic} 주제의 ${getDifficultyPrompt(difficulty)} 객관식 퀴즈 ${count}개를 생성해주세요.
    ${weather ? `현재 날씨는 ${weather}입니다. 이 날씨와 관련된 내용을 포함시켜주세요.` : ''}
    ${timeContext ? `현재 시간대는 ${timeContext}입니다. 적절한 내용을 선택해주세요.` : ''}

    다음 JSON 형식으로 정확하게 응답해주세요:
    {
      "questions": [
        {
          "id": "unique_id",
          "question": "질문 내용",
          "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
          "correctAnswer": 0,
          "explanation": "정답 설명",
          "category": "${finalTopic}",
          "difficulty": "${difficulty}",
          "weatherContext": ${weather ? `"${weather}"` : 'null'},
          "timeContext": "${timeContext}"
        }
      ]
    }

    중요 사항:
    1. correctAnswer는 0부터 시작하는 인덱스입니다 (0, 1, 2, 3)
    2. 각 질문은 정확히 4개의 선택지를 가져야 합니다
    3. 설명은 교육적이고 이해하기 쉽게 작성해주세요
    4. ${language === 'korean' ? '모든 내용을 한국어로 작성해주세요' : 'Write all content in English'}
    5. JSON 형식을 정확히 지켜주세요
  `

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // JSON 파싱 시도
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini')
    }

    const quizData = JSON.parse(jsonMatch[0])
    return quizData.questions
  } catch (error) {
    console.error('Gemini quiz generation error:', error)
    throw error
  }
}

// POST /api/quiz-ai/generate - AI로 퀴즈 생성
router.post('/generate', async (req, res) => {
  try {
    const {
      topic,
      difficulty = 'medium',
      count = 5,
      weather,
      language = 'korean'
    } = req.body

    console.log('Quiz generation request received:')
    console.log('- Topic:', topic)
    console.log('- Difficulty:', difficulty)
    console.log('- Count:', count)
    console.log('- Weather:', weather)

    // API 키 확인
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY environment variable.',
        setup: {
          steps: [
            '1. Google AI Studio에서 API 키 발급: https://makersuite.google.com/app/apikey',
            '2. .env 파일에 GEMINI_API_KEY=your_api_key_here 추가',
            '3. 서버 재시작'
          ]
        }
      })
    }

    const questions = await generateQuizWithGemini({
      topic,
      difficulty,
      count: Math.min(count, 10), // 최대 10개로 제한
      weather,
      timeContext: getCurrentTimeContext(),
      language
    })

    // 정답 제거한 버전 (클라이언트용)
    const questionsWithoutAnswers = questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty
    }))

    // 정답은 서버 세션에 저장 (간단한 메모리 저장소 사용)
    // 실제 프로덕션에서는 Redis 등을 사용
    global.quizAnswers = global.quizAnswers || {}
    questions.forEach(q => {
      global.quizAnswers[q.id] = {
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        correctOption: q.options[q.correctAnswer]
      }
    })

    res.json({
      success: true,
      data: {
        questions: questionsWithoutAnswers,
        total: questions.length,
        context: {
          topic,
          difficulty,
          weather: weather || 'any',
          time: getCurrentTimeContext(),
          language
        }
      }
    })
  } catch (error) {
    console.error('Quiz generation error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to generate quiz',
      message: error.message
    })
  }
})

// POST /api/quiz-ai/check - AI 생성 퀴즈 정답 확인
router.post('/check', async (req, res) => {
  try {
    const { questionId, answer } = req.body

    if (!questionId || answer === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Question ID and answer are required'
      })
    }

    // 메모리에서 정답 조회
    const storedAnswer = global.quizAnswers?.[questionId]
    if (!storedAnswer) {
      return res.status(404).json({
        success: false,
        error: 'Question not found or expired'
      })
    }

    const isCorrect = storedAnswer.correctAnswer === parseInt(answer)

    res.json({
      success: true,
      data: {
        questionId,
        userAnswer: parseInt(answer),
        correctAnswer: storedAnswer.correctAnswer,
        isCorrect,
        explanation: storedAnswer.explanation,
        correctOption: storedAnswer.correctOption
      }
    })
  } catch (error) {
    console.error('Quiz check error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to check quiz answer'
    })
  }
})

// GET /api/quiz-ai/topics - 사용 가능한 주제 목록
router.get('/topics', (req, res) => {
  try {
    const { weather } = req.query

    const allTopics = [
      { id: 'general', name: '일반상식', icon: '📚' },
      { id: 'science', name: '과학', icon: '🔬' },
      { id: 'history', name: '역사', icon: '📜' },
      { id: 'culture', name: '문화', icon: '🎭' },
      { id: 'geography', name: '지리', icon: '🗺️' },
      { id: 'sports', name: '스포츠', icon: '⚽' },
      { id: 'technology', name: '기술/IT', icon: '💻' },
      { id: 'entertainment', name: '엔터테인먼트', icon: '🎬' },
      { id: 'food', name: '음식', icon: '🍽️' },
      { id: 'nature', name: '자연', icon: '🌿' },
      { id: 'art', name: '예술', icon: '🎨' },
      { id: 'music', name: '음악', icon: '🎵' },
      { id: 'literature', name: '문학', icon: '📖' },
      { id: 'philosophy', name: '철학', icon: '🤔' },
      { id: 'psychology', name: '심리학', icon: '🧠' }
    ]

    // 날씨 기반 추천 주제
    const recommendedTopics = weather ? getWeatherBasedTopics(weather) : []

    const topicsWithRecommendation = allTopics.map(topic => ({
      ...topic,
      recommended: recommendedTopics.includes(topic.name)
    }))

    res.json({
      success: true,
      data: {
        topics: topicsWithRecommendation,
        recommendedTopics,
        weather: weather || 'any'
      }
    })
  } catch (error) {
    console.error('Topics fetch error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch topics'
    })
  }
})

// GET /api/quiz-ai/difficulties - 난이도 목록
router.get('/difficulties', (req, res) => {
  try {
    const difficulties = [
      { id: 'easy', name: '쉬움', description: '기초 수준', color: 'green' },
      { id: 'medium', name: '보통', description: '일반 수준', color: 'yellow' },
      { id: 'hard', name: '어려움', description: '고급 수준', color: 'orange' },
      { id: 'expert', name: '전문가', description: '전문가 수준', color: 'red' }
    ]

    res.json({
      success: true,
      data: { difficulties }
    })
  } catch (error) {
    console.error('Difficulties fetch error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch difficulties'
    })
  }
})

// POST /api/quiz-ai/suggest - AI 기반 퀴즈 주제 추천
router.post('/suggest', async (req, res) => {
  try {
    const { weather, time, userInterests = [], recentScores = [] } = req.body

    const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
      사용자를 위한 퀴즈 주제 3개를 추천해주세요.

      현재 상황:
      - 날씨: ${weather || '정보 없음'}
      - 시간대: ${time || getCurrentTimeContext()}
      - 사용자 관심사: ${userInterests.length > 0 ? userInterests.join(', ') : '정보 없음'}
      - 최근 점수: ${recentScores.length > 0 ? recentScores.map(s => `${s.topic}: ${s.score}%`).join(', ') : '정보 없음'}

      다음 JSON 형식으로 응답해주세요:
      {
        "suggestions": [
          {
            "topic": "주제명",
            "reason": "추천 이유",
            "difficulty": "추천 난이도 (easy/medium/hard)",
            "expectedEngagement": "high/medium/low"
          }
        ]
      }
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini')
    }

    const suggestions = JSON.parse(jsonMatch[0])

    res.json({
      success: true,
      data: suggestions
    })
  } catch (error) {
    console.error('Suggestion error:', error)

    // 폴백: 기본 추천
    const defaultSuggestions = {
      suggestions: [
        {
          topic: '일반상식',
          reason: '폭넓은 지식을 테스트할 수 있습니다',
          difficulty: 'medium',
          expectedEngagement: 'high'
        },
        {
          topic: weather ? getWeatherBasedTopics(weather)[0] : '과학',
          reason: weather ? '현재 날씨와 관련된 흥미로운 주제입니다' : '논리적 사고를 기를 수 있습니다',
          difficulty: 'medium',
          expectedEngagement: 'medium'
        },
        {
          topic: '역사',
          reason: '과거를 통해 현재를 이해할 수 있습니다',
          difficulty: 'hard',
          expectedEngagement: 'medium'
        }
      ]
    }

    res.json({
      success: true,
      data: defaultSuggestions,
      fallback: true
    })
  }
})

export default router