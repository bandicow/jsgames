import { FC, useState, useEffect, useRef } from 'react'
import YouTube, { YouTubeProps } from 'react-youtube'
import { motion } from 'framer-motion'
import { useMusicStore } from '../../store/musicStore'
import { useWeatherStore } from '../../store/weatherStore'

interface YouTubeTrack {
  videoId: string
  title: string
  artist: string
  thumbnail: string
  duration?: number
}

// 서버에서 YouTube 음악 데이터 가져오기
const fetchYouTubeMusicFromServer = async (mood: string): Promise<YouTubeTrack[]> => {
  try {
    const response = await fetch(`http://localhost:3005/api/youtube/search?mood=${mood}`)
    if (!response.ok) {
      throw new Error('Failed to fetch music')
    }
    const data = await response.json()
    if (data.success && data.data?.tracks) {
      return data.data.tracks
    }
    return []
  } catch (error) {
    console.error('Failed to fetch YouTube music from server:', error)
    // 서버 요청 실패시 빈 배열 반환
    return []
  }
}

const YouTubeMusicPlayer: FC = () => {
  const { currentMood } = useWeatherStore()
  const {
    isPlaying,
    volume,
    setVolume,
    pauseTrack,
    resumeTrack,
    setYoutubeTrackInfo
  } = useMusicStore()

  const [player, setPlayer] = useState<any>(null)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [playlist, setPlaylist] = useState<YouTubeTrack[]>([])
  const [_isReady, setIsReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(false)
  const intervalRef = useRef<number | null>(null)

  // 현재 트랙
  const currentTrack = playlist[currentTrackIndex]

  // 날씨에 따른 플레이리스트 설정
  useEffect(() => {
    const loadPlaylist = async () => {
      setIsLoadingPlaylist(true)
      const moodKey = currentMood || 'sunny_upbeat'

      // 서버에서 음악 데이터 가져오기
      const tracks = await fetchYouTubeMusicFromServer(moodKey)

      if (tracks.length > 0) {
        setPlaylist(tracks)
        setCurrentTrackIndex(0)
      }
      setIsLoadingPlaylist(false)
    }

    loadPlaylist()
  }, [currentMood])

  // 현재 트랙이 변경될 때마다 store에 정보 업데이트
  useEffect(() => {
    if (currentTrack) {
      setYoutubeTrackInfo(currentTrack.title, currentTrack.artist)
    }
  }, [currentTrack, setYoutubeTrackInfo])

  // YouTube 플레이어 옵션
  const opts: YouTubeProps['opts'] = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      loop: 0,  // 루프 비활성화 (관련 동영상 자동 재생 방지)
      rel: 0,  // 관련 동영상 표시 안 함
      iv_load_policy: 3,
      cc_load_policy: 0,
      playsinline: 1,
      enablejsapi: 1,
      origin: window.location.origin,
      fs: 0,  // 전체 화면 버튼 비활성화
      disablekb: 1  // 키보드 컨트롤 비활성화
    }
  }

  // 플레이어 준비 완료
  const onReady = (event: any) => {
    setPlayer(event.target)
    setIsReady(true)
    event.target.setVolume(volume * 100)
    // 명시적으로 현재 트랙의 비디오 로드
    if (currentTrack) {
      event.target.cueVideoById(currentTrack.videoId)
      if (isPlaying) {
        event.target.playVideo()
      }
    }
  }

  // 재생 상태 변경
  const onStateChange = (event: any) => {
    if (event.data === 0) { // 종료
      handleNext()
    }
    if (event.data === 1) { // 재생 중
      setDuration(event.target.getDuration())
      startTimeUpdate()
    }
    if (event.data === 2) { // 일시정지
      stopTimeUpdate()
    }
  }

  // 시간 업데이트 시작
  const startTimeUpdate = () => {
    // 기존 인터벌이 있으면 먼저 정리
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
    }

    // 새로운 인터벌 시작
    intervalRef.current = window.setInterval(() => {
      if (player) {
        const time = player.getCurrentTime()
        setCurrentTime(time)
      }
    }, 100) // 100ms마다 업데이트 (더 부드러운 프로그레스 바)
  }

  // 시간 업데이트 중지
  const stopTimeUpdate = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopTimeUpdate()
    }
  }, [])

  // 재생/일시정지 토글
  const togglePlay = () => {
    if (!player) return

    if (isPlaying) {
      player.pauseVideo()
      pauseTrack()
    } else {
      player.playVideo()
      resumeTrack()
    }
  }

  // 다음 트랙
  const handleNext = () => {
    const nextIndex = (currentTrackIndex + 1) % playlist.length
    setCurrentTrackIndex(nextIndex)
    setCurrentTime(0) // 재생 시간 초기화
    if (player && playlist[nextIndex]) {
      // 명시적으로 비디오 ID만 전달
      player.loadVideoById({
        videoId: playlist[nextIndex].videoId,
        startSeconds: 0
      })
    }
  }

  // 이전 트랙
  const handlePrevious = () => {
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1
    setCurrentTrackIndex(prevIndex)
    setCurrentTime(0) // 재생 시간 초기화
    if (player && playlist[prevIndex]) {
      // 명시적으로 비디오 ID만 전달
      player.loadVideoById({
        videoId: playlist[prevIndex].videoId,
        startSeconds: 0
      })
    }
  }

  // 볼륨 변경
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (player) {
      player.setVolume(newVolume * 100)
    }
  }

  // 시간 포맷
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 진행바 클릭
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!player || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const seekTime = percentage * duration
    player.seekTo(seekTime, true)
    setCurrentTime(seekTime) // 즉시 UI 업데이트
  }

  return (
    <div className="glass-card p-6 space-y-6">
      {/* 숨겨진 YouTube 플레이어 */}
      <div style={{ display: 'none' }}>
        {currentTrack && (
          <YouTube
            videoId={currentTrack.videoId}
            opts={opts}
            onReady={onReady}
            onStateChange={onStateChange}
          />
        )}
      </div>

      {/* 현재 재생 중인 트랙 정보 */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <motion.h3
            key={currentTrack?.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg font-bold text-gray-800 dark:text-white"
          >
            {isLoadingPlaylist ? '플레이리스트 로딩 중...' : (currentTrack?.title || '트랙을 선택하세요')}
          </motion.h3>
          <motion.p
            key={currentTrack?.artist}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            {currentTrack?.artist || '아티스트'}
          </motion.p>
        </div>

        {/* 현재 날씨 표시 */}
        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            현재 날씨 음악
          </p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentMood?.replace('_', ' ') || 'sunny upbeat'}
          </p>
        </div>
      </div>

      {/* 진행바 */}
      <div className="space-y-2">
        <div
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer overflow-hidden"
          onClick={handleSeek}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            initial={{ width: 0 }}
            animate={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handlePrevious}
          className="glass-button p-3 rounded-full hover:bg-white/20 dark:hover:bg-white/10"
          disabled={playlist.length === 0}
          title="이전 곡"
        >
          ⏮️
        </button>

        <button
          onClick={togglePlay}
          className="glass-button p-4 rounded-full hover:bg-white/20 dark:hover:bg-white/10 text-2xl"
          disabled={!currentTrack}
          title={isPlaying ? "일시정지" : "재생"}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>

        <button
          onClick={handleNext}
          className="glass-button p-3 rounded-full hover:bg-white/20 dark:hover:bg-white/10"
          disabled={playlist.length === 0}
          title="다음 곡"
        >
          ⏭️
        </button>
      </div>

      {/* 볼륨 컨트롤 */}
      <div className="flex items-center space-x-3">
        <span className="text-sm">🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3ch]">
          {Math.round(volume * 100)}%
        </span>
      </div>

      {/* 플레이리스트 */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          플레이리스트 ({playlist.length}곡)
        </h4>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {playlist.map((track, index) => (
            <motion.div
              key={`${track.videoId}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-2 rounded cursor-pointer transition-colors duration-200 ${
                index === currentTrackIndex
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-white/10 dark:hover:bg-white/5'
              }`}
              onClick={() => {
                setCurrentTrackIndex(index)
                setCurrentTime(0)
                if (player) {
                  player.loadVideoById({
                    videoId: track.videoId,
                    startSeconds: 0
                  })
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-500 min-w-[2ch]">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {track.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {track.artist}
                  </p>
                </div>
                {index === currentTrackIndex && (
                  <span className="text-xs">
                    {isPlaying ? '▶️' : '⏸️'}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoadingPlaylist && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            음악을 불러오는 중...
          </p>
        </div>
      )}
    </div>
  )
}

export default YouTubeMusicPlayer