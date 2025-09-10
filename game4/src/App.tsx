import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Header from './components/layout/Header'
import LeftPanel from './components/layout/LeftPanel'
import MainContent from './components/layout/MainContent'
import WeatherPanel from './components/layout/WeatherPanel'
import { useGeolocation } from './hooks/useGeolocation'
import { useWeatherStore } from './store/weatherStore'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const { latitude, longitude, error: geoError, permissionStatus } = useGeolocation()
  const { fetchWeather, fetchForecast, detectLocation } = useWeatherStore()

  // 다크모드 토글
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // 위치 기반 날씨 정보 가져오기
  useEffect(() => {
    if (latitude && longitude) {
      fetchWeather(latitude, longitude)
      fetchForecast(latitude, longitude)
    } else if (geoError || permissionStatus === 'denied' || permissionStatus === 'prompt') {
      // Geolocation 실패 시 또는 권한 요청 중일 때 IP 기반 위치 감지
      detectLocation()
    }
  }, [latitude, longitude, geoError, permissionStatus, fetchWeather, fetchForecast, detectLocation])
  
  // 초기 로드 시 즉시 IP 기반 위치 사용
  useEffect(() => {
    detectLocation()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 transition-colors duration-300">
      <Toaster 
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#f3f4f6' : '#1f2937',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
      
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 좌측 패널 - 네비게이션 */}
          <div className="lg:col-span-1">
            <LeftPanel />
          </div>
          
          {/* 메인 콘텐츠 - 카드 그리드 */}
          <div className="lg:col-span-2">
            <MainContent />
          </div>
          
          {/* 우측 패널 - 날씨 정보 */}
          <div className="lg:col-span-1">
            <WeatherPanel />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App