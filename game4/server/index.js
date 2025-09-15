import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import weatherRoutes from './routes/weather.js'
import musicRoutes from './routes/music.js'
import quizAIRoutes from './routes/quizAI.js'
import worldExplorerRoutes from './routes/worldExplorer.js'

// ES 모듈에서 __dirname 사용
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 환경변수 로드
dotenv.config({ path: path.join(__dirname, '..', '.env.development') })
console.log('GEMINI_API_KEY loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No')

const app = express()
const PORT = process.env.PORT || 3004

// 미들웨어
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:5173',
    /^http:\/\/192\.168\.\d+\.\d+:3003$/, // 네트워크 IP 패턴 허용
    /^http:\/\/192\.168\.\d+\.\d+:3004$/, // 네트워크 IP 패턴 허용
    /^http:\/\/\d+\.\d+\.\d+\.\d+:3003$/, // 모든 IP 패턴 허용
    /^http:\/\/\d+\.\d+\.\d+\.\d+:3004$/, // 모든 IP 패턴 허용
  ],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: 'Too many requests from this IP, please try again later.'
})

app.use('/api', limiter)

// API 라우트
app.use('/api/weather', weatherRoutes)
app.use('/api/music', musicRoutes)
app.use('/api/quiz-ai', quizAIRoutes)
app.use('/api/world-explorer', worldExplorerRoutes)

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
})

// 프로덕션 모드에서 정적 파일 서빙
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')))
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'))
  })
}

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  })
})

// 404 핸들링
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Not Found',
      status: 404
    }
  })
})

// 서버 시작 - 모든 인터페이스에서 접근 가능하도록 설정
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  🚀 Server is running!
  📡 Port: ${PORT}
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  🔗 Local: http://localhost:${PORT}/api/health
  🌐 Network: http://0.0.0.0:${PORT}/api/health
  `)
})