import { GameState, InputState, Player, Enemy, Projectile, XPOrb, WeaponType, EnemyType, Wave } from '../types';
import { GAME_CONFIG } from '../../constants/gameConfig';
import { ObjectPool, PoolFactories } from '../utils/ObjectPool';
import { SpatialGrid } from '../utils/SpatialGrid';
import { Vec2, MathUtils } from '../utils/math';
import { CollisionSystem } from '../systems/CollisionSystem';
import { WaveSpawner } from '../systems/WaveSpawner';
import { WeaponSystem } from '../systems/WeaponSystem';
import { ExperienceSystem } from '../systems/ExperienceSystem';
import { Renderer } from './Renderer';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private inputState: InputState;
  
  // Systems
  private renderer: Renderer;
  private collisionSystem: CollisionSystem;
  private waveSpawner: WaveSpawner;
  private weaponSystem: WeaponSystem;
  private experienceSystem: ExperienceSystem;
  
  // Object pools
  private enemyPool: ObjectPool<Enemy>;
  private projectilePool: ObjectPool<Projectile>;
  private xpOrbPool: ObjectPool<XPOrb>;
  
  // Spatial grids
  private enemyGrid: SpatialGrid<Enemy>;
  private projectileGrid: SpatialGrid<Projectile>;
  private xpOrbGrid: SpatialGrid<XPOrb>;
  
  // Performance tracking
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;
  private deltaTime: number = 0;
  
  // Game loop
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    
    // Set canvas size
    this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
    
    // Initialize game state
    this.gameState = this.initializeGameState();
    
    // Initialize input state
    this.inputState = {
      keys: new Set(),
      mouse: {
        x: 0,
        y: 0,
        buttons: new Set(),
      },
    };
    
    // Initialize object pools
    this.enemyPool = new ObjectPool<Enemy>(
      PoolFactories.createEnemy as () => Enemy,
      PoolFactories.resetEnemy,
      200,
      GAME_CONFIG.OBJECT_POOL_SIZE
    );
    
    this.projectilePool = new ObjectPool<Projectile>(
      PoolFactories.createProjectile as () => Projectile,
      PoolFactories.resetProjectile,
      100,
      500
    );
    
    this.xpOrbPool = new ObjectPool<XPOrb>(
      PoolFactories.createXPOrb as () => XPOrb,
      PoolFactories.resetXPOrb,
      100,
      300
    );
    
    // Initialize spatial grids
    this.enemyGrid = new SpatialGrid<Enemy>(
      GAME_CONFIG.CANVAS_WIDTH,
      GAME_CONFIG.CANVAS_HEIGHT,
      GAME_CONFIG.GRID_CELL_SIZE
    );
    
    this.projectileGrid = new SpatialGrid<Projectile>(
      GAME_CONFIG.CANVAS_WIDTH,
      GAME_CONFIG.CANVAS_HEIGHT,
      GAME_CONFIG.GRID_CELL_SIZE
    );
    
    this.xpOrbGrid = new SpatialGrid<XPOrb>(
      GAME_CONFIG.CANVAS_WIDTH,
      GAME_CONFIG.CANVAS_HEIGHT,
      GAME_CONFIG.GRID_CELL_SIZE
    );
    
    // Initialize systems
    this.renderer = new Renderer(this.ctx);
    this.collisionSystem = new CollisionSystem(
      this.enemyGrid,
      this.projectileGrid,
      this.xpOrbGrid
    );
    this.waveSpawner = new WaveSpawner(this.enemyPool);
    this.weaponSystem = new WeaponSystem(this.projectilePool);
    this.experienceSystem = new ExperienceSystem();
    
    // Set up input handlers
    this.setupInputHandlers();
  }

  private initializeGameState(): GameState {
    const player: Player = {
      id: MathUtils.generateId(),
      type: 'player',
      position: {
        x: GAME_CONFIG.CANVAS_WIDTH / 2,
        y: GAME_CONFIG.CANVAS_HEIGHT / 2,
      },
      velocity: { x: 0, y: 0 },
      radius: GAME_CONFIG.PLAYER.RADIUS,
      health: GAME_CONFIG.PLAYER.MAX_HEALTH,
      maxHealth: GAME_CONFIG.PLAYER.MAX_HEALTH,
      damage: 0,
      speed: GAME_CONFIG.PLAYER.BASE_SPEED,
      active: true,
      level: 1,
      experience: 0,
      experienceToNext: GAME_CONFIG.EXPERIENCE.BASE_TO_NEXT,
      weapons: [
        {
          type: WeaponType.BULLET,
          level: 1,
          damage: GAME_CONFIG.WEAPONS[WeaponType.BULLET].damage,
          fireRate: GAME_CONFIG.WEAPONS[WeaponType.BULLET].fireRate,
          projectileSpeed: GAME_CONFIG.WEAPONS[WeaponType.BULLET].projectileSpeed,
          projectileCount: GAME_CONFIG.WEAPONS[WeaponType.BULLET].projectileCount,
          pierce: GAME_CONFIG.WEAPONS[WeaponType.BULLET].pierce,
          area: GAME_CONFIG.WEAPONS[WeaponType.BULLET].area,
          lastFired: 0,
        },
      ],
      upgrades: [],
      moveSpeed: GAME_CONFIG.PLAYER.BASE_SPEED,
      pickupRadius: GAME_CONFIG.PLAYER.PICKUP_RADIUS,
    };

    const wave: Wave = {
      number: 1,
      enemyCount: GAME_CONFIG.WAVE.BASE_ENEMY_COUNT,
      enemyTypes: [EnemyType.BASIC],
      spawnRate: GAME_CONFIG.WAVE.BASE_SPAWN_RATE,
      duration: GAME_CONFIG.WAVE.DURATION,
      startTime: Date.now(),
    };

    return {
      player,
      enemies: [],
      projectiles: [],
      xpOrbs: [],
      effects: [],
      wave,
      isPaused: false,
      isGameOver: false,
      score: 0,
      time: 0,
      kills: 0,
      performanceMetrics: {
        fps: 60,
        frameTime: 16.67,
        entityCount: 1,
        updateTime: 0,
        renderTime: 0,
      },
    };
  }

  private setupInputHandlers(): void {
    // Keyboard input
    window.addEventListener('keydown', (e) => {
      this.inputState.keys.add(e.key.toLowerCase());
      
      // Handle pause
      if (e.key === 'Escape' || e.key === 'p') {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.inputState.keys.delete(e.key.toLowerCase());
    });

    // Mouse input
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.inputState.mouse.x = e.clientX - rect.left;
      this.inputState.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.inputState.mouse.buttons.add(e.button);
    });

    this.canvas.addEventListener('mouseup', (e) => {
      this.inputState.mouse.buttons.delete(e.button);
    });

    // Prevent context menu on right click
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  public start(): void {
    if (this.animationFrameId !== null) return;
    
    this.lastFrameTime = performance.now();
    this.gameLoop(this.lastFrameTime);
  }

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public togglePause(): void {
    this.gameState.isPaused = !this.gameState.isPaused;
  }

  private gameLoop = (currentTime: number): void => {
    // Calculate delta time
    this.deltaTime = Math.min((currentTime - this.lastFrameTime) / 1000, 0.1); // Cap at 100ms
    this.lastFrameTime = currentTime;

    // Update FPS counter
    this.updateFPS(currentTime);

    // Skip update if paused
    if (!this.gameState.isPaused && !this.gameState.isGameOver) {
      const updateStartTime = performance.now();
      this.update(this.deltaTime);
      this.gameState.performanceMetrics.updateTime = performance.now() - updateStartTime;
    }

    // Always render
    const renderStartTime = performance.now();
    this.render();
    this.gameState.performanceMetrics.renderTime = performance.now() - renderStartTime;

    // Continue loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private updateFPS(currentTime: number): void {
    this.frameCount++;
    
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.gameState.performanceMetrics.fps = this.frameCount;
      this.gameState.performanceMetrics.frameTime = 1000 / this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
      
      // Update entity count
      this.gameState.performanceMetrics.entityCount = 
        1 + // Player
        this.gameState.enemies.filter(e => e.active).length +
        this.gameState.projectiles.filter(p => p.active).length +
        this.gameState.xpOrbs.filter(o => o.active).length;
        
      // Update memory usage if available
      if ((performance as any).memory) {
        this.gameState.performanceMetrics.memoryUsage = 
          (performance as any).memory.usedJSHeapSize / 1048576; // Convert to MB
      }
    }
  }

  private update(deltaTime: number): void {
    // Update game time
    this.gameState.time += deltaTime;

    // Update player
    this.updatePlayer(deltaTime);

    // Update systems
    this.waveSpawner.update(this.gameState, deltaTime);
    this.weaponSystem.update(this.gameState, deltaTime);

    // Update enemies
    this.updateEnemies(deltaTime);

    // Update projectiles
    this.updateProjectiles(deltaTime);

    // Update XP orbs
    this.updateXPOrbs(deltaTime);

    // Process collisions
    this.collisionSystem.processCollisions(this.gameState);

    // Update experience
    this.experienceSystem.update(this.gameState);

    // Clean up inactive entities
    this.cleanupInactiveEntities();

    // Check game over
    if (this.gameState.player.health <= 0) {
      this.gameState.isGameOver = true;
    }
  }

  private updatePlayer(deltaTime: number): void {
    const player = this.gameState.player;
    
    // Handle movement
    let dx = 0;
    let dy = 0;

    if (this.inputState.keys.has('w') || this.inputState.keys.has('arrowup')) dy -= 1;
    if (this.inputState.keys.has('s') || this.inputState.keys.has('arrowdown')) dy += 1;
    if (this.inputState.keys.has('a') || this.inputState.keys.has('arrowleft')) dx -= 1;
    if (this.inputState.keys.has('d') || this.inputState.keys.has('arrowright')) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }

    // Apply movement
    player.velocity.x = dx * player.moveSpeed;
    player.velocity.y = dy * player.moveSpeed;
    
    player.position.x += player.velocity.x * deltaTime;
    player.position.y += player.velocity.y * deltaTime;

    // Keep player in bounds
    player.position.x = MathUtils.clamp(
      player.position.x,
      player.radius,
      GAME_CONFIG.CANVAS_WIDTH - player.radius
    );
    player.position.y = MathUtils.clamp(
      player.position.y,
      player.radius,
      GAME_CONFIG.CANVAS_HEIGHT - player.radius
    );

    // Health regeneration
    if (player.health < player.maxHealth) {
      player.health = Math.min(
        player.maxHealth,
        player.health + GAME_CONFIG.PLAYER.HEALTH_REGEN * deltaTime
      );
    }
  }

  private updateEnemies(deltaTime: number): void {
    const player = this.gameState.player;

    for (const enemy of this.gameState.enemies) {
      if (!enemy.active) continue;

      const oldPosition = Vec2.clone(enemy.position);

      // Move towards player
      const direction = Vec2.normalize(
        Vec2.subtract(player.position, enemy.position)
      );
      
      enemy.velocity = Vec2.multiply(direction, enemy.speed);
      enemy.position.x += enemy.velocity.x * deltaTime;
      enemy.position.y += enemy.velocity.y * deltaTime;

      // Update spatial grid
      this.enemyGrid.update(enemy, oldPosition);
    }
  }

  private updateProjectiles(deltaTime: number): void {
    for (const projectile of this.gameState.projectiles) {
      if (!projectile.active) continue;

      const oldPosition = Vec2.clone(projectile.position);

      // Update position
      projectile.position.x += projectile.velocity.x * deltaTime;
      projectile.position.y += projectile.velocity.y * deltaTime;

      // Update lifetime
      projectile.lifetime += deltaTime;
      if (projectile.lifetime >= projectile.maxLifetime) {
        projectile.active = false;
        continue;
      }

      // Check if out of bounds
      if (
        projectile.position.x < -50 ||
        projectile.position.x > GAME_CONFIG.CANVAS_WIDTH + 50 ||
        projectile.position.y < -50 ||
        projectile.position.y > GAME_CONFIG.CANVAS_HEIGHT + 50
      ) {
        projectile.active = false;
        continue;
      }

      // Update spatial grid
      this.projectileGrid.update(projectile, oldPosition);
    }
  }

  private updateXPOrbs(deltaTime: number): void {
    const player = this.gameState.player;

    for (const orb of this.gameState.xpOrbs) {
      if (!orb.active) continue;

      const oldPosition = Vec2.clone(orb.position);
      const distance = Vec2.distance(orb.position, player.position);

      // Check if within pickup radius
      if (distance <= player.pickupRadius && !orb.isBeingCollected) {
        orb.isBeingCollected = true;
      }

      // Move towards player if being collected
      if (orb.isBeingCollected) {
        const direction = Vec2.normalize(
          Vec2.subtract(player.position, orb.position)
        );
        
        const speed = GAME_CONFIG.EXPERIENCE.ORB_MAGNET_SPEED;
        orb.velocity = Vec2.multiply(direction, speed);
        orb.position.x += orb.velocity.x * deltaTime;
        orb.position.y += orb.velocity.y * deltaTime;

        // Update spatial grid
        this.xpOrbGrid.update(orb, oldPosition);
      }
    }
  }

  private cleanupInactiveEntities(): void {
    // Clean up enemies
    this.gameState.enemies = this.gameState.enemies.filter((enemy) => {
      if (!enemy.active) {
        this.enemyGrid.remove(enemy);
        this.enemyPool.release(enemy);
        return false;
      }
      return true;
    });

    // Clean up projectiles
    this.gameState.projectiles = this.gameState.projectiles.filter((projectile) => {
      if (!projectile.active) {
        this.projectileGrid.remove(projectile);
        this.projectilePool.release(projectile);
        return false;
      }
      return true;
    });

    // Clean up XP orbs
    this.gameState.xpOrbs = this.gameState.xpOrbs.filter((orb) => {
      if (!orb.active) {
        this.xpOrbGrid.remove(orb);
        this.xpOrbPool.release(orb);
        return false;
      }
      return true;
    });
  }

  private render(): void {
    this.renderer.render(this.gameState);
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public getEnemyPool(): ObjectPool<Enemy> {
    return this.enemyPool;
  }

  public getProjectilePool(): ObjectPool<Projectile> {
    return this.projectilePool;
  }

  public getXPOrbPool(): ObjectPool<XPOrb> {
    return this.xpOrbPool;
  }

  public getEnemyGrid(): SpatialGrid<Enemy> {
    return this.enemyGrid;
  }

  public getProjectileGrid(): SpatialGrid<Projectile> {
    return this.projectileGrid;
  }

  public getXPOrbGrid(): SpatialGrid<XPOrb> {
    return this.xpOrbGrid;
  }
}