// API 유틸리티 - 환경별 API 베이스 URL 자동 감지
export const getApiBaseUrl = (): string => {
  // Vite의 프록시를 통해 API 요청 (상대 경로 사용)
  // 이렇게 하면 Vite가 자동으로 3005 포트로 프록시
  return ''
}

// API 엔드포인트 생성 헬퍼
export const createApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl()
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}/api${cleanEndpoint}`
}