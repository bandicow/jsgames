import { FC } from 'react'
import BaseCard from '../cards/BaseCard'

const MainContent: FC = () => {
  // 임시 카드 데이터
  const cards = [
    { id: 1, type: 'music', title: '🎵 무드 음악', content: '오늘의 날씨에 어울리는 음악 추천' },
    { id: 2, type: 'quiz', title: '🧠 퀴즈 타임', content: '두뇌를 깨우는 재미있는 퀴즈' },
    { id: 3, type: 'random', title: '🎲 랜덤 즐길거리', content: '우주 사진과 재미있는 사실' },
    { id: 4, type: 'activity', title: '💡 액티비티', content: '날씨에 맞는 활동 추천' },
    { id: 5, type: 'news', title: '📰 간단 정보', content: '오늘의 유용한 정보' },
    { id: 6, type: 'game', title: '🎮 미니게임', content: '간단한 브라우저 게임' },
  ]

  return (
    <main className="space-y-6">
      {/* 무드 상태 표시 */}
      <div className="glass-card p-6 text-center">
        <h2 className="text-2xl font-bold mb-2 text-gradient">
          현재 무드: 맑음 상쾌 ☀️
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          맑은 날씨에 어울리는 콘텐츠를 준비했어요!
        </p>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <BaseCard key={card.id} {...card} />
        ))}
      </div>
    </main>
  )
}

export default MainContent