import { FC, useState } from 'react'
import { motion } from 'framer-motion'

interface WeatherRadarProps {
  lat?: number
  lon?: number
}

const WeatherRadar: FC<WeatherRadarProps> = ({ lat = 37.5665, lon = 126.9780 }) => {
  const [radarType, setRadarType] = useState<'radar' | 'satellite' | 'temp'>('radar')
  const [isLoading, setIsLoading] = useState(true)
  
  // 한국 기상청 레이더 또는 Windy 임베드 사용
  const radarUrls = {
    // Windy 레이더 (무료)
    windy: `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&width=650&height=450&zoom=8&level=surface&overlay=radar&product=ecmwf&menu=&message=true&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`,
    
    // 기상청 레이더 이미지 (한국 전용)
    kma: 'https://www.weather.go.kr/repositary/image/rdr/img/RDR_CMP_WRC_000.png',
    
    // RainViewer API (전세계 무료)
    rainviewer: `https://api.rainviewer.com/public/weather-maps.json`
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">🛰️ 기상 레이더</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setRadarType('radar')}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              radarType === 'radar' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            레이더
          </button>
          <button
            onClick={() => setRadarType('satellite')}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              radarType === 'satellite' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            위성
          </button>
          <button
            onClick={() => setRadarType('temp')}
            className={`px-3 py-1 rounded-lg text-sm transition-all ${
              radarType === 'temp' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            온도
          </button>
        </div>
      </div>

      <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Windy 임베드 사용 */}
        <iframe
          src={`https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&width=650&height=450&zoom=7&level=surface&overlay=${
            radarType === 'radar' ? 'radar' : 
            radarType === 'satellite' ? 'satellite' : 
            'temp'
          }&product=ecmwf&menu=&message=&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`}
          className="w-full h-full"
          frameBorder="0"
          onLoad={handleIframeLoad}
          title="Weather Radar"
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>실시간 기상 레이더</span>
        <span>출처: Windy.com</span>
      </div>
    </motion.div>
  )
}

export default WeatherRadar