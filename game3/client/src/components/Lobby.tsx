import React, { useState } from 'react';
import { useGameContext } from '../App';
import type { Player, GameType } from '../types/game';

interface LobbyProps {
  socket: ReturnType<typeof import('../hooks/useSocket').useSocket>;
}

const Lobby: React.FC<LobbyProps> = ({ socket }) => {
  const { 
    room, 
    playerName, 
    setCurrentScreen,
    setRoom,
    setRoomId 
  } = useGameContext();

  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);

  if (!room) {
    return (
      <div className="card">
        <div className="loading">
          로비 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  const currentPlayer = room.players.find((p: Player) => p.name === playerName);
  const isHost = currentPlayer?.isHost || false;
  const isReady = currentPlayer?.isReady || false;
  const allPlayersReady = room.players.every((p: Player) => p.isReady || p.isHost);
  const canStartGame = room.players.length >= 2 && allPlayersReady && selectedGame;

  const handleToggleReady = () => {
    socket.emit('toggleReady');
  };

  const handleStartGame = () => {
    if (!selectedGame) {
      alert('게임을 선택해주세요');
      return;
    }
    
    if (!canStartGame) {
      alert('모든 플레이어가 준비 상태가 아닙니다');
      return;
    }

    socket.emit('startGame', selectedGame);
  };

  const handleLeaveRoom = () => {
    if (confirm('정말 방을 나가시겠습니까?')) {
      socket.emit('leaveRoom');
      setRoom(null);
      setRoomId(null);
      setCurrentScreen('menu');
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.id).then(() => {
      alert('방 코드가 복사되었습니다!');
    }).catch(() => {
      alert(`방 코드: ${room.id}`);
    });
  };

  return (
    <div className="lobby card">
      <div className="lobby-header">
        <h2>🎮 {room.name}</h2>
        <div className="room-info">
          <p>
            <strong>방 코드:</strong> 
            <span style={{ 
              fontFamily: 'monospace', 
              fontSize: '1.2em', 
              marginLeft: '8px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }} onClick={copyRoomCode}>
              {room.id}
            </span>
            <button 
              onClick={copyRoomCode}
              style={{ 
                marginLeft: '8px', 
                padding: '4px 8px', 
                fontSize: '12px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              📋
            </button>
          </p>
          <p><strong>플레이어:</strong> {room.players.length}/{room.maxPlayers}</p>
        </div>
      </div>

      {/* 게임 선택 (호스트만) */}
      {isHost && (
        <div className="game-selection" style={{ marginBottom: '24px' }}>
          <h3>게임 선택</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className={`btn ${selectedGame === 'uno' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedGame('uno')}
            >
              🎴 우노
            </button>
            <button
              className={`btn ${selectedGame === 'reaction' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedGame('reaction')}
            >
              ⚡ 반응속도
            </button>
          </div>
          {selectedGame && (
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
              {selectedGame === 'uno' ? 
                '카드를 먼저 다 버리는 사람이 승리!' : 
                '가장 빠른 반응속도를 가진 사람이 승리!'
              }
            </p>
          )}
        </div>
      )}

      {/* 선택된 게임 표시 (참가자) */}
      {!isHost && selectedGame && (
        <div className="selected-game" style={{ 
          marginBottom: '24px',
          padding: '16px',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '8px',
          border: '2px solid rgba(102, 126, 234, 0.2)'
        }}>
          <h3>선택된 게임: {selectedGame === 'uno' ? '🎴 우노' : '⚡ 반응속도'}</h3>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
            {selectedGame === 'uno' ? 
              '카드를 먼저 다 버리는 사람이 승리!' : 
              '가장 빠른 반응속도를 가진 사람이 승리!'
            }
          </p>
        </div>
      )}

      {/* 플레이어 목록 */}
      <div className="players-section">
        <h3>플레이어 ({room.players.length}/{room.maxPlayers})</h3>
        <div className="players-grid">
          {room.players.map((player: Player) => (
            <div 
              key={player.id}
              className={`player-card ${player.isHost ? 'host' : ''} ${player.isReady ? 'ready' : ''}`}
            >
              <div className="player-name">
                {player.name}
                {player.name === playerName && ' (나)'}
              </div>
              <div className={`player-status ${
                player.isHost ? 'host' : player.isReady ? 'ready' : 'waiting'
              }`}>
                {player.isHost ? '👑 방장' : player.isReady ? '✅ 준비완료' : '⏳ 대기중'}
              </div>
            </div>
          ))}
          
          {/* 빈 슬롯 표시 */}
          {Array.from({ length: room.maxPlayers - room.players.length }).map((_, index) => (
            <div key={`empty-${index}`} className="player-card empty">
              <div className="player-name" style={{ color: '#ccc' }}>
                대기 중...
              </div>
              <div className="player-status waiting">
                🎮 참가 대기
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="lobby-controls">
        {/* 게임 시작 버튼 (호스트만) */}
        {isHost && (
          <button
            className="btn btn-large"
            onClick={handleStartGame}
            disabled={!canStartGame}
            title={!canStartGame ? 
              (!selectedGame ? '게임을 선택해주세요' : 
               room.players.length < 2 ? '최소 2명의 플레이어가 필요합니다' : 
               '모든 플레이어가 준비 상태가 아닙니다') : 
              '게임을 시작합니다'
            }
          >
            🚀 게임 시작
          </button>
        )}

        {/* 준비 버튼 (참가자만) */}
        {!isHost && (
          <button
            className={`btn btn-large ${isReady ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleToggleReady}
          >
            {isReady ? '✅ 준비완료' : '🎯 준비하기'}
          </button>
        )}

        {/* 방 나가기 버튼 */}
        <button
          className="btn btn-danger"
          onClick={handleLeaveRoom}
        >
          🚪 방 나가기
        </button>
      </div>

      {/* 상태 메시지 */}
      <div className="lobby-status" style={{ marginTop: '20px', textAlign: 'center' }}>
        {room.players.length < 2 && (
          <p style={{ color: '#e53e3e' }}>
            ⚠️ 게임을 시작하려면 최소 2명의 플레이어가 필요합니다
          </p>
        )}
        {room.players.length >= 2 && !allPlayersReady && (
          <p style={{ color: '#ed8936' }}>
            ⏳ 모든 플레이어가 준비 상태가 되면 게임을 시작할 수 있습니다
          </p>
        )}
        {room.players.length >= 2 && allPlayersReady && !selectedGame && isHost && (
          <p style={{ color: '#ed8936' }}>
            🎮 게임을 선택하고 시작 버튼을 눌러주세요
          </p>
        )}
        {room.players.length >= 2 && allPlayersReady && selectedGame && (
          <p style={{ color: '#48bb78' }}>
            ✅ 게임 시작 준비 완료!
          </p>
        )}
      </div>
    </div>
  );
};

export default Lobby;