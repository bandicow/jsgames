// 날씨 관련 타입
export interface CurrentWeather {
  location: string
  temperature: number
  feelsLike: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  visibility: number
  uvi: number
  timestamp: number
}

export interface ForecastData {
  hourly: HourlyForecast[]
  daily: DailyForecast[]
}

export interface HourlyForecast {
  time: number
  temperature: number
  condition: string
  precipitationProbability?: number
}

export interface DailyForecast {
  date: number
  tempMin: number
  tempMax: number
  condition: string
  precipitationProbability?: number
}

export interface AQIData {
  aqi: number
  level: 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous'
  pm25?: number
  pm10?: number
  o3?: number
  no2?: number
}

// 무드 토큰 타입
export enum MoodToken {
  SUNNY_UPBEAT = 'sunny_upbeat',
  CLOUDY_CHILL = 'cloudy_chill',
  RAIN_LOFI = 'rain_lofi',
  STORM_ENERGETIC = 'storm_energetic',
  SNOW_COZY = 'snow_cozy',
  MIST_AMBIENT = 'mist_ambient',
  HEAT_TROPICAL = 'heat_tropical',
  COLD_WARMUP = 'cold_warmup',
}

// 카드 타입
export interface Card {
  id: string
  type: CardType
  title: string
  content: string
  metadata?: any
  priority?: number
}

export enum CardType {
  MUSIC = 'music',
  QUIZ = 'quiz',
  RANDOM = 'random',
  ACTIVITY = 'activity',
  NEWS = 'news',
  GAME = 'game',
  WEATHER = 'weather',
}

// 음악 관련 타입
export interface MusicTrack {
  id: string
  title: string
  artist: string
  album?: string
  duration: number // 초 단위
  url: string
  thumbnail?: string
  genre: string[]
  mood: MoodToken
  isAmbient: boolean // 환경음 여부
}

export interface MusicPlaylist {
  id: string
  name: string
  mood: MoodToken
  tracks: MusicTrack[]
  isDefault: boolean // 기본 제공 플레이리스트
  thumbnail?: string
}

export interface AudioState {
  currentTrack: MusicTrack | null
  currentPlaylist: MusicPlaylist | null
  isPlaying: boolean
  isPaused: boolean
  volume: number // 0-1
  currentTime: number
  duration: number
  isLoading: boolean
  error: string | null
  repeat: 'none' | 'track' | 'playlist'
  shuffle: boolean
  audioMode: 'music' | 'ambient' | 'both'
}

export interface WeatherMusicMapping {
  mood: MoodToken
  musicGenres: string[]
  ambientSounds: string[]
  energyLevel: 'low' | 'medium' | 'high'
  musicDescription: string
  ambientDescription: string
}

// 퀴즈 관련 타입
export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number // 정답 인덱스 (0-based)
  explanation?: string
  category: QuizCategory
  difficulty: QuizDifficulty
  tags?: string[]
  weatherContext?: MoodToken[] // 특정 날씨에 맞는 퀴즈
  timeContext?: TimeOfDay[] // 특정 시간대에 맞는 퀴즈
}

export enum QuizCategory {
  GENERAL = 'general', // 일반상식
  SCIENCE = 'science', // 과학
  HISTORY = 'history', // 역사
  CULTURE = 'culture', // 문화
  GEOGRAPHY = 'geography', // 지리
  SPORTS = 'sports', // 스포츠
  ENTERTAINMENT = 'entertainment', // 연예/오락
  TECHNOLOGY = 'technology', // 기술/IT
  FOOD = 'food', // 음식
  WEATHER = 'weather', // 날씨 관련
  CURRENT = 'current', // 시사
  LITERATURE = 'literature', // 문학
}

export enum QuizDifficulty {
  EASY = 'easy', // 쉬움
  MEDIUM = 'medium', // 보통
  HARD = 'hard', // 어려움
}

export enum TimeOfDay {
  MORNING = 'morning', // 오전 (6-12시)
  AFTERNOON = 'afternoon', // 오후 (12-18시)
  EVENING = 'evening', // 저녁 (18-22시)
  NIGHT = 'night', // 밤 (22-6시)
}

export interface QuizSession {
  id: string
  questions: QuizQuestion[]
  currentQuestionIndex: number
  userAnswers: (number | null)[]
  score: number
  totalQuestions: number
  startTime: number
  endTime?: number
  category?: QuizCategory
  difficulty?: QuizDifficulty
  weatherContext?: MoodToken
  timeContext?: TimeOfDay
}

export interface QuizStats {
  totalQuizzesTaken: number
  totalQuestionsAnswered: number
  totalCorrectAnswers: number
  averageScore: number
  categoryStats: Record<QuizCategory, {
    attempted: number
    correct: number
    accuracy: number
  }>
  difficultyStats: Record<QuizDifficulty, {
    attempted: number
    correct: number
    accuracy: number
  }>
  bestStreak: number
  currentStreak: number
  lastPlayedAt?: number
}

export interface QuizState {
  currentSession: QuizSession | null
  availableQuestions: QuizQuestion[]
  stats: QuizStats
  isLoading: boolean
  error: string | null
  
  // Actions
  startQuiz: (options?: QuizStartOptions) => Promise<void>
  answerQuestion: (answerIndex: number) => void
  nextQuestion: () => void
  finishQuiz: () => void
  fetchQuestions: (options?: QuizFetchOptions) => Promise<void>
  resetQuiz: () => void
  updateStats: () => void
}

export interface QuizStartOptions {
  category?: QuizCategory
  difficulty?: QuizDifficulty
  questionCount?: number
  weatherContext?: MoodToken
  timeContext?: TimeOfDay
}

export interface QuizFetchOptions {
  category?: QuizCategory
  difficulty?: QuizDifficulty
  weatherContext?: MoodToken
  timeContext?: TimeOfDay
  limit?: number
}

// 사용자 설정
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  location?: {
    lat: number
    lon: number
    name: string
  }
  notifications: boolean
  autoRefresh: boolean
  refreshInterval: number // 분 단위
  language: 'ko' | 'en'
  music: {
    enabled: boolean
    autoPlay: boolean
    volume: number
    preferredMode: 'music' | 'ambient' | 'both'
    spotifyConnected: boolean
  }
  quiz: {
    enabled: boolean
    preferredDifficulty: QuizDifficulty
    preferredCategories: QuizCategory[]
    questionsPerSession: number
    showExplanations: boolean
    autoNext: boolean
    contextualQuizzes: boolean // 날씨/시간 맞춤형 퀴즈
  }
}