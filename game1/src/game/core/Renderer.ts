import { GameState, Enemy, Projectile, XPOrb, EnemyType, WeaponType } from '../types';
import { GAME_CONFIG } from '../../constants/gameConfig';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private offscreenCanvas?: OffscreenCanvas;
  private offscreenCtx?: CanvasRenderingContext2D;
  
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    
    // Try to use OffscreenCanvas for better performance
    if (typeof OffscreenCanvas !== 'undefined') {
      this.offscreenCanvas = new OffscreenCanvas(
        GAME_CONFIG.CANVAS_WIDTH,
        GAME_CONFIG.CANVAS_HEIGHT
      );
      this.offscreenCtx = this.offscreenCanvas.getContext('2d') as unknown as CanvasRenderingContext2D;
    }
  }

  public render(gameState: GameState): void {
    const ctx = this.offscreenCtx || this.ctx;
    
    // Clear canvas
    ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    
    // Draw grid (debug)
    if (GAME_CONFIG.DEBUG.SHOW_GRID) {
      this.drawGrid(ctx);
    }
    
    // Draw entities in order (back to front)
    this.drawXPOrbs(ctx, gameState.xpOrbs);
    this.drawEnemies(ctx, gameState.enemies);
    this.drawProjectiles(ctx, gameState.projectiles);
    this.drawPlayer(ctx, gameState);
    
    // Draw UI elements
    this.drawUI(ctx, gameState);
    
    // Copy offscreen canvas to main canvas if using it
    if (this.offscreenCanvas && this.offscreenCtx) {
      this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    }
  }
  
  private drawGrid(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = GAME_CONFIG.COLORS.GRID;
    ctx.lineWidth = 0.5;
    
    const cellSize = GAME_CONFIG.GRID_CELL_SIZE;
    
    // Vertical lines
    for (let x = 0; x <= GAME_CONFIG.CANVAS_WIDTH; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_CONFIG.CANVAS_HEIGHT);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= GAME_CONFIG.CANVAS_HEIGHT; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_CONFIG.CANVAS_WIDTH, y);
      ctx.stroke();
    }
  }
  
  private drawPlayer(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    const player = gameState.player;
    
    // Draw player circle
    ctx.fillStyle = GAME_CONFIG.COLORS.PLAYER;
    ctx.beginPath();
    ctx.arc(player.position.x, player.position.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw health bar above player
    const barWidth = 40;
    const barHeight = 4;
    const barY = player.position.y - player.radius - 15;
    
    // Health bar background
    ctx.fillStyle = GAME_CONFIG.COLORS.HEALTH_BAR_BG;
    ctx.fillRect(
      player.position.x - barWidth / 2,
      barY,
      barWidth,
      barHeight
    );
    
    // Health bar fill
    const healthPercent = player.health / player.maxHealth;
    ctx.fillStyle = GAME_CONFIG.COLORS.HEALTH_BAR;
    ctx.fillRect(
      player.position.x - barWidth / 2,
      barY,
      barWidth * healthPercent,
      barHeight
    );
    
    // Draw pickup radius (debug)
    if (GAME_CONFIG.DEBUG.SHOW_COLLISION_BOXES) {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(player.position.x, player.position.y, player.pickupRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  
  private drawEnemies(ctx: CanvasRenderingContext2D, enemies: Enemy[]): void {
    // Batch render by enemy type for better performance
    const enemiesByType: Map<EnemyType, Enemy[]> = new Map();
    
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      
      if (!enemiesByType.has(enemy.enemyType)) {
        enemiesByType.set(enemy.enemyType, []);
      }
      enemiesByType.get(enemy.enemyType)!.push(enemy);
    }
    
    // Draw each type
    enemiesByType.forEach((enemiesOfType, type) => {
      const config = GAME_CONFIG.ENEMIES[type];
      ctx.fillStyle = config.color;
      
      for (const enemy of enemiesOfType) {
        ctx.beginPath();
        ctx.arc(enemy.position.x, enemy.position.y, enemy.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw health bar if damaged
        if (enemy.health < enemy.maxHealth) {
          const barWidth = enemy.radius * 2;
          const barHeight = 3;
          const barY = enemy.position.y - enemy.radius - 8;
          
          // Background
          ctx.fillStyle = GAME_CONFIG.COLORS.HEALTH_BAR_BG;
          ctx.fillRect(
            enemy.position.x - barWidth / 2,
            barY,
            barWidth,
            barHeight
          );
          
          // Health
          const healthPercent = enemy.health / enemy.maxHealth;
          ctx.fillStyle = GAME_CONFIG.COLORS.HEALTH_BAR;
          ctx.fillRect(
            enemy.position.x - barWidth / 2,
            barY,
            barWidth * healthPercent,
            barHeight
          );
          
          // Reset color for next enemy
          ctx.fillStyle = config.color;
        }
      }
    });
  }
  
  private drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]): void {
    // Batch render by weapon type
    const projectilesByType: Map<WeaponType, Projectile[]> = new Map();
    
    for (const projectile of projectiles) {
      if (!projectile.active) continue;
      
      if (!projectilesByType.has(projectile.weaponType)) {
        projectilesByType.set(projectile.weaponType, []);
      }
      projectilesByType.get(projectile.weaponType)!.push(projectile);
    }
    
    // Draw each type
    projectilesByType.forEach((projectilesOfType, type) => {
      const config = GAME_CONFIG.WEAPONS[type];
      ctx.fillStyle = config.color;
      
      for (const projectile of projectilesOfType) {
        ctx.beginPath();
        ctx.arc(
          projectile.position.x,
          projectile.position.y,
          config.radius * config.area,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    });
  }
  
  private drawXPOrbs(ctx: CanvasRenderingContext2D, xpOrbs: XPOrb[]): void {
    ctx.fillStyle = GAME_CONFIG.COLORS.XP_ORB;
    
    for (const orb of xpOrbs) {
      if (!orb.active) continue;
      
      // Add pulsing effect
      const pulseScale = 1 + Math.sin(Date.now() * 0.005) * 0.2;
      const radius = GAME_CONFIG.EXPERIENCE.ORB_RADIUS * pulseScale;
      
      ctx.beginPath();
      ctx.arc(orb.position.x, orb.position.y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Add glow effect if being collected
      if (orb.isBeingCollected) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }
  
  private drawUI(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    ctx.fillStyle = GAME_CONFIG.COLORS.UI_TEXT;
    ctx.font = 'bold 16px Arial';
    
    // Draw level and experience
    ctx.textAlign = 'left';
    ctx.fillText(`Level: ${gameState.player.level}`, 10, 30);
    
    // Experience bar
    const expBarWidth = 200;
    const expBarHeight = 10;
    const expBarX = 10;
    const expBarY = 40;
    
    // Background
    ctx.fillStyle = GAME_CONFIG.COLORS.HEALTH_BAR_BG;
    ctx.fillRect(expBarX, expBarY, expBarWidth, expBarHeight);
    
    // Fill
    const expPercent = gameState.player.experience / gameState.player.experienceToNext;
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(expBarX, expBarY, expBarWidth * expPercent, expBarHeight);
    
    // Experience text
    ctx.fillStyle = GAME_CONFIG.COLORS.UI_TEXT;
    ctx.font = '12px Arial';
    ctx.fillText(
      `${Math.floor(gameState.player.experience)}/${gameState.player.experienceToNext}`,
      expBarX,
      expBarY + expBarHeight + 15
    );
    
    // Draw wave info
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Wave: ${gameState.wave.number}`, GAME_CONFIG.CANVAS_WIDTH - 10, 30);
    
    // Draw score and kills
    ctx.font = '14px Arial';
    ctx.fillText(`Score: ${gameState.score}`, GAME_CONFIG.CANVAS_WIDTH - 10, 50);
    ctx.fillText(`Kills: ${gameState.kills}`, GAME_CONFIG.CANVAS_WIDTH - 10, 70);
    
    // Draw time
    const minutes = Math.floor(gameState.time / 60);
    const seconds = Math.floor(gameState.time % 60);
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    ctx.fillText(`Time: ${timeString}`, GAME_CONFIG.CANVAS_WIDTH - 10, 90);
    
    // Draw performance metrics (debug)
    if (GAME_CONFIG.DEBUG.SHOW_PERFORMANCE_METRICS) {
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = gameState.performanceMetrics.fps < GAME_CONFIG.WARNING_FPS ? '#ff0000' : '#00ff00';
      ctx.fillText(`FPS: ${gameState.performanceMetrics.fps}`, 10, GAME_CONFIG.CANVAS_HEIGHT - 60);
      
      ctx.fillStyle = GAME_CONFIG.COLORS.UI_TEXT;
      ctx.fillText(`Entities: ${gameState.performanceMetrics.entityCount}`, 10, GAME_CONFIG.CANVAS_HEIGHT - 45);
      ctx.fillText(`Update: ${gameState.performanceMetrics.updateTime.toFixed(2)}ms`, 10, GAME_CONFIG.CANVAS_HEIGHT - 30);
      ctx.fillText(`Render: ${gameState.performanceMetrics.renderTime.toFixed(2)}ms`, 10, GAME_CONFIG.CANVAS_HEIGHT - 15);
      
      if (gameState.performanceMetrics.memoryUsage) {
        ctx.fillText(`Memory: ${gameState.performanceMetrics.memoryUsage.toFixed(1)}MB`, 10, GAME_CONFIG.CANVAS_HEIGHT - 75);
      }
    }
    
    // Draw pause screen
    if (gameState.isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
      
      ctx.fillStyle = GAME_CONFIG.COLORS.UI_TEXT;
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2);
      
      ctx.font = '24px Arial';
      ctx.fillText('Press ESC or P to continue', GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 + 50);
    }
    
    // Draw game over screen
    if (gameState.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
      
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 - 50);
      
      ctx.fillStyle = GAME_CONFIG.COLORS.UI_TEXT;
      ctx.font = '24px Arial';
      ctx.fillText(`Final Score: ${gameState.score}`, GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 + 10);
      ctx.fillText(`Survived: ${timeString}`, GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 + 40);
      ctx.fillText(`Kills: ${gameState.kills}`, GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 + 70);
      
      ctx.font = '18px Arial';
      ctx.fillText('Press F5 to restart', GAME_CONFIG.CANVAS_WIDTH / 2, GAME_CONFIG.CANVAS_HEIGHT / 2 + 120);
    }
  }
}