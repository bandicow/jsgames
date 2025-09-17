import { FC } from 'react'
import MusicCard from '../music/MusicCard'
import AIQuizCard from '../quiz/AIQuizCard'
import WorldExplorer from '../world/WorldExplorer'
import ActivityCard from '../activity/ActivityCard'
import NewsCard from '../news/NewsCard'
import GameHub from '../games/GameHub'
import { useWeatherStore } from '../../store/weatherStore'

const MainContent: FC = () => {
  const { weather, currentMood } = useWeatherStore()

  // 무드 메시지 매핑
  const getMoodDisplay = () => {
    if (!weather || !currentMood) {
      return {
        title: '날씨 정보 로딩 중... 🌤️',
        description: '잠시만 기다려주세요. 날씨에 맞는 콘텐츠를 준비하고 있어요!'
      }
    }

    const moodMessages = {
      sunny_upbeat: {
        title: '현재 무드: 맑음 상쾌 ☀️',
        description: '밝은 햇살처럼 상쾌한 하루! 활기찬 콘텐츠로 에너지를 충전하세요!'
      },
      cloudy_chill: {
        title: '현재 무드: 구름 여유 ☁️',
        description: '잔잔한 구름 같은 차분한 시간. 여유롭게 즐길 수 있는 콘텐츠를 준비했어요!'
      },
      rain_lofi: {
        title: '현재 무드: 비 감성 🌧️',
        description: '빗소리와 함께하는 집중의 시간. 차분한 분위기에서 즐기세요!'
      },
      storm_energetic: {
        title: '현재 무드: 폭풍 역동 ⛈️',
        description: '폭풍우처럼 역동적인 에너지! 강렬한 도전을 즐겨보세요!'
      },
      snow_cozy: {
        title: '현재 무드: 눈 포근 ❄️',
        description: '눈 내리는 포근한 날. 따뜻한 실내에서 즐기는 특별한 시간!'
      },
      mist_ambient: {
        title: '현재 무드: 안개 신비 🌫️',
        description: '안개처럼 몽환적인 분위기. 신비로운 콘텐츠와 함께하세요!'
      },
      heat_tropical: {
        title: '현재 무드: 더위 열정 🏝️',
        description: '뜨거운 열정의 시간! 시원한 콘텐츠로 더위를 날려버리세요!'
      },
      cold_warmup: {
        title: '현재 무드: 추위 따뜻 🧥',
        description: '추운 날씨를 따뜻하게! 마음까지 데워줄 콘텐츠를 만나보세요!'
      }
    }

    return moodMessages[currentMood] || {
      title: '현재 무드 탐색 중... 🌈',
      description: '새로운 날씨 무드를 분석하고 있어요. 곧 맞춤형 콘텐츠를 제공할게요!'
    }
  }

  const moodDisplay = getMoodDisplay()

  return (
    <main className="space-y-6">
      {/* 동적 무드 상태 표시 */}
      <div className="glass-card p-6 text-center">
        <h2 className="text-2xl font-bold mb-2 text-gradient">
          {moodDisplay.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-3">
          {moodDisplay.description}
        </p>
        
        {/* 현재 날씨 정보 */}
        {weather && (
          <div className="flex justify-center items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 dark:bg-white/5 rounded-full">
              <span>🌡️</span>
              <span>{Math.round(weather.temperature)}°C</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 dark:bg-white/5 rounded-full">
              <span>💨</span>
              <span>{weather.windSpeed}m/s</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 dark:bg-white/5 rounded-full">
              <span>💧</span>
              <span>{weather.humidity}%</span>
            </div>
          </div>
        )}
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 음악 카드 - 첫 번째 위치 */}
        <div className="md:col-span-2">
          <MusicCard />
        </div>

        {/* AI 퀴즈 카드 - Gemini 기반 */}
        <div className="md:col-span-2">
          <AIQuizCard />
        </div>

        {/* 세상 둘러보기 카드 */}
        <div className="md:col-span-2">
          <WorldExplorer />
        </div>

        {/* 액티비티 카드 */}
        <div className="md:col-span-2">
          <ActivityCard />
        </div>

        {/* AI 뉴스 요약 카드 */}
        <div className="md:col-span-2">
          <NewsCard />
        </div>

        {/* 게임 허브 카드 */}
        <div className="md:col-span-2">
          <GameHub />
        </div>
      </div>
    </main>
  )
}

export default MainContent