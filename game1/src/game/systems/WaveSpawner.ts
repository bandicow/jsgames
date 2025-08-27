import { GameState, Enemy, EnemyType } from '../types';
import { GAME_CONFIG } from '../../constants/gameConfig';
import { ObjectPool } from '../utils/ObjectPool';
import { MathUtils, Vec2 } from '../utils/math';

export class WaveSpawner {
  private enemyPool: ObjectPool<Enemy>;
  private lastSpawnTime: number = 0;
  private enemiesSpawnedInWave: number = 0;
  
  constructor(enemyPool: ObjectPool<Enemy>) {
    this.enemyPool = enemyPool;
  }
  
  public update(gameState: GameState, deltaTime: number): void {
    const wave = gameState.wave;
    const currentTime = Date.now();
    
    // Check if wave is complete
    if (currentTime - wave.startTime >= wave.duration) {
      this.nextWave(gameState);
      return;
    }
    
    // Calculate spawn interval
    const spawnInterval = 1 / wave.spawnRate;
    
    // Spawn enemies
    if (currentTime - this.lastSpawnTime >= spawnInterval * 1000) {
      if (this.enemiesSpawnedInWave < wave.enemyCount) {
        this.spawnEnemy(gameState);
        this.lastSpawnTime = currentTime;
        this.enemiesSpawnedInWave++;
      }
    }
  }
  
  private spawnEnemy(gameState: GameState): void {
    const wave = gameState.wave;
    const player = gameState.player;
    
    // Get enemy from pool
    const enemy = this.enemyPool.acquire();
    
    // Choose enemy type
    const enemyType = this.selectEnemyType(wave);
    const config = GAME_CONFIG.ENEMIES[enemyType];
    
    // Initialize enemy
    enemy.id = MathUtils.generateId();
    enemy.type = 'enemy' as const;
    enemy.enemyType = enemyType;
    enemy.active = true;
    enemy.health = config.health;
    enemy.maxHealth = config.health;
    enemy.damage = config.damage;
    enemy.speed = config.speed;
    enemy.radius = config.radius;
    enemy.xpValue = config.xpValue;
    
    // Spawn position - random point on circle around player
    const spawnDistance = Math.max(
      GAME_CONFIG.CANVAS_WIDTH,
      GAME_CONFIG.CANVAS_HEIGHT
    ) * 0.6;
    
    const angle = Math.random() * Math.PI * 2;
    enemy.position = {
      x: player.position.x + Math.cos(angle) * spawnDistance,
      y: player.position.y + Math.sin(angle) * spawnDistance,
    };
    
    // Clamp to screen bounds with margin
    const margin = 50;
    enemy.position.x = MathUtils.clamp(
      enemy.position.x,
      -margin,
      GAME_CONFIG.CANVAS_WIDTH + margin
    );
    enemy.position.y = MathUtils.clamp(
      enemy.position.y,
      -margin,
      GAME_CONFIG.CANVAS_HEIGHT + margin
    );
    
    // Initialize velocity towards player
    const direction = Vec2.normalize(
      Vec2.subtract(player.position, enemy.position)
    );
    enemy.velocity = Vec2.multiply(direction, enemy.speed);
    
    // Add to game state and spatial grid
    gameState.enemies.push(enemy);
    
    // Note: The spatial grid is updated in the GameEngine's update method
  }
  
  private selectEnemyType(wave: any): EnemyType {
    // For early waves, mostly basic enemies
    if (wave.number <= 2) {
      return EnemyType.BASIC;
    }
    
    // Add fast enemies after wave 2
    if (wave.number <= 4) {
      return Math.random() < 0.7 ? EnemyType.BASIC : EnemyType.FAST;
    }
    
    // Add tank enemies after wave 4
    if (wave.number <= 6) {
      const rand = Math.random();
      if (rand < 0.5) return EnemyType.BASIC;
      if (rand < 0.8) return EnemyType.FAST;
      return EnemyType.TANK;
    }
    
    // Mixed enemies for later waves
    const rand = Math.random();
    if (rand < 0.4) return EnemyType.BASIC;
    if (rand < 0.7) return EnemyType.FAST;
    if (rand < 0.95) return EnemyType.TANK;
    
    // Boss wave every 5 waves
    if (wave.number % GAME_CONFIG.WAVE.BOSS_WAVE_INTERVAL === 0) {
      return EnemyType.BOSS;
    }
    
    return EnemyType.TANK;
  }
  
  private nextWave(gameState: GameState): void {
    const wave = gameState.wave;
    
    // Increment wave number
    wave.number++;
    
    // Increase difficulty
    wave.enemyCount = Math.floor(
      GAME_CONFIG.WAVE.BASE_ENEMY_COUNT +
      GAME_CONFIG.WAVE.ENEMY_COUNT_INCREASE * (wave.number - 1)
    );
    
    wave.spawnRate = 
      GAME_CONFIG.WAVE.BASE_SPAWN_RATE +
      GAME_CONFIG.WAVE.SPAWN_RATE_INCREASE * (wave.number - 1);
    
    // Reset wave timer
    wave.startTime = Date.now();
    this.enemiesSpawnedInWave = 0;
    
    // Bonus score for completing wave
    gameState.score += 100 * wave.number;
  }
}