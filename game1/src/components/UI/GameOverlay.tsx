import React from 'react';
import { GameState } from '../../game/types';
import './GameOverlay.css';

interface GameOverlayProps {
  gameState: GameState;
}

const GameOverlay: React.FC<GameOverlayProps> = ({ gameState }) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const expPercent = (gameState.player.experience / gameState.player.experienceToNext) * 100;

  return (
    <div className="game-overlay">
      <div className="overlay-top-left">
        <div className="player-info">
          <div className="level-badge">LV {gameState.player.level}</div>
          <div className="exp-bar-container">
            <div className="exp-bar" style={{ width: `${expPercent}%` }} />
            <span className="exp-text">
              {Math.floor(gameState.player.experience)} / {gameState.player.experienceToNext} XP
            </span>
          </div>
        </div>
        
        <div className="health-bar-container">
          <div 
            className="health-bar" 
            style={{ width: `${(gameState.player.health / gameState.player.maxHealth) * 100}%` }} 
          />
          <span className="health-text">
            {Math.floor(gameState.player.health)} / {gameState.player.maxHealth} HP
          </span>
        </div>
      </div>

      <div className="overlay-top-right">
        <div className="stat-item">
          <span className="stat-label">Wave</span>
          <span className="stat-value">{gameState.wave.number}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Time</span>
          <span className="stat-value">{formatTime(gameState.time)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Kills</span>
          <span className="stat-value">{gameState.kills}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Score</span>
          <span className="stat-value">{gameState.score.toLocaleString()}</span>
        </div>
      </div>

      {gameState.performanceMetrics.fps < 55 && (
        <div className="performance-warning">
          ⚠ Low FPS: {gameState.performanceMetrics.fps}
        </div>
      )}
    </div>
  );
};

export default GameOverlay;