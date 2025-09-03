import React, { useEffect, useState } from 'react';
import { useGameContext } from '../App';
import type { ReactionGameState, ReactionPlayerState } from '../types/game';

interface ReactionGameProps {
  socket: ReturnType<typeof import('../hooks/useSocket').useSocket>;
}

const ReactionGame: React.FC<ReactionGameProps> = ({ socket }) => {
  const { gameData, setCurrentScreen } = useGameContext();
  const [hasClicked, setHasClicked] = useState(false);
  const [clickTime, setClickTime] = useState<number | null>(null);

  const gameState: ReactionGameState = gameData;

  useEffect(() => {
    // 각 라운드마다 상태 초기화
    if (gameState?.gameStatus === 'waiting' || gameState?.gameStatus === 'ready') {
      setHasClicked(false);
      setClickTime(null);
    }
  }, [gameState?.currentRound, gameState?.gameStatus]);

  if (!gameState) {
    return (
      <div className="game-container">
        <div className="loading">
          게임 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  const handleReactionClick = () => {
    if (hasClicked) return;
    if (gameState.gameStatus !== 'ready' && gameState.gameStatus !== 'go') return;

    setHasClicked(true);
    const now = Date.now();
    setClickTime(now);
    socket.emit('reactionClick');
  };

  const handleBackToLobby = () => {
    setCurrentScreen('lobby');
  };

  const getStatusMessage = () => {
    switch (gameState.gameStatus) {
      case 'waiting':
        return '다음 라운드 준비 중...';
      case 'ready':
        return '준비... 초록색이 되면 클릭하세요!';
      case 'go':
        return '지금 클릭!';
      case 'finished':
        return '게임 종료!';
      default:
        return '게임 진행 중...';
    }
  };

  const getBackgroundColor = () => {
    switch (gameState.gameStatus) {
      case 'waiting':
        return '#f7fafc';
      case 'ready':
        return '#fed7d7'; // 빨간색 (대기)
      case 'go':
        return '#c6f6d5'; // 초록색 (클릭 시점)
      case 'finished':
        return '#bee3f8';
      default:
        return '#f7fafc';
    }
  };

  const renderCurrentRound = () => (
    <div className="reaction-round">
      <div 
        className="reaction-button-container"
        style={{
          backgroundColor: getBackgroundColor(),
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          transition: 'background-color 0.3s ease',
          cursor: gameState.gameStatus === 'ready' || gameState.gameStatus === 'go' ? 'pointer' : 'default'
        }}
        onClick={handleReactionClick}
      >
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: '2.5em', 
            margin: '0 0 16px 0',
            color: gameState.gameStatus === 'go' ? '#22543d' : '#2d3748'
          }}>
            {getStatusMessage()}
          </h2>
          
          {gameState.gameStatus === 'ready' && (
            <p style={{ fontSize: '1.2em', color: '#e53e3e' }}>
              🔴 아직 클릭하지 마세요!
            </p>
          )}
          
          {gameState.gameStatus === 'go' && (
            <p style={{ fontSize: '1.2em', color: '#22543d', fontWeight: 'bold' }}>
              🟢 지금 클릭!
            </p>
          )}
          
          {hasClicked && gameState.gameStatus !== 'finished' && (
            <p style={{ fontSize: '1.1em', color: '#4a5568', marginTop: '16px' }}>
              ✅ 클릭 완료! 결과를 기다리는 중...
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderRoundResults = () => {
    if (gameState.roundResults.length === 0) return null;

    const latestRound = gameState.roundResults[gameState.roundResults.length - 1];
    
    return (
      <div className="round-results" style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3>라운드 {latestRound.round} 결과</h3>
        <div style={{ display: 'grid', gap: '8px' }}>
          {latestRound.results
            .sort((a, b) => a.rank - b.rank)
            .map((result) => (
              <div 
                key={result.playerId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: result.rank === 1 ? '#f0fff4' : 
                              result.rank === 2 ? '#fffaf0' : '#f7fafc',
                  border: result.rank === 1 ? '2px solid #22543d' :
                          result.rank === 2 ? '2px solid #744210' : '2px solid #e2e8f0'
                }}
              >
                <span style={{ fontWeight: 'bold' }}>
                  {result.rank === 1 ? '🥇' : result.rank === 2 ? '🥈' : result.rank === 3 ? '🥉' : '📍'} 
                  {result.playerName}
                </span>
                <span>
                  {result.reactionTime === -1 ? '너무 빨라요!' :
                   result.reactionTime === 999999 ? '시간 초과' :
                   `${result.reactionTime}ms`}
                  {result.points > 0 && ` (+${result.points}점)`}
                </span>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderScoreboard = () => (
    <div className="scoreboard" style={{
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h3>현재 점수</h3>
      <div style={{ display: 'grid', gap: '8px' }}>
        {[...gameState.players]
          .sort((a, b) => b.totalScore - a.totalScore)
          .map((player, index) => (
            <div 
              key={player.playerId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '6px',
                background: index === 0 ? '#f0fff4' : '#f7fafc',
                border: index === 0 ? '2px solid #22543d' : '2px solid #e2e8f0'
              }}
            >
              <span style={{ fontWeight: index === 0 ? 'bold' : 'normal' }}>
                {index === 0 ? '👑' : `${index + 1}.`} {player.playerName}
              </span>
              <span style={{ fontWeight: 'bold' }}>
                {player.totalScore}점
              </span>
            </div>
          ))}
      </div>
    </div>
  );

  const renderFinalResults = () => (
    <div className="final-results">
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginBottom: '24px', color: '#2d3748' }}>🎉 게임 종료!</h2>
        
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            fontSize: '2em', 
            marginBottom: '16px',
            color: '#22543d'
          }}>
            🏆 {gameState.finalResults[0]?.playerName} 승리!
          </div>
        </div>

        <div className="final-rankings">
          <h3 style={{ marginBottom: '16px' }}>최종 순위</h3>
          {gameState.finalResults.map((result) => (
            <div 
              key={result.playerId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                marginBottom: '8px',
                borderRadius: '8px',
                background: result.rank === 1 ? '#f0fff4' : 
                            result.rank === 2 ? '#fffaf0' : '#f7fafc',
                border: result.rank === 1 ? '3px solid #22543d' :
                        result.rank === 2 ? '3px solid #744210' : '2px solid #e2e8f0'
              }}
            >
              <span style={{ 
                fontWeight: 'bold',
                fontSize: result.rank === 1 ? '1.2em' : '1em'
              }}>
                {result.rank === 1 ? '🥇' : 
                 result.rank === 2 ? '🥈' : 
                 result.rank === 3 ? '🥉' : '📍'} 
                {result.playerName}
              </span>
              <span style={{ 
                fontWeight: 'bold',
                fontSize: result.rank === 1 ? '1.2em' : '1em'
              }}>
                {result.score}점
              </span>
            </div>
          ))}
        </div>

        <button 
          className="btn btn-large"
          onClick={handleBackToLobby}
          style={{ marginTop: '24px' }}
        >
          로비로 돌아가기
        </button>
      </div>
    </div>
  );

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>⚡ 반응속도 게임</h1>
        <div>
          라운드 {gameState.currentRound}/{gameState.totalRounds}
        </div>
      </div>

      <div className="game-content" style={{ padding: '20px' }}>
        {gameState.gameStatus === 'finished' ? (
          renderFinalResults()
        ) : (
          <>
            {renderCurrentRound()}
            {renderRoundResults()}
            {renderScoreboard()}
          </>
        )}
      </div>
    </div>
  );
};

export default ReactionGame;