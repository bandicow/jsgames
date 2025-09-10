# 🎮 JSGames 프로젝트 인덱스

> JavaScript/TypeScript 기반 게임 모음집 - 혼자 또는 여럿이 함께 즐기는 웹 게임들

## 📋 프로젝트 개요

| 항목 | 정보 |
|------|------|
| **총 게임 수** | 4개 (완성: 3개, 개발중: 1개) |
| **기술 스택** | React, TypeScript/JavaScript, Node.js, Socket.io |
| **실행 환경** | 웹 브라우저 (Chrome, Firefox, Safari, Edge) |
| **플랫폼 지원** | 데스크톱, 모바일, 태블릿 |
| **네트워크** | 로컬 네트워크 멀티플레이어 지원 |

---

## 🎯 게임 목록 및 상태

### 🏹 Game1: 뱀파이어 서바이벌 (완성) 
**경로**: `game1/` | **포트**: 3003 | **타입**: 싱글플레이어 액션

- **장르**: 서바이벌, 액션, 로그라이크
- **기술**: React 18 + TypeScript + Canvas API
- **특징**: 
  - 실시간 탑다운 슈팅 게임
  - 레벨업 시 무기/능력 업그레이드 시스템
  - 웨이브 기반 적 생성 시스템
  - 경험치 및 진행도 시스템

```bash
# 실행 방법
cd game1
npm install
npm start  # http://localhost:3003
```

**핵심 컴포넌트**:
- `GameEngine.ts` - 게임 루프 및 상태 관리
- `WeaponSystem.ts` - 무기 시스템 및 공격 로직
- `CollisionSystem.ts` - 충돌 감지 및 처리
- `WaveSpawner.ts` - 적 생성 및 웨이브 관리

---

### 🐍 Game2: 뱀 서바이벌 (완성)
**경로**: `game2/` | **포트**: 기본값 | **타입**: 싱글플레이어 아케이드

- **장르**: 아케이드, 서바이벌, 액션
- **기술**: React + JavaScript + Canvas API
- **특징**:
  - 뱀 게임과 서바이벌 장르 결합
  - 적 처치 및 아이템 수집 시스템
  - 다국어 지원 (한국어/영어)
  - 레벨업 및 업그레이드 선택 시스템

```bash
# 실행 방법
cd game2
npm install
npm start  # http://localhost:3000
```

**핵심 기능**:
- `GameEngine.js` - 게임 상태 및 루프 관리
- `WeaponFactory.js` - 다양한 무기 생성 시스템
- `Player.js` - 플레이어 제어 및 성장 시스템
- `i18n.js` - 다국어 지원 시스템

---

### 🎴 Game3: 멀티플레이어 게임 (완성)
**경로**: `game3/` | **포트**: 3000(클라이언트), 3001(서버) | **타입**: 멀티플레이어

- **장르**: 카드 게임, 반응속도 게임, 파티 게임
- **기술**: React + TypeScript (클라이언트) + Node.js + Express + Socket.io (서버)
- **지원 게임**:
  - **우노 (UNO)**: 2-4인 카드 게임
  - **반응속도 게임**: 2-4인 경쟁 게임

```bash
# 실행 방법
cd game3
npm run install-all    # 전체 의존성 설치
npm run dev:host       # 네트워크 접근 허용 개발 서버
```

**네트워크 기능**:
- 실시간 멀티플레이어 지원
- 방 생성/참가 시스템
- 로컬 네트워크 내 기기 간 플레이 가능
- 실시간 게임 상태 동기화

**아키텍처**:
```
game3/
├── client/          # React 프론트엔드
├── server/          # Node.js + Socket.io 백엔드
└── shared/          # 공통 타입 정의
```

---

### 🌦️ Game4: 하이브리드 날씨 웹앱 (설계 완료, 개발 예정)
**경로**: `game4/` | **타입**: 하이브리드 앱 (오락 70% + 유틸 30%)

- **컨셉**: 날씨 기반 무드 토큰으로 개인화된 경험 제공
- **기술 계획**: React 18 + TypeScript + Vite + Zustand + Tailwind CSS
- **주요 기능**:
  - 위치 기반 실시간 날씨 정보
  - 날씨 기반 무드 토큰 시스템 (8가지)
  - 무드에 따른 음악 추천, 퀴즈, 랜덤 콘텐츠
  - 글래스모피즘 UI + 다크/라이트 모드

**설계 문서**:
- [`README.md`](game4/README.md) - 프로젝트 개요 및 빠른 시작
- [`hybrid-webapp-improvements.md`](game4/hybrid-webapp-improvements.md) - 아키텍처 개선사항
- [`tech-stack-guide.md`](game4/tech-stack-guide.md) - 기술 스택 및 구현 가이드

---

## 🏗️ 기술 스택 비교

| 게임 | 프론트엔드 | 백엔드 | 렌더링 | 상태관리 | 특징 |
|------|------------|--------|---------|----------|------|
| **Game1** | React 18 + TS | - | Canvas | React State | TypeScript, 모던 문법 |
| **Game2** | React + JS | - | Canvas | React State | 다국어 지원, 클래식 |
| **Game3** | React + TS | Node.js + Socket.io | DOM | React State + Socket | 실시간 멀티플레이어 |
| **Game4** | React 18 + TS + Vite | Express.js + Redis | DOM/Canvas | Zustand | PWA, 글래스모피즘 |

---

## 📁 프로젝트 구조

```
jsgames/
├── README.md                    # 메인 프로젝트 소개
├── PROJECT-INDEX.md            # 이 문서 - 전체 프로젝트 인덱스
├── DEVELOPMENT-GUIDE.md        # 개발 환경 설정 및 가이드
│
├── game1/                      # 뱀파이어 서바이벌
│   ├── src/
│   │   ├── components/         # React 컴포넌트
│   │   ├── game/              # 게임 엔진 및 로직
│   │   │   ├── core/          # 핵심 엔진
│   │   │   ├── systems/       # 게임 시스템들
│   │   │   ├── types/         # TypeScript 타입
│   │   │   └── utils/         # 유틸리티
│   │   ├── constants/         # 게임 설정값
│   │   └── hooks/             # React 커스텀 훅
│   ├── package.json           # 의존성 및 스크립트
│   └── README.md              # Game1 전용 가이드
│
├── game2/                      # 뱀 서바이벌
│   ├── src/
│   │   ├── components/         # React 컴포넌트
│   │   ├── game/              # 게임 로직
│   │   │   ├── core/          # 게임 엔진
│   │   │   ├── entities/      # 게임 오브젝트들
│   │   │   └── weapons/       # 무기 시스템
│   │   ├── locales/           # 다국어 리소스
│   │   │   ├── ko.json        # 한국어
│   │   │   └── en.json        # 영어
│   │   └── utils/             # 유틸리티
│   ├── package.json
│   └── README.md
│
├── game3/                      # 멀티플레이어 게임
│   ├── client/                # React 클라이언트
│   │   ├── src/
│   │   │   ├── components/    # React 컴포넌트
│   │   │   ├── hooks/         # 커스텀 훅
│   │   │   └── types/         # TypeScript 타입
│   │   └── package.json
│   ├── server/                # Node.js 서버
│   │   ├── index.js          # 메인 서버 파일
│   │   ├── models/           # 데이터 모델
│   │   └── games/            # 게임별 로직
│   ├── shared/               # 공통 타입
│   ├── package.json          # 루트 스크립트
│   └── README.md             # 상세 설정 가이드
│
└── game4/                      # 하이브리드 날씨 앱
    ├── README.md              # 프로젝트 개요
    ├── hybrid-webapp-improvements.md  # 아키텍처 개선사항
    ├── tech-stack-guide.md    # 기술 스택 가이드
    ├── .env.example           # 환경변수 템플릿
    └── .gitignore             # Git 제외 파일
```

---

## 🚀 빠른 실행 가이드

### 전체 프로젝트 클론
```bash
git clone <repository-url>
cd jsgames
```

### 개별 게임 실행

#### 1️⃣ 뱀파이어 서바이벌 (Game1)
```bash
cd game1
npm install
npm start
# → http://localhost:3003
```

#### 2️⃣ 뱀 서바이벌 (Game2)  
```bash
cd game2
npm install
npm start
# → http://localhost:3000
```

#### 3️⃣ 멀티플레이어 게임 (Game3)
```bash
cd game3
npm run install-all     # 클라이언트 + 서버 의존성 설치
npm run dev:host        # 네트워크 접근 허용
# → 클라이언트: http://localhost:3000
# → 서버: http://localhost:3001
```

#### 4️⃣ 하이브리드 날씨 앱 (Game4) - 개발 예정
```bash
cd game4
# 설계 문서 확인
# npm install (구현 후)
```

---

## 🎮 게임별 특징 및 추천 시나리오

### 🕹️ 혼자 즐기기
- **Game1 (뱀파이어 서바이벌)**: 집중력과 반사신경이 필요한 본격 액션 게임
- **Game2 (뱀 서바이벌)**: 가벼운 아케이드 게임, 간단한 조작

### 👥 함께 즐기기  
- **Game3 (멀티플레이어)**: 2-4명이 함께하는 파티 게임
  - **우노**: 전략과 운이 결합된 카드 게임
  - **반응속도**: 순간 반응력 경쟁 게임

### 🌈 일상 유틸리티
- **Game4 (하이브리드 앱)**: 날씨 확인과 함께 오락 요소도 즐기는 생활 앱

---

## 📊 개발 현황 및 통계

### 개발 완료도
- ✅ **Game1**: 100% 완성 (TypeScript 기반 고급 구조)
- ✅ **Game2**: 100% 완성 (다국어 지원)  
- ✅ **Game3**: 100% 완성 (실시간 멀티플레이어)
- 🏗️ **Game4**: 설계 완료, 구현 대기

### 기술적 특징
- **총 코드 라인 수**: ~15,000+ 라인
- **컴포넌트 수**: 50+ 개
- **지원 언어**: 2개 (한국어, 영어)
- **브라우저 호환성**: 모던 브라우저 전체

### 성능 지표
- **로딩 시간**: 평균 2-3초
- **프레임레이트**: 60 FPS 목표
- **메모리 사용량**: 평균 50-100MB
- **네트워크 지연시간**: <100ms (로컬 네트워크)

---

## 🛠️ 개발 환경 요구사항

### 필수 요구사항
- **Node.js**: 16.x 이상
- **npm**: 8.x 이상  
- **브라우저**: Chrome 90+, Firefox 88+, Safari 14+

### 권장 개발 도구
- **코드 에디터**: VS Code + TypeScript 확장
- **Git**: 버전 관리
- **터미널**: 명령어 실행

### 선택적 도구
- **React Developer Tools**: 브라우저 확장
- **Redux DevTools**: 상태 디버깅 (향후)
- **Lighthouse**: 성능 측정

---

## 📈 향후 개발 계획

### 단기 목표 (1-2주)
- [ ] Game4 핵심 기능 구현 시작
- [ ] Game1/2/3 성능 최적화
- [ ] 모바일 UX 개선

### 중기 목표 (1-2개월)  
- [ ] Game4 완전 구현
- [ ] PWA 기능 추가 (오프라인 지원)
- [ ] 게임 간 공통 UI 라이브러리 구축
- [ ] 테스트 코드 작성

### 장기 목표 (3-6개월)
- [ ] 새로운 게임 타입 추가
- [ ] 온라인 멀티플레이어 지원
- [ ] 사용자 계정 및 진행도 저장
- [ ] 모바일 앱 버전 고려

---

## 🤝 기여 가이드

### 코드 스타일
- **JavaScript**: ES6+ 문법 사용
- **TypeScript**: strict 모드 활성화
- **React**: 함수형 컴포넌트 + Hooks
- **CSS**: CSS Modules 또는 styled-components

### 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 변경
style: 코드 스타일 변경
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드/설정 변경
```

### 브랜치 전략
- `main`: 안정 버전
- `develop`: 개발 버전  
- `feature/*`: 기능별 브랜치
- `hotfix/*`: 긴급 수정

---

## 📞 문의 및 지원

### 문서
- **전체 개요**: [README.md](README.md)
- **개발 가이드**: [DEVELOPMENT-GUIDE.md](DEVELOPMENT-GUIDE.md)
- **게임별 가이드**: 각 `game*/README.md` 참조

### 이슈 리포팅
1. 게임별 폴더에서 문제 재현
2. 브라우저 콘솔 로그 확인
3. 시스템 환경 정보 포함하여 제보

---

**🎮 Happy Gaming! 재미있는 게임 개발과 플레이를 즐기세요!**