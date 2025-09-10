/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_OPENWEATHER_ENABLED: string
  // 더 많은 환경 변수 타입 정의 추가 가능
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}