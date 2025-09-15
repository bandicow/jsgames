import { create } from 'zustand'
import { MusicTrack, MusicPlaylist, AudioState, WeatherMusicMapping, MoodToken } from '../types'

interface MusicState extends AudioState {
  // 플레이리스트 및 트랙
  playlists: MusicPlaylist[]
  recommendations: MusicTrack[]
  weatherMappings: WeatherMusicMapping[]
  isInitialized: boolean
  
  // 액션
  initializeMusic: (mood?: MoodToken) => void
  loadWeatherMusic: (mood: MoodToken) => void
  playTrack: (track: MusicTrack, playlist?: MusicPlaylist) => void
  pauseTrack: () => void
  resumeTrack: () => void
  stopTrack: () => void
  nextTrack: () => void
  previousTrack: () => void
  setVolume: (volume: number) => void
  setCurrentTime: (time: number) => void
  setRepeat: (repeat: 'none' | 'track' | 'playlist') => void
  setShuffle: (shuffle: boolean) => void
  setAudioMode: (mode: 'music' | 'ambient' | 'both') => void
  clearError: () => void
}

// 날씨별 음악 매핑 데이터
const WEATHER_MUSIC_MAPPINGS: WeatherMusicMapping[] = [
  {
    mood: MoodToken.SUNNY_UPBEAT,
    musicGenres: ['pop', 'reggae', 'indie', 'electronic'],
    ambientSounds: ['birds', 'gentle_wind', 'nature'],
    energyLevel: 'high',
    musicDescription: '밝고 경쾌한 음악으로 활기찬 하루를 시작해보세요',
    ambientDescription: '새소리와 바람소리로 상쾌한 아침을 연출해보세요'
  },
  {
    mood: MoodToken.CLOUDY_CHILL,
    musicGenres: ['lo-fi', 'chillhop', 'jazz', 'acoustic'],
    ambientSounds: ['soft_wind', 'distant_traffic', 'cafe_ambience'],
    energyLevel: 'medium',
    musicDescription: '차분한 분위기의 음악으로 편안한 시간을 보내세요',
    ambientDescription: '부드러운 바람소리와 함께 여유로운 시간을 만끽하세요'
  },
  {
    mood: MoodToken.RAIN_LOFI,
    musicGenres: ['lo-fi', 'ambient', 'neo-soul', 'downtempo'],
    ambientSounds: ['rain_light', 'rain_heavy', 'thunder_distant', 'window_rain'],
    energyLevel: 'low',
    musicDescription: '비오는 날에 어울리는 감성적인 음악을 들어보세요',
    ambientDescription: '빗소리와 함께 집중력을 높이고 마음을 진정시켜보세요'
  },
  {
    mood: MoodToken.STORM_ENERGETIC,
    musicGenres: ['rock', 'electronic', 'dramatic', 'cinematic'],
    ambientSounds: ['thunder_close', 'storm_wind', 'rain_storm'],
    energyLevel: 'high',
    musicDescription: '폭풍우와 어울리는 역동적인 음악으로 에너지를 충전하세요',
    ambientDescription: '천둥소리와 폭풍우로 자연의 웅장함을 느껴보세요'
  },
  {
    mood: MoodToken.SNOW_COZY,
    musicGenres: ['folk', 'acoustic', 'indie', 'classical'],
    ambientSounds: ['fireplace', 'wind_gentle', 'snow_falling'],
    energyLevel: 'low',
    musicDescription: '눈오는 날의 포근함을 더해주는 따뜻한 음악',
    ambientDescription: '벽난로 소리와 함께 겨울의 포근함을 만끽하세요'
  },
  {
    mood: MoodToken.MIST_AMBIENT,
    musicGenres: ['ambient', 'post-rock', 'drone', 'minimalist'],
    ambientSounds: ['mist', 'distant_water', 'forest_ambience'],
    energyLevel: 'low',
    musicDescription: '안개 낀 날의 신비로운 분위기를 연출하는 앰비언트 음악',
    ambientDescription: '안개와 물소리로 몽환적인 분위기를 만들어보세요'
  },
  {
    mood: MoodToken.HEAT_TROPICAL,
    musicGenres: ['tropical', 'reggaeton', 'bossa nova', 'latin'],
    ambientSounds: ['tropical_birds', 'ocean_waves', 'palm_trees'],
    energyLevel: 'high',
    musicDescription: '더위를 시원하게 날려버릴 트로피컬 음악',
    ambientDescription: '파도소리와 열대새 소리로 휴양지 분위기를 연출하세요'
  },
  {
    mood: MoodToken.COLD_WARMUP,
    musicGenres: ['warm indie', 'soul', 'r&b', 'cozy folk'],
    ambientSounds: ['fireplace', 'indoor_ambience', 'warm_cafe'],
    energyLevel: 'medium',
    musicDescription: '추운 날씨를 따뜻하게 만들어줄 음악',
    ambientDescription: '벽난로와 따뜻한 실내 분위기로 몸과 마음을 녹여보세요'
  }
]

// 무드 토큰을 API 키로 변환하는 매핑
const MOOD_TO_API_KEY = {
  [MoodToken.SUNNY_UPBEAT]: 'sunny_upbeat',
  [MoodToken.RAIN_LOFI]: 'rain_lofi',
  [MoodToken.CLOUDY_CHILL]: 'cloudy_chill',
  [MoodToken.SNOW_COZY]: 'snow_cozy',
  [MoodToken.STORM_ENERGETIC]: 'storm_energetic',
  [MoodToken.MIST_AMBIENT]: 'mist_ambient',
  [MoodToken.HEAT_TROPICAL]: 'heat_tropical',
  [MoodToken.COLD_WARMUP]: 'cold_warmup'
}

import { createApiUrl } from '../utils/api'

// API에서 음악 트랙을 가져오는 함수
const fetchMusicFromAPI = async (mood: MoodToken): Promise<MusicTrack[]> => {
  try {
    const moodKey = MOOD_TO_API_KEY[mood]
    if (!moodKey) return []

    const response = await fetch(createApiUrl(`/music/search?mood=${moodKey}&limit=10`))
    const data = await response.json()
    
    if (!data.success || !data.data.tracks) {
      console.error('Failed to fetch music from API:', data.error)
      return []
    }

    // API 응답을 MusicTrack 형식으로 변환
    return data.data.tracks.map((track: any) => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      duration: track.duration,
      url: track.url,
      genre: Array.isArray(track.genre) ? track.genre : [track.genre],
      mood: mood,
      isAmbient: track.isAmbient || false,
      artwork: track.artwork,
      iTunesUrl: track.iTunesUrl
    }))
  } catch (error) {
    console.error('Error fetching music from API:', error)
    return []
  }
}

export const useMusicStore = create<MusicState>((set, get) => ({
  // 초기 오디오 상태
  currentTrack: null,
  currentPlaylist: null,
  isPlaying: false,
  isPaused: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  error: null,
  repeat: 'none',
  shuffle: false,
  audioMode: 'both',
  
  // 초기 데이터
  playlists: [],
  recommendations: [],
  weatherMappings: WEATHER_MUSIC_MAPPINGS,
  isInitialized: false,
  
  // 음악 시스템 초기화 (자동 재생 포함)
  initializeMusic: async (mood?: MoodToken) => {
    const { isInitialized } = get()
    if (isInitialized) return

    // 기본 무드 설정 (맑은 날씨)
    const defaultMood = mood || MoodToken.SUNNY_UPBEAT

    // 날씨 음악 로드하고 완료 대기
    await get().loadWeatherMusic(defaultMood)

    // 로드 완료 후 첫 번째 트랙 자동 재생
    const { recommendations } = get()
    if (recommendations.length > 0) {
      const firstTrack = recommendations[0]
      get().playTrack(firstTrack)
    }

    set({ isInitialized: true })
  },
  
  // 날씨별 음악 로드 (실제 API 사용)
  loadWeatherMusic: async (mood: MoodToken) => {
    const mapping = WEATHER_MUSIC_MAPPINGS.find(m => m.mood === mood)
    if (!mapping) return
    
    set({ isLoading: true, error: null })
    
    try {
      // 실제 API에서 음악 데이터 가져오기
      const tracks = await fetchMusicFromAPI(mood)
      
      if (tracks.length === 0) {
        throw new Error('음악을 찾을 수 없습니다.')
      }
      
      const { audioMode } = get()
      let recommendations: MusicTrack[] = []
      
      // audioMode에 따라 필터링
      if (audioMode === 'music') {
        recommendations = tracks.filter(track => !track.isAmbient)
      } else if (audioMode === 'ambient') {
        recommendations = tracks.filter(track => track.isAmbient)
        // ambient 트랙이 없으면 전체를 ambient로 처리
        if (recommendations.length === 0) {
          recommendations = tracks.slice(0, 3).map(track => ({ ...track, isAmbient: true }))
        }
      } else {
        recommendations = tracks
      }
      
      set({ 
        recommendations, 
        isLoading: false, 
        error: null 
      })
      
    } catch (error) {
      console.error('Failed to load weather music:', error)
      set({ 
        recommendations: [],
        isLoading: false, 
        error: error instanceof Error ? error.message : '음악 로드에 실패했습니다.' 
      })
    }
  },
  
  // 트랙 재생
  playTrack: (track: MusicTrack, playlist?: MusicPlaylist) => {
    set({ 
      currentTrack: track,
      currentPlaylist: playlist || null,
      isPlaying: true,
      isPaused: false,
      isLoading: true,
      error: null
    })
    
    // 실제 오디오 재생은 컴포넌트에서 처리
  },
  
  // 일시 정지
  pauseTrack: () => {
    set({ isPlaying: false, isPaused: true })
  },
  
  // 재생 재개
  resumeTrack: () => {
    const { currentTrack } = get()
    if (currentTrack) {
      set({ isPlaying: true, isPaused: false })
    }
  },
  
  // 재생 중지
  stopTrack: () => {
    set({ 
      isPlaying: false, 
      isPaused: false, 
      currentTime: 0 
    })
  },
  
  // 다음 트랙
  nextTrack: () => {
    const { currentPlaylist, currentTrack, shuffle, recommendations } = get()

    let tracks: MusicTrack[] = []
    if (currentPlaylist) {
      tracks = currentPlaylist.tracks
    } else if (recommendations.length > 0) {
      tracks = recommendations
    } else {
      return
    }

    if (tracks.length === 0) return

    let nextIndex = 0
    if (currentTrack) {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack.id)
      if (currentIndex !== -1) {
        if (shuffle) {
          nextIndex = Math.floor(Math.random() * tracks.length)
        } else {
          nextIndex = (currentIndex + 1) % tracks.length
        }
      }
    }

    const nextTrack = tracks[nextIndex]
    // 다음 트랙 재생 시 자동으로 재생 상태로 설정
    set({
      currentTrack: nextTrack,
      currentPlaylist: currentPlaylist || null,
      isPlaying: true,
      isPaused: false,
      isLoading: true,
      error: null,
      currentTime: 0 // 새 트랙이므로 시간 초기화
    })
  },
  
  // 이전 트랙
  previousTrack: () => {
    const { currentPlaylist, currentTrack, shuffle, recommendations } = get()

    let tracks: MusicTrack[] = []
    if (currentPlaylist) {
      tracks = currentPlaylist.tracks
    } else if (recommendations.length > 0) {
      tracks = recommendations
    } else {
      return
    }

    if (tracks.length === 0) return

    let prevIndex = 0
    if (currentTrack) {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack.id)
      if (currentIndex !== -1) {
        if (shuffle) {
          prevIndex = Math.floor(Math.random() * tracks.length)
        } else {
          prevIndex = currentIndex === 0 ? tracks.length - 1 : currentIndex - 1
        }
      }
    }

    const prevTrack = tracks[prevIndex]
    // 이전 트랙 재생 시 자동으로 재생 상태로 설정
    set({
      currentTrack: prevTrack,
      currentPlaylist: currentPlaylist || null,
      isPlaying: true,
      isPaused: false,
      isLoading: true,
      error: null,
      currentTime: 0 // 새 트랙이므로 시간 초기화
    })
  },
  
  // 볼륨 설정
  setVolume: (volume: number) => {
    set({ volume: Math.max(0, Math.min(1, volume)) })
  },
  
  // 재생 위치 설정
  setCurrentTime: (time: number) => {
    set({ currentTime: time })
  },
  
  // 반복 모드 설정
  setRepeat: (repeat: 'none' | 'track' | 'playlist') => {
    set({ repeat })
  },
  
  // 셔플 모드 설정
  setShuffle: (shuffle: boolean) => {
    set({ shuffle })
  },
  
  // 오디오 모드 설정
  setAudioMode: (mode: 'music' | 'ambient' | 'both') => {
    set({ audioMode: mode })
    
    // 현재 추천 목록 업데이트
    const { recommendations } = get()
    if (recommendations.length > 0) {
      const currentMood = recommendations[0]?.mood
      if (currentMood) {
        get().loadWeatherMusic(currentMood)
      }
    }
  },
  
  // 에러 클리어
  clearError: () => {
    set({ error: null })
  }
}))