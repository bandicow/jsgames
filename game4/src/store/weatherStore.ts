import { create } from 'zustand'
import axios from 'axios'
import { CurrentWeather, ForecastData, AQIData, MoodToken } from '../types'
import { createApiUrl } from '../utils/api'

interface WeatherState {
  // 상태
  weather: CurrentWeather | null
  forecast: ForecastData | null
  airQuality: AQIData | null
  currentMood: MoodToken | null
  loading: boolean
  error: string | null
  lastUpdated: number | null
  
  // 위치
  location: {
    lat: number
    lon: number
    name: string
  } | null
  
  // 액션
  fetchWeather: (lat: number, lon: number) => Promise<void>
  fetchForecast: (lat: number, lon: number) => Promise<void>
  detectLocation: () => Promise<void>
  calculateMood: () => void
  clearError: () => void
  setLoading: (loading: boolean) => void
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  // 초기 상태
  weather: null,
  forecast: null,
  airQuality: null,
  currentMood: null,
  loading: false,
  error: null,
  lastUpdated: null,
  location: null,
  
  // 날씨 가져오기
  fetchWeather: async (lat: number, lon: number) => {
    const { lastUpdated } = get()
    const now = Date.now()
    
    // 10분 이내면 스킵
    if (lastUpdated && (now - lastUpdated) < 10 * 60 * 1000) {
      return
    }
    
    set({ loading: true, error: null })
    
    try {
      const response = await axios.get(createApiUrl('/weather/current'), {
        params: { lat, lon }
      })
      
      const data = response.data.data
      
      const weather: CurrentWeather = {
        location: data.location || '현재 위치',
        temperature: Math.round(data.current?.temp || 20),
        feelsLike: Math.round(data.current?.feels_like || 20),
        condition: data.current?.weather?.[0]?.main || 'Clear',
        description: data.current?.weather?.[0]?.description || '맑음',
        humidity: data.current?.humidity || 50,
        windSpeed: data.current?.wind_speed || 0,
        visibility: data.current?.visibility || 10000,
        uvi: data.current?.uvi || 0,
        timestamp: now
      }
      
      const airQuality: AQIData = data.current?.air_quality || {
        aqi: 50,
        level: 'good'
      }
      
      // 위치 정보 업데이트
      if (data.location) {
        set({
          location: {
            lat: data.coord?.lat || lat,
            lon: data.coord?.lon || lon,
            name: data.location
          }
        })
      }
      
      set({ 
        weather, 
        airQuality,
        loading: false, 
        lastUpdated: now 
      })
      
      // 무드 계산
      get().calculateMood()
    } catch (error: any) {
      console.error('Weather fetch error:', error)
      set({ 
        error: error.message || '날씨 정보를 가져올 수 없습니다.', 
        loading: false 
      })
    }
  },
  
  // 예보 가져오기
  fetchForecast: async (lat: number, lon: number) => {
    try {
      const response = await axios.get(createApiUrl('/weather/forecast'), {
        params: { lat, lon }
      })
      
      const data = response.data.data
      
      const forecast: ForecastData = {
        hourly: (data.hourly || []).slice(0, 12).map((hour: any) => ({
          time: new Date(hour.time).getTime(),
          temperature: Math.round(hour.temperature),
          condition: hour.condition || 'Clear',
          precipitationProbability: hour.precipitationProbability
        })),
        daily: (data.daily || []).slice(0, 7).map((day: any) => ({
          date: new Date(day.time).getTime(),
          tempMin: Math.round(day.temperatureMin || 0),
          tempMax: Math.round(day.temperatureMax || 0),
          condition: day.condition || 'Clear',
          precipitationProbability: day.precipitationProbability
        }))
      }
      
      set({ forecast })
    } catch (error: any) {
      console.error('Forecast error:', error)
    }
  },
  
  // 위치 감지
  detectLocation: async () => {
    set({ loading: true })
    
    try {
      // 브라우저 위치 API 시도
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })
        
        const { latitude: lat, longitude: lon } = position.coords
        
        set({
          location: {
            lat,
            lon,
            name: '현재 위치'
          }
        })
        
        // 날씨 데이터 가져오기
        await get().fetchWeather(lat, lon)
        await get().fetchForecast(lat, lon)
      }
    } catch (error) {
      // IP 기반 위치 폴백
      try {
        const response = await axios.get(createApiUrl('/weather/location'))
        const { lat, lon, city } = response.data.data
        
        set({
          location: {
            lat,
            lon,
            name: city
          }
        })
        
        await get().fetchWeather(lat, lon)
        await get().fetchForecast(lat, lon)
      } catch (fallbackError) {
        set({ 
          error: '위치를 가져올 수 없습니다.',
          loading: false 
        })
      }
    }
  },
  
  // 무드 계산
  calculateMood: () => {
    const { weather, airQuality } = get()
    
    if (!weather) return
    
    let mood: MoodToken = MoodToken.SUNNY_UPBEAT
    
    // 날씨 조건에 따른 무드 결정
    const condition = weather.condition.toLowerCase()
    const temp = weather.temperature
    const feelsLike = weather.feelsLike
    
    if (condition.includes('rain') || condition.includes('drizzle')) {
      mood = MoodToken.RAIN_LOFI
    } else if (condition.includes('storm') || condition.includes('thunder')) {
      mood = MoodToken.STORM_ENERGETIC
    } else if (condition.includes('snow')) {
      mood = MoodToken.SNOW_COZY
    } else if (condition.includes('mist') || condition.includes('fog')) {
      mood = MoodToken.MIST_AMBIENT
    } else if (condition.includes('cloud')) {
      mood = MoodToken.CLOUDY_CHILL
    } else if (feelsLike > 32) {
      mood = MoodToken.HEAT_TROPICAL
    } else if (feelsLike < 0) {
      mood = MoodToken.COLD_WARMUP
    } else if (condition.includes('clear') || condition.includes('sun')) {
      mood = MoodToken.SUNNY_UPBEAT
    }
    
    set({ currentMood: mood })
  },
  
  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ loading })
}))