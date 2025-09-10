// API 유틸리티 - 환경별 API 베이스 URL 자동 감지
export const getApiBaseUrl = (): string => {
  // 개발 환경에서 현재 호스트 사용
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location
    return `${protocol}//${hostname}:3004`
  }
  
  // 서버사이드 렌더링 대비
  return 'http://localhost:3004'
}

// API 엔드포인트 생성 헬퍼
export const createApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl()
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}/api${cleanEndpoint}`
}