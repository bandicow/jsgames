import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@shared/types';

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

// 동적으로 Socket.io 서버 URL 생성 (네트워크 접속 지원)
const getSocketUrl = () => {
  const hostname = window.location.hostname;
  return `http://${hostname}:3001`;
};

const SOCKET_URL = getSocketUrl();

export const useSocket = () => {
  const socketRef = useRef<SocketType | null>(null);

  const connect = useCallback(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: false
      });
    }
    
    if (!socketRef.current.connected) {
      socketRef.current.connect();
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

  return {
    socket: socketRef.current,
    connect,
    disconnect,
    emit,
    on,
    off,
    isConnected: socketRef.current?.connected || false
  };
};