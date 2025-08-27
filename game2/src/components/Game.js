// Main Game Component

import React, { useEffect, useRef, useState } from 'react';
import GameEngine from '../game/core/GameEngine';
import i18n from '../utils/i18n';
import './Game.css';

function Game() {
  const canvasRef = useRef(null);
  const gameEngineRef = useRef(null);
  const [gameState, setGameState] = useState('menu');
  const [language, setLanguage] = useState(i18n.getLanguage());

  useEffect(() => {
    if (canvasRef.current && !gameEngineRef.current) {
      // Create game engine with i18n
      gameEngineRef.current = new GameEngine(canvasRef.current, i18n);
      
      // Update game state listener
      const updateInterval = setInterval(() => {
        if (gameEngineRef.current) {
          setGameState(gameEngineRef.current.gameState);
        }
      }, 100);
      
      return () => {
        clearInterval(updateInterval);
      };
    }
  }, []);

  useEffect(() => {
    // Language change listener
    const unsubscribe = i18n.subscribe((newLang) => {
      setLanguage(newLang);
    });
    
    return unsubscribe;
  }, []);

  const startGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.init();
      gameEngineRef.current.start();
      setGameState('playing');
    }
  };

  const changeLanguage = (lang) => {
    i18n.setLanguage(lang);
  };

  const restartGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.init();
      gameEngineRef.current.start();
      setGameState('playing');
    }
  };

  return (
    <div className="game-container">
      {gameState === 'menu' && (
        <div className="menu-overlay">
          <div className="menu-content">
            <h1 className="game-title">{i18n.t('game.title')}</h1>
            
            <div className="language-selector">
              <button 
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
              >
                English
              </button>
              <button 
                className={`lang-btn ${language === 'ko' ? 'active' : ''}`}
                onClick={() => changeLanguage('ko')}
              >
                한국어
              </button>
            </div>
            
            <button className="start-btn" onClick={startGame}>
              {i18n.t('game.start')}
            </button>
            
            <div className="controls-info">
              <h3>Controls</h3>
              <p>WASD - Move</p>
              <p>ESC - Pause</p>
              <p>Enter - Select</p>
            </div>
          </div>
        </div>
      )}
      
      <canvas 
        ref={canvasRef}
        className={gameState === 'menu' ? 'canvas-hidden' : 'canvas-visible'}
      />
      
      {(gameState === 'gameover' || gameState === 'victory') && (
        <div className="game-over-overlay">
          <button className="restart-btn" onClick={restartGame}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default Game;