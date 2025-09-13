import { FC, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useMusicStore } from '../../store/musicStore'
import { MusicTrack } from '../../types'
import { createApiUrl } from '../../utils/api'

interface MusicSearchProps {
  className?: string
}

interface SearchResult {
  success: boolean
  data: {
    tracks: MusicTrack[]
    total: number
    source: string
  }
}

const MusicSearch: FC<MusicSearchProps> = ({ className = '' }) => {
  const { playTrack } = useMusicStore()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchType, setSearchType] = useState<'artist' | 'genre' | 'trending'>('artist')
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const performSearch = async (searchQuery: string, type: 'artist' | 'genre' | 'trending') => {
    if (!searchQuery.trim() && type !== 'trending') {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    try {
      let endpoint = ''
      if (type === 'trending') {
        endpoint = createApiUrl(`/music/trending?limit=12`)
      } else if (type === 'artist') {
        endpoint = createApiUrl(`/music/artist/${encodeURIComponent(searchQuery.trim())}`)
      } else if (type === 'genre') {
        endpoint = createApiUrl(`/music/genre/${encodeURIComponent(searchQuery.trim())}`)
      }

      const response = await fetch(endpoint)
      const data: SearchResult = await response.json()

      if (data.success && data.data.tracks) {
        // API 응답을 MusicTrack 형식으로 변환
        const tracks: MusicTrack[] = data.data.tracks.map((track: any) => ({
          id: track.id,
          title: track.title,
          artist: track.artist,
          duration: track.duration,
          url: track.url,
          genre: Array.isArray(track.genre) ? track.genre : [track.genre],
          mood: track.mood || 'search_result',
          isAmbient: track.isAmbient || false,
          artwork: track.artwork,
          iTunesUrl: track.iTunesUrl
        }))
        setSearchResults(tracks)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchChange = (value: string) => {
    setQuery(value)
    
    // 디바운싱: 300ms 후에 검색 실행
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value, searchType)
    }, 300)
  }

  const handleSearchTypeChange = (type: 'artist' | 'genre' | 'trending') => {
    setSearchType(type)
    if (type === 'trending') {
      performSearch('', type)
    } else if (query.trim()) {
      performSearch(query, type)
    }
  }

  const handleTrackPlay = (track: MusicTrack) => {
    playTrack(track)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-4 ${className}`}
    >
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <span>🔍</span>
        <span>음악 검색</span>
      </h3>

      {/* 검색 타입 선택 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleSearchTypeChange('artist')}
          className={`px-3 py-1 rounded-lg text-sm transition-all ${
            searchType === 'artist'
              ? 'bg-blue-500/30 text-blue-600 dark:text-blue-400'
              : 'glass-button hover:bg-white/20 dark:hover:bg-white/10'
          }`}
        >
          아티스트
        </button>
        <button
          onClick={() => handleSearchTypeChange('genre')}
          className={`px-3 py-1 rounded-lg text-sm transition-all ${
            searchType === 'genre'
              ? 'bg-blue-500/30 text-blue-600 dark:text-blue-400'
              : 'glass-button hover:bg-white/20 dark:hover:bg-white/10'
          }`}
        >
          장르
        </button>
        <button
          onClick={() => handleSearchTypeChange('trending')}
          className={`px-3 py-1 rounded-lg text-sm transition-all ${
            searchType === 'trending'
              ? 'bg-blue-500/30 text-blue-600 dark:text-blue-400'
              : 'glass-button hover:bg-white/20 dark:hover:bg-white/10'
          }`}
        >
          인기곡
        </button>
      </div>

      {/* 검색 입력 */}
      {searchType !== 'trending' && (
        <div className="relative mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={
              searchType === 'artist' 
                ? '아티스트 이름을 입력하세요 (예: BTS, Taylor Swift)' 
                : '장르를 입력하세요 (예: pop, rock, jazz)'
            }
            className="w-full p-3 rounded-lg bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 
                       placeholder-gray-500 dark:placeholder-gray-400 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      )}

      {/* 검색 결과 */}
      <div className="space-y-2">
        {searchResults.length === 0 && !isSearching && searchType === 'trending' && (
          <button
            onClick={() => performSearch('', 'trending')}
            className="w-full glass-button p-3 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 text-center"
          >
            🔥 인기 음악 보기
          </button>
        )}

        {searchResults.map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 dark:bg-white/3 
                       hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-200 group"
          >
            {/* 앨범 아트워크 */}
            {track.artwork && (
              <img 
                src={track.artwork} 
                alt={`${track.title} artwork`}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            )}
            
            {/* 트랙 정보 */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {track.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {track.artist}
                {track.genre && track.genre.length > 0 && (
                  <span className="ml-2 text-xs bg-gray-500/20 px-2 py-0.5 rounded-full">
                    {track.genre[0]}
                  </span>
                )}
              </p>
            </div>

            {/* 재생 시간 */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
            </div>

            {/* 재생 버튼 */}
            <button
              onClick={() => handleTrackPlay(track)}
              className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/30 
                         text-blue-600 dark:text-blue-400 transition-all duration-200"
              title="재생"
            >
              ▶️
            </button>
          </motion.div>
        ))}

        {searchResults.length === 0 && !isSearching && query && searchType !== 'trending' && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-2xl mb-2">🔍</div>
            <p>검색 결과가 없습니다</p>
            <p className="text-sm">다른 키워드로 검색해보세요</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default MusicSearch