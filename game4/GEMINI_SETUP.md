# Gemini AI 퀴즈 설정 가이드

## 🤖 Gemini AI 퀴즈 기능

이 앱은 Google Gemini AI를 사용하여 날씨와 시간대에 맞는 맞춤형 퀴즈를 동적으로 생성합니다.

## 🚀 시작하기

### 1. Gemini API 키 발급

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 방문
2. Google 계정으로 로그인
3. "Get API Key" 또는 "API 키 가져오기" 클릭
4. "Create API Key" 또는 "API 키 만들기" 선택
5. 생성된 API 키 복사

### 2. API 키 설정

`.env.development` 파일을 열고 다음 라인을 수정:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

위의 `your_gemini_api_key_here` 부분을 복사한 실제 API 키로 교체하세요.

예시:
```env
GEMINI_API_KEY=AIzaSyD-abcd1234efgh5678ijkl9012mnop
```

### 3. 서버 재시작

API 키를 설정한 후 서버를 재시작해야 합니다:

```bash
# 서버 중지 (Ctrl+C)
# 다시 시작
npm run dev
```

## 📋 기능 소개

### 날씨 기반 퀴즈 주제
- ☀️ **맑은 날**: 스포츠, 야외활동, 여행 관련 퀴즈
- 🌧️ **비 오는 날**: 문학, 예술, 음악, 철학 퀴즈
- ☁️ **흐린 날**: 과학, 기술, 우주, 미스터리 퀴즈
- ❄️ **눈 오는 날**: 요리, 문화, 전통 관련 퀴즈
- ⛈️ **폭풍우**: 모험, 생존, 극한상황 퀴즈
- 🌫️ **안개**: 신화, 전설, 판타지 퀴즈
- 🏝️ **더운 날**: 여름휴가, 해양, 열대지역 퀴즈
- 🧥 **추운 날**: 겨울준비, 건강, 온열음식 퀴즈

### 난이도 설정
- **쉬움**: 초등학생도 이해할 수 있는 수준
- **보통**: 일반 성인이 알만한 수준
- **어려움**: 전문 지식이 필요한 수준
- **전문가**: 해당 분야 전문가 수준

### 주제 카테고리
- 📚 일반상식
- 🔬 과학
- 📜 역사
- 🎭 문화
- 🗺️ 지리
- ⚽ 스포츠
- 💻 기술/IT
- 🎬 엔터테인먼트
- 🍽️ 음식
- 🌿 자연
- 🎨 예술
- 🎵 음악
- 📖 문학
- 🤔 철학
- 🧠 심리학

## 🔧 API 엔드포인트

### 퀴즈 생성
```
POST /api/quiz-ai/generate
```

요청 본문:
```json
{
  "topic": "과학",
  "difficulty": "medium",
  "count": 5,
  "weather": "sunny_upbeat",
  "language": "korean"
}
```

### 정답 확인
```
POST /api/quiz-ai/check
```

요청 본문:
```json
{
  "questionId": "unique_id",
  "answer": 0
}
```

### 주제 목록 조회
```
GET /api/quiz-ai/topics?weather=sunny_upbeat
```

### 난이도 목록 조회
```
GET /api/quiz-ai/difficulties
```

### AI 추천
```
POST /api/quiz-ai/suggest
```

요청 본문:
```json
{
  "weather": "rain_lofi",
  "time": "evening",
  "userInterests": ["과학", "역사"],
  "recentScores": [
    { "topic": "과학", "score": 80 },
    { "topic": "역사", "score": 60 }
  ]
}
```

## ⚠️ 주의사항

1. **API 키 보안**: API 키를 절대 공개 저장소에 커밋하지 마세요
2. **사용량 제한**: Gemini API는 무료 티어에서 분당 요청 제한이 있습니다
3. **에러 처리**: API 키가 없거나 잘못된 경우 안내 메시지가 표시됩니다

## 🆘 문제 해결

### API 키가 작동하지 않는 경우
1. API 키가 올바르게 복사되었는지 확인
2. `.env.development` 파일이 저장되었는지 확인
3. 서버를 재시작했는지 확인
4. Google AI Studio에서 API 키가 활성화되어 있는지 확인

### 퀴즈가 생성되지 않는 경우
1. 브라우저 콘솔에서 에러 메시지 확인
2. 네트워크 탭에서 API 응답 확인
3. 서버 로그 확인 (`npm run dev` 터미널)

## 📝 라이선스

이 프로젝트는 Google Gemini API를 사용합니다.
Gemini API 사용 약관을 준수해주세요.

## 🔗 유용한 링크

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API 문서](https://ai.google.dev/docs)
- [API 키 관리](https://makersuite.google.com/app/apikey)