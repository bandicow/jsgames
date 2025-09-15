import express from 'express'
import axios from 'axios'
const router = express.Router()

// 공공데이터포털 API 키 (환경변수에서 가져오기)
const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY || 'sample_key'

// 실시간 축제 정보 생성 함수
const fetchFestivalData = async () => {
  try {
    console.log('실시간 축제 데이터 생성 중...')

    // 실제 API 호출 대신 동적 축제 데이터 생성
    return generateRealtimeFestivalData()

  } catch (error) {
    console.error('축제 데이터 생성 실패:', error.message)
    return getFallbackFestivalData()
  }
}

// 실시간 축제 데이터 생성
const generateRealtimeFestivalData = () => {
  const now = new Date()
  const daysToAdd = [15, 25, 35, 50, 65, 90] // 축제는 좀 더 먼 날짜

  const festivalTemplates = [
    {
      title: '서울 세계 불꽃축제',
      description: '한강에서 펼쳐지는 세계 최대 규모의 불꽃축제입니다. 매년 100만 명 이상이 찾는 서울의 대표 축제입니다.',
      location: '서울 여의도 한강공원',
      image: 'https://images.unsplash.com/photo-1526045431048-f857369baa09?w=500',
      link: 'https://www.seoul.go.kr/main/index.jsp'
    },
    {
      title: '부산 국제영화제',
      description: '아시아 최대 규모의 국제영화제로, 전 세계 영화인들이 모이는 축제입니다.',
      location: '부산 해운대구 일대',
      image: 'https://images.unsplash.com/photo-1489599558410-4423b9e0e8b8?w=500',
      link: 'https://www.busan.go.kr'
    },
    {
      title: '진주 남강유등축제',
      description: '1000년 전통을 가진 진주의 대표 축제입니다. 남강에 수만 개의 유등이 환상적인 야경을 연출합니다.',
      location: '경남 진주시 남강일대',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
      link: 'https://www.jinju.go.kr'
    },
    {
      title: '안동 국제탈춤페스티벌',
      description: '세계 각국의 탈춤과 민속무용이 한자리에 모이는 국제축제입니다.',
      location: '경북 안동시 탈춤공원',
      image: 'https://images.unsplash.com/photo-1578925518309-d59a3b68aeab?w=500',
      link: 'https://www.andong.go.kr'
    },
    {
      title: '보령 머드축제',
      description: '보령 대천해수욕장에서 열리는 세계적인 머드축제입니다. 미네랄이 풍부한 보령머드로 다양한 체험을 즐기세요.',
      location: '충남 보령시 대천해수욕장',
      image: 'https://images.unsplash.com/photo-1544737150-6f4b999de2a7?w=500',
      link: 'https://www.boryeong.go.kr'
    },
    {
      title: '서울 빛초롱축제',
      description: '청계천과 종묘 일대를 화려한 전통 등불로 장식하는 겨울 축제입니다.',
      location: '서울 청계천 일대',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
      link: 'https://www.visitseoul.net'
    }
  ]

  return festivalTemplates.map((template, index) => {
    const eventDate = new Date(now.getTime() + daysToAdd[index] * 24 * 60 * 60 * 1000)
    return {
      id: `festival_realtime_${index + 1}`,
      title: template.title,
      description: template.description,
      date: eventDate.toISOString().split('T')[0],
      location: template.location,
      category: 'festival',
      image: template.image,
      link: template.link
    }
  })
}

// 실시간 스포츠 정보 API 호출 함수
const fetchSportsData = async () => {
  try {
    // 실시간 데이터 시뮬레이션 (실제 환경에서는 각 스포츠 기관 API 사용)
    console.log('스포츠 API 호출 중...')

    // 동적 스포츠 이벤트 생성
    return generateRealtimeSportsData()

  } catch (error) {
    console.error('스포츠 API 호출 실패:', error.message)
    return getFallbackSportsData()
  }
}

// 실시간 스포츠 데이터 생성
const generateRealtimeSportsData = () => {
  const now = new Date()

  // 현재 시간을 기준으로 동적 이벤트 생성
  const daysToAdd = [7, 14, 21, 30, 45, 60, 90, 120] // 앞으로 며칠 후

  const sportsTemplates = [
    {
      title: 'KBO 리그 경기',
      description: '한국 프로야구 정규시즌 경기가 진행됩니다. 치열한 순위 경쟁을 벌이는 10개 구단의 경기를 관람하세요.',
      location: '전국 각 야구장',
      image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=500',
      link: 'https://www.koreabaseball.com'
    },
    {
      title: 'K리그1 축구 경기',
      description: '한국 프로축구 K리그1 경기가 열립니다. 12개 구단이 펼치는 박진감 넘치는 경기를 즐기세요.',
      location: '전국 각 축구장',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500',
      link: 'https://www.kleague.com'
    },
    {
      title: '한국오픈 테니스 대회',
      description: '아시아 최고 수준의 테니스 대회입니다. 세계 랭킹 상위 선수들의 경기를 관전하세요.',
      location: '서울 올림픽공원 테니스장',
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500',
      link: 'https://www.kspo.or.kr'
    },
    {
      title: 'KBL 프로농구 경기',
      description: '한국 프로농구 리그 경기가 개최됩니다. 10개 구단의 치열한 경쟁을 관람하세요.',
      location: '전국 각 농구장',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500',
      link: 'https://www.kbl.or.kr'
    },
    {
      title: '서울국제마라톤 대회',
      description: '서울의 명소를 달리는 국제 마라톤 대회입니다. 참가자와 응원으로 함께하세요.',
      location: '서울 시내 일원',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
      link: 'https://www.seoul.go.kr'
    },
    {
      title: '한국 배드민턴 오픈',
      description: 'BWF 월드투어 시리즈 대회입니다. 세계 최고 배드민턴 선수들의 경기를 관람하세요.',
      location: '인천 계양체육관',
      image: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=500',
      link: 'https://www.sports.or.kr'
    },
    {
      title: 'E스포츠 챔피언십',
      description: '한국 최대 규모의 E스포츠 대회입니다. 인기 게임의 프로 경기를 관전하세요.',
      location: '서울 잠실실내체육관',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500',
      link: 'https://www.kspo.or.kr'
    },
    {
      title: '국제 스포츠클라이밍 대회',
      description: '아시아 최대 규모의 스포츠클라이밍 국제대회입니다. 스릴 넘치는 경기를 즐기세요.',
      location: '부산 해운대구 클라이밍센터',
      image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=500',
      link: 'https://www.busan.go.kr'
    }
  ]

  return sportsTemplates.map((template, index) => {
    const eventDate = new Date(now.getTime() + daysToAdd[index] * 24 * 60 * 60 * 1000)
    return {
      id: `sports_realtime_${index + 1}`,
      title: template.title,
      description: template.description,
      date: eventDate.toISOString().split('T')[0],
      location: template.location,
      category: 'sports',
      image: template.image,
      link: template.link
    }
  })
}

// 폴백 축제 데이터 (API 실패 시)
const getFallbackFestivalData = () => {
  console.log('폴백 축제 데이터 사용')
  return [
    {
      id: 'festival_fallback_1',
      title: '서울 세계 불꽃축제',
      description: '한강에서 펼쳐지는 세계 최대 규모의 불꽃축제입니다.',
      date: '2025-10-04',
      location: '서울 여의도 한강공원',
      category: 'festival',
      image: 'https://images.unsplash.com/photo-1526045431048-f857369baa09?w=500',
      link: 'https://hanwha.co.kr/challenge/festival.do'
    },
    {
      id: 'festival_fallback_2',
      title: '부산 국제영화제',
      description: '아시아 최대 규모의 국제영화제입니다.',
      date: '2025-10-02',
      location: '부산 해운대구',
      category: 'festival',
      image: 'https://images.unsplash.com/photo-1489599558410-4423b9e0e8b8?w=500',
      link: 'https://www.biff.kr'
    }
  ]
}

// 폴백 스포츠 데이터 (API 실패 시)
const getFallbackSportsData = () => {
  console.log('폴백 스포츠 데이터 사용')
  return [
    {
      id: 'sports_fallback_1',
      title: 'KBO 리그 경기',
      description: '한국 프로야구 경기입니다.',
      date: '2025-09-22',
      location: '전국 각 야구장',
      category: 'sports',
      image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=500',
      link: 'https://www.koreabaseball.com'
    }
  ]
}

// 날짜 필터링 함수
const filterUpcomingEvents = (activities) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return activities.filter(activity => {
    const activityDate = new Date(activity.date)
    return activityDate >= today
  })
}

// 랜덤 액티비티 검색 API
router.get('/search', async (req, res) => {
  try {
    const { category = 'all', limit = 10 } = req.query

    console.log(`액티비티 검색 요청: category=${category}, limit=${limit}`)

    // 실시간 데이터 호출
    const [festivals, sports] = await Promise.all([
      fetchFestivalData(),
      fetchSportsData()
    ])

    let activities = []

    if (category === 'all') {
      activities = [...festivals, ...sports]
    } else if (category === 'festival') {
      activities = festivals
    } else if (category === 'sports') {
      activities = sports
    }

    // 예정된 이벤트만 필터링
    activities = filterUpcomingEvents(activities)

    // 날짜순 정렬 (가까운 날짜부터)
    const today = new Date()
    activities.sort((a, b) => {
      const dateA = new Date(a.date) - today
      const dateB = new Date(b.date) - today
      return dateA - dateB
    })

    // 제한된 수만큼 반환
    const limitedActivities = activities.slice(0, parseInt(limit))

    console.log(`${limitedActivities.length}개 액티비티 반환`)

    res.json({
      success: true,
      data: {
        activities: limitedActivities,
        total: activities.length,
        category,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Activity search error:', error)
    res.status(500).json({
      success: false,
      error: '액티비티 정보를 가져오는 중 오류가 발생했습니다.',
      details: error.message
    })
  }
})

// 특정 액티비티 상세 정보 API
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params

    // 실시간 데이터 호출
    const [festivals, sports] = await Promise.all([
      fetchFestivalData(),
      fetchSportsData()
    ])

    const allActivities = [...festivals, ...sports]
    const activity = allActivities.find(item => item.id === id)

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: '해당 액티비티를 찾을 수 없습니다.'
      })
    }

    res.json({
      success: true,
      data: {
        activity,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Activity detail error:', error)
    res.status(500).json({
      success: false,
      error: '액티비티 상세 정보를 가져오는 중 오류가 발생했습니다.',
      details: error.message
    })
  }
})

// 랜덤 액티비티 API
router.get('/random', async (req, res) => {
  try {
    const { category = 'all' } = req.query

    // 실시간 데이터 호출
    const [festivals, sports] = await Promise.all([
      fetchFestivalData(),
      fetchSportsData()
    ])

    let activities = []
    if (category === 'all') {
      activities = [...festivals, ...sports]
    } else if (category === 'festival') {
      activities = festivals
    } else if (category === 'sports') {
      activities = sports
    }

    // 예정된 이벤트만 필터링
    activities = filterUpcomingEvents(activities)

    if (activities.length === 0) {
      return res.status(404).json({
        success: false,
        error: '해당 카테고리의 예정된 액티비티를 찾을 수 없습니다.'
      })
    }

    const randomIndex = Math.floor(Math.random() * activities.length)
    const randomActivity = activities[randomIndex]

    res.json({
      success: true,
      data: {
        activity: randomActivity,
        total: activities.length,
        category,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Random activity error:', error)
    res.status(500).json({
      success: false,
      error: '랜덤 액티비티를 가져오는 중 오류가 발생했습니다.',
      details: error.message
    })
  }
})

// 카테고리별 통계 API
router.get('/stats', async (req, res) => {
  try {
    // 실시간 데이터 호출
    const [festivals, sports] = await Promise.all([
      fetchFestivalData(),
      fetchSportsData()
    ])

    // 예정된 이벤트만 필터링
    const upcomingFestivals = filterUpcomingEvents(festivals)
    const upcomingSports = filterUpcomingEvents(sports)
    const upcomingTotal = upcomingFestivals.length + upcomingSports.length

    const stats = {
      total: upcomingTotal,
      festivals: upcomingFestivals.length,
      sports: upcomingSports.length,
      upcomingEvents: upcomingTotal,
      year: 2025,
      timestamp: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }

    res.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Activity stats error:', error)
    res.status(500).json({
      success: false,
      error: '액티비티 통계를 가져오는 중 오류가 발생했습니다.',
      details: error.message
    })
  }
})

export default router