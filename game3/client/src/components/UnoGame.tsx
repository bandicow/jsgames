import React, { useState, useEffect } from 'react';
import { useGameContext } from '../App';
import type { UnoGameState, UnoCard, UnoColor } from '../types/game';
import './UnoGame.css';

interface UnoGameProps {
  socket: ReturnType<typeof import('../hooks/useSocket').useSocket>;
}

const UnoGame: React.FC<UnoGameProps> = ({ socket }) => {
  const { gameData, setCurrentScreen, playerName } = useGameContext();
  const [selectedCard, setSelectedCard] = useState<UnoCard | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showUnoButton, setShowUnoButton] = useState(false);

  const gameState: UnoGameState = gameData;

  useEffect(() => {
    if (!gameState) return;

    const currentPlayer = gameState.players.find(p => p.playerName === playerName);
    
    // 우노 버튼 표시 여부 체크 (카드가 2장일 때)
    if (currentPlayer && currentPlayer.cards.length === 2) {
      setShowUnoButton(true);
    } else {
      setShowUnoButton(false);
    }
  }, [gameState, playerName]);

  if (!gameState) {
    return (
      <div className="game-container">
        <div className="loading">
          우노 게임을 불러오는 중...
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(p => p.playerName === playerName);
  const isMyTurn = gameState.currentPlayerId === socket.socket?.id;

  const handleCardClick = (card: UnoCard) => {
    if (!isMyTurn) return;
    if (!canPlayCard(card)) return;

    if (card.value === 'wild' || card.value === 'wild_draw4') {
      setSelectedCard(card);
      setShowColorPicker(true);
    } else {
      playCard(card);
    }
  };

  const handleColorSelect = (color: UnoColor) => {
    if (selectedCard) {
      playCard(selectedCard, color);
      setSelectedCard(null);
      setShowColorPicker(false);
    }
  };

  const playCard = (card: UnoCard, selectedColor?: UnoColor) => {
    const cardToPlay = selectedColor ? { ...card, selectedColor } : card;
    socket.emit('playUnoCard', cardToPlay);
  };

  const canPlayCard = (card: UnoCard): boolean => {
    if (!gameState.lastPlayedCard) return true;
    
    if (card.color === 'wild') return true;
    
    return (
      card.color === gameState.lastPlayedCard.color ||
      card.value === gameState.lastPlayedCard.value
    );
  };

  const handleUnoDeclaration = () => {
    socket.emit('declareUno');
    setShowUnoButton(false);
  };

  const handleDrawCard = () => {
    if (!isMyTurn) return;
    // 서버에서 드로우 카드 로직을 처리하도록 빈 카드 플레이 시도
    // (실제로는 서버에서 유효하지 않은 플레이로 처리되어 드로우됨)
  };

  const handleBackToLobby = () => {
    setCurrentScreen('lobby');
  };

  const getCardColor = (card: UnoCard): string => {
    switch (card.color) {
      case 'red': return '#dc3545';
      case 'blue': return '#007bff';
      case 'green': return '#28a745';
      case 'yellow': return '#ffc107';
      case 'wild': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const getCardDisplayValue = (card: UnoCard): string => {
    switch (card.value) {
      case 'skip': return '⊘';
      case 'reverse': return '↻';
      case 'draw2': return '+2';
      case 'wild': return '✦';
      case 'wild_draw4': return '+4';
      default: return card.value;
    }
  };

  const renderCard = (card: UnoCard, isPlayable: boolean = false, onClick?: () => void) => (
    <div
      key={card.id}
      className={`uno-card ${isPlayable ? 'playable' : ''}`}
      style={{
        backgroundColor: getCardColor(card),
        color: card.color === 'yellow' ? '#000' : '#fff'
      }}
      onClick={onClick}
    >
      <div className="card-value">
        {getCardDisplayValue(card)}
      </div>
    </div>
  );

  const renderColorPicker = () => (
    <div className="color-picker-overlay" onClick={() => setShowColorPicker(false)}>
      <div className="color-picker" onClick={(e) => e.stopPropagation()}>
        <h3>색상을 선택하세요</h3>
        <div className="color-options">
          {(['red', 'blue', 'green', 'yellow'] as UnoColor[]).map(color => (
            <button
              key={color}
              className="color-option"
              style={{ backgroundColor: getCardColor({ color } as UnoCard) }}
              onClick={() => handleColorSelect(color)}
            >
              {color === 'red' ? '빨강' :
               color === 'blue' ? '파랑' :
               color === 'green' ? '초록' : '노랑'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPlayerArea = (player: any, position: string) => (
    <div key={player.playerId} className={`player-area ${position}`}>
      <div className="player-info">
        <span className="player-name">
          {player.playerName}
          {player.playerId === gameState.currentPlayerId && ' 🎯'}
          {player.hasDeclaratedUno && ' 🔥UNO!'}
        </span>
        <span className="card-count">
          🎴 {player.cardCount}장
        </span>
      </div>
      
      {position !== 'bottom' && (
        <div className="opponent-cards">
          {Array.from({ length: Math.min(player.cardCount, 10) }).map((_, i) => (
            <div key={i} className="card-back" style={{
              transform: `translateX(${i * 3}px) rotate(${(Math.random() - 0.5) * 10}deg)`
            }}>
              🎴
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderGameBoard = () => (
    <div className="uno-game-board">
      {/* 상대방 플레이어들 */}
      <div className="opponents">
        {gameState.players
          .filter(p => p.playerName !== playerName)
          .map((player, index) => {
            const positions = ['top-left', 'top-right', 'right'];
            return renderPlayerArea(player, positions[index % 3]);
          })}
      </div>

      {/* 게임 중앙부 */}
      <div className="game-center">
        <div className="deck-area">
          <div className="draw-pile" onClick={handleDrawCard}>
            <div className="card-back">
              🎴
            </div>
            <span>{gameState.deckCount}장</span>
          </div>
          
          <div className="discard-pile">
            {gameState.lastPlayedCard && renderCard(gameState.lastPlayedCard)}
            <span>버린 카드</span>
          </div>
        </div>

        {gameState.drawCount > 0 && (
          <div className="draw-penalty">
            ⚠️ {gameState.drawCount}장 뽑기
          </div>
        )}

        {showUnoButton && isMyTurn && (
          <button 
            className="uno-button"
            onClick={handleUnoDeclaration}
          >
            🔥 UNO!
          </button>
        )}
      </div>

      {/* 내 카드들 */}
      <div className="my-area">
        <div className="player-info">
          <span className="player-name">
            {playerName} (나)
            {isMyTurn && ' 🎯 내 차례'}
          </span>
        </div>
        
        <div className="my-cards">
          {currentPlayer?.cards.map(card => 
            renderCard(
              card,
              isMyTurn && canPlayCard(card),
              () => isMyTurn && handleCardClick(card)
            )
          )}
        </div>
      </div>
    </div>
  );

  const renderGameEnd = () => (
    <div className="game-end">
      <div className="end-screen">
        <h2>🎉 게임 종료!</h2>
        <div className="winner">
          🏆 승자: {gameState.players.find(p => p.cards.length === 0)?.playerName}
        </div>
        
        <div className="final-scores">
          <h3>최종 점수</h3>
          {/* 점수는 서버에서 계산된 결과를 표시 */}
        </div>
        
        <button className="btn btn-large" onClick={handleBackToLobby}>
          로비로 돌아가기
        </button>
      </div>
    </div>
  );

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>🎴 우노 게임</h1>
        <div className="game-info">
          <span>방향: {gameState.direction === 1 ? '→' : '←'}</span>
          <span>현재: {gameState.players.find(p => p.playerId === gameState.currentPlayerId)?.playerName}</span>
        </div>
      </div>

      <div className="game-content">
        {gameState.gameStatus === 'finished' ? renderGameEnd() : renderGameBoard()}
      </div>

      {showColorPicker && renderColorPicker()}
    </div>
  );
};

export default UnoGame;