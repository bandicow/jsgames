# 기술 스택 및 구현 가이드

## 📦 권장 기술 스택

### Frontend 스택
```json
{
  "name": "hybrid-weather-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.1",
    "framer-motion": "^10.16.4",
    "react-query": "^3.39.3",
    "axios": "^1.5.0",
    "date-fns": "^2.30.0",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.15",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "postcss": "^8.4.28",
    "tailwindcss": "^3.3.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5",
    "vitest": "^0.34.4",
    "vite-plugin-pwa": "^0.16.4",
    "workbox-window": "^7.0.0"
  }
}
```

### Backend/서버 설정
```json
{
  "name": "hybrid-weather-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "redis": "^4.6.7",
    "node-cache": "^5.1.2",
    "axios": "^1.5.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2"
  }
}
```

---

## 🔧 개발 환경 설정

### 1. Vite 설정 (vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.(openweathermap|weatherapi)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'weather-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 10 * 60 // 10분
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['framer-motion'],
          utils: ['date-fns', 'axios']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

### 2. Tailwind CSS 설정 (tailwind.config.js)
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.25)',
          dark: 'rgba(0, 0, 0, 0.25)'
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio')
  ],
}
```

---

## 🌐 API 통합 전략

### 1. API 서비스 레이어 구조
```
src/services/
├── api/
│   ├── weather.ts      # OpenWeatherMap/WeatherAPI
│   ├── music.ts        # Last.fm + Spotify
│   ├── location.ts     # Geolocation + IP
│   ├── quiz.ts         # Open Trivia DB
│   └── images.ts       # Unsplash + NASA
├── cache/
│   ├── weatherCache.ts
│   └── musicCache.ts
└── types/
    ├── weather.ts
    ├── music.ts
    └── common.ts
```

### 2. Weather API 구현 예시
```typescript
// src/services/api/weather.ts
interface WeatherAPI {
  getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather>;
  getForecast(lat: number, lon: number): Promise<ForecastData>;
  getAirQuality(lat: number, lon: number): Promise<AQIData>;
}

class OpenWeatherMapAPI implements WeatherAPI {
  private baseURL = '/api/weather'; // 프록시 경로
  
  async getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
    try {
      const response = await axios.get(`${this.baseURL}/current`, {
        params: { lat, lon },
        timeout: 5000
      });
      return this.transformWeatherData(response.data);
    } catch (error) {
      throw new WeatherAPIError('Failed to fetch current weather', error);
    }
  }

  private transformWeatherData(data: any): CurrentWeather {
    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      visibility: data.visibility,
      timestamp: Date.now()
    };
  }
}
```

### 3. 음악 API 구현
```typescript
// src/services/api/music.ts
interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork: string;
  previewUrl?: string;
  externalUrl: string;
  duration?: number;
}

class LastFmAPI {
  private baseURL = '/api/music';
  
  async searchByMood(moodToken: MoodToken): Promise<MusicTrack[]> {
    const searchTerm = this.getMoodSearchTerm(moodToken);
    
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        params: { 
          query: searchTerm,
          limit: 10 
        }
      });
      
      return response.data.tracks.map(this.transformTrack);
    } catch (error) {
      console.warn('Music API failed, using fallback');
      return this.getFallbackTracks(moodToken);
    }
  }

  private getMoodSearchTerm(mood: MoodToken): string {
    const moodTerms = {
      [MoodToken.SUNNY_UPBEAT]: 'upbeat happy summer',
      [MoodToken.RAIN_LOFI]: 'chill lofi rain ambient',
      [MoodToken.STORM_ENERGETIC]: 'energetic rock electronic',
      // ...
    };
    return moodTerms[mood] || 'ambient chill';
  }
}
```

---

## 🏗️ 폴더 구조

```
game4/
├── public/
│   ├── icons/          # PWA 아이콘들
│   ├── sounds/         # 효과음 (선택사항)
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── LeftPanel.tsx
│   │   │   ├── MainContent.tsx
│   │   │   └── WeatherPanel.tsx
│   │   ├── cards/
│   │   │   ├── BaseCard.tsx
│   │   │   ├── MusicCard.tsx
│   │   │   ├── QuizCard.tsx
│   │   │   ├── WeatherCard.tsx
│   │   │   └── RandomCard.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── weather/
│   │       ├── WeatherIcon.tsx
│   │       ├── ForecastChart.tsx
│   │       └── AQIIndicator.tsx
│   ├── services/
│   │   ├── api/
│   │   ├── cache/
│   │   ├── mood/
│   │   └── location/
│   ├── store/
│   │   ├── weatherStore.ts
│   │   ├── moodStore.ts
│   │   ├── userStore.ts
│   │   └── uiStore.ts
│   ├── types/
│   │   ├── weather.ts
│   │   ├── music.ts
│   │   ├── mood.ts
│   │   └── ui.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── formatters.ts
│   ├── hooks/
│   │   ├── useWeather.ts
│   │   ├── useMood.ts
│   │   ├── useGeolocation.ts
│   │   └── useLocalStorage.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── components.css
│   │   └── animations.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── server/                # Backend (Express.js)
│   ├── routes/
│   │   ├── weather.js
│   │   ├── music.js
│   │   └── images.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── cache.js
│   │   └── rateLimit.js
│   ├── services/
│   │   └── apiProxy.js
│   ├── config/
│   │   └── apis.js
│   └── server.js
├── tests/
│   ├── components/
│   ├── services/
│   └── e2e/
├── docs/
│   ├── api.md
│   └── deployment.md
├── .env.example
├── .gitignore
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 🎨 UI 컴포넌트 예시

### 1. 글래스모피즘 카드 컴포넌트
```tsx
// src/components/ui/GlassCard.tsx
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg';
  opacity?: 'light' | 'medium' | 'dark';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '',
  blur = 'md',
  opacity = 'medium'
}) => {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg'
  };

  const opacityClasses = {
    light: 'bg-white/10 dark:bg-black/10',
    medium: 'bg-white/20 dark:bg-black/20',
    dark: 'bg-white/30 dark:bg-black/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        ${opacityClasses[opacity]}
        ${blurClasses[blur]}
        border border-white/20 dark:border-white/10
        rounded-2xl shadow-lg
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
```

### 2. 날씨 패널 컴포넌트
```tsx
// src/components/layout/WeatherPanel.tsx
export const WeatherPanel: React.FC = () => {
  const { weather, forecast, loading, error } = useWeather();
  const { currentMood } = useMood();
  
  if (loading) return <WeatherSkeleton />;
  if (error) return <WeatherError onRetry={() => window.location.reload()} />;
  
  return (
    <aside className="w-full lg:w-80 space-y-4">
      {/* 현재 날씨 */}
      <GlassCard className="p-6">
        <div className="text-center">
          <WeatherIcon condition={weather.condition} size="lg" />
          <h2 className="text-2xl font-light mt-2">{weather.temperature}°</h2>
          <p className="text-sm opacity-75">{weather.description}</p>
          <p className="text-xs opacity-60 mt-1">체감 {weather.feelsLike}°</p>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="opacity-60">습도</span>
            <p className="font-medium">{weather.humidity}%</p>
          </div>
          <div>
            <span className="opacity-60">바람</span>
            <p className="font-medium">{weather.windSpeed} m/s</p>
          </div>
        </div>
      </GlassCard>
      
      {/* 시간별 예보 */}
      <GlassCard className="p-4">
        <h3 className="font-medium mb-3">시간별 예보</h3>
        <div className="space-y-2">
          {forecast.hourly.slice(0, 6).map((hour) => (
            <div key={hour.time} className="flex justify-between items-center">
              <span className="text-sm">{format(hour.time, 'HH:mm')}</span>
              <div className="flex items-center gap-2">
                <WeatherIcon condition={hour.condition} size="sm" />
                <span className="text-sm">{hour.temperature}°</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
      
      {/* 공기질 */}
      {weather.airQuality && (
        <GlassCard className="p-4">
          <h3 className="font-medium mb-2">공기질</h3>
          <AQIIndicator 
            value={weather.airQuality.aqi}
            level={weather.airQuality.level}
          />
        </GlassCard>
      )}
    </aside>
  );
};
```

---

## 🔄 상태 관리 (Zustand)

```typescript
// src/store/weatherStore.ts
interface WeatherState {
  weather: CurrentWeather | null;
  forecast: ForecastData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  
  // Actions
  fetchWeather: (lat: number, lon: number) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  weather: null,
  forecast: null,
  loading: false,
  error: null,
  lastUpdated: null,
  
  fetchWeather: async (lat: number, lon: number) => {
    const { lastUpdated } = get();
    const now = Date.now();
    
    // 10분 이내면 스킵
    if (lastUpdated && (now - lastUpdated) < 10 * 60 * 1000) {
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      const weatherAPI = new OpenWeatherMapAPI();
      const [weather, forecast] = await Promise.all([
        weatherAPI.getCurrentWeather(lat, lon),
        weatherAPI.getForecast(lat, lon)
      ]);
      
      set({ 
        weather, 
        forecast, 
        loading: false, 
        lastUpdated: now 
      });
    } catch (error) {
      set({ 
        error: error.message, 
        loading: false 
      });
    }
  },
  
  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ loading })
}));
```

---

## 🚀 즉시 시작 가능한 스크립트

### 프로젝트 초기화
```bash
# game4 폴더로 이동
cd game4

# React + TypeScript + Vite 프로젝트 생성
npm create vite@latest . -- --template react-ts

# 추가 패키지 설치
npm install zustand framer-motion react-query axios date-fns react-hot-toast

# 개발 도구 설치
npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms @tailwindcss/aspect-ratio vite-plugin-pwa

# Tailwind 초기화
npx tailwindcss init -p

# 서버 폴더 생성 및 초기화
mkdir server && cd server
npm init -y
npm install express cors helmet express-rate-limit redis axios dotenv
npm install -D nodemon

# 다시 루트로
cd ..
```

### 환경변수 설정 (.env.example)
```env
# Weather APIs
OPENWEATHER_API_KEY=your_openweather_key
WEATHERAPI_KEY=your_weatherapi_key

# Music APIs  
LASTFM_API_KEY=your_lastfm_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Image APIs
UNSPLASH_ACCESS_KEY=your_unsplash_key
NASA_API_KEY=your_nasa_key

# Other APIs
EXCHANGERATE_API_KEY=your_exchange_key

# Server Config
PORT=3001
NODE_ENV=development
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

이제 `npm run dev`로 개발을 시작할 수 있습니다!