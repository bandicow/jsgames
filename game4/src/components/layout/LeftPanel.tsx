import { FC, useState } from 'react'

const LeftPanel: FC = () => {
  const [activeTab, setActiveTab] = useState('today')

  const menuItems = [
    { id: 'today', label: '오늘의 추천', icon: '✨' },
    { id: 'favorites', label: '즐겨찾기', icon: '⭐' },
    { id: 'history', label: '히스토리', icon: '📝' },
    { id: 'settings', label: '설정', icon: '⚙️' },
  ]

  return (
    <aside className="glass-card p-4 lg:sticky lg:top-24">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3
              ${activeTab === item.id 
                ? 'bg-blue-500/20 dark:bg-blue-400/20 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-gray-200/20 dark:hover:bg-gray-700/20'
              }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* 퀵 액션 섹션 */}
      <div className="mt-6 pt-6 border-t border-gray-200/20 dark:border-gray-700/20">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
          퀵 액션
        </h3>
        <div className="space-y-2">
          <button className="glass-button w-full text-sm">
            📍 위치 변경
          </button>
          <button className="glass-button w-full text-sm">
            🔔 알림 설정
          </button>
        </div>
      </div>
    </aside>
  )
}

export default LeftPanel