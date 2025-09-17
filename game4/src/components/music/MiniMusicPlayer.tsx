import { FC } from 'react'
import { motion } from 'framer-motion'
import { useMusicStore } from '../../store/musicStore'
import { useWeatherStore } from '../../store/weatherStore'

interface MiniMusicPlayerProps {
  className?: string
}

const MiniMusicPlayer: FC<MiniMusicPlayerProps> = ({ className = '' }) => {
  const {
    isPlaying,
    volume,
    setVolume,
    pauseTrack,
    resumeTrack,
    youtubeTrackTitle,
    youtubeTrackArtist
  } = useMusicStore()

  const { currentMood } = useWeatherStore()

  // YouTube 플레이어에서 현재 재생 중인 트랙 정보 가져오기
  const getCurrentTrackInfo = () => {
    // Store에서 YouTube 트랙 정보 가져오기
    if (youtubeTrackTitle && youtubeTrackArtist) {
      return {
        title: youtubeTrackTitle,
        artist: youtubeTrackArtist
      }
    }
    // 기본값: 현재 무드 표시
    if (isPlaying && currentMood) {
      return {
        title: '한국 음악 재생 중',
        artist: getMoodDescription(currentMood)
      }
    }
    return null
  }

  const getMoodEmoji = () => {
    if (!currentMood) return '🎵'

    const moodEmojis = {
      sunny_upbeat: '☀️',
      cloudy_chill: '☁️',
      rain_lofi: '🌧️',
      storm_energetic: '⛈️',
      snow_cozy: '❄️',
      mist_ambient: '🌫️',
      heat_tropical: '🌴',
      cold_warmup: '🔥'
    }

    return moodEmojis[currentMood as keyof typeof moodEmojis] || '🎵'
  }

  const getMoodDescription = (mood: string) => {
    const moodDescriptions = {
      sunny_upbeat: '맑은 날의 경쾌한 음악',
      cloudy_chill: '구름 낀 날의 차분한 음악',
      rain_lofi: '비오는 날의 감성적인 음악',
      storm_energetic: '폭풍우의 역동적인 음악',
      snow_cozy: '눈 내리는 날의 포근한 음악',
      mist_ambient: '안개 낀 날의 신비로운 음악',
      heat_tropical: '더운 날의 트로피컬 음악',
      cold_warmup: '추운 날을 녹이는 따뜻한 음악'
    }
    return moodDescriptions[mood as keyof typeof moodDescriptions] || '음악'
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseTrack()
    } else {
      resumeTrack()
    }
  }

  const currentTrackInfo = getCurrentTrackInfo()

  if (!currentTrackInfo && !isPlaying) {
    return (
      <div className={`glass-card p-3 ${className}`}>
        <div className="text-center">
          <div className="text-2xl mb-2">🎵</div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            재생 중인 음악이 없습니다
          </p>
          <p className="text-xs text-gray-500 mt-1">
            음악 탭에서 재생하세요
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-3 ${className}`}
    >
      {/* 현재 재생 트랙 정보 */}
      <div className="flex items-center space-x-2 mb-3">
        <div className="text-lg">{getMoodEmoji()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate text-sm">
            {currentTrackInfo ? currentTrackInfo.title : '음악 재생 중'}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {currentTrackInfo ? currentTrackInfo.artist : getMoodDescription(currentMood || 'sunny_upbeat')}
          </p>
        </div>
      </div>

      {/* YouTube 플레이어 상태 표시 */}
      <div className="mb-3 px-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>YouTube 음악 플레이어</span>
          <span className={`px-2 py-0.5 rounded-full ${
            isPlaying
              ? 'bg-green-500/20 text-green-600 dark:text-green-400'
              : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
          }`}>
            {isPlaying ? '재생 중' : '일시 정지'}
          </span>
        </div>
      </div>

      {/* 빠른 컨트롤 */}
      <div className="flex items-center justify-center mb-3">
        <button
          onClick={togglePlayPause}
          className="glass-button px-4 py-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 flex items-center space-x-2"
          title={isPlaying ? "일시정지" : "재생"}
        >
          <span>{isPlaying ? '⏸️' : '▶️'}</span>
          <span className="text-sm">{isPlaying ? '일시정지' : '재생'}</span>
        </button>
      </div>

      {/* 볼륨 컨트롤 */}
      <div className="flex items-center space-x-2">
        <span className="text-xs">🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
        />
        <span className="text-xs text-gray-500 min-w-[2ch]">{Math.round(volume * 100)}%</span>
      </div>

      {/* 빠른 음악 설정 */}
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">빠른 설정</h5>

        {/* 음악 섹션으로 이동 버튼 */}
        <button
          onClick={() => {
            // MusicCard가 있는 섹션으로 스크롤
            const musicSection = document.querySelector('.music-card-section')
            if (musicSection) {
              musicSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }}
          className="w-full glass-button p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 text-xs mb-2"
        >
          <div className="flex items-center justify-between">
            <span>🎵 음악 플레이어 열기</span>
            <span>→</span>
          </div>
        </button>

        {/* 날씨별 음악 추천 */}
        {currentMood && (
          <div className="text-xs text-gray-500 text-center">
            <p className="mb-1">현재 날씨 음악</p>
            <div className="flex items-center justify-center space-x-1">
              <span>{getMoodEmoji()}</span>
              <span className="text-xs">{currentMood.replace('_', ' ')}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// 시간 포맷 함수
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default MiniMusicPlayer