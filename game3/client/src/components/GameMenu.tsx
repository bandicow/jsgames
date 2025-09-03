import React, { useState, useEffect } from 'react';
import { useGameContext } from '../App';

interface GameMenuProps {
  socket: ReturnType<typeof import('../hooks/useSocket').useSocket>;
}

const GameMenu: React.FC<GameMenuProps> = ({ socket }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);
  const [roomName, setRoomName] = useState('');

  const { setPlayerName: setGlobalPlayerName, error } = useGameContext();

  useEffect(() => {
    // 컴포넌트 마운트 시 소켓 연결
    if (!socket.isConnected) {
      socket.connect();
    }
  }, [socket]);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert('플레이어 이름을 입력해주세요');
      return;
    }
    
    if (!roomName.trim()) {
      alert('방 이름을 입력해주세요');
      return;
    }

    setGlobalPlayerName(playerName.trim());
    socket.emit('createRoom', roomName.trim(), playerName.trim());
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert('플레이어 이름을 입력해주세요');
      return;
    }
    
    if (!roomCode.trim()) {
      alert('방 코드를 입력해주세요');
      return;
    }

    setGlobalPlayerName(playerName.trim());
    socket.emit('joinRoom', roomCode.trim(), playerName.trim());
  };

  const resetForms = () => {
    setShowCreateRoom(false);
    setShowJoinRoom(false);
    setRoomName('');
    setRoomCode('');
  };

  if (showCreateRoom) {
    return (
      <div className="card game-menu">
        <h2>새 게임 방 만들기</h2>
        
        <div className="input-group">
          <label className="input-label">플레이어 이름</label>
          <input
            type="text"
            className="input"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="이름을 입력하세요"
            maxLength={20}
          />
        </div>

        <div className="input-group">
          <label className="input-label">방 이름</label>
          <input
            type="text"
            className="input"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="방 이름을 입력하세요"
            maxLength={30}
          />
        </div>

        <div className="menu-buttons">
          <button 
            className="btn btn-large"
            onClick={handleCreateRoom}
            disabled={!socket.isConnected}
          >
            방 만들기
          </button>
          <button className="btn btn-secondary" onClick={resetForms}>
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (showJoinRoom) {
    return (
      <div className="card game-menu">
        <h2>게임 방 참가하기</h2>
        
        <div className="input-group">
          <label className="input-label">플레이어 이름</label>
          <input
            type="text"
            className="input"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="이름을 입력하세요"
            maxLength={20}
          />
        </div>

        <div className="input-group">
          <label className="input-label">방 코드</label>
          <input
            type="text"
            className="input"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="방 코드를 입력하세요"
          />
        </div>

        <div className="menu-buttons">
          <button 
            className="btn btn-large"
            onClick={handleJoinRoom}
            disabled={!socket.isConnected}
          >
            참가하기
          </button>
          <button className="btn btn-secondary" onClick={resetForms}>
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-menu">
      <h1>🎮 멀티플레이어 게임</h1>
      
      <div className="card">
        <div className="menu-buttons">
          <button 
            className="btn btn-large"
            onClick={() => setShowCreateRoom(true)}
            disabled={!socket.isConnected}
          >
            🆕 새 게임 만들기
          </button>
          
          <button 
            className="btn btn-large"
            onClick={() => setShowJoinRoom(true)}
            disabled={!socket.isConnected}
          >
            🚪 게임 참가하기
          </button>
        </div>

        {!socket.isConnected && (
          <div className="connection-info">
            <p style={{ color: '#e53e3e', marginTop: '16px' }}>
              서버에 연결 중입니다...
            </p>
          </div>
        )}

        <div style={{ marginTop: '32px', color: '#718096', fontSize: '14px' }}>
          <p>🎯 <strong>우노 게임:</strong> 클래식 우노 카드 게임을 친구들과 함께!</p>
          <p>⚡ <strong>반응속도 게임:</strong> 누가 가장 빠른 손을 가졌는지 겨뤄보세요!</p>
          <p>👥 <strong>2-4명</strong>이 함께 플레이할 수 있습니다</p>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;