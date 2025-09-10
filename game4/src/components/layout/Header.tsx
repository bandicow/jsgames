import { FC } from 'react'

interface HeaderProps {
  isDarkMode: boolean
  setIsDarkMode: (value: boolean) => void
}

const Header: FC<HeaderProps> = ({ isDarkMode, setIsDarkMode }) => {
  return (
    <header className="glass-card sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-2xl">🌦️</div>
            <h1 className="text-xl font-bold text-gradient">
              하이브리드 날씨 앱
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 다크모드 토글 */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="glass-button p-2"
              aria-label="테마 전환"
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>
            
            {/* 설정 버튼 */}
            <button 
              className="glass-button p-2"
              aria-label="설정"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header