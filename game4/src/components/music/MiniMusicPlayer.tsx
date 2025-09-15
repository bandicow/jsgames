import { FC, useState, useEffect, useRef } from 'react'
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
    currentTime,
    duration,
    playTrack,
    pauseTrack,
    resumeTrack,
    nextTrack,
    previousTrack,
    setVolume,
    setCurrentTime
  } = useMusicStore()

  const [localCurrentTime, setLocalCurrentTime] = useState(0)
  const [localDuration, setLocalDuration] = useState(30) // 기본 30초
  const [isDragging, setIsDragging] = useState(false)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // 재생 시간 업데이트
  useEffect(() => {
    if (!isPlaying || isDragging || !currentTrack) return

    const interval = setInterval(() => {
      setLocalCurrentTime(prev => {
        if (prev >= localDuration) {
          // 트랙 끝에 도달하면 다음 트랙으로
          nextTrack()
          return 0
        }
        return prev + 0.1
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying, isDragging, localDuration, nextTrack, currentTrack])

  // 트랙 변경 시 시간 초기화
  useEffect(() => {
    setLocalCurrentTime(0)
    // 실제 duration이 있으면 사용, 없으면 30초 기본값
    setLocalDuration(duration || 30)
  }, [currentTrack, duration])

  // 재생 상태가 바뀐때 시간 동기화
  useEffect(() => {
    if (!isPlaying) {
      // 재생이 멈췄을 때는 현재 위치 유지
      // 재생바는 안 움직임
    }
  }, [isPlaying])

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

      {/* 재생 진행바 */}
      <div className="mb-3">
        <div
          ref={progressBarRef}
          className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden cursor-pointer relative"
          onClick={(e) => {
            if (!progressBarRef.current) return
            const rect = progressBarRef.current.getBoundingClientRect()
            const x = e.clientX - rect.left
            const percentage = x / rect.width
            const newTime = percentage * localDuration
            setLocalCurrentTime(newTime)
            setCurrentTime(newTime)
          }}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-100"
            style={{ width: `${(localCurrentTime / localDuration) * 100}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-100"
            style={{ left: `calc(${(localCurrentTime / localDuration) * 100}% - 6px)` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{formatTime(localCurrentTime)}</span>
          <span>{formatTime(localDuration)}</span>
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

// 시간 포맷 함수
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default MiniMusicPlayer