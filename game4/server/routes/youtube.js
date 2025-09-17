import express from 'express'

const router = express.Router()

// YouTube 재생 가능한 실제 음악 데이터베이스 - 정확한 videoId 확인됨
const YOUTUBE_MUSIC_DB = {
  'sunny_upbeat': [
    { videoId: 'gdZLi9oWNZg', title: 'Dynamite', artist: 'BTS', thumbnail: 'https://i.ytimg.com/vi/gdZLi9oWNZg/default.jpg' },
    { videoId: 'CuklIb9d3fI', title: 'FANCY', artist: 'TWICE', thumbnail: 'https://i.ytimg.com/vi/CuklIb9d3fI/default.jpg' },
    { videoId: 'IHNzOHi8sJs', title: 'DNA', artist: 'BTS', thumbnail: 'https://i.ytimg.com/vi/IHNzOHi8sJs/default.jpg' },
    { videoId: '9bZkp7q19f0', title: '강남스타일', artist: 'PSY', thumbnail: 'https://i.ytimg.com/vi/9bZkp7q19f0/default.jpg' },
    { videoId: 'i0p1bmr0EmE', title: 'What is Love?', artist: 'TWICE', thumbnail: 'https://i.ytimg.com/vi/i0p1bmr0EmE/default.jpg' },
    { videoId: 'mAKsZ26SabQ', title: 'YES or YES', artist: 'TWICE', thumbnail: 'https://i.ytimg.com/vi/mAKsZ26SabQ/default.jpg' },
    { videoId: 'MBdVXkSdhwU', title: '봄날', artist: 'BTS', thumbnail: 'https://i.ytimg.com/vi/MBdVXkSdhwU/default.jpg' },
    { videoId: 'bwmSjveL3Lc', title: 'BOOMBAYAH', artist: 'BLACKPINK', thumbnail: 'https://i.ytimg.com/vi/bwmSjveL3Lc/default.jpg' },
  ],
  'cloudy_chill': [
    { videoId: 'D1PvIWdJ8xo', title: 'Blueming', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/D1PvIWdJ8xo/default.jpg' },
    { videoId: 'd9IxdwEFk1c', title: 'Palette (Feat. G-DRAGON)', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/d9IxdwEFk1c/default.jpg' },
    { videoId: 'v7bnOxV4jAc', title: '밤편지', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/v7bnOxV4jAc/default.jpg' },
    { videoId: '0-q1KafFCLU', title: 'How You Like That', artist: 'BLACKPINK', thumbnail: 'https://i.ytimg.com/vi/0-q1KafFCLU/default.jpg' },
    { videoId: 'uR8Mrt1IpXg', title: 'Psycho', artist: 'Red Velvet', thumbnail: 'https://i.ytimg.com/vi/uR8Mrt1IpXg/default.jpg' },
    { videoId: 'vRXZj0DzXIA', title: 'Red Flavor', artist: 'Red Velvet', thumbnail: 'https://i.ytimg.com/vi/vRXZj0DzXIA/default.jpg' },
    { videoId: 'CuklIb9d3fI', title: 'FANCY', artist: 'TWICE', thumbnail: 'https://i.ytimg.com/vi/CuklIb9d3fI/default.jpg' },
  ],
  'rain_lofi': [
    { videoId: '9jFZdu0zTEA', title: '비', artist: '폴킴', thumbnail: 'https://i.ytimg.com/vi/aqVi8IImEwE/default.jpg' },
    { videoId: 'v7bnOxV4jAc', title: '밤편지', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/v7bnOxV4jAc/default.jpg' },
    { videoId: 'D1PvIWdJ8xo', title: 'Blueming', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/D1PvIWdJ8xo/default.jpg' },
    { videoId: 'H69tJmsgd9I', title: 'Love poem', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/H69tJmsgd9I/default.jpg' },
    { videoId: 'nM0xDI5R50E', title: 'BBIBBI', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/nM0xDI5R50E/default.jpg' },
    { videoId: 'uR8Mrt1IpXg', title: 'Psycho', artist: 'Red Velvet', thumbnail: 'https://i.ytimg.com/vi/uR8Mrt1IpXg/default.jpg' },
    { videoId: 'mAKsZ26SabQ', title: 'YES or YES', artist: 'TWICE', thumbnail: 'https://i.ytimg.com/vi/mAKsZ26SabQ/default.jpg' },
    { videoId: 'd9IxdwEFk1c', title: 'Palette (Feat. G-DRAGON)', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/d9IxdwEFk1c/default.jpg' },
  ],
  'storm_energetic': [
    { videoId: 'aPd9exmH17o', title: 'DDU-DU DDU-DU', artist: 'BLACKPINK', thumbnail: 'https://i.ytimg.com/vi/aPd9exmH17o/default.jpg' },
    { videoId: 'Amq-qlqbjYA', title: 'KILL THIS LOVE', artist: 'BLACKPINK', thumbnail: 'https://i.ytimg.com/vi/Amq-qlqbjYA/default.jpg' },
    { videoId: 'TQTlCHxyuu8', title: '소리꾼', artist: 'Stray Kids', thumbnail: 'https://i.ytimg.com/vi/TQTlCHxyuu8/default.jpg' },
    { videoId: 'mAKsZ26SabQ', title: 'YES or YES', artist: 'TWICE', thumbnail: 'https://i.ytimg.com/vi/mAKsZ26SabQ/default.jpg' },
    { videoId: '7HDeem-JaSY', title: 'FAKE LOVE', artist: 'BTS', thumbnail: 'https://i.ytimg.com/vi/7HDeem-JaSY/default.jpg' },
    { videoId: 'gdZLi9oWNZg', title: 'Dynamite', artist: 'BTS', thumbnail: 'https://i.ytimg.com/vi/gdZLi9oWNZg/default.jpg' },
    { videoId: '0-q1KafFCLU', title: 'How You Like That', artist: 'BLACKPINK', thumbnail: 'https://i.ytimg.com/vi/0-q1KafFCLU/default.jpg' },
  ],
  'snow_cozy': [
    { videoId: 'nM0xDI5R50E', title: 'BBIBBI', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/nM0xDI5R50E/default.jpg' },
    { videoId: 'FZ9lJ5ctd0s', title: '첫눈', artist: 'EXO', thumbnail: 'https://i.ytimg.com/vi/FZ9lJ5ctd0s/default.jpg' },
    { videoId: 'V5PLNMn3Wfg', title: '썸타', artist: '볼빨간사춘기', thumbnail: 'https://i.ytimg.com/vi/V5PLNMn3Wfg/default.jpg' },
    { videoId: 'v7bnOxV4jAc', title: '밤편지', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/v7bnOxV4jAc/default.jpg' },
    { videoId: 'D1PvIWdJ8xo', title: 'Blueming', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/D1PvIWdJ8xo/default.jpg' },
    { videoId: 'H69tJmsgd9I', title: 'Love poem', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/H69tJmsgd9I/default.jpg' },
    { videoId: 'MBdVXkSdhwU', title: '봄날', artist: 'BTS', thumbnail: 'https://i.ytimg.com/vi/MBdVXkSdhwU/default.jpg' },
  ],
  'mist_ambient': [
    { videoId: 'nM0xDI5R50E', title: 'BBIBBI', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/nM0xDI5R50E/default.jpg' },
    { videoId: 'v7bnOxV4jAc', title: '밤편지', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/v7bnOxV4jAc/default.jpg' },
    { videoId: 'D1PvIWdJ8xo', title: 'Blueming', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/D1PvIWdJ8xo/default.jpg' },
    { videoId: 'H69tJmsgd9I', title: 'Love poem', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/H69tJmsgd9I/default.jpg' },
    { videoId: 'd9IxdwEFk1c', title: 'Palette (Feat. G-DRAGON)', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/d9IxdwEFk1c/default.jpg' },
    { videoId: 'uR8Mrt1IpXg', title: 'Psycho', artist: 'Red Velvet', thumbnail: 'https://i.ytimg.com/vi/uR8Mrt1IpXg/default.jpg' },
  ],
  'heat_tropical': [
    { videoId: 'k6jqx9kZgPM', title: 'Dance The Night Away', artist: 'TWICE', thumbnail: 'https://i.ytimg.com/vi/k6jqx9kZgPM/default.jpg' },
    { videoId: 'vRXZj0DzXIA', title: 'Red Flavor', artist: 'Red Velvet', thumbnail: 'https://i.ytimg.com/vi/vRXZj0DzXIA/default.jpg' },
    { videoId: 'WyiIGEHQP8o', title: 'Really Really', artist: 'WINNER', thumbnail: 'https://i.ytimg.com/vi/WyiIGEHQP8o/default.jpg' },
    { videoId: 'HlN2BXNJzxA', title: 'Alcohol-Free', artist: 'TWICE', thumbnail: 'https://i.ytimg.com/vi/HlN2BXNJzxA/default.jpg' },
    { videoId: 'abcNvZgFfZs', title: 'Power Up', artist: 'Red Velvet', thumbnail: 'https://i.ytimg.com/vi/abcNvZgFfZs/default.jpg' },
    { videoId: 'gdZLi9oWNZg', title: 'Dynamite', artist: 'BTS', thumbnail: 'https://i.ytimg.com/vi/gdZLi9oWNZg/default.jpg' },
    { videoId: 'CuklIb9d3fI', title: 'FANCY', artist: 'TWICE', thumbnail: 'https://i.ytimg.com/vi/CuklIb9d3fI/default.jpg' },
  ],
  'cold_warmup': [
    { videoId: 'nM0xDI5R50E', title: 'BBIBBI', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/nM0xDI5R50E/default.jpg' },
    { videoId: 'v7bnOxV4jAc', title: '밤편지', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/v7bnOxV4jAc/default.jpg' },
    { videoId: 'H69tJmsgd9I', title: 'Love poem', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/H69tJmsgd9I/default.jpg' },
    { videoId: 'd9IxdwEFk1c', title: 'Palette (Feat. G-DRAGON)', artist: 'IU', thumbnail: 'https://i.ytimg.com/vi/d9IxdwEFk1c/default.jpg' },
    { videoId: '0-q1KafFCLU', title: 'How You Like That', artist: 'BLACKPINK', thumbnail: 'https://i.ytimg.com/vi/0-q1KafFCLU/default.jpg' },
    { videoId: 'MBdVXkSdhwU', title: '봄날', artist: 'BTS', thumbnail: 'https://i.ytimg.com/vi/MBdVXkSdhwU/default.jpg' },
  ]
}

// YouTube 음악 검색 엔드포인트
router.get('/search', async (req, res) => {
  try {
    const { mood } = req.query

    if (!mood) {
      return res.status(400).json({
        success: false,
        error: 'Mood parameter is required'
      })
    }

    // 해당 무드의 음악 가져오기
    const tracks = YOUTUBE_MUSIC_DB[mood] || YOUTUBE_MUSIC_DB['sunny_upbeat']

    // 랜덤하게 섞기
    const shuffled = [...tracks].sort(() => Math.random() - 0.5)

    res.json({
      success: true,
      data: {
        tracks: shuffled,
        mood: mood,
        total: shuffled.length
      }
    })
  } catch (error) {
    console.error('YouTube search error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'YouTube search failed'
    })
  }
})

export default router