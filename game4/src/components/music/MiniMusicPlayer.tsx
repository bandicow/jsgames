import { FC } from 'react'
import { motion } from 'framer-motion'
import { useMusicStore } from '../../store/musicStore'

interface MiniMusicPlayerProps {
  className?: string
}

const MiniMusicPlayer: FC<MiniMusicPlayerProps> = ({ className = '' }) => {
  const {
    currentTrack,
    isPlaying,
    volume,
    playTrack,
    pauseTrack,
    resumeTrack,
    nextTrack,
    previousTrack,
    setVolume
  } = useMusicStore()

  const getMoodEmoji = () => {
    if (!currentTrack) return '🎵'
    
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
    
    return moodEmojis[currentTrack.mood as keyof typeof moodEmojis] || '🎵'
  }

  const togglePlayPause = () => {
    if (!currentTrack) return
    
    if (isPlaying) {
      pauseTrack()
    } else {
      resumeTrack()
    }
  }

  if (!currentTrack) {
    return (
      <div className={`glass-card p-3 ${className}`}>
        <div className="text-center">
          <div className="text-2xl mb-2">🎵</div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            재생 중인 음악이 없습니다
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
          <h4 className="font-medium truncate text-sm">{currentTrack.title}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {currentTrack.artist}
          </p>
        </div>
      </div>

      {/* 기본 컨트롤 */}
      <div className="flex items-center justify-center space-x-2 mb-2">
        <button
          onClick={previousTrack}
          className="glass-button p-1.5 rounded-md hover:bg-white/20 dark:hover:bg-white/10 text-sm"
          title="이전 곡"
        >
          ⏮️
        </button>
        
        <button
          onClick={togglePlayPause}
          className="glass-button p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10"
          title={isPlaying ? "일시정지" : "재생"}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <button
          onClick={nextTrack}
          className="glass-button p-1.5 rounded-md hover:bg-white/20 dark:hover:bg-white/10 text-sm"
          title="다음 곡"
        >
          ⏭️
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

      {/* 트랙 타입 표시 */}
      {currentTrack.isAmbient && (
        <div className="mt-2 text-center">
          <span className="px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs">
            환경음
          </span>
        </div>
      )}
    </motion.div>
  )
}

export default MiniMusicPlayer