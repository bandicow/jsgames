import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@shared/types';

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

// 동적으로 Socket.io 서버 URL 생성 (네트워크 접속 지원)
const getSocketUrl = () => {
  const hostname = window.location.hostname;
  return `http://${hostname}:3001`;
};

const SOCKET_URL = getSocketUrl();

// 디버깅용 로그
console.log('🔗 Socket URL:', SOCKET_URL);
console.log('🌍 Current hostname:', window.location.hostname);

export const useSocket = () => {
  const socketRef = useRef<SocketType | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // 한 번만 생성되는 socket 인스턴스
  useEffect(() => {
    if (!socketRef.current) {
      console.log('🔌 Socket.IO 인스턴스 생성 중...', SOCKET_URL);
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: false,
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // 연결 디버깅 이벤트
      socketRef.current.on('connect', () => {
        console.log('✅ Socket.IO 연결 성공');
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('❌ Socket.IO 연결 끊김:', reason);
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('🚫 Socket.IO 연결 에러:', error);
        setIsConnected(false);
      });

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket.IO 재연결 성공 (시도 #' + attemptNumber + ')');
        setIsConnected(true);
      });

      socketRef.current.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Socket.IO 재연결 시도 #' + attemptNumber);
      });

      socketRef.current.on('reconnect_error', (error) => {
        console.error('🚫 Socket.IO 재연결 에러:', error);
      });

      socketRef.current.on('reconnect_failed', () => {
        console.error('💀 Socket.IO 재연결 실패 - 최대 시도 횟수 초과');
        setIsConnected(false);
      });
    }
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      console.log('🚀 Socket.IO 연결 시도 중...');
      socketRef.current.connect();
    } else if (socketRef.current?.connected) {
      console.log('ℹ️ Socket.IO 이미 연결됨');
    }
    
    return socketRef.current;
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  const emit = useCallback(<T extends keyof ClientToServerEvents>(
    event: T,
    ...args: Parameters<ClientToServerEvents[T]>
  ) => {
    if (socketRef.current) {
      socketRef.current.emit(event, ...args);
    }
  }, []);

  const on = useCallback(<T extends keyof ServerToClientEvents>(
    event: T,
    listener: ServerToClientEvents[T]
  ) => {
    if (socketRef.current) {
      socketRef.current.on(event, listener);
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, listener);
      }
    };
  }, []);

  const off = useCallback(<T extends keyof ServerToClientEvents>(
    event: T,
    listener?: ServerToClientEvents[T]
  ) => {
    if (socketRef.current) {
      socketRef.current.off(event, listener);
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return useMemo(() => ({
    socket: socketRef.current,
    connect,
    disconnect,
    emit,
    on,
    off,
    isConnected
  }), [connect, disconnect, emit, on, off, isConnected]);
};