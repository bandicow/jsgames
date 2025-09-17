import express from 'express'
import fetch from 'node-fetch'

const router = express.Router()

// 별자리 한영 매핑
const ZODIAC_SIGNS = {
  'aries': { name_kr: '양자리', name_en: 'aries', dates: '3/21 - 4/19', element: 'fire', symbol: '♈' },
  'taurus': { name_kr: '황소자리', name_en: 'taurus', dates: '4/20 - 5/20', element: 'earth', symbol: '♉' },
  'gemini': { name_kr: '쌍둥이자리', name_en: 'gemini', dates: '5/21 - 6/20', element: 'air', symbol: '♊' },
  'cancer': { name_kr: '게자리', name_en: 'cancer', dates: '6/21 - 7/22', element: 'water', symbol: '♋' },
  'leo': { name_kr: '사자자리', name_en: 'leo', dates: '7/23 - 8/22', element: 'fire', symbol: '♌' },
  'virgo': { name_kr: '처녀자리', name_en: 'virgo', dates: '8/23 - 9/22', element: 'earth', symbol: '♍' },
  'libra': { name_kr: '천칭자리', name_en: 'libra', dates: '9/23 - 10/22', element: 'air', symbol: '♎' },
  'scorpio': { name_kr: '전갈자리', name_en: 'scorpio', dates: '10/23 - 11/21', element: 'water', symbol: '♏' },
  'sagittarius': { name_kr: '궁수자리', name_en: 'sagittarius', dates: '11/22 - 12/21', element: 'fire', symbol: '♐' },
  'capricorn': { name_kr: '염소자리', name_en: 'capricorn', dates: '12/22 - 1/19', element: 'earth', symbol: '♑' },
  'aquarius': { name_kr: '물병자리', name_en: 'aquarius', dates: '1/20 - 2/18', element: 'air', symbol: '♒' },
  'pisces': { name_kr: '물고기자리', name_en: 'pisces', dates: '2/19 - 3/20', element: 'water', symbol: '♓' }
}

// 운세 번역 함수
const translateHoroscope = (description) => {
  // 간단한 키워드 기반 번역 (실제로는 더 정교한 번역 시스템 필요)
  const translations = {
    'love': '사랑',
    'career': '직업',
    'money': '금전',
    'health': '건강',
    'family': '가족',
    'friends': '친구',
    'lucky': '행운의',
    'today': '오늘',
    'tomorrow': '내일',
    'good': '좋은',
    'bad': '나쁜',
    'excellent': '훌륭한',
    'positive': '긍정적인',
    'negative': '부정적인'
  }

  let translatedDescription = description
  Object.keys(translations).forEach(en => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi')
    translatedDescription = translatedDescription.replace(regex, translations[en])
  })

  return translatedDescription
}

// 모든 별자리 목록 조회
router.get('/signs', (req, res) => {
  try {
    const signs = Object.keys(ZODIAC_SIGNS).map(key => ({
      sign: key,
      ...ZODIAC_SIGNS[key]
    }))

    res.json({
      success: true,
      data: signs
    })
  } catch (error) {
    console.error('별자리 목록 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '별자리 목록 조회에 실패했습니다'
    })
  }
})

// 폴백 운세 데이터 - 모든 별자리 포함
const FALLBACK_HOROSCOPES = {
  'aries': {
    description: "Today is a day of bold action and new beginnings. Your natural leadership qualities will shine, and others will look to you for guidance.",
    description_kr: "오늘은 대담한 행동과 새로운 시작의 날입니다. 당신의 타고난 리더십이 빛을 발하며, 다른 사람들이 당신의 지도를 구할 것입니다.",
    mood: "대담한",
    color: "빨간색",
    lucky_number: 7,
    lucky_time: "오후 2시-3시",
    compatibility: "사자자리"
  },
  'taurus': {
    description: "Stability and patience are your strengths today. Focus on building solid foundations for your future goals.",
    description_kr: "안정감과 인내심이 오늘의 강점입니다. 미래 목표를 위한 견고한 기반을 구축하는 데 집중하세요.",
    mood: "안정적인",
    color: "초록색",
    lucky_number: 6,
    lucky_time: "오전 9시-10시",
    compatibility: "처녀자리"
  },
  'gemini': {
    description: "Communication and networking open new doors today. Your wit and charm will help you connect with important people.",
    description_kr: "소통과 네트워킹이 새로운 기회의 문을 열어줍니다. 당신의 재치와 매력이 중요한 인물들과의 연결을 도울 것입니다.",
    mood: "활발한",
    color: "노란색",
    lucky_number: 5,
    lucky_time: "오후 1시-2시",
    compatibility: "물병자리"
  },
  'cancer': {
    description: "Emotional intuition guides you to make the right decisions. Trust your feelings and nurture your relationships.",
    description_kr: "감정적 직관이 올바른 결정으로 이끌어줍니다. 당신의 감정을 믿고 인간관계를 소중히 가꾸세요.",
    mood: "감성적인",
    color: "은색",
    lucky_number: 2,
    lucky_time: "저녁 6시-7시",
    compatibility: "전갈자리"
  },
  'leo': {
    description: "Your creativity and confidence are at their peak today. It's an excellent time to showcase your talents and take center stage.",
    description_kr: "오늘 당신의 창의력과 자신감이 절정에 달합니다. 재능을 뽐내고 무대의 중심에 서기에 최적의 시간입니다.",
    mood: "당당한",
    color: "금색",
    lucky_number: 1,
    lucky_time: "오전 10시-11시",
    compatibility: "양자리"
  },
  'virgo': {
    description: "Attention to detail and practical thinking lead to successful outcomes. Organization is key to your progress today.",
    description_kr: "세심한 주의력과 실용적 사고가 성공적인 결과로 이끕니다. 체계적인 정리가 오늘 발전의 열쇠입니다.",
    mood: "꼼꼼한",
    color: "갈색",
    lucky_number: 8,
    lucky_time: "오전 8시-9시",
    compatibility: "황소자리"
  },
  'libra': {
    description: "Balance and harmony bring peace to your life today. Diplomatic solutions will resolve any conflicts gracefully.",
    description_kr: "균형과 조화가 오늘 당신의 삶에 평화를 가져다줍니다. 외교적 해결책이 모든 갈등을 우아하게 해결할 것입니다.",
    mood: "우아한",
    color: "분홍색",
    lucky_number: 6,
    lucky_time: "오후 4시-5시",
    compatibility: "쌍둥이자리"
  },
  'scorpio': {
    description: "Deep transformation and powerful insights emerge today. Trust your inner strength to overcome any challenges.",
    description_kr: "깊은 변화와 강력한 통찰이 오늘 나타납니다. 어떤 도전도 극복할 수 있는 내면의 힘을 믿으세요.",
    mood: "신비로운",
    color: "검은색",
    lucky_number: 9,
    lucky_time: "저녁 8시-9시",
    compatibility: "게자리"
  },
  'sagittarius': {
    description: "Adventure and learning expand your horizons today. New experiences will bring wisdom and joy to your journey.",
    description_kr: "모험과 학습이 오늘 당신의 시야를 넓혀줍니다. 새로운 경험들이 여정에 지혜와 기쁨을 가져다 줄 것입니다.",
    mood: "모험적인",
    color: "보라색",
    lucky_number: 3,
    lucky_time: "오후 3시-4시",
    compatibility: "양자리"
  },
  'capricorn': {
    description: "Hard work and dedication pay off in meaningful ways today. Your persistence will lead to long-term success.",
    description_kr: "노력과 헌신이 오늘 의미 있는 방식으로 보상받습니다. 당신의 끈기가 장기적인 성공으로 이끌 것입니다.",
    mood: "성실한",
    color: "회색",
    lucky_number: 10,
    lucky_time: "오전 7시-8시",
    compatibility: "황소자리"
  },
  'aquarius': {
    description: "Innovation and original thinking lead you to unexpected discoveries. Trust your intuition and embrace unconventional solutions.",
    description_kr: "혁신과 독창적 사고가 예상치 못한 발견으로 이끕니다. 직감을 믿고 관습에 얽매이지 않는 해결책을 받아들이세요.",
    mood: "독창적인",
    color: "하늘색",
    lucky_number: 11,
    lucky_time: "저녁 7시-8시",
    compatibility: "쌍둥이자리"
  },
  'pisces': {
    description: "Compassion and creativity flow naturally today. Your empathetic nature will help others and bring you inner peace.",
    description_kr: "연민과 창의성이 오늘 자연스럽게 흘러나옵니다. 당신의 공감능력이 다른 사람들을 도우며 내면의 평화를 가져다줄 것입니다.",
    mood: "감성적인",
    color: "바다색",
    lucky_number: 12,
    lucky_time: "저녁 9시-10시",
    compatibility: "게자리"
  }
}

// 운세 조회 API
router.post('/daily', async (req, res) => {
  try {
    const { sign, day = 'today' } = req.body

    if (!sign) {
      return res.status(400).json({
        success: false,
        error: '별자리를 선택해주세요'
      })
    }

    if (!ZODIAC_SIGNS[sign.toLowerCase()]) {
      return res.status(400).json({
        success: false,
        error: '올바르지 않은 별자리입니다'
      })
    }

    if (!['today', 'tomorrow', 'yesterday'].includes(day)) {
      return res.status(400).json({
        success: false,
        error: '올바르지 않은 날짜입니다 (today, tomorrow, yesterday만 가능)'
      })
    }

    console.log(`🔮 운세 요청: ${sign} - ${day}`)

    let horoscopeData
    let isFromAPI = false

    try {
      // Aztro API 호출 시도
      const aztroUrl = `https://aztro.sameerkumar.website/?sign=${sign.toLowerCase()}&day=${day}`
      const response = await fetch(aztroUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000 // 5초 타임아웃
      })

      if (response.ok) {
        horoscopeData = await response.json()
        isFromAPI = true
        console.log('✨ Aztro API 응답 받음:', horoscopeData)
      } else {
        throw new Error(`Aztro API 오류: ${response.status}`)
      }
    } catch (apiError) {
      console.log('⚠️ Aztro API 사용 불가, 폴백 데이터 사용:', apiError.message)

      // 폴백 데이터 사용
      const fallbackData = FALLBACK_HOROSCOPES[sign.toLowerCase()] || FALLBACK_HOROSCOPES['leo']
      horoscopeData = {
        current_date: new Date().toLocaleDateString(),
        date_range: ZODIAC_SIGNS[sign.toLowerCase()].dates,
        description: fallbackData.description,
        compatibility: fallbackData.compatibility,
        mood: fallbackData.mood,
        color: fallbackData.color,
        lucky_number: fallbackData.lucky_number,
        lucky_time: fallbackData.lucky_time
      }
    }

    // 응답 데이터 가공
    const result = {
      success: true,
      data: {
        sign: sign.toLowerCase(),
        sign_info: ZODIAC_SIGNS[sign.toLowerCase()],
        day: day,
        current_date: horoscopeData.current_date,
        date_range: horoscopeData.date_range,
        description: horoscopeData.description,
        description_kr: isFromAPI ? translateHoroscope(horoscopeData.description) : (FALLBACK_HOROSCOPES[sign.toLowerCase()]?.description_kr || "오늘은 좋은 하루가 될 것입니다."),
        compatibility: horoscopeData.compatibility,
        mood: horoscopeData.mood,
        color: horoscopeData.color,
        lucky_number: horoscopeData.lucky_number,
        lucky_time: horoscopeData.lucky_time,
        generated_at: new Date().toISOString(),
        source: isFromAPI ? 'aztro_api' : 'fallback'
      }
    }

    res.json(result)

  } catch (error) {
    console.error('🚨 운세 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '운세 조회에 실패했습니다'
    })
  }
})

// 타로카드 조회 API
router.get('/tarot/random', async (req, res) => {
  try {
    const { count = 1 } = req.query
    const cardCount = Math.min(parseInt(count), 3) // 최대 3장까지

    console.log(`🔮 타로카드 요청: ${cardCount}장`)

    // 타로카드 API 호출
    const response = await fetch(`https://tarotapi.dev/api/v1/cards/random?n=${cardCount}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
      timeout: 5000
    })

    if (!response.ok) {
      throw new Error(`Tarot API 오류: ${response.status}`)
    }

    const data = await response.json()

    // 데이터 변환 및 한국어 처리
    const processedCards = data.cards.map(card => ({
      ...card,
      meaning_up_kr: translateTarotMeaning(card.meaning_up),
      meaning_rev_kr: translateTarotMeaning(card.meaning_rev),
      desc_kr: translateTarotDesc(card.desc)
    }))

    res.json({
      success: true,
      data: {
        cards: processedCards,
        total: data.nhits,
        generated_at: new Date().toISOString()
      }
    })

    console.log(`✨ 타로카드 응답: ${processedCards.length}장 반환`)

  } catch (error) {
    console.error('🚨 타로카드 조회 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '타로카드 조회에 실패했습니다'
    })
  }
})

// 타로카드 의미 번역 함수
const translateTarotMeaning = (meaning) => {
  const translations = {
    'love': '사랑', 'success': '성공', 'happiness': '행복', 'money': '금전',
    'career': '직업', 'health': '건강', 'family': '가족', 'friendship': '우정',
    'power': '권력', 'energy': '에너지', 'wisdom': '지혜', 'courage': '용기',
    'change': '변화', 'journey': '여행', 'hope': '희망', 'fear': '두려움',
    'loss': '상실', 'gain': '획득', 'conflict': '갈등', 'peace': '평화',
    'strength': '힘', 'weakness': '약함', 'truth': '진실', 'deception': '속임',
    'new beginnings': '새로운 시작', 'endings': '끝', 'transformation': '변화'
  }

  let translated = meaning
  Object.keys(translations).forEach(en => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi')
    translated = translated.replace(regex, translations[en])
  })

  return translated
}

// 타로카드 설명 번역 함수 (간단한 요약)
const translateTarotDesc = (desc) => {
  // 너무 길어서 간단히 요약된 한국어 설명으로 변환
  const cardDescriptions = {
    'fool': '새로운 시작과 모험을 상징하는 카드입니다.',
    'magician': '의지력과 창조력을 나타내는 카드입니다.',
    'high priestess': '직감과 내면의 지혜를 의미합니다.',
    'empress': '풍요로움과 창조성을 상징합니다.',
    'emperor': '권위와 안정성을 나타냅니다.',
    'hierophant': '전통과 정신적 지도를 의미합니다.',
    'lovers': '사랑과 선택의 기로를 상징합니다.',
    'chariot': '의지력과 승리를 나타냅니다.',
    'strength': '내면의 힘과 용기를 의미합니다.',
    'hermit': '성찰과 내면의 빛을 상징합니다.',
    'wheel': '운명의 변화와 순환을 나타냅니다.',
    'justice': '정의와 균형을 의미합니다.',
    'hanged': '희생과 새로운 관점을 상징합니다.',
    'death': '변화와 재생을 나타냅니다.',
    'temperance': '조화와 절제를 의미합니다.',
    'devil': '유혹과 속박을 상징합니다.',
    'tower': '급작스러운 변화와 깨달음을 나타냅니다.',
    'star': '희망과 영감을 의미합니다.',
    'moon': '환상과 무의식을 상징합니다.',
    'sun': '기쁨과 성공을 나타냅니다.',
    'judgement': '재생과 각성을 의미합니다.',
    'world': '완성과 성취를 상징합니다.'
  }

  // 카드 이름에 따라 간단한 한국어 설명 반환
  for (const [key, value] of Object.entries(cardDescriptions)) {
    if (desc.toLowerCase().includes(key)) {
      return value
    }
  }

  return '타로카드가 전하는 신비로운 메시지입니다.'
}

// 생년월일로 별자리 계산
router.get('/calculate-sign', (req, res) => {
  try {
    const { month, day } = req.query

    if (!month || !day) {
      return res.status(400).json({
        success: false,
        error: '월(month)과 일(day)을 모두 입력해주세요'
      })
    }

    const monthInt = parseInt(month)
    const dayInt = parseInt(day)

    if (monthInt < 1 || monthInt > 12 || dayInt < 1 || dayInt > 31) {
      return res.status(400).json({
        success: false,
        error: '올바른 월일을 입력해주세요'
      })
    }

    // 별자리 계산 로직
    let calculatedSign = ''

    if ((monthInt === 3 && dayInt >= 21) || (monthInt === 4 && dayInt <= 19)) {
      calculatedSign = 'aries'
    } else if ((monthInt === 4 && dayInt >= 20) || (monthInt === 5 && dayInt <= 20)) {
      calculatedSign = 'taurus'
    } else if ((monthInt === 5 && dayInt >= 21) || (monthInt === 6 && dayInt <= 20)) {
      calculatedSign = 'gemini'
    } else if ((monthInt === 6 && dayInt >= 21) || (monthInt === 7 && dayInt <= 22)) {
      calculatedSign = 'cancer'
    } else if ((monthInt === 7 && dayInt >= 23) || (monthInt === 8 && dayInt <= 22)) {
      calculatedSign = 'leo'
    } else if ((monthInt === 8 && dayInt >= 23) || (monthInt === 9 && dayInt <= 22)) {
      calculatedSign = 'virgo'
    } else if ((monthInt === 9 && dayInt >= 23) || (monthInt === 10 && dayInt <= 22)) {
      calculatedSign = 'libra'
    } else if ((monthInt === 10 && dayInt >= 23) || (monthInt === 11 && dayInt <= 21)) {
      calculatedSign = 'scorpio'
    } else if ((monthInt === 11 && dayInt >= 22) || (monthInt === 12 && dayInt <= 21)) {
      calculatedSign = 'sagittarius'
    } else if ((monthInt === 12 && dayInt >= 22) || (monthInt === 1 && dayInt <= 19)) {
      calculatedSign = 'capricorn'
    } else if ((monthInt === 1 && dayInt >= 20) || (monthInt === 2 && dayInt <= 18)) {
      calculatedSign = 'aquarius'
    } else if ((monthInt === 2 && dayInt >= 19) || (monthInt === 3 && dayInt <= 20)) {
      calculatedSign = 'pisces'
    }

    res.json({
      success: true,
      data: {
        birth_date: { month: monthInt, day: dayInt },
        calculated_sign: calculatedSign,
        sign_info: ZODIAC_SIGNS[calculatedSign]
      }
    })

  } catch (error) {
    console.error('별자리 계산 오류:', error)
    res.status(500).json({
      success: false,
      error: error.message || '별자리 계산에 실패했습니다'
    })
  }
})

export default router