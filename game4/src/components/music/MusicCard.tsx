import { FC, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWeatherStore } from '../../store/weatherStore'
import { useMusicStore } from '../../store/musicStore'
import WeatherAudioPlayer from './WeatherAudioPlayer'
import WeatherMusicRecommendations from './WeatherMusicRecommendations'
import MusicSearch from './MusicSearch'
import { MoodToken } from '../../types'

interface MusicCardProps {
  className?: string
}

const MusicCard: FC<MusicCardProps> = ({ className = '' }) => {
  const { weather, currentMood } = useWeatherStore()
  const { currentTrack, isPlaying, initializeMusic, loadWeatherMusic, isInitialized } = useMusicStore()
  const [showFullPlayer, setShowFullPlayer] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // 음악 시스템 초기화 및 날씨 변화에 따른 음악 업데이트
  useEffect(() => {
    if (!isInitialized) {
      // 첫 초기화 - 현재 무드가 있으면 사용, 없으면 기본값
      initializeMusic(currentMood || MoodToken.SUNNY_UPBEAT)
    } else if (currentMood) {
      // 이미 초기화되었지만 날씨가 변한 경우 음악 업데이트
      loadWeatherMusic(currentMood)
    }
  }, [currentMood, isInitialized, initializeMusic, loadWeatherMusic])

  const getMoodTitle = (mood: MoodToken | null): string => {
    if (!mood) return '🎵 음악'
    
    const titles = {
      [MoodToken.SUNNY_UPBEAT]: '☀️ 화창한 날의 음악',
      [MoodToken.CLOUDY_CHILL]: '☁️ 구름 낀 날의 여유',
      [MoodToken.RAIN_LOFI]: '🌧️ 비오는 날의 감성',
      [MoodToken.STORM_ENERGETIC]: '⛈️ 폭풍우의 에너지',
      [MoodToken.SNOW_COZY]: '❄️ 눈오는 날의 포근함',
      [MoodToken.MIST_AMBIENT]: '🌫️ 안개 낀 신비로운 분위기',
      [MoodToken.HEAT_TROPICAL]: '🌴 뜨거운 여름의 트로피컬',
      [MoodToken.COLD_WARMUP]: '🔥 추운 날의 따뜻함'
    }
    return titles[mood] || '🎵 음악'
  }

  const getMoodDescription = (mood: MoodToken | null): string => {
    if (!mood) return '날씨에 맞는 음악을 들어보세요'
    
    const descriptions = {
      [MoodToken.SUNNY_UPBEAT]: '밝고 경쾌한 음악으로 활기찬 하루를',
      [MoodToken.CLOUDY_CHILL]: '차분한 분위기의 음악으로 편안한 시간을',
      [MoodToken.RAIN_LOFI]: '비오는 날에 어울리는 감성적인 음악을',
      [MoodToken.STORM_ENERGETIC]: '역동적인 음악으로 에너지를 충전하세요',
      [MoodToken.SNOW_COZY]: '포근한 음악과 함께 겨울을 따뜻하게',
      [MoodToken.MIST_AMBIENT]: '신비로운 앰비언트 음악으로 몽환적 분위기를',
      [MoodToken.HEAT_TROPICAL]: '트로피컬 음악으로 시원한 여름을',
      [MoodToken.COLD_WARMUP]: '따뜻한 음악으로 추위를 녹여보세요'
    }
    return descriptions[mood] || '날씨에 맞는 음악을 들어보세요'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass-card p-6 cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 ${className}`}
    >
      {/* 카드 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">
            {currentMood ? (
              currentMood === MoodToken.SUNNY_UPBEAT ? '☀️' :
              currentMood === MoodToken.RAIN_LOFI ? '🌧️' :
              currentMood === MoodToken.SNOW_COZY ? '❄️' :
              currentMood === MoodToken.STORM_ENERGETIC ? '⛈️' :
              currentMood === MoodToken.CLOUDY_CHILL ? '☁️' :
              currentMood === MoodToken.MIST_AMBIENT ? '🌫️' :
              currentMood === MoodToken.HEAT_TROPICAL ? '🌴' :
              currentMood === MoodToken.COLD_WARMUP ? '🔥' : '🎵'
            ) : '🎵'}
          </div>
          <div>
            <h3 className="text-xl font-bold">{getMoodTitle(currentMood)}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getMoodDescription(currentMood)}
            </p>
          </div>
        </div>
        {currentTrack && isPlaying && (
          <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
            <span className="animate-pulse">🎵</span>
            <span>재생 중</span>
          </div>
        )}
      </div>

      {/* 현재 날씨 정보 */}
      {weather && (
        <div className="mb-4 p-3 bg-white/20 dark:bg-white/10 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">현재 날씨:</span>
            <span className="font-medium">{weather.description} {weather.temperature}°C</span>
          </div>
        </div>
      )}

      {/* 현재 재생 중인 트랙 (있는 경우) */}
      {currentTrack && (
        <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {currentTrack.isAmbient ? '🌿' : '🎵'}
              </span>
              <div>
                <p className="font-medium text-sm">{currentTrack.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{currentTrack.artist}</p>
              </div>
            </div>
            <div className="text-blue-600 dark:text-blue-400">
              {isPlaying ? '▶️' : '⏸️'}
            </div>
          </div>
        </div>
      )}

      {/* 음악 재생 컨트롤 */}
      {!currentTrack && (
        <div className="mb-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-3">
            날씨에 맞는 음악을 시작해보세요
          </p>
          <button
            onClick={() => {
              // 첫 번째 추천 음악 재생
              initializeMusic(currentMood || MoodToken.SUNNY_UPBEAT)
            }}
            className="w-full glass-button p-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 font-medium"
          >
            ▶ 음악 재생 시작
          </button>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="space-y-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowRecommendations(!showRecommendations)
            if (showRecommendations) {
              setShowSearch(false)
            }
          }}
          className="w-full glass-button p-3 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 text-left flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <span>🎶</span>
            <span>날씨 음악 추천</span>
          </span>
          <span className="text-sm">
            {showRecommendations ? '▼' : '▶'}
          </span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowSearch(!showSearch)
            if (showSearch) {
              setShowRecommendations(false)
            }
          }}
          className="w-full glass-button p-3 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 text-left flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <span>🔍</span>
            <span>음악 검색</span>
          </span>
          <span className="text-sm">
            {showSearch ? '▼' : '▶'}
          </span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowFullPlayer(!showFullPlayer)
          }}
          className="w-full glass-button p-3 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 text-left flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <span>🎛️</span>
            <span>전체 플레이어</span>
          </span>
          <span className="text-sm">
            {showFullPlayer ? '▼' : '▶'}
          </span>
        </button>
      </div>

      {/* 확장된 음악 추천 */}
      {showRecommendations && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 overflow-hidden"
        >
          <WeatherMusicRecommendations />
        </motion.div>
      )}

      {/* 확장된 음악 검색 */}
      {showSearch && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 overflow-hidden"
        >
          <MusicSearch />
        </motion.div>
      )}

      {/* 확장된 음악 플레이어 */}
      {showFullPlayer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 overflow-hidden"
        >
          <WeatherAudioPlayer />
        </motion.div>
      )}
    </motion.div>
  )
}

export default MusicCard