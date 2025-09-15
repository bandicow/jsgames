import { FC, useState } from 'react'
import { useWeatherStore } from '../../store/weatherStore'
import WeatherRadar from '../weather/WeatherRadar'
import AirQualityDetail from '../weather/AirQualityDetail'

const WeatherPanel: FC = () => {
  const { 
    weather, 
    forecast, 
    airQuality, 
    loading, 
    error,
    location
  } = useWeatherStore()
  
  const [showRadar, setShowRadar] = useState(false)
  const [showAirQuality, setShowAirQuality] = useState(false)

  // 날씨 아이콘 매핑
  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase()
    if (lowerCondition.includes('clear') || lowerCondition.includes('sun')) return '☀️'
    if (lowerCondition.includes('cloud')) return '☁️'
    if (lowerCondition.includes('rain')) return '🌧️'
    if (lowerCondition.includes('storm')) return '⛈️'
    if (lowerCondition.includes('snow')) return '❄️'
    if (lowerCondition.includes('mist') || lowerCondition.includes('fog')) return '🌫️'
    return '🌤️'
  }

  // AQI 레벨에 따른 색상
  const getAQIColor = (level: string) => {
    switch(level) {
      case 'good': return 'green'
      case 'moderate': return 'yellow'
      case 'unhealthy': return 'orange'
      case 'very_unhealthy': return 'red'
      case 'hazardous': return 'purple'
      default: return 'gray'
    }
  }

  const getAQIText = (level: string) => {
    switch(level) {
      case 'good': return '좋음'
      case 'moderate': return '보통'
      case 'unhealthy': return '나쁨'
      case 'very_unhealthy': return '매우 나쁨'
      case 'hazardous': return '위험'
      default: return '알 수 없음'
    }
  }

  // 로딩 상태
  if (loading) {
    return (
      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="glass-card p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">날씨 정보를 불러오는 중...</p>
          </div>
        </div>
      </aside>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="glass-card p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              위치 권한을 확인하거나 페이지를 새로고침 해주세요.
            </p>
          </div>
        </div>
      </aside>
    )
  }

  // 데이터가 없는 경우
  if (!weather) {
    return (
      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="glass-card p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">📍</div>
            <p className="text-gray-600 dark:text-gray-400">위치 정보를 가져오는 중...</p>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      {/* 현재 날씨 */}
      <div className="glass-card p-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            📍 {location?.name || weather.location}
          </p>
          <div className="text-6xl mb-4">{getWeatherIcon(weather.condition)}</div>
          <h2 className="text-4xl font-bold mb-1">
            {weather.temperature}°
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {weather.description}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            체감 {weather.feelsLike}°
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200/20 dark:border-gray-700/20">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">습도</p>
            <p className="font-semibold">{weather.humidity}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">바람</p>
            <p className="font-semibold">{weather.windSpeed.toFixed(1)} m/s</p>
          </div>
        </div>

        {weather.uvi !== undefined && (
          <div className="mt-4 pt-4 border-t border-gray-200/20 dark:border-gray-700/20">
            <p className="text-sm text-gray-600 dark:text-gray-400">자외선 지수</p>
            <p className="font-semibold">{weather.uvi}</p>
          </div>
        )}
      </div>

      {/* 시간별 예보 */}
      {forecast?.hourly && forecast.hourly.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-4">시간별 예보</h3>
          <div className="space-y-3">
            {forecast.hourly.slice(0, 4).map((hour, index) => {
              const date = new Date(hour.time)
              const timeStr = date.toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {timeStr}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {getWeatherIcon(hour.condition)}
                    </span>
                    <span className="font-medium">{hour.temperature}°</span>
                    {hour.precipitationProbability && hour.precipitationProbability > 0 && (
                      <span className="text-xs text-blue-500">
                        {Math.round(hour.precipitationProbability * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 공기질 */}
      {airQuality && (
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-3">공기질</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 bg-${getAQIColor(airQuality.level)}-500 rounded-full`}></div>
              <span className={`text-${getAQIColor(airQuality.level)}-600 dark:text-${getAQIColor(airQuality.level)}-400 font-medium`}>
                {getAQIText(airQuality.level)}
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              AQI {airQuality.aqi}
            </span>
          </div>
        </div>
      )}

      {/* 기상 레이더 & 미세먼지 버튼 */}
      <div className="glass-card p-4">
        <h3 className="font-semibold mb-3">상세 정보</h3>
        <div className="space-y-2">
          {/* 기상 레이더 토글 */}
          <div>
            <button
              onClick={() => {
                setShowRadar(!showRadar)
                if (!showRadar) {
                  setShowAirQuality(false)
                }
              }}
              className="w-full glass-button text-left flex items-center justify-between hover:bg-white/20 dark:hover:bg-white/10"
            >
              <span className="flex items-center gap-2">
                <span>🛰️</span>
                <span>기상 레이더</span>
              </span>
              <span className="text-sm">
                {showRadar ? '▼' : '▶'}
              </span>
            </button>
            {/* 기상 레이더 컨텐츠 */}
            {showRadar && location && (
              <div className="mt-2">
                <WeatherRadar lat={location.lat} lon={location.lon} />
              </div>
            )}
          </div>

          {/* 미세먼지 상세 토글 */}
          <div>
            <button
              onClick={() => {
                setShowAirQuality(!showAirQuality)
                if (!showAirQuality) {
                  setShowRadar(false)
                }
              }}
              className="w-full glass-button text-left flex items-center justify-between hover:bg-white/20 dark:hover:bg-white/10"
            >
              <span className="flex items-center gap-2">
                <span>🌬️</span>
                <span>미세먼지 상세</span>
              </span>
              <span className="text-sm">
                {showAirQuality ? '▼' : '▶'}
              </span>
            </button>
            {/* 미세먼지 상세 컨텐츠 */}
            {showAirQuality && (
              <div className="mt-2">
                <AirQualityDetail
                  airQuality={airQuality}
                  location={location?.name || weather.location}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 생활 팁 */}
      <div className="glass-card p-4">
        <h3 className="font-semibold mb-3">오늘의 팁</h3>
        <ul className="space-y-2 text-sm">
          {weather.condition.toLowerCase().includes('rain') ? (
            <li className="flex items-center space-x-2">
              <span>☂️</span>
              <span>우산 필요</span>
            </li>
          ) : (
            <li className="flex items-center space-x-2">
              <span>☂️</span>
              <span>우산 필요 없음</span>
            </li>
          )}
          
          {weather.temperature > 25 ? (
            <li className="flex items-center space-x-2">
              <span>👕</span>
              <span>가벼운 옷차림 추천</span>
            </li>
          ) : weather.temperature < 10 ? (
            <li className="flex items-center space-x-2">
              <span>🧥</span>
              <span>따뜻한 옷차림 필요</span>
            </li>
          ) : (
            <li className="flex items-center space-x-2">
              <span>👔</span>
              <span>적당한 옷차림 추천</span>
            </li>
          )}
          
          {weather.uvi && weather.uvi > 5 && (
            <li className="flex items-center space-x-2">
              <span>🕶️</span>
              <span>자외선 지수 높음</span>
            </li>
          )}
        </ul>
      </div>
    </aside>
  )
}

export default WeatherPanel