import express from 'express'
import axios from 'axios'

const router = express.Router()

// 날씨별 음악 장르 매핑
const WEATHER_GENRE_MAPPING = {
  'sunny_upbeat': {
    genres: ['pop', 'reggae', 'indie', 'electronic', 'dance'],
    keywords: ['upbeat', 'happy', 'summer', 'sunshine', 'cheerful', 'energetic'],
    searchTerms: 'upbeat happy pop summer dance'
  },
  'rain_lofi': {
    genres: ['lo-fi', 'chillhop', 'jazz', 'acoustic', 'alternative'],
    keywords: ['chill', 'relaxing', 'rain', 'cozy', 'mellow', 'ambient'],
    searchTerms: 'chill lofi jazz relaxing ambient'
  },
  'cloudy_chill': {
    genres: ['chillhop', 'indie', 'alternative', 'folk'],
    keywords: ['mellow', 'indie', 'alternative', 'contemplative'],
    searchTerms: 'indie alternative mellow folk'
  },
  'snow_cozy': {
    genres: ['folk', 'acoustic', 'indie', 'classical'],
    keywords: ['cozy', 'warm', 'acoustic', 'folk', 'winter'],
    searchTerms: 'acoustic folk winter cozy classical'
  },
  'storm_energetic': {
    genres: ['rock', 'electronic', 'metal', 'dramatic'],
    keywords: ['energetic', 'powerful', 'intense', 'dramatic'],
    searchTerms: 'rock electronic intense powerful'
  },
  'mist_ambient': {
    genres: ['ambient', 'post-rock', 'instrumental', 'new age'],
    keywords: ['ambient', 'atmospheric', 'dreamy', 'ethereal'],
    searchTerms: 'ambient instrumental atmospheric ethereal'
  },
  'heat_tropical': {
    genres: ['reggae', 'latin', 'tropical', 'world'],
    keywords: ['tropical', 'reggae', 'latin', 'caribbean', 'summer'],
    searchTerms: 'reggae tropical latin caribbean summer'
  },
  'cold_warmup': {
    genres: ['soul', 'r&b', 'jazz', 'blues'],
    keywords: ['warm', 'soulful', 'smooth', 'cozy'],
    searchTerms: 'soul r&b jazz smooth warm'
  }
}

// iTunes Search API를 사용하여 음악 검색
router.get('/search', async (req, res) => {
  try {
    const { mood, limit = 10 } = req.query
    
    if (!mood) {
      return res.status(400).json({
        success: false,
        error: 'Mood parameter is required'
      })
    }

    const moodMapping = WEATHER_GENRE_MAPPING[mood]
    if (!moodMapping) {
      return res.status(400).json({
        success: false,
        error: 'Invalid mood parameter'
      })
    }

    // iTunes Search API 호출
    const response = await axios.get('https://itunes.apple.com/search', {
      params: {
        term: moodMapping.searchTerms,
        media: 'music',
        entity: 'song',
        limit: limit,
        country: 'US',
        explicit: 'No'
      }
    })

    if (!response.data || !response.data.results) {
      throw new Error('No results from iTunes API')
    }

    // 결과 변환
    const tracks = response.data.results.map((track, index) => ({
      id: `${mood}_${track.trackId}_${index}`,
      title: track.trackName || 'Unknown Title',
      artist: track.artistName || 'Unknown Artist',
      album: track.collectionName || 'Unknown Album',
      duration: Math.floor(track.trackTimeMillis / 1000) || 180,
      url: track.previewUrl || null, // 30초 미리듣기 URL
      artwork: track.artworkUrl100 || track.artworkUrl60 || null,
      genre: track.primaryGenreName || moodMapping.genres[0],
      mood: mood,
      isAmbient: mood.includes('ambient') || mood === 'mist_ambient',
      iTunesUrl: track.trackViewUrl,
      price: track.trackPrice,
      currency: track.currency
    })).filter(track => track.url) // 미리듣기 URL이 있는 것만 필터

    res.json({
      success: true,
      data: {
        mood: mood,
        tracks: tracks,
        total: tracks.length,
        source: 'iTunes'
      }
    })

  } catch (error) {
    console.error('Music Search API Error:', error.message)
    
    // 에러 시 기본 데이터 반환
    res.status(500).json({
      success: false,
      error: 'Failed to search music',
      message: error.message,
      data: {
        mood: req.query.mood,
        tracks: [],
        total: 0,
        source: 'fallback'
      }
    })
  }
})

// 특정 아티스트로 검색
router.get('/artist/:artistName', async (req, res) => {
  try {
    const { artistName } = req.params
    const { limit = 10 } = req.query

    const response = await axios.get('https://itunes.apple.com/search', {
      params: {
        term: artistName,
        media: 'music',
        entity: 'song',
        limit: limit,
        country: 'US',
        explicit: 'No'
      }
    })

    const tracks = response.data.results.map((track, index) => ({
      id: `artist_${track.trackId}_${index}`,
      title: track.trackName || 'Unknown Title',
      artist: track.artistName || 'Unknown Artist',
      album: track.collectionName || 'Unknown Album',
      duration: Math.floor(track.trackTimeMillis / 1000) || 180,
      url: track.previewUrl || null,
      artwork: track.artworkUrl100 || track.artworkUrl60 || null,
      genre: track.primaryGenreName || 'Unknown',
      iTunesUrl: track.trackViewUrl,
      price: track.trackPrice,
      currency: track.currency
    })).filter(track => track.url)

    res.json({
      success: true,
      data: {
        artist: artistName,
        tracks: tracks,
        total: tracks.length,
        source: 'iTunes'
      }
    })

  } catch (error) {
    console.error('Artist Search API Error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to search artist',
      message: error.message
    })
  }
})

// 장르별 검색
router.get('/genre/:genreName', async (req, res) => {
  try {
    const { genreName } = req.params
    const { limit = 20 } = req.query

    // 장르별 검색어 매핑
    const genreSearchTerms = {
      pop: 'pop music hit chart',
      rock: 'rock music alternative indie',
      jazz: 'jazz smooth blues',
      classical: 'classical symphony orchestral',
      electronic: 'electronic dance EDM techno',
      hiphop: 'hip hop rap urban',
      country: 'country music folk bluegrass',
      reggae: 'reggae caribbean tropical',
      blues: 'blues soul rhythm',
      folk: 'folk acoustic indie singer-songwriter'
    }

    const searchTerm = genreSearchTerms[genreName.toLowerCase()] || genreName

    const response = await axios.get('https://itunes.apple.com/search', {
      params: {
        term: searchTerm,
        media: 'music',
        entity: 'song',
        limit: limit,
        country: 'US',
        explicit: 'No'
      }
    })

    const tracks = response.data.results.map((track, index) => ({
      id: `genre_${genreName}_${track.trackId}_${index}`,
      title: track.trackName || 'Unknown Title',
      artist: track.artistName || 'Unknown Artist',
      album: track.collectionName || 'Unknown Album',
      duration: Math.floor(track.trackTimeMillis / 1000) || 180,
      url: track.previewUrl || null,
      artwork: track.artworkUrl100 || track.artworkUrl60 || null,
      genre: track.primaryGenreName || genreName,
      iTunesUrl: track.trackViewUrl,
      price: track.trackPrice,
      currency: track.currency
    })).filter(track => track.url)

    res.json({
      success: true,
      data: {
        genre: genreName,
        tracks: tracks,
        total: tracks.length,
        source: 'iTunes'
      }
    })

  } catch (error) {
    console.error('Genre Search API Error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to search by genre',
      message: error.message
    })
  }
})

// 트렌딩/인기 음악 (다양한 장르 믹스)
router.get('/trending', async (req, res) => {
  try {
    const { limit = 20 } = req.query
    
    // 인기 키워드들로 검색
    const trendingTerms = [
      'top hits 2024',
      'popular music chart',
      'trending songs',
      'viral music',
      'hit songs'
    ]

    // 랜덤으로 하나 선택
    const randomTerm = trendingTerms[Math.floor(Math.random() * trendingTerms.length)]

    const response = await axios.get('https://itunes.apple.com/search', {
      params: {
        term: randomTerm,
        media: 'music',
        entity: 'song',
        limit: limit,
        country: 'US',
        explicit: 'No'
      }
    })

    const tracks = response.data.results.map((track, index) => ({
      id: `trending_${track.trackId}_${index}`,
      title: track.trackName || 'Unknown Title',
      artist: track.artistName || 'Unknown Artist',
      album: track.collectionName || 'Unknown Album',
      duration: Math.floor(track.trackTimeMillis / 1000) || 180,
      url: track.previewUrl || null,
      artwork: track.artworkUrl100 || track.artworkUrl60 || null,
      genre: track.primaryGenreName || 'Popular',
      iTunesUrl: track.trackViewUrl,
      price: track.trackPrice,
      currency: track.currency
    })).filter(track => track.url)

    res.json({
      success: true,
      data: {
        category: 'trending',
        tracks: tracks,
        total: tracks.length,
        source: 'iTunes'
      }
    })

  } catch (error) {
    console.error('Trending Music API Error:', error.message)
    res.status(500).json({
      success: false,
      error: 'Failed to get trending music',
      message: error.message
    })
  }
})

export default router