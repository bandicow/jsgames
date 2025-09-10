import { FC, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useMusicStore } from '../../store/musicStore'
import { useWeatherStore } from '../../store/weatherStore'
import { MusicTrack, MoodToken } from '../../types'

interface WeatherMusicRecommendationsProps {
  className?: string
}

const WeatherMusicRecommendations: FC<WeatherMusicRecommendationsProps> = ({ className = '' }) => {
  const { currentMood, weather } = useWeatherStore()
  const {
    recommendations,
    weatherMappings,
    audioMode,
    currentTrack,
    isPlaying,
    playTrack,
    loadWeatherMusic
  } = useMusicStore()

  // 날씨 변화시 음악 추천 업데이트
  useEffect(() => {
    if (currentMood) {
      loadWeatherMusic(currentMood)
    }
  }, [currentMood, audioMode, loadWeatherMusic])

  const getCurrentMapping = () => {
    return weatherMappings.find(mapping => mapping.mood === currentMood)
  }

  const getMoodTitle = (mood: MoodToken): string => {
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
    return titles[mood] || '🎵 음악 추천'
  }

  const getGenreEmoji = (genre: string): string => {
    const emojis: { [key: string]: string } = {
      'pop': '🎤',
      'rock': '🎸',
      'jazz': '🎺',
      'classical': '🎻',
      'electronic': '🎛️',
      'hip-hop': '🎧',
      'lo-fi': '📻',
      'ambient': '🌌',
      'folk': '🪕',
      'reggae': '🌴',
      'latin': '💃',
      'r&b': '🎼',
      'indie': '🎭',
      'acoustic': '🪕'
    }
    return emojis[genre] || '🎵'
  }

  const handleTrackPlay = (track: MusicTrack) => {
    playTrack(track)
  }

  const currentMapping = getCurrentMapping()

  if (!currentMood || !weather) {
    return (
      <div className={`glass-card p-4 ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p>날씨 기반 음악을 준비중...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-4 ${className}`}
    >
      {/* 헤더 */}
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">
          {getMoodTitle(currentMood)}
        </h3>
        {currentMapping && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {audioMode === 'music' 
              ? currentMapping.musicDescription
              : audioMode === 'ambient' 
                ? currentMapping.ambientDescription
                : '음악과 환경음을 함께 즐겨보세요'
            }
          </p>
        )}
      </div>

      {/* 음악 장르 태그 */}
      {currentMapping && audioMode !== 'ambient' && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {currentMapping.musicGenres.slice(0, 4).map((genre) => (
              <span
                key={genre}
                className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-xs flex items-center gap-1"
              >
                {getGenreEmoji(genre)}
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 추천 트랙 목록 */}
      <div className="space-y-2">
        {recommendations.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
            <div className="text-2xl mb-2">🎵</div>
            <p>이 날씨에 맞는 음악을 준비중입니다.</p>
          </div>
        ) : (
          recommendations.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-button p-3 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 cursor-pointer transition-all ${
                currentTrack?.id === track.id && isPlaying 
                  ? 'ring-2 ring-blue-500/50 bg-blue-500/10' 
                  : ''
              }`}
              onClick={() => handleTrackPlay(track)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {track.isAmbient ? '🌿' : '🎵'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate text-sm">
                        {track.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {track.artist}
                        {track.isAmbient && (
                          <span className="ml-2 px-1 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded text-xs">
                            환경음
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </span>
                  {currentTrack?.id === track.id && isPlaying ? (
                    <span className="text-blue-500">▶️</span>
                  ) : (
                    <span className="text-gray-400 group-hover:text-gray-600">▶️</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* 현재 날씨 정보 */}
      <div className="mt-4 pt-4 border-t border-gray-200/20 dark:border-gray-700/20">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>현재 날씨:</span>
          <span>{weather.description} {weather.temperature}°C</span>
        </div>
        {currentMapping && (
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
            <span>에너지 레벨:</span>
            <span className="flex items-center gap-1">
              {currentMapping.energyLevel === 'high' && '🔥 높음'}
              {currentMapping.energyLevel === 'medium' && '⚡ 보통'}
              {currentMapping.energyLevel === 'low' && '🌙 낮음'}
            </span>
          </div>
        )}
      </div>

      {/* 오디오 모드 선택 */}
      <div className="mt-3 flex justify-center">
        <div className="flex bg-gray-200/20 dark:bg-gray-700/20 rounded-lg p-1">
          {['music', 'ambient', 'both'].map((mode) => (
            <button
              key={mode}
              onClick={() => useMusicStore.getState().setAudioMode(mode as any)}
              className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                audioMode === mode
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              {mode === 'music' && '🎵 음악'}
              {mode === 'ambient' && '🌿 환경음'}
              {mode === 'both' && '🎶 둘다'}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default WeatherMusicRecommendations