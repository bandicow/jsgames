import { useState, useEffect, useCallback } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  error: string | null
  loading: boolean
  permissionStatus: 'prompt' | 'granted' | 'denied' | null
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  watchPosition?: boolean
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
    permissionStatus: null
  })

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watchPosition = false
  } = options

  const checkPermission = useCallback(async () => {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' })
        setState(prev => ({ 
          ...prev, 
          permissionStatus: permission.state as 'prompt' | 'granted' | 'denied' 
        }))
        
        permission.addEventListener('change', () => {
          setState(prev => ({ 
            ...prev, 
            permissionStatus: permission.state as 'prompt' | 'granted' | 'denied' 
          }))
        })
      }
    } catch (error) {
      console.error('Permission check failed:', error)
    }
  }, [])

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      error: null,
      loading: false,
      permissionStatus: 'granted'
    })
  }, [])

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = '위치 정보를 가져올 수 없습니다.'
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = '위치 권한이 거부되었습니다.'
        setState(prev => ({ ...prev, permissionStatus: 'denied' }))
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = '위치 정보를 사용할 수 없습니다.'
        break
      case error.TIMEOUT:
        errorMessage = '위치 정보 요청 시간이 초과되었습니다.'
        break
    }
    
    setState(prev => ({
      ...prev,
      error: errorMessage,
      loading: false
    }))
  }, [])

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: '브라우저가 위치 정보를 지원하지 않습니다.',
        loading: false
      }))
      return
    }

    setState(prev => ({ ...prev, loading: true }))

    const geoOptions: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge
    }

    if (watchPosition) {
      const watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        geoOptions
      )
      
      return () => {
        navigator.geolocation.clearWatch(watchId)
      }
    } else {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        geoOptions
      )
    }
  }, [enableHighAccuracy, timeout, maximumAge, watchPosition, handleSuccess, handleError])

  useEffect(() => {
    checkPermission()
    const cleanup = getCurrentPosition()
    
    return () => {
      if (cleanup) cleanup()
    }
  }, [checkPermission, getCurrentPosition])

  const refresh = useCallback(() => {
    getCurrentPosition()
  }, [getCurrentPosition])

  return {
    ...state,
    refresh,
    isAvailable: 'geolocation' in navigator
  }
}