import { FC, useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useMusicStore } from '../../store/musicStore'
import { MusicTrack } from '../../types'

interface WeatherAudioPlayerProps {
  className?: string
}

const WeatherAudioPlayer: FC<WeatherAudioPlayerProps> = ({ className = '' }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const {
    currentTrack,
    isPlaying,
    isPaused,
    volume,
    currentTime,
    duration,
    isLoading,
    error,
    repeat,
    shuffle,
    audioMode,
    playTrack,
    pauseTrack,
    resumeTrack,
    stopTrack,
    nextTrack,
    previousTrack,
    setVolume,
    setCurrentTime,
    setRepeat,
    setShuffle,
    setAudioMode,
    clearError
  } = useMusicStore()

  // 오디오 이벤트 핸들러
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadStart = () => {
      useMusicStore.setState({ isLoading: true })
    }

    const handleCanPlay = () => {
      useMusicStore.setState({ 
        isLoading: false, 
        duration: audio.duration 
      })
    }

    const handleTimeUpdate = () => {
      if (!isDragging) {
        useMusicStore.setState({ currentTime: audio.currentTime })
      }
    }

    const handleEnded = () => {
      if (repeat === 'track') {
        audio.currentTime = 0
        audio.play()
      } else if (repeat === 'playlist') {
        nextTrack()
      } else {
        stopTrack()
      }
    }

    const handleError = () => {
      useMusicStore.setState({ 
        error: '음악을 재생할 수 없습니다.',
        isLoading: false,
        isPlaying: false
      })
    }

    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [isDragging, repeat, nextTrack, stopTrack])

  // 재생/일시정지 제어
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    if (isPlaying && !isPaused) {
      // 새 트랙이면 src 설정
      if (audio.src !== currentTrack.url) {
        audio.src = currentTrack.url
      }

      audio.play().catch((error) => {
        console.error('Audio playback failed:', error)
        useMusicStore.setState({
          error: '음악을 재생할 수 없습니다. 브라우저 정책상 사용자 상호작용이 필요할 수 있습니다.',
          isPlaying: false,
          isLoading: false
        })
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, isPaused, currentTrack])

  // 볼륨 제어
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  // 재생 위치 제어
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (Math.abs(audio.currentTime - currentTime) > 1) {
      audio.currentTime = currentTime
    }
  }, [currentTime])

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
  }

  const handleProgressMouseDown = () => {
    setIsDragging(true)
  }

  const handleProgressMouseUp = () => {
    setIsDragging(false)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value))
  }

  const togglePlayPause = () => {
    if (!currentTrack) return
    
    if (isPlaying) {
      pauseTrack()
    } else {
      resumeTrack()
    }
  }

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

  const getAudioModeIcon = () => {
    switch (audioMode) {
      case 'music': return '🎵'
      case 'ambient': return '🌿'
      case 'both': return '🎶'
      default: return '🎵'
    }
  }

  if (!currentTrack) {
    return (
      <div className={`glass-card p-4 ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">🎵</div>
          <p>날씨에 맞는 음악을 선택해보세요</p>
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
      {/* 숨겨진 오디오 엘리먼트 */}
      <audio
        ref={audioRef}
        src={currentTrack.url}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
          <button
            onClick={clearError}
            className="ml-2 underline hover:no-underline"
          >
            닫기
          </button>
        </div>
      )}

      {/* 트랙 정보 */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="text-2xl">{getMoodEmoji()}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{currentTrack.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {currentTrack.artist}
            {currentTrack.isAmbient && (
              <span className="ml-2 px-1.5 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded text-xs">
                환경음
              </span>
            )}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {formatTime(currentTime)} / {formatTime(duration || 0)}
        </div>
      </div>

      {/* 재생 진행바 */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleProgressChange}
            onMouseDown={handleProgressMouseDown}
            onMouseUp={handleProgressMouseUp}
            className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 
                       [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg
                       [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150
                       hover:[&::-webkit-slider-thumb]:bg-blue-600 hover:[&::-webkit-slider-thumb]:scale-110"
          />
          {/* 진행바 배경 표시 */}
          <div 
            className="absolute top-0 left-0 h-3 bg-blue-500 bg-opacity-30 rounded-lg pointer-events-none transition-all duration-100"
            style={{ 
              width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' 
            }}
          />
        </div>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        <button
          onClick={previousTrack}
          className="glass-button p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10"
          title="이전 곡"
        >
          ⏮️
        </button>
        
        <button
          onClick={togglePlayPause}
          className="glass-button p-3 rounded-full hover:bg-white/20 dark:hover:bg-white/10 text-xl"
          title={isPlaying ? "일시정지" : "재생"}
          disabled={isLoading}
        >
          {isLoading ? '⏳' : (isPlaying ? '⏸️' : '▶️')}
        </button>
        
        <button
          onClick={nextTrack}
          className="glass-button p-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10"
          title="다음 곡"
        >
          ⏭️
        </button>
      </div>

      {/* 추가 컨트롤 */}
      <div className="flex items-center justify-between">
        {/* 볼륨 컨트롤 */}
        <div className="flex items-center space-x-2 flex-1 max-w-32">
          <span className="text-sm">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
          />
        </div>

        {/* 모드 및 옵션 버튼 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAudioMode(audioMode === 'music' ? 'ambient' : audioMode === 'ambient' ? 'both' : 'music')}
            className={`glass-button px-2 py-1 rounded text-sm hover:bg-white/20 dark:hover:bg-white/10`}
            title="오디오 모드 전환"
          >
            {getAudioModeIcon()}
          </button>
          
          <button
            onClick={() => setShuffle(!shuffle)}
            className={`glass-button px-2 py-1 rounded text-sm hover:bg-white/20 dark:hover:bg-white/10 ${
              shuffle ? 'text-blue-500' : ''
            }`}
            title="셔플"
          >
            🔀
          </button>
          
          <button
            onClick={() => setRepeat(repeat === 'none' ? 'playlist' : repeat === 'playlist' ? 'track' : 'none')}
            className={`glass-button px-2 py-1 rounded text-sm hover:bg-white/20 dark:hover:bg-white/10 ${
              repeat !== 'none' ? 'text-blue-500' : ''
            }`}
            title={`반복: ${repeat === 'none' ? '없음' : repeat === 'track' ? '한 곡' : '전체'}`}
          >
            {repeat === 'track' ? '🔂' : repeat === 'playlist' ? '🔁' : '🔁'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default WeatherAudioPlayer