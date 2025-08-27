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
  const [selectedStage, setSelectedStage] = useState(0); // 0 = Forest (default)
  const [selectedDuration, setSelectedDuration] = useState(600); // 10 minutes default
  const [showSettings, setShowSettings] = useState(false);

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
      console.log(`Starting new game - Stage: ${selectedStage}, Duration: ${selectedDuration}s`);
      
      // Apply settings before starting
      gameEngineRef.current.setGameSettings({
        startStage: selectedStage,
        gameDuration: selectedDuration
      });
      
      // Force complete reset
      gameEngineRef.current.init();
      
      // Small delay to ensure init() completes
      setTimeout(() => {
        gameEngineRef.current.start();
        setGameState('playing');
      }, 50);
      
      setShowSettings(false);
    }
  };

  const changeLanguage = (lang) => {
    i18n.setLanguage(lang);
  };

  const restartGame = () => {
    if (gameEngineRef.current) {
      console.log(`Restarting game - Stage: ${selectedStage}, Duration: ${selectedDuration}s`);
      
      // Apply settings before restarting
      gameEngineRef.current.setGameSettings({
        startStage: selectedStage,
        gameDuration: selectedDuration
      });
      
      // Force complete reset
      gameEngineRef.current.init();
      
      // Small delay to ensure init() completes
      setTimeout(() => {
        gameEngineRef.current.start();
        setGameState('playing');
      }, 50);
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
            
            <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
              {i18n.t('game.settings') || 'Settings'}
            </button>
            
            {showSettings && (
              <div className="settings-panel">
                <h3>{i18n.t('game.settings') || 'Game Settings'}</h3>
                
                <div className="setting-group">
                  <label>{i18n.t('game.stage.select') || 'Start Stage'}:</label>
                  <select value={selectedStage} onChange={(e) => setSelectedStage(Number(e.target.value))}>
                    <option value={0}>{i18n.t('game.stage.forest') || 'Forest'}</option>
                    <option value={1}>{i18n.t('game.stage.desert') || 'Desert'}</option>
                    <option value={2}>{i18n.t('game.stage.volcano') || 'Volcano'}</option>
                    <option value={3}>{i18n.t('game.stage.snow') || 'Snow'}</option>
                    <option value={4}>{i18n.t('game.stage.space') || 'Space'}</option>
                  </select>
                </div>
                
                <div className="setting-group">
                  <label>{i18n.t('game.duration') || 'Game Duration'}:</label>
                  <select value={selectedDuration} onChange={(e) => setSelectedDuration(Number(e.target.value))}>
                    <option value={60}>1 {i18n.t('game.minute') || 'minute'}</option>
                    <option value={180}>3 {i18n.t('game.minutes') || 'minutes'}</option>
                    <option value={300}>5 {i18n.t('game.minutes') || 'minutes'}</option>
                    <option value={600}>10 {i18n.t('game.minutes') || 'minutes'}</option>
                  </select>
                </div>
                
                <p className="settings-note">
                  {i18n.t('game.boss.note') || 'Boss spawns 1 minute before game ends'}
                </p>
              </div>
            )}
            
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