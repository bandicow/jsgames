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
}