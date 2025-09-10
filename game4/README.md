# 🌦️ 하이브리드 날씨 웹앱

날씨 기반 무드 토큰으로 개인화된 오락 및 유틸리티 경험을 제공하는 하이브리드 웹앱

## 🎯 프로젝트 개요

- **오락 70% / 유틸리티 30%** 비율의 경험 설계
- **무드 토큰 시스템**으로 날씨에 따른 개인화된 콘텐츠 제공
- **글래스모피즘 UI**와 다크/라이트 모드 지원
- **PWA 기능**으로 네이티브 앱 같은 경험
- **무료 API만 사용**하여 비용 효율적 운영

## 🏗️ 아키텍처

### 레이아웃 구조
```
┌─────────────────────────────────────────┐
│ 좌측 패널        │ 메인 콘텐츠    │ 날씨 패널 │
│ (네비게이션)     │ (카드 그리드)  │ (날씨정보)│
│ 25%             │ 50%           │ 25%      │
│                 │               │          │
│ • 즐겨찾기       │ • 음악 카드    │ • 현재날씨│
│ • 히스토리       │ • 퀴즈 카드    │ • 예보    │
│ • 설정          │ • 랜덤 콘텐츠   │ • 공기질  │
│ • 프로필        │ • 액티비티     │ • 팁     │
└─────────────────────────────────────────┘
```

### 무드 토큰 시스템
날씨 조건에 따라 8가지 무드 토큰을 생성하여 UI 테마와 콘텐츠를 자동 조정:

- 🌞 **SUNNY_UPBEAT**: 맑은 날씨 → 밝고 에너제틱한 콘텐츠
- ☁️ **CLOUDY_CHILL**: 흐린 날씨 → 차분하고 편안한 콘텐츠  
- 🌧️ **RAIN_LOFI**: 비 오는 날 → 로파이 음악과 실내 활동
- ⛈️ **STORM_ENERGETIC**: 폭풍 → 역동적이고 강렬한 콘텐츠
- ❄️ **SNOW_COZY**: 눈 → 따뜻하고 아늑한 분위기
- 🌫️ **MIST_AMBIENT**: 안개 → 몽환적이고 차분한 콘텐츠
- 🔥 **HEAT_TROPICAL**: 무더위 → 트로피컬하고 시원한 콘텐츠
- 🧊 **COLD_WARMUP**: 추위 → 따뜻하고 활력적인 콘텐츠

## 🛠️ 기술 스택

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Zustand** (상태관리)  
- **Tailwind CSS** (스타일링)
- **Framer Motion** (애니메이션)
- **React Query** (데이터 페칭)
- **PWA** (Workbox)

### Backend  
- **Express.js** (API 프록시)
- **Redis** (캐싱)
- **Railway/Vercel** (배포)

### APIs
- **OpenWeatherMap**: 날씨 데이터
- **Last.fm + Spotify**: 음악 추천
- **Open Trivia DB**: 퀴즈
- **Unsplash**: 이미지
- **NASA APOD**: 우주 사진

## 🚀 빠른 시작

### 1. 프로젝트 설정
```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일에서 API 키들을 설정하세요

# 개발 서버 시작
npm run dev
```

### 2. API 키 발급
무료 API 키들을 발급받아 `.env` 파일에 설정:

1. [OpenWeatherMap](https://openweathermap.org/api) - 무료 1000 calls/day
2. [Last.fm](https://www.last.fm/api) - 무료 API
3. [Spotify](https://developer.spotify.com/) - 무료 웹 API
4. [Unsplash](https://unsplash.com/developers) - 무료 5000 requests/hour

### 3. 개발 명령어
```bash
npm run dev          # 개발 서버 실행
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 미리보기
npm run test         # 테스트 실행
npm run lint         # 린트 검사
```

## 📱 기능 상세

### 오락 기능 (70%)
1. **🎵 무드 기반 음악 추천**
   - 날씨에 따른 음악 큐레이션
   - 30초 미리듣기 지원
   - 외부 음악 앱 연동

2. **🧠 인터랙티브 퀴즈**
   - 난이도 선택 (쉬움/보통/어려움)
   - 실시간 채점 및 해설
   - 카테고리별 퀴즈 제공

3. **🎲 랜덤 즐길거리**
   - 동물 사진과 재미있는 사실
   - NASA 우주 사진과 설명
   - 영감을 주는 명언
   - 무드에 따른 콘텐츠 필터링

### 유틸리티 기능 (30%)
1. **🌤️ 상세 날씨 정보**
   - 현재 날씨 및 체감온도
   - 시간별/주간 예보
   - 공기질 지수 및 건강 정보

2. **💡 생활 팁 및 추천**
   - 옷차림 가이드
   - 우산 필요 여부
   - 자외선 차단 조언
   - 실내/야외 활동 제안

3. **📈 보조 정보**
   - 간단한 환율 정보
   - 지역별 시간대 정보

## 🎨 디자인 시스템

### 글래스모피즘 UI
```css
.glass-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### 다크/라이트 모드
- 시스템 설정 자동 감지
- 수동 토글 지원
- 무드 토큰에 따른 색상 조정

### 애니메이션
- 카드 전환: 부드러운 페이드 인/아웃
- 날씨 변화: 배경 파티클 효과
- 무드 전환: 색상과 레이아웃 애니메이션
- 모바일 제스처: 스와이프와 터치 반응

## 📱 모바일 최적화

### 반응형 레이아웃
- **데스크톱**: 3열 고정 레이아웃
- **태블릿**: 2열 + 하단 날씨 패널
- **모바일**: 단일 열 + 하단 시트

### 터치 제스처
- **스와이프**: 카드 간 이동
- **핀치**: 확대/축소 (선택사항)
- **롱프레스**: 컨텍스트 메뉴
- **Pull-to-refresh**: 데이터 새로고침

## 🔧 개발 가이드

### 새 카드 타입 추가
```typescript
// 1. 카드 타입 정의
interface CustomCard extends BaseCard {
  type: 'custom';
  customData: any;
}

// 2. 컴포넌트 구현
const CustomCardComponent: React.FC<{ data: CustomCard }> = ({ data }) => {
  return (
    <GlassCard>
      {/* 카드 내용 */}
    </GlassCard>
  );
};

// 3. 카드 레지스트리에 등록
const cardRegistry = {
  // 기존 카드들...
  custom: CustomCardComponent
};
```

### 무드 토큰 로직 확장
```typescript
// moodEngine.ts에서 새로운 조건 추가
const generateMoodToken = (weather: WeatherData): MoodToken => {
  // 기존 로직...
  
  // 새로운 조건 추가
  if (weather.temperature > 35 && weather.humidity > 80) {
    return MoodToken.HUMID_SLUGGISH;
  }
  
  return defaultMood;
};
```

## 📊 성능 목표

### Core Web Vitals
- **LCP**: < 2.5s (목표: 1.5s)
- **FID**: < 100ms (목표: 50ms)  
- **CLS**: < 0.1 (목표: 0.05)

### 최적화 전략
- 번들 분할 및 코드 스플리팅
- 이미지 lazy loading 및 WebP 포맷
- Service Worker 캐싱
- Redis 기반 API 응답 캐싱

## 🔐 보안 고려사항

### API 키 보안
- 모든 API 키는 서버 사이드에서 관리
- 클라이언트에서는 프록시 엔드포인트만 호출
- 환경변수를 통한 키 관리

### 사용자 데이터
- 위치 데이터는 세션 내에서만 보관
- 개인 설정은 로컬 스토리지 활용
- 쿠키나 서버 저장소에 민감 정보 저장 금지

## 🚀 배포 가이드

### Vercel (Frontend)
```bash
# Vercel CLI 설치 및 배포
npm i -g vercel
vercel --prod
```

### Railway (Backend)
```bash
# Railway CLI를 통한 배포
npm i -g @railway/cli
railway login
railway link
railway up
```

## 📈 로드맵

### Phase 1: 핵심 기능 (완료 목표: 2주)
- [x] 기본 레이아웃 및 컴포넌트
- [ ] 날씨 API 통합
- [ ] 무드 토큰 시스템 구현
- [ ] 기본 카드 타입 3개

### Phase 2: 고급 기능 (완료 목표: 2주)
- [ ] 음악 API 통합
- [ ] 퀴즈 시스템
- [ ] PWA 기능
- [ ] 모바일 최적화

### Phase 3: 확장 기능 (완료 목표: 1주)
- [ ] 사용자 개인화
- [ ] 성능 최적화
- [ ] 접근성 개선
- [ ] 테스트 작성

### Phase 4: 배포 및 모니터링 (완료 목표: 0.5주)
- [ ] 프로덕션 배포
- [ ] 모니터링 설정
- [ ] 에러 추적
- [ ] 사용자 피드백 수집

## 📋 다음 단계

1. **즉시 실행**: `npm install` 및 환경 설정
2. **API 키 발급**: 무료 API 서비스들에서 키 발급
3. **개발 시작**: Phase 1 기능부터 구현 시작
4. **피드백**: 개발 과정에서 지속적인 개선사항 도출

## 📚 참고 문서

- [아키텍처 개선사항](./hybrid-webapp-improvements.md) - 상세 기술 분석
- [기술 스택 가이드](./tech-stack-guide.md) - 구현 세부사항
- [API 문서](./docs/api.md) - API 명세서 (작성 예정)
- [컴포넌트 문서](./docs/components.md) - UI 컴포넌트 가이드 (작성 예정)

---

**Made with ☁️ by Architect Persona + Sequential Analysis**