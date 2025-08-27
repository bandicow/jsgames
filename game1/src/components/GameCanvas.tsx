import React, { useRef, useEffect, useState } from 'react';
import { GameEngine } from '../game/core/GameEngine';
import { GameState } from '../game/types';
import UpgradeMenu from './UI/UpgradeMenu';
import GameOverlay from './UI/GameOverlay';
import './GameCanvas.css';

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showUpgradeMenu, setShowUpgradeMenu] = useState(false);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize game engine
    const gameEngine = new GameEngine(canvasRef.current);
    gameEngineRef.current = gameEngine;

    // Start game
    gameEngine.start();

    // Update React state periodically
    const updateState = () => {
      const state = gameEngine.getGameState();
      setGameState({ ...state });
      
      // Check for pending level ups
      const experienceSystem = (gameEngine as any).experienceSystem;
      if (experienceSystem && experienceSystem.hasPendingLevelUps()) {
        setShowUpgradeMenu(true);
        gameEngine.togglePause();
      }
      
      animationFrameRef.current = requestAnimationFrame(updateState);
    };
    updateState();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      gameEngine.stop();
    };
  }, []);

  const handleUpgradeSelect = (upgradeId: string) => {
    if (gameEngineRef.current) {
      const experienceSystem = (gameEngineRef.current as any).experienceSystem;
      if (experienceSystem) {
        experienceSystem.applyUpgrade(gameEngineRef.current.getGameState(), upgradeId);
        
        // Check if more upgrades pending
        if (!experienceSystem.hasPendingLevelUps()) {
          setShowUpgradeMenu(false);
          gameEngineRef.current.togglePause();
        }
      }
    }
  };

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        className="game-canvas"
        width={1280}
        height={720}
      />
      
      {gameState && (
        <>
          <GameOverlay gameState={gameState} />
          
          {showUpgradeMenu && gameEngineRef.current && (
            <UpgradeMenu
              upgrades={(gameEngineRef.current as any).experienceSystem?.getAvailableUpgrades() || []}
              onSelect={handleUpgradeSelect}
            />
          )}
          
          {gameState.isGameOver && (
            <div className="game-over-overlay">
              <button className="restart-button" onClick={handleRestart}>
                Restart Game
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GameCanvas;