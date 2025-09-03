import React, { useState, useEffect, createContext, useContext } from 'react';
import { useSocket } from './hooks/useSocket';
import GameMenu from './components/GameMenu';
import Lobby from './components/Lobby';
import UnoGame from './components/UnoGame';
import ReactionGame from './components/ReactionGame';
import type { GameState, AppContextType, Room } from './types/game';
import './App.css';

// 게임 상태 컨텍스트
export const GameContext = createContext<AppContextType | null>(null);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within GameProvider');
  }
  return context;
};

function App() {
  // 게임 상태
  const [gameState, setGameState] = useState<GameState>({
    currentScreen: 'menu',
    selectedGame: null,
    playerName: '',
    roomId: null,
    room: null,
    gameData: null,
    error: null,
    isConnected: false
  });

  const socket = useSocket();

  // 소켓 이벤트 리스너 설정
  useEffect(() => {
    if (!socket.socket) return;

    const cleanup: (() => void)[] = [];

    // 연결 상태 관리
    cleanup.push(socket.on('connect', () => {
      console.log('서버에 연결되었습니다');
      setGameState(prev => ({ ...prev, isConnected: true, error: null }));
    }));

    cleanup.push(socket.on('disconnect', () => {
      console.log('서버와의 연결이 끊어졌습니다');
      setGameState(prev => ({ 
        ...prev, 
        isConnected: false,
        error: '서버와의 연결이 끊어졌습니다'
      }));
    }));

    // 룸 관련 이벤트
    cleanup.push(socket.on('roomCreated', (room: Room) => {
      console.log('방이 생성되었습니다:', room);
      setGameState(prev => ({ 
        ...prev, 
        room, 
        roomId: room.id, 
        currentScreen: 'lobby',
        error: null
      }));
    }));

    cleanup.push(socket.on('roomJoined', (room: Room) => {
      console.log('방에 참가했습니다:', room);
      setGameState(prev => ({ 
        ...prev, 
        room, 
        roomId: room.id, 
        currentScreen: 'lobby',
        error: null
      }));
    }));

    cleanup.push(socket.on('playerJoined', (player) => {
      console.log('새 플레이어가 참가했습니다:', player);
      setGameState(prev => {
        if (!prev.room) return prev;
        return {
          ...prev,
          room: {
            ...prev.room,
            players: [...prev.room.players, player]
          }
        };
      });
    }));

    cleanup.push(socket.on('playerLeft', (playerId) => {
      console.log('플레이어가 나갔습니다:', playerId);
      setGameState(prev => {
        if (!prev.room) return prev;
        return {
          ...prev,
          room: {
            ...prev.room,
            players: prev.room.players.filter((p: any) => p.id !== playerId)
          }
        };
      });
    }));

    cleanup.push(socket.on('playerReady', (playerId, isReady) => {
      console.log(`플레이어 ${playerId} 준비 상태:`, isReady);
      setGameState(prev => {
        if (!prev.room) return prev;
        return {
          ...prev,
          room: {
            ...prev.room,
            players: prev.room.players.map((p: any) => 
              p.id === playerId ? { ...p, isReady } : p
            )
          }
        };
      });
    }));

    // 게임 관련 이벤트
    cleanup.push(socket.on('gameStarted', (gameType) => {
      console.log('게임이 시작되었습니다:', gameType);
      setGameState(prev => ({ 
        ...prev, 
        selectedGame: gameType,
        currentScreen: 'game'
      }));
    }));

    cleanup.push(socket.on('gameStateChanged', (state) => {
      console.log('게임 상태 변경:', state);
      setGameState(prev => ({ ...prev, gameData: state }));
    }));

    cleanup.push(socket.on('gameEnded', (results) => {
      console.log('게임 종료:', results);
      setGameState(prev => ({ 
        ...prev, 
        currentScreen: 'lobby',
        selectedGame: null,
        gameData: null
      }));
    }));

    // 에러 처리
    cleanup.push(socket.on('error', (message) => {
      console.error('서버 에러:', message);
      setGameState(prev => ({ ...prev, error: message }));
    }));

    return () => {
      cleanup.forEach(fn => fn());
    };
  }, [socket]);

  // 컨텍스트 값 생성
  const contextValue: AppContextType = {
    ...gameState,
    setCurrentScreen: (screen) => setGameState(prev => ({ ...prev, currentScreen: screen })),
    setSelectedGame: (game) => setGameState(prev => ({ ...prev, selectedGame: game })),
    setPlayerName: (name) => setGameState(prev => ({ ...prev, playerName: name })),
    setRoomId: (id) => setGameState(prev => ({ ...prev, roomId: id })),
    setRoom: (room) => setGameState(prev => ({ ...prev, room })),
    setGameData: (data) => setGameState(prev => ({ ...prev, gameData: data })),
    setError: (error) => setGameState(prev => ({ ...prev, error })),
    setIsConnected: (connected) => setGameState(prev => ({ ...prev, isConnected: connected }))
  };

  // 화면 렌더링
  const renderCurrentScreen = () => {
    switch (gameState.currentScreen) {
      case 'menu':
        return <GameMenu socket={socket} />;
      case 'lobby':
        return <Lobby socket={socket} />;
      case 'game':
        if (gameState.selectedGame === 'uno') {
          return <UnoGame socket={socket} />;
        } else if (gameState.selectedGame === 'reaction') {
          return <ReactionGame socket={socket} />;
        }
        return <div>알 수 없는 게임</div>;
      default:
        return <div>로딩 중...</div>;
    }
  };

  return (
    <GameContext.Provider value={contextValue}>
      <div className="app">
        {/* 연결 상태 표시 */}
        <div className={`connection-status ${gameState.isConnected ? 'connected' : 'disconnected'}`}>
          {gameState.isConnected ? '🟢 연결됨' : '🔴 연결 끊김'}
        </div>

        {/* 에러 메시지 */}
        {gameState.error && (
          <div className="error-banner">
            <span>{gameState.error}</span>
            <button onClick={() => setGameState(prev => ({ ...prev, error: null }))}>
              ✕
            </button>
          </div>
        )}

        {/* 메인 컨텐츠 */}
        <main className="main-content">
          {renderCurrentScreen()}
        </main>
      </div>
    </GameContext.Provider>
  );
}

export default App;