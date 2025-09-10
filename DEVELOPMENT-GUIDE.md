# 🛠️ JSGames 개발 가이드

> JSGames 프로젝트 개발 환경 설정, 기여 방법, 그리고 베스트 프랙티스

## 📋 목차

1. [개발 환경 설정](#개발-환경-설정)
2. [프로젝트 구조 이해](#프로젝트-구조-이해)
3. [개발 워크플로우](#개발-워크플로우)
4. [코딩 스타일 가이드](#코딩-스타일-가이드)
5. [테스팅 가이드](#테스팅-가이드)
6. [배포 및 빌드](#배포-및-빌드)
7. [문제해결 가이드](#문제해결-가이드)
8. [기여 방법](#기여-방법)

---

## 🔧 개발 환경 설정

### 필수 요구사항

#### 시스템 요구사항
```bash
# Node.js 버전 확인 (16.x 이상 필요)
node --version  # v16.0.0+

# npm 버전 확인 (8.x 이상 권장)
npm --version   # 8.0.0+

# Git 버전 확인
git --version   # 2.0.0+
```

#### 권장 개발 도구
- **코드 에디터**: VS Code (확장 프로그램 포함)
- **브라우저**: Chrome 또는 Firefox (개발자 도구 포함)
- **터미널**: iTerm2 (macOS), Windows Terminal (Windows), 기본 터미널 (Linux)

### VS Code 확장 프로그램 설정

#### 필수 확장 프로그램
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### VS Code 설정 (.vscode/settings.json)
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### 프로젝트 클론 및 초기 설정

```bash
# 1. 저장소 클론
git clone <repository-url>
cd jsgames

# 2. 각 게임별 의존성 설치
# Game1 (TypeScript 기반)
cd game1
npm install
cd ..

# Game2 (JavaScript 기반)
cd game2
npm install  
cd ..

# Game3 (멀티플레이어)
cd game3
npm run install-all  # 클라이언트 + 서버 의존성 모두 설치
cd ..

# Game4 (향후 개발)
cd game4
# npm install (구현 후)
```

---

## 🏗️ 프로젝트 구조 이해

### 전체 프로젝트 구조

```
jsgames/
├── 📄 README.md                    # 메인 프로젝트 소개
├── 📄 PROJECT-INDEX.md            # 상세 프로젝트 인덱스
├── 📄 DEVELOPMENT-GUIDE.md        # 이 파일 - 개발 가이드
│
├── 🎮 game1/                      # 뱀파이어 서바이벌
│   ├── src/
│   │   ├── components/            # React 컴포넌트
│   │   │   ├── GameCanvas.tsx     # 메인 게임 캔버스
│   │   │   └── UI/               # UI 컴포넌트들
│   │   ├── game/                 # 게임 엔진 및 로직
│   │   │   ├── core/             # 핵심 엔진 (GameEngine, Renderer)
│   │   │   ├── systems/          # 게임 시스템들
│   │   │   ├── types/            # TypeScript 타입 정의
│   │   │   └── utils/            # 유틸리티 함수들
│   │   ├── constants/            # 게임 설정값
│   │   └── hooks/                # React 커스텀 훅
│   ├── public/                   # 정적 자산
│   ├── package.json              # 의존성 및 스크립트
│   └── tsconfig.json             # TypeScript 설정
│
├── 🎮 game2/                      # 뱀 서바이벌  
│   ├── src/
│   │   ├── components/           # React 컴포넌트
│   │   ├── game/                 # 게임 로직
│   │   │   ├── core/             # 게임 엔진
│   │   │   ├── entities/         # 게임 오브젝트들
│   │   │   └── weapons/          # 무기 시스템
│   │   ├── locales/              # 다국어 리소스
│   │   │   ├── ko.json           # 한국어
│   │   │   └── en.json           # 영어
│   │   └── utils/                # 유틸리티
│   └── package.json
│
├── 🎮 game3/                      # 멀티플레이어
│   ├── client/                   # React 클라이언트
│   │   ├── src/
│   │   │   ├── components/       # React 컴포넌트
│   │   │   ├── hooks/            # 커스텀 훅 (useSocket 등)
│   │   │   └── types/            # TypeScript 타입
│   │   └── package.json
│   ├── server/                   # Node.js 서버
│   │   ├── index.js             # 메인 서버 파일
│   │   ├── models/              # 데이터 모델 (Room.js)
│   │   └── games/               # 게임별 로직 (uno.js, reaction.js)
│   ├── shared/                  # 공통 타입 정의
│   └── package.json             # 루트 패키지 (스크립트 관리)
│
└── 🎮 game4/                      # 하이브리드 날씨 앱
    ├── README.md                 # 프로젝트 개요
    ├── hybrid-webapp-improvements.md  # 아키텍처 분석
    ├── tech-stack-guide.md       # 기술 스택 가이드
    ├── .env.example              # 환경변수 템플릿
    └── .gitignore                # Git 제외 파일
```

### 각 게임의 아키텍처 패턴

#### Game1 (TypeScript 패턴)
- **아키텍처**: Entity-Component-System (ECS) 패턴
- **상태 관리**: React 상태 + 게임 엔진 상태 분리
- **타입 안전성**: 엄격한 TypeScript 타입 정의
- **성능**: Canvas 최적화, Object Pooling

#### Game2 (JavaScript 패턴)  
- **아키텍처**: 클래스 기반 OOP
- **다국어**: i18n 시스템 구현
- **모듈화**: 기능별 모듈 분리
- **확장성**: 플러그인 형태의 무기 시스템

#### Game3 (네트워크 패턴)
- **아키텍처**: 클라이언트-서버 분리
- **통신**: Socket.io 기반 실시간 통신  
- **동기화**: 서버 중심의 상태 관리
- **확장성**: 게임별 모듈화된 로직

---

## 🔄 개발 워크플로우

### 일반적인 개발 사이클

#### 1. 기능 개발 시작
```bash
# 새 기능 브랜치 생성
git checkout -b feature/새기능명

# 해당 게임 디렉토리로 이동
cd game1  # 또는 game2, game3

# 개발 서버 시작
npm start
```

#### 2. 개발 및 테스트
```bash
# 코드 변경 사항을 실시간으로 확인
# 브라우저에서 http://localhost:포트번호 접속

# 린트 및 타입 체크 (TypeScript 프로젝트)
npm run lint
npm run type-check  # TypeScript 전용

# 테스트 실행 (테스트가 있는 경우)
npm test
```

#### 3. 빌드 및 검증
```bash
# 프로덕션 빌드 테스트
npm run build

# 빌드된 결과물 미리보기
npm run preview  # 또는 serve -s build
```

#### 4. 커밋 및 푸시
```bash
# 변경사항 스테이징
git add .

# 커밋 (메시지 규칙 준수)
git commit -m "feat: 새로운 기능 추가"

# 원격 브랜치에 푸시
git push origin feature/새기능명
```

### 게임별 개발 서버 실행

#### Game1 (뱀파이어 서바이벌)
```bash
cd game1
npm start
# → http://localhost:3003
```

#### Game2 (뱀 서바이벌)
```bash
cd game2  
npm start
# → http://localhost:3000
```

#### Game3 (멀티플레이어)
```bash
cd game3

# 개발 모드 (로컬만)
npm run dev

# 네트워크 접근 허용 모드
npm run dev:host
# → 클라이언트: http://localhost:3000
# → 서버: http://localhost:3001
```

---

## 📝 코딩 스타일 가이드

### JavaScript/TypeScript 스타일

#### 1. 네이밍 컨벤션
```typescript
// 변수/함수: camelCase
const playerHealth = 100;
const movePlayer = (direction: Direction) => {};

// 클래스: PascalCase  
class GameEngine {}
class WeaponSystem {}

// 상수: UPPER_SNAKE_CASE
const MAX_PLAYER_HEALTH = 100;
const GAME_CONFIG = {};

// 인터페이스: PascalCase + 'I' 접두사 (선택)
interface IPlayer {}
interface PlayerData {}  // 또는 접두사 없이

// 타입: PascalCase
type Direction = 'up' | 'down' | 'left' | 'right';
```

#### 2. 함수 작성 스타일
```typescript
// 화살표 함수 (짧은 함수)
const add = (a: number, b: number) => a + b;

// 일반 함수 (복잡한 로직)
function updateGameState(state: GameState): GameState {
  // 복잡한 로직...
  return newState;
}

// 컴포넌트 (React)
const GameCanvas: React.FC = () => {
  return <canvas />;
};
```

#### 3. Import/Export 스타일
```typescript
// Named imports (추천)
import { useState, useEffect } from 'react';
import { GameEngine, Player } from '../game/core';

// Default import
import React from 'react';
import GameCanvas from './components/GameCanvas';

// Export
export { GameEngine };
export default GameCanvas;
```

### React 컴포넌트 스타일

#### 1. 컴포넌트 구조
```typescript
import React, { useState, useEffect } from 'react';
import './ComponentName.css';

interface Props {
  prop1: string;
  prop2?: number;  // 선택적 prop
}

const ComponentName: React.FC<Props> = ({ prop1, prop2 = 0 }) => {
  // 1. 상태 정의
  const [state, setState] = useState<StateType>(initialState);
  
  // 2. 이펙트 정의  
  useEffect(() => {
    // 부수 효과
  }, []);
  
  // 3. 이벤트 핸들러
  const handleClick = () => {
    setState(newState);
  };
  
  // 4. 렌더링
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

#### 2. 커스텀 훅 패턴
```typescript
// hooks/useGame.ts
import { useState, useEffect } from 'react';

interface UseGameReturn {
  gameState: GameState;
  startGame: () => void;
  pauseGame: () => void;
}

export const useGame = (): UseGameReturn => {
  const [gameState, setGameState] = useState<GameState>('menu');
  
  const startGame = () => setGameState('playing');
  const pauseGame = () => setGameState('paused');
  
  return {
    gameState,
    startGame,
    pauseGame
  };
};
```

### CSS 스타일 가이드

#### 1. CSS Modules 패턴 (Game1, Game2)
```css
/* Component.module.css */
.container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.button {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.button:hover {
  background: #0056b3;
}
```

#### 2. Tailwind CSS 패턴 (Game4)
```tsx
// 유틸리티 클래스 사용
<div className="flex flex-col p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
  <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
    제목
  </h1>
  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors">
    버튼
  </button>
</div>
```

---

## 🧪 테스팅 가이드

### 단위 테스트 (Unit Tests)

#### 유틸리티 함수 테스트
```typescript
// utils/__tests__/math.test.ts
import { calculateDistance, normalizeVector } from '../math';

describe('Math utilities', () => {
  test('calculateDistance should return correct distance', () => {
    expect(calculateDistance(0, 0, 3, 4)).toBe(5);
  });
  
  test('normalizeVector should normalize vector correctly', () => {
    const result = normalizeVector(3, 4);
    expect(result.x).toBeCloseTo(0.6);
    expect(result.y).toBeCloseTo(0.8);
  });
});
```

#### React 컴포넌트 테스트
```typescript
// components/__tests__/GameCanvas.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import GameCanvas from '../GameCanvas';

describe('GameCanvas', () => {
  test('renders canvas element', () => {
    render(<GameCanvas />);
    const canvas = screen.getByRole('img'); // canvas의 role
    expect(canvas).toBeInTheDocument();
  });
});
```

### 통합 테스트 (Integration Tests)

#### Game3 네트워크 테스트
```javascript
// server/__tests__/socket.test.js
const io = require('socket.io-client');
const server = require('../index');

describe('Socket.io server', () => {
  let clientSocket;
  
  beforeAll((done) => {
    server.listen(() => {
      const port = server.address().port;
      clientSocket = io(`http://localhost:${port}`);
      clientSocket.on('connect', done);
    });
  });
  
  afterAll(() => {
    server.close();
    clientSocket.close();
  });
  
  test('should create room', (done) => {
    clientSocket.emit('createRoom', { playerName: 'Test' });
    clientSocket.on('roomCreated', (data) => {
      expect(data.roomId).toBeDefined();
      done();
    });
  });
});
```

### E2E 테스트 (End-to-End Tests)

#### Playwright 테스트 예시
```typescript
// e2e/game1.spec.ts
import { test, expect } from '@playwright/test';

test('Game1 basic gameplay', async ({ page }) => {
  await page.goto('http://localhost:3003');
  
  // 게임 시작 버튼 클릭
  await page.click('button:has-text("시작")');
  
  // 캔버스가 로드되었는지 확인
  await expect(page.locator('canvas')).toBeVisible();
  
  // 게임 UI 요소들 확인
  await expect(page.locator('.score')).toBeVisible();
  await expect(page.locator('.level')).toBeVisible();
});
```

---

## 📦 배포 및 빌드

### 개발 환경별 빌드

#### Game1/Game2 (Create React App)
```bash
# 개발 빌드
npm start

# 프로덕션 빌드
npm run build

# 빌드 결과물 서빙
npx serve -s build
```

#### Game3 (클라이언트-서버 분리)
```bash
# 클라이언트 빌드
cd client
npm run build

# 서버 실행
cd ../server  
npm start

# 또는 루트에서 전체 실행
cd game3
npm run build    # 클라이언트 빌드
npm run start     # 프로덕션 서버 시작
```

#### Game4 (Vite 빌드)
```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

### 환경변수 관리

#### Game4 환경변수 설정
```bash
# .env.development
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WEATHER_API_KEY=dev_key_here

# .env.production  
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_WEATHER_API_KEY=prod_key_here
```

### 정적 호스팅 배포

#### Netlify/Vercel 배포 설정
```json
// package.json
{
  "scripts": {
    "build": "react-scripts build",
    "deploy": "npm run build && netlify deploy --prod --dir=build"
  }
}
```

#### netlify.toml
```toml
[build]
  publish = "build"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🐛 문제해결 가이드

### 일반적인 문제들

#### 1. 의존성 설치 문제
```bash
# npm 캐시 클리어
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

#### 2. TypeScript 타입 에러
```bash
# 타입 정의 파일 설치
npm install --save-dev @types/node @types/react

# tsconfig.json 설정 확인
{
  "compilerOptions": {
    "strict": true,
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "es6"]
  }
}
```

#### 3. Canvas 렌더링 문제
```typescript
// 고DPI 디스플레이 대응
const setupCanvas = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d')!;
  const devicePixelRatio = window.devicePixelRatio || 1;
  
  canvas.width = canvas.offsetWidth * devicePixelRatio;
  canvas.height = canvas.offsetHeight * devicePixelRatio;
  
  ctx.scale(devicePixelRatio, devicePixelRatio);
  canvas.style.width = canvas.offsetWidth + 'px';
  canvas.style.height = canvas.offsetHeight + 'px';
};
```

#### 4. Socket.io 연결 문제 (Game3)
```javascript
// CORS 설정 확인
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// 클라이언트 연결 확인
const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling']
});
```

### 성능 최적화

#### 1. Bundle 크기 최적화
```bash
# Bundle 분석 (Create React App)
npm install --save-dev webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

#### 2. Canvas 성능 최적화
```typescript
// Object Pooling 패턴
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  
  constructor(createFn: () => T, initialSize: number = 10) {
    this.createFn = createFn;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }
  
  get(): T {
    return this.pool.pop() || this.createFn();
  }
  
  release(obj: T): void {
    this.pool.push(obj);
  }
}
```

---

## 🤝 기여 방법

### 기여하기 전 체크리스트

- [ ] Issue에서 논의된 내용인가?
- [ ] 코딩 스타일 가이드를 따랐는가?
- [ ] 기존 기능을 손상시키지 않는가?
- [ ] 테스트가 모두 통과하는가?
- [ ] 문서가 업데이트되었는가?

### Pull Request 프로세스

#### 1. Fork 및 브랜치 생성
```bash
# Fork한 저장소 클론
git clone https://github.com/your-username/jsgames.git
cd jsgames

# 업스트림 원격 저장소 추가
git remote add upstream https://github.com/original-owner/jsgames.git

# 새 기능 브랜치 생성
git checkout -b feature/amazing-feature
```

#### 2. 개발 및 커밋
```bash
# 코드 작성 및 테스트
# ...

# 커밋 (규칙에 따라)
git add .
git commit -m "feat: add amazing new feature

- Implement feature X
- Add tests for feature X
- Update documentation"
```

#### 3. Pull Request 생성
```bash
# 원격 브랜치에 푸시
git push origin feature/amazing-feature

# GitHub에서 Pull Request 생성
# PR 템플릿에 따라 설명 작성
```

### 커밋 메시지 규칙

```
type(scope): subject

body

footer
```

#### 타입 (Type)
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경 (formatting, semicolon 등)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드/설정 변경

#### 예시
```
feat(game1): add weapon upgrade system

- Implement upgrade tree for weapons
- Add upgrade UI components  
- Add upgrade sound effects

Closes #123
```

### 코드 리뷰 가이드라인

#### 리뷰어를 위한 가이드
- [ ] 코드가 요구사항을 충족하는가?
- [ ] 성능상 문제는 없는가?
- [ ] 보안 이슈는 없는가?
- [ ] 테스트 커버리지는 적절한가?
- [ ] 코드 가독성은 좋은가?

#### 기여자를 위한 가이드  
- 작고 집중된 PR을 만드세요
- 명확하고 상세한 PR 설명을 작성하세요
- 리뷰 피드백에 열린 마음으로 응답하세요
- CI 검사가 통과하는지 확인하세요

---

## 📚 추가 자료

### 학습 자료
- **React**: [공식 문서](https://react.dev/)
- **TypeScript**: [공식 핸드북](https://www.typescriptlang.org/docs/)
- **Socket.io**: [공식 가이드](https://socket.io/docs/)
- **HTML5 Canvas**: [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

### 도구 및 라이브러리
- **VS Code**: [확장 프로그램 추천](https://code.visualstudio.com/docs/nodejs/reactjs-tutorial)
- **Chrome DevTools**: [게임 디버깅 가이드](https://developer.chrome.com/docs/devtools/)
- **React DevTools**: [프로파일링 가이드](https://react.dev/learn/react-developer-tools)

### 커뮤니티
- **Discord**: (개발 중인 서버)
- **GitHub Discussions**: 프로젝트 관련 논의
- **Issues**: 버그 리포트 및 기능 요청

---

**🚀 Happy Coding!**
JSGames 프로젝트에 기여해주셔서 감사합니다. 질문이나 도움이 필요하면 언제든 이슈를 생성하거나 Discussion에서 논의해 주세요!