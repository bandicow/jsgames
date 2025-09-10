import express from 'express'
import axios from 'axios'

const router = express.Router()

// Open-Meteo API 기반 날씨 데이터 변환 함수
const transformOpenMeteoData = (data, location = '현재 위치') => {
  const current = data.current || data.current_weather
  const hourly = data.hourly || {}
  const daily = data.daily || {}
  
  // 날씨 코드를 설명으로 변환
  const getWeatherDescription = (code) => {
    const weatherCodes = {
      0: { main: 'Clear', description: '맑음', icon: '☀️' },
      1: { main: 'Clear', description: '대체로 맑음', icon: '🌤️' },
      2: { main: 'Clouds', description: '부분적으로 흐림', icon: '⛅' },
      3: { main: 'Clouds', description: '흐림', icon: '☁️' },
      45: { main: 'Mist', description: '안개', icon: '🌫️' },
      48: { main: 'Mist', description: '짙은 안개', icon: '🌫️' },
      51: { main: 'Drizzle', description: '약한 이슬비', icon: '🌦️' },
      53: { main: 'Drizzle', description: '이슬비', icon: '🌦️' },
      55: { main: 'Drizzle', description: '강한 이슬비', icon: '🌦️' },
      61: { main: 'Rain', description: '약한 비', icon: '🌧️' },
      63: { main: 'Rain', description: '비', icon: '🌧️' },
      65: { main: 'Rain', description: '강한 비', icon: '🌧️' },
      71: { main: 'Snow', description: '약한 눈', icon: '🌨️' },
      73: { main: 'Snow', description: '눈', icon: '🌨️' },
      75: { main: 'Snow', description: '강한 눈', icon: '❄️' },
      77: { main: 'Snow', description: '진눈깨비', icon: '🌨️' },
      80: { main: 'Rain', description: '소나기', icon: '🌦️' },
      81: { main: 'Rain', description: '소나기', icon: '🌦️' },
      82: { main: 'Rain', description: '강한 소나기', icon: '⛈️' },
      85: { main: 'Snow', description: '약한 눈 소나기', icon: '🌨️' },
      86: { main: 'Snow', description: '눈 소나기', icon: '🌨️' },
      95: { main: 'Thunderstorm', description: '천둥번개', icon: '⛈️' },
      96: { main: 'Thunderstorm', description: '약한 우박을 동반한 천둥번개', icon: '⛈️' },
      99: { main: 'Thunderstorm', description: '우박을 동반한 천둥번개', icon: '⛈️' }
    }
    return weatherCodes[code] || { main: 'Clear', description: '알 수 없음', icon: '🌤️' }
  }

  const weatherInfo = getWeatherDescription(current?.weathercode || current?.weather_code || 0)
  
  // AQI 계산 (PM2.5 기반 간단한 계산)
  const calculateAQI = (pm25, pm10, o3, no2, usAqi) => {
    // US AQI가 있으면 사용
    if (usAqi) {
      let level = 'good'
      if (usAqi <= 50) level = 'good'
      else if (usAqi <= 100) level = 'moderate'
      else if (usAqi <= 150) level = 'unhealthy'
      else if (usAqi <= 200) level = 'very_unhealthy'
      else level = 'hazardous'
      
      return { 
        aqi: Math.round(usAqi), 
        level,
        pm25,
        pm10,
        o3,
        no2
      }
    }
    
    // PM2.5 기반 계산
    if (!pm25) return { aqi: 50, level: 'good' }
    let aqi = 50
    let level = 'good'
    
    if (pm25 <= 12) {
      aqi = Math.round(pm25 * 4.17)
      level = 'good'
    } else if (pm25 <= 35.4) {
      aqi = Math.round(50 + (pm25 - 12) * 2.1)
      level = 'moderate'
    } else if (pm25 <= 55.4) {
      aqi = Math.round(100 + (pm25 - 35.4) * 2.5)
      level = 'unhealthy'
    } else if (pm25 <= 150.4) {
      aqi = Math.round(150 + (pm25 - 55.4) * 1.05)
      level = 'very_unhealthy'
    } else {
      aqi = Math.round(200 + (pm25 - 150.4) * 2)
      level = 'hazardous'
    }
    
    return { aqi, level, pm25, pm10, o3, no2 }
  }

  return {
    location,
    coord: { 
      lat: data.latitude, 
      lon: data.longitude 
    },
    current: {
      temp: current.temperature_2m || current.temperature || 20,
      feels_like: current.apparent_temperature || current.temperature_2m || 20,
      humidity: current.relativehumidity_2m || current.relative_humidity_2m || 50,
      wind_speed: current.windspeed_10m || current.wind_speed_10m || 0,
      weather: [{ 
        main: weatherInfo.main, 
        description: weatherInfo.description,
        icon: weatherInfo.icon
      }],
      visibility: current.visibility || 10000,
      uvi: current.uv_index || 0,
      air_quality: calculateAQI(
        current.pm2_5 || hourly.pm2_5?.[0],
        current.pm10 || hourly.pm10?.[0],
        current.ozone || hourly.ozone?.[0],
        current.nitrogen_dioxide || hourly.nitrogen_dioxide?.[0],
        current.us_aqi
      )
    },
    hourly: (hourly?.time && Array.isArray(hourly.time)) ? hourly.time.slice(0, 24).map((time, index) => ({
      dt: new Date(time).getTime() / 1000,
      temp: hourly.temperature_2m?.[index] || 20,
      weather: [getWeatherDescription(hourly.weathercode?.[index] || 0)],
      pop: (hourly.precipitation_probability?.[index] || 0) / 100
    })) : [],
    daily: (daily?.time && Array.isArray(daily.time)) ? daily.time.slice(0, 7).map((time, index) => ({
      dt: new Date(time).getTime() / 1000,
      temp: { 
        min: daily.temperature_2m_min?.[index] || 15, 
        max: daily.temperature_2m_max?.[index] || 25 
      },
      weather: [getWeatherDescription(daily.weathercode?.[index] || 0)],
      pop: (daily.precipitation_probability_max?.[index] || 0) / 100
    })) : []
  }
}

// 현재 날씨 가져오기 (Open-Meteo API 사용)
router.get('/current', async (req, res) => {
  try {
    const { lat, lon } = req.query
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      })
    }

    // Open-Meteo API 호출 (무료, API 키 불필요)
    const [weatherResponse, airQualityResponse] = await Promise.all([
      // 날씨 데이터
      axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          current: [
            'temperature_2m',
            'relativehumidity_2m',
            'apparent_temperature',
            'weathercode',
            'windspeed_10m',
            'uv_index'
          ].join(','),
          hourly: [
            'temperature_2m',
            'weathercode',
            'precipitation_probability'
          ].join(','),
          daily: [
            'weathercode',
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_probability_max'
          ].join(','),
          timezone: 'auto',
          forecast_days: 7
        }
      }),
      
      // 대기질 데이터
      axios.get('https://air-quality-api.open-meteo.com/v1/air-quality', {
        params: {
          latitude: lat,
          longitude: lon,
          current: [
            'pm10',
            'pm2_5',
            'nitrogen_dioxide',
            'ozone',
            'us_aqi'
          ].join(','),
          timezone: 'auto'
        }
      }).catch(err => {
        console.log('Air quality API error:', err.message)
        return null
      })
    ])
    
    const response = weatherResponse
    
    // 도시명 가져오기 (Reverse Geocoding)
    let location = '현재 위치'
    try {
      const geoResponse = await axios.get(
        `https://nominatim.openstreetmap.org/reverse`,
        {
          params: {
            lat,
            lon,
            format: 'json',
            'accept-language': 'ko'
          },
          headers: {
            'User-Agent': 'HybridWeatherApp/1.0'
          }
        }
      )
      location = geoResponse.data.address?.city || 
                 geoResponse.data.address?.town || 
                 geoResponse.data.address?.village ||
                 geoResponse.data.display_name?.split(',')[0] ||
                 '현재 위치'
    } catch (geoError) {
      console.log('Geocoding error:', geoError.message)
    }
    
    // 대기질 데이터 추가
    let airQualityData = null
    if (airQualityResponse && airQualityResponse.data) {
      const aqCurrent = airQualityResponse.data.current || {}
      airQualityData = {
        pm25: aqCurrent.pm2_5,
        pm10: aqCurrent.pm10,
        o3: aqCurrent.ozone,
        no2: aqCurrent.nitrogen_dioxide,
        usAqi: aqCurrent.us_aqi
      }
      
      // response.data에 대기질 데이터 병합
      if (!response.data.current) response.data.current = {}
      Object.assign(response.data.current, airQualityData)
    }
    
    const transformedData = transformOpenMeteoData(response.data, location)
    
    res.json({
      success: true,
      data: transformedData,
      cached: false,
      source: 'open-meteo'
    })
  } catch (error) {
    console.error('Weather API Error:', error.message)
    
    // 에러 시 기본 데이터 반환
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data',
      message: error.message,
      data: {
        location: '오류',
        coord: { lat: 0, lon: 0 },
        current: {
          temp: 20,
          feels_like: 20,
          humidity: 50,
          wind_speed: 0,
          weather: [{ main: 'Clear', description: '데이터 없음' }],
          visibility: 10000,
          uvi: 0,
          air_quality: { aqi: 50, level: 'good' }
        }
      }
    })
  }
})

// 예보 가져오기
router.get('/forecast', async (req, res) => {
  try {
    const { lat, lon } = req.query
    
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      })
    }

    // Open-Meteo API 호출
    const response = await axios.get(
      'https://api.open-meteo.com/v1/forecast',
      {
        params: {
          latitude: lat,
          longitude: lon,
          hourly: [
            'temperature_2m',
            'weathercode',
            'precipitation_probability'
          ].join(','),
          daily: [
            'weathercode',
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_probability_max'
          ].join(','),
          timezone: 'auto',
          forecast_days: 7
        }
      }
    )
    
    // 응답 데이터 안전성 확인
    if (!response.data) {
      throw new Error('No data received from weather API')
    }
    
    // Forecast 전용 변환 함수 (current 데이터 없음)
    const transformForecastData = (data) => {
      const hourly = data.hourly || {}
      const daily = data.daily || {}
      
      const getWeatherDescription = (code) => {
        const weatherCodes = {
          0: { main: 'Clear', description: '맑음', icon: '☀️' },
          1: { main: 'Clear', description: '대체로 맑음', icon: '🌤️' },
          2: { main: 'Clouds', description: '부분적으로 흐림', icon: '⛅' },
          3: { main: 'Clouds', description: '흐림', icon: '☁️' },
          61: { main: 'Rain', description: '비', icon: '🌧️' },
          63: { main: 'Rain', description: '강한 비', icon: '🌧️' },
          80: { main: 'Rain', description: '소나기', icon: '🌦️' }
        }
        return weatherCodes[code] || { main: 'Clear', description: '맑음', icon: '🌤️' }
      }
      
      return {
        hourly: (hourly?.time && Array.isArray(hourly.time)) ? hourly.time.slice(0, 24).map((time, index) => ({
          time: time,
          temperature: hourly.temperature_2m?.[index] || 20,
          condition: getWeatherDescription(hourly.weathercode?.[index] || 0).main,
          precipitationProbability: (hourly.precipitation_probability?.[index] || 0) / 100
        })) : [],
        daily: (daily?.time && Array.isArray(daily.time)) ? daily.time.slice(0, 7).map((time, index) => ({
          time: time,
          temperatureMax: daily.temperature_2m_max?.[index] || 25,
          temperatureMin: daily.temperature_2m_min?.[index] || 15,
          condition: getWeatherDescription(daily.weathercode?.[index] || 0).main,
          precipitationProbability: (daily.precipitation_probability_max?.[index] || 0) / 100
        })) : []
      }
    }
    
    const transformedData = transformForecastData(response.data)
    
    res.json({
      success: true,
      data: {
        hourly: transformedData.hourly || [],
        daily: transformedData.daily || []
      },
      cached: false,
      source: 'open-meteo'
    })
  } catch (error) {
    console.error('Forecast API Error:', error.message)
    
    // 에러 시 기본 예보 데이터 반환
    res.status(500).json({
      success: false,
      error: 'Failed to fetch forecast data',
      message: error.message,
      data: {
        hourly: [],
        daily: []
      }
    })
  }
})

// IP 기반 위치 가져오기
router.get('/location', async (req, res) => {
  try {
    // IP 기반 위치 서비스 (무료 API 사용)
    const response = await axios.get('http://ip-api.com/json/', {
      params: {
        fields: 'status,message,country,countryCode,region,regionName,city,lat,lon,timezone'
      }
    })
    
    if (response.data.status === 'success') {
      res.json({
        success: true,
        data: {
          city: response.data.city,
          country: response.data.country,
          lat: response.data.lat,
          lon: response.data.lon,
          timezone: response.data.timezone
        }
      })
    } else {
      throw new Error(response.data.message || 'Location detection failed')
    }
  } catch (error) {
    console.error('Location API Error:', error.message)
    // 기본값으로 서울 반환
    res.json({
      success: true,
      data: {
        city: '서울',
        country: 'Korea',
        lat: 37.5665,
        lon: 126.9780
      },
      cached: true
    })
  }
})

export default router