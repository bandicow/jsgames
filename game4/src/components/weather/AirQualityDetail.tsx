import { FC } from 'react'
import { motion } from 'framer-motion'
import { AQIData } from '../../types'

interface AirQualityDetailProps {
  airQuality: AQIData | null
  location?: string
}

const AirQualityDetail: FC<AirQualityDetailProps> = ({ airQuality, location = '현재 위치' }) => {
  // AQI 레벨에 따른 색상 설정
  const getAQIColor = (level: string) => {
    switch(level) {
      case 'good': return 'bg-green-500'
      case 'moderate': return 'bg-yellow-500'
      case 'unhealthy': return 'bg-orange-500'
      case 'very_unhealthy': return 'bg-red-500'
      case 'hazardous': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getAQITextColor = (level: string) => {
    switch(level) {
      case 'good': return 'text-green-600 dark:text-green-400'
      case 'moderate': return 'text-yellow-600 dark:text-yellow-400'
      case 'unhealthy': return 'text-orange-600 dark:text-orange-400'
      case 'very_unhealthy': return 'text-red-600 dark:text-red-400'
      case 'hazardous': return 'text-purple-600 dark:text-purple-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getAQILabel = (level: string) => {
    switch(level) {
      case 'good': return '좋음'
      case 'moderate': return '보통'
      case 'unhealthy': return '나쁨'
      case 'very_unhealthy': return '매우 나쁨'
      case 'hazardous': return '위험'
      default: return '알 수 없음'
    }
  }

  const getAQIDescription = (level: string) => {
    switch(level) {
      case 'good': 
        return '공기질이 좋습니다. 야외 활동하기 좋은 날이에요! 🌳'
      case 'moderate': 
        return '공기질이 보통입니다. 민감한 분들은 장시간 야외 활동에 주의하세요.'
      case 'unhealthy': 
        return '공기질이 나쁩니다. 야외 활동을 자제하고 마스크를 착용하세요. 😷'
      case 'very_unhealthy': 
        return '공기질이 매우 나쁩니다. 가급적 실내에 머무르세요! ⚠️'
      case 'hazardous': 
        return '위험한 수준입니다. 외출을 삼가고 실내 공기청정기를 가동하세요! 🚨'
      default: 
        return '공기질 정보를 확인할 수 없습니다.'
    }
  }

  const getAQIEmoji = (level: string) => {
    switch(level) {
      case 'good': return '😊'
      case 'moderate': return '😐'
      case 'unhealthy': return '😷'
      case 'very_unhealthy': return '🤧'
      case 'hazardous': return '☠️'
      default: return '❓'
    }
  }

  if (!airQuality) {
    return (
      <div className="glass-card p-4">
        <h3 className="font-semibold mb-3">🌬️ 대기질 정보</h3>
        <p className="text-gray-500 dark:text-gray-400">
          대기질 정보를 불러오는 중...
        </p>
      </div>
    )
  }

  const aqiPercentage = Math.min((airQuality.aqi / 300) * 100, 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">🌬️ 대기질 상세정보</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {location}
        </span>
      </div>

      {/* AQI 메인 표시 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getAQIEmoji(airQuality.level)}</span>
            <div>
              <div className="text-3xl font-bold">{airQuality.aqi}</div>
              <div className={`font-medium ${getAQITextColor(airQuality.level)}`}>
                {getAQILabel(airQuality.level)}
              </div>
            </div>
          </div>
        </div>

        {/* AQI 바 */}
        <div className="mt-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${aqiPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full ${getAQIColor(airQuality.level)}`}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>0</span>
            <span>50</span>
            <span>100</span>
            <span>150</span>
            <span>200</span>
            <span>300+</span>
          </div>
        </div>
      </div>

      {/* 설명 */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm">{getAQIDescription(airQuality.level)}</p>
      </div>

      {/* 상세 오염물질 정보 */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm mb-2">오염물질 농도</h4>
        
        {airQuality.pm25 !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              PM2.5 (초미세먼지)
            </span>
            <span className="font-medium">
              {airQuality.pm25?.toFixed(1) || 'N/A'} μg/m³
            </span>
          </div>
        )}
        
        {airQuality.pm10 !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              PM10 (미세먼지)
            </span>
            <span className="font-medium">
              {airQuality.pm10?.toFixed(1) || 'N/A'} μg/m³
            </span>
          </div>
        )}
        
        {airQuality.o3 !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              O₃ (오존)
            </span>
            <span className="font-medium">
              {airQuality.o3?.toFixed(1) || 'N/A'} μg/m³
            </span>
          </div>
        )}
        
        {airQuality.no2 !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              NO₂ (이산화질소)
            </span>
            <span className="font-medium">
              {airQuality.no2?.toFixed(1) || 'N/A'} μg/m³
            </span>
          </div>
        )}
      </div>

      {/* 행동 요령 */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-sm mb-2">행동 요령</h4>
        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          {airQuality.level === 'good' && (
            <>
              <li>• 야외 활동 적극 권장</li>
              <li>• 환기를 자주 시켜주세요</li>
            </>
          )}
          {airQuality.level === 'moderate' && (
            <>
              <li>• 민감군은 장시간 야외 활동 주의</li>
              <li>• 적절한 환기 권장</li>
            </>
          )}
          {(airQuality.level === 'unhealthy' || airQuality.level === 'very_unhealthy') && (
            <>
              <li>• 야외 활동 자제</li>
              <li>• 외출 시 마스크 착용</li>
              <li>• 실내 공기청정기 가동</li>
            </>
          )}
          {airQuality.level === 'hazardous' && (
            <>
              <li>• 외출 금지</li>
              <li>• 창문 닫고 실내 대기</li>
              <li>• 공기청정기 최대 가동</li>
              <li>• 호흡기 증상 시 병원 방문</li>
            </>
          )}
        </ul>
      </div>
    </motion.div>
  )
}

export default AirQualityDetail