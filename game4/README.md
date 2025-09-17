# 🌦️ WeatherHub (웨더허브)

날씨 기반 라이프스타일 플랫폼 - 날씨와 함께하는 음악, 게임, 뉴스, 퀴즈

## 🎯 프로젝트 개요

**WeatherHub**는 현재 날씨를 기반으로 개인화된 콘텐츠를 제공하는 종합 라이프스타일 플랫폼입니다.

### 주요 특징
- **🎮 6종 브라우저 게임**: 2048, 틱택토, 가위바위보, 숫자야구, 메모리카드, 반응속도
- **🎵 날씨 기반 음악 추천**: YouTube Music API 연동
- **📰 실시간 뉴스**: Google News RSS + Gemini AI 요약
- **🧠 AI 퀴즈**: Gemini 기반 날씨 퀴즈
- **🌍 세계 날씨 탐험**: 전 세계 도시 날씨 정보
- **🏃 액티비티 추천**: 날씨에 맞는 활동 제안

## 🏗️ 시스템 아키텍처

### 기술 스택
- **Frontend**: React 18 + TypeScript + Vite
- **상태관리**: Zustand (영구 저장 지원)
- **스타일링**: Tailwind CSS + 글래스모피즘 UI
- **애니메이션**: Framer Motion
- **백엔드**: Express.js (API 프록시)
- **API 통합**: OpenWeatherMap, YouTube Music, Google News, Gemini AI

### 무드 토큰 시스템
날씨에 따라 8가지 무드로 콘텐츠 개인화:

- 🌞 **맑음 상쾌** (sunny_upbeat): 밝고 활기찬 콘텐츠
- ☁️ **구름 여유** (cloudy_chill): 차분하고 편안한 콘텐츠
- 🌧️ **비 감성** (rain_lofi): 로파이 음악과 실내 활동
- ⛈️ **폭풍 역동** (storm_energetic): 강렬하고 역동적인 콘텐츠
- ❄️ **눈 포근** (snow_cozy): 따뜻하고 아늑한 분위기
- 🌫️ **안개 신비** (mist_ambient): 몽환적인 콘텐츠
- 🏝️ **더위 열정** (heat_tropical): 시원한 트로피컬 콘텐츠
- 🧥 **추위 따뜻** (cold_warmup): 따뜻한 활력 콘텐츠

## 🚀 빠른 시작

### 1. 설치
```bash
# 저장소 클론
git clone https://github.com/yourusername/weatherhub.git
cd weatherhub

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
```

### 2. 필수 API 키 설정
`.env` 파일에 다음 API 키들을 설정:
```env
VITE_OPENWEATHER_API_KEY=your_openweather_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_YOUTUBE_API_KEY=your_youtube_api_key
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 🎮 게임 컬렉션

### 1. 2048
- 클래식 숫자 퍼즐 게임
- 키보드(화살표/WASD) 및 터치 컨트롤
- 점수 및 최고 타일 추적

### 2. 틱택토 (Tic-Tac-Toe)
- AI 대전 (쉬움/보통/어려움)
- Minimax 알고리즘 구현
- 연승 시스템

### 3. 가위바위보
- 3초 카운트다운 시스템
- 점수 및 전적 관리
- 애니메이션 효과

### 4. 숫자 야구
- 4자리 숫자 맞추기
- 스트라이크/볼 시스템
- 힌트 기능 (점수 차감)

### 5. 카드 매칭
- 날씨 테마 메모리 게임
- 콤보 시스템
- 시간 및 이동 추적

### 6. 반응속도 테스트
- 5라운드 평균 계산
- 반응 시간별 이모지 피드백
- 통계 분석

## 🎵 음악 기능

- **날씨 기반 추천**: 현재 날씨에 맞는 음악 자동 추천
- **YouTube Music 통합**: 실제 음악 스트리밍
- **재생 목록 관리**: 좋아요, 건너뛰기 기능
- **미니 플레이어**: 앱 전체에서 음악 제어

## 📰 뉴스 & AI

- **실시간 뉴스**: Google News RSS 피드
- **AI 요약**: Gemini AI로 3줄 요약
- **카테고리별 필터링**: 날씨, 비즈니스, 스포츠, 엔터테인먼트
- **자동 업데이트**: 10분마다 새로운 뉴스

## 🌡️ 날씨 기능

- **실시간 날씨**: OpenWeatherMap API
- **5일 예보**: 시간별 상세 예보
- **공기질 정보**: AQI 지수 표시
- **날씨 레이더**: 기상청 실시간 레이더
- **세계 날씨**: 전 세계 도시 날씨 검색

## 📱 모바일 최적화

- **반응형 디자인**: 모든 화면 크기 지원
- **터치 제스처**: 스와이프, 탭 지원
- **PWA 지원**: 앱처럼 설치 가능
- **오프라인 모드**: 캐시된 데이터 표시

## 🛠️ 개발 명령어

```bash
npm run dev         # 개발 서버 실행
npm run build       # 프로덕션 빌드
npm run preview     # 빌드 미리보기
npm run lint        # 코드 린트
npm run typecheck   # 타입 체크
```

## 📊 성능 최적화

- **코드 분할**: 동적 import로 번들 크기 최적화
- **이미지 최적화**: WebP 포맷 및 lazy loading
- **캐싱 전략**: Service Worker 활용
- **상태 관리**: Zustand로 효율적 리렌더링

## 🔒 보안

- **API 키 보호**: 서버 프록시로 클라이언트 노출 방지
- **HTTPS 전용**: 보안 연결만 허용
- **Rate Limiting**: API 호출 제한
- **입력 검증**: XSS 방어

## 🎨 커스터마이징

### 테마 수정
`src/styles/globals.css`에서 색상 변수 수정:
```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
  /* ... */
}
```

### 새 게임 추가
1. `src/components/games/`에 게임 컴포넌트 생성
2. `src/store/gameStore.ts`에 게임 타입 추가
3. `GameHub.tsx`에 게임 등록

## 📈 향후 계획

- [ ] 소셜 기능 (점수 공유, 리더보드)
- [ ] 더 많은 게임 추가
- [ ] AI 챗봇 통합
- [ ] 다국어 지원 확대
- [ ] 음성 제어 기능

## 🤝 기여하기

풀 리퀘스트 환영합니다! 큰 변경사항은 먼저 이슈를 열어 논의해 주세요.

## 📄 라이선스

MIT License

## 👥 크레딧

- Weather Data: OpenWeatherMap
- Music: YouTube Music API
- News: Google News RSS
- AI: Google Gemini
- Icons: Emoji

---

**Made with ❤️ by WeatherHub Team**