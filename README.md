# 🎮 JSGames - JavaScript/TypeScript 게임 컬렉션

> 웹 브라우저에서 즐기는 다양한 장르의 게임 모음집

[![Games](https://img.shields.io/badge/Games-4-blue)](./PROJECT-INDEX.md)
[![Tech](https://img.shields.io/badge/Tech-React%20%7C%20TypeScript%20%7C%20Node.js-green)](#기술-스택)
[![Status](https://img.shields.io/badge/Status-3%20Complete%20%7C%201%20In%20Design-orange)](#게임-목록)

## 🎯 프로젝트 소개

JSGames는 다양한 장르의 웹 기반 게임들을 모아놓은 컬렉션입니다. 혼자서 즐기는 액션 게임부터 친구들과 함께하는 멀티플레이어 게임까지, 모던 웹 기술로 구현된 재미있는 게임들을 경험할 수 있습니다.

## 🎮 게임 목록

| 게임 | 타입 | 상태 | 실행 포트 | 설명 |
|------|------|------|-----------|------|
| **🏹 Game1** | 싱글플레이어 액션 | ✅ 완성 | 3003 | 뱀파이어 서바이벌 스타일 탑다운 슈팅 |
| **🐍 Game2** | 싱글플레이어 아케이드 | ✅ 완성 | 3000 | 뱀 게임 + 서바이벌 요소 결합 |
| **🎴 Game3** | 멀티플레이어 파티 | ✅ 완성 | 3000/3001 | 우노 카드게임 & 반응속도 게임 |
| **🌦️ Game4** | 하이브리드 앱 | 🏗️ 설계완료 | TBD | 날씨 기반 개인화 경험 앱 |

## 🚀 빠른 시작

### 전체 프로젝트 클론 및 실행
```bash
# 저장소 클론
git clone <repository-url>
cd jsgames

# 개별 게임 실행 (예: Game1)
cd game1
npm install
npm start
```

### 각 게임별 접속
- **Game1 (뱀파이어 서바이벌)**: http://localhost:3003
- **Game2 (뱀 서바이벌)**: http://localhost:3000  
- **Game3 (멀티플레이어)**: http://localhost:3000 (+ 서버 3001)

## 🛠️ 기술 스택

### 공통 기술
- **Frontend**: React 18, TypeScript/JavaScript
- **Styling**: CSS3, CSS Modules
- **Build**: Create React App, Vite
- **Rendering**: HTML5 Canvas, DOM

### 게임별 특화 기술
- **Game1**: TypeScript, 고성능 Canvas 렌더링
- **Game2**: 다국어 지원 (i18n), JavaScript
- **Game3**: Socket.io (실시간 멀티플레이어), Node.js + Express
- **Game4**: Zustand, Tailwind CSS, PWA, API 통합

## 📁 프로젝트 구조

```
jsgames/
├── 📄 PROJECT-INDEX.md        # 📋 상세한 프로젝트 인덱스 및 가이드
├── 📄 DEVELOPMENT-GUIDE.md    # 🛠️ 개발 환경 설정 및 기여 가이드
│
├── 🎮 game1/                  # 뱀파이어 서바이벌 (React + TS)
├── 🎮 game2/                  # 뱀 서바이벌 (React + JS + i18n)  
├── 🎮 game3/                  # 멀티플레이어 (React + Node.js + Socket.io)
└── 🎮 game4/                  # 하이브리드 날씨 앱 (설계 완료)
```

## 🎯 게임별 특징

### 🏹 Game1: 뱀파이어 서바이벌
- **장르**: 탑다운 액션 슈팅, 로그라이크
- **특징**: 실시간 전투, 레벨업 시스템, 다양한 무기와 업그레이드
- **기술**: TypeScript, Canvas API, 고성능 게임 엔진

### 🐍 Game2: 뱀 서바이벌  
- **장르**: 아케이드, 서바이벌 액션
- **특징**: 뱀 게임 + 적 처치 요소, 다국어 지원, 성장 시스템
- **기술**: JavaScript, i18n, 모듈화된 게임 시스템

### 🎴 Game3: 멀티플레이어 게임
- **장르**: 카드 게임, 반응속도 게임, 파티 게임
- **특징**: 
  - **우노**: 2-4인 클래식 카드 게임
  - **반응속도**: 2-4인 경쟁 게임
  - 실시간 네트워크 플레이, 로컬 네트워크 지원
- **기술**: Socket.io, 실시간 동기화, 방 시스템

### 🌦️ Game4: 하이브리드 날씨 앱 (개발 예정)
- **컨셉**: 날씨 정보 + 개인화된 오락 경험 (70% 오락 + 30% 유틸)
- **특징**: 
  - 날씨 기반 무드 토큰 시스템
  - 음악 추천, 퀴즈, 랜덤 콘텐츠
  - 글래스모피즘 UI, PWA 기능
- **기술**: React 18, Vite, Zustand, Tailwind CSS, 무료 API 통합

## 📱 플랫폼 지원

- **💻 데스크톱**: Windows, macOS, Linux (모든 모던 브라우저)
- **📱 모바일**: iOS Safari, Android Chrome (터치 최적화)
- **🖥️ 태블릿**: iPad, Android 태블릿 (반응형 UI)

## 🌐 네트워크 플레이

**Game3 멀티플레이어 기능**:
- 로컬 네트워크 내 기기 간 연결
- 실시간 게임 상태 동기화
- 2-4명 동시 플레이 지원
- Wi-Fi 네트워크를 통한 크로스 플랫폼 플레이

## 📖 문서 및 가이드

| 문서 | 내용 | 대상 |
|------|------|------|
| [📋 PROJECT-INDEX.md](PROJECT-INDEX.md) | 전체 프로젝트 상세 인덱스 | 개발자, 사용자 |
| [🛠️ DEVELOPMENT-GUIDE.md](DEVELOPMENT-GUIDE.md) | 개발 환경 설정 및 기여 가이드 | 개발자 |
| [📄 game*/README.md](game1/README.md) | 각 게임별 상세 가이드 | 게임별 사용자 |

## 🔧 시스템 요구사항

### 최소 요구사항
- **브라우저**: Chrome 70+, Firefox 65+, Safari 12+, Edge 79+
- **RAM**: 2GB 이상 
- **네트워크**: 로컬 네트워크 (멀티플레이어용)

### 권장 사양  
- **브라우저**: 최신 버전
- **RAM**: 4GB 이상
- **GPU**: 하드웨어 가속 지원
- **네트워크**: 안정적인 Wi-Fi 연결

## 🎪 게임 플레이 스타일

### 🕹️ 혼자 즐기기
- **Game1**: 집중력과 전략이 필요한 액션 게임 (15-30분 플레이)
- **Game2**: 가벼운 아케이드 게임 (5-15분 플레이)

### 👥 함께 즐기기
- **Game3**: 친구들과 함께하는 파티 게임
  - 우노: 전략과 심리전 (10-20분)
  - 반응속도: 순발력 대결 (5분)

### 🌈 일상 활용
- **Game4**: 날씨 확인 + 맞춤형 엔터테인먼트

## 📊 프로젝트 통계

- **총 개발 기간**: 6개월+
- **코드 라인 수**: 15,000+ 라인
- **컴포넌트 수**: 50+ 개
- **지원 언어**: 2개 (한국어, 영어)
- **테스트된 기기**: 10+ 종 (데스크톱, 모바일, 태블릿)

## 🤝 기여하기

JSGames 프로젝트에 기여하고 싶으시다면:

1. **버그 리포트**: 이슈 등록 후 재현 방법 제공
2. **기능 제안**: 새로운 게임 아이디어나 개선사항 제안  
3. **코드 기여**: Pull Request를 통한 코드 개선
4. **문서 개선**: README나 가이드 문서 개선

자세한 내용은 [DEVELOPMENT-GUIDE.md](DEVELOPMENT-GUIDE.md)를 참고하세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

## 🚀 지금 바로 시작해보세요!

```bash
# 1. 저장소 클론
git clone <repository-url>
cd jsgames

# 2. 원하는 게임 선택 후 실행
cd game1  # 또는 game2, game3
npm install
npm start

# 3. 브라우저에서 게임 플레이 시작! 🎮
```

**🎮 Happy Gaming!** 
재미있는 게임 경험을 즐기시고, 피드백이나 제안사항이 있으시면 언제든 공유해 주세요!