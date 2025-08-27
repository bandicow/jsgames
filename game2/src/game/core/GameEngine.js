// Game Engine - Main game logic controller

import Player from '../entities/Player';
import Enemy from '../entities/Enemy';
import Item from '../entities/Item';
import Barrel from '../entities/Barrel';
import Obstacle from '../entities/Obstacle';
import WeaponFactory from '../weapons/WeaponFactory';
import { 
  GAME_CONFIG, 
  ENEMY_CONFIG, 
  BOSS_CONFIG, 
  EXP_ORBS,
  ITEM_DROP_RATES,
  STAGE_CONFIG,
  PASSIVE_TYPES,
  AUXILIARY_ITEMS
} from '../../utils/constants';
import { 
  getRandomEdgePosition, 
  randomElement,
  randomInt,
  createParticle,
  updateParticle,
  drawParticle 
} from '../../utils/helpers';

export default class GameEngine {
  constructor(canvas, i18n) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.i18n = i18n || { t: (key) => key }; // Fallback if i18n not provided
    
    // Custom settings
    this.customDuration = null;
    this.customStartStage = null;
    
    // Game state
    this.gameState = 'menu'; // menu, playing, paused, levelup, gameover, victory
    this.gameTime = 0;
    this.stageTime = 0;
    this.currentStage = 0;
    this.score = 0;
    
    // Entities
    this.player = null;
    this.enemies = [];
    this.items = [];
    this.barrels = [];
    this.obstacles = [];
    this.particles = [];
    this.damageNumbers = [];
    
    // Spawning
    this.enemySpawnTimer = 0;
    this.enemySpawnRate = ENEMY_CONFIG.SPAWN_RATE;
    this.bossSpawned = false;
    this.miniBossTimer = 0;
    
    // Effects
    this.freezeTime = 0;
    this.magnetTime = 0;
    this.screenShake = 0;
    
    // Level up
    this.levelUpChoices = [];
    this.selectedChoice = 0;
    
    // Input
    this.keys = {};
    this.mouseX = 0;
    this.mouseY = 0;
    
    // Performance
    this.lastTime = 0;
    this.deltaTime = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.fpsTimer = 0;
    
    // Initialize
    this.init();
  }

  init() {
    console.log('GameEngine init() called - resetting all timers');
    
    // FORCE complete reset of game state
    this.gameState = 'menu';
    
    // Set canvas size
    this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
    
    // Create player at center
    this.player = new Player(
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    
    // Give player starting weapon
    this.player.addWeapon(WeaponFactory.createWeapon('bullet'));
    
    // Reset arrays
    this.enemies = [];
    this.items = [];
    this.barrels = [];
    this.obstacles = [];
    this.particles = [];
    this.damageNumbers = [];
    
    // Apply custom stage if set
    if (this.customStartStage !== null) {
      this.currentStage = this.customStartStage;
      console.log(`Applied custom stage: ${this.customStartStage} (${STAGE_CONFIG.STAGES[this.customStartStage]})`);
    } else {
      this.currentStage = 0;
      console.log('Using default stage progression');
    }
    
    // Spawn initial obstacles for the stage
    this.spawnStageObstacles();
    
    // FORCE reset all timers to exactly 0
    this.gameTime = 0;
    this.stageTime = 0;
    this.enemySpawnTimer = 0;
    this.barrelSpawnTimer = 0;
    this.miniBossTimer = 0;
    this.bossSpawned = false;
    this.miniBossSpawned = false;
    this.wave = 1;
    this.lastTime = 0;
    this.deltaTime = 0;
    this.fpsTimer = 0;
    this.frameCount = 0;
    
    // Reset effects
    this.freezeTime = 0;
    this.magnetTime = 0;
    this.screenShake = 0;
    
    // Log to confirm reset
    console.log(`Timer reset complete - GameTime: ${this.gameTime}, Duration: ${this.getGameDuration()}`);
    
    // Setup input handlers
    this.setupInputHandlers();
  }

  // Map physical key codes to logical keys (language-independent WASD)
  mapPhysicalKey(code) {
    const keyMap = {
      'KeyW': 'w',
      'KeyA': 'a', 
      'KeyS': 's',
      'KeyD': 'd'
    };
    return keyMap[code];
  }

  setupInputHandlers() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      this.keys[key] = true;
      
      // Map physical keys to logical keys for WASD (language-independent)
      const mappedKey = this.mapPhysicalKey(e.code) || key;
      
      // Pass to player using mapped key for movement
      if (this.player) {
        this.player.setKey(mappedKey, true);
      }
      
      // Handle special keys
      if (key === 'escape') {
        if (this.gameState === 'playing') {
          this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
          this.gameState = 'playing';
        }
      }
      
      // Game over or victory - restart game
      if (this.gameState === 'gameover' || this.gameState === 'victory') {
        if (key === 'r' || key === 'enter' || key === ' ') {
          this.init();
          this.start();
        }
      }
      
      // Level up selection (use mapped key for WASD)
      if (this.gameState === 'levelup') {
        if (key === 'arrowup' || mappedKey === 'w') {
          this.selectedChoice = Math.max(0, this.selectedChoice - 1);
        } else if (key === 'arrowdown' || mappedKey === 's') {
          this.selectedChoice = Math.min(this.levelUpChoices.length - 1, this.selectedChoice + 1);
        } else if (mappedKey === 'a') {
          // Move selection left - fixed direction
          this.selectedChoice = (this.selectedChoice - 1 + this.levelUpChoices.length) % this.levelUpChoices.length;
        } else if (mappedKey === 'd') {
          // Move selection right
          this.selectedChoice = (this.selectedChoice + 1) % this.levelUpChoices.length;
        } else if (key === 'enter' || key === ' ') {
          this.selectLevelUpChoice();
        }
      }
    });
    
    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      this.keys[key] = false;
      
      // Map physical keys to logical keys for WASD (language-independent)
      const mappedKey = this.mapPhysicalKey(e.code) || key;
      
      // Pass to player using mapped key for movement
      if (this.player) {
        this.player.setKey(mappedKey, false);
      }
    });
    
    // Mouse events
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });
    
    this.canvas.addEventListener('click', (e) => {
      if (this.gameState === 'levelup') {
        // Check which card was clicked
        const cardWidth = 200;
        const cardHeight = 250;
        const cardSpacing = 20;
        const totalWidth = this.levelUpChoices.length * cardWidth + (this.levelUpChoices.length - 1) * cardSpacing;
        const startX = (this.canvas.width - totalWidth) / 2;
        const cardY = this.canvas.height / 2 - cardHeight / 2;
        
        for (let i = 0; i < this.levelUpChoices.length; i++) {
          const cardX = startX + i * (cardWidth + cardSpacing);
          if (this.mouseX >= cardX && this.mouseX <= cardX + cardWidth &&
              this.mouseY >= cardY && this.mouseY <= cardY + cardHeight) {
            this.selectedChoice = i;
            this.selectLevelUpChoice();
            break;
          }
        }
      }
    });
  }

  start() {
    this.gameState = 'playing';
    this.lastTime = performance.now();
    this.gameLoop();
  }
  
  setGameSettings(settings) {
    if (settings.gameDuration !== undefined) {
      this.customDuration = settings.gameDuration;
    }
    if (settings.startStage !== undefined) {
      this.customStartStage = settings.startStage;
    }
  }
  
  getGameDuration() {
    return this.customDuration || GAME_CONFIG.GAME_DURATION;
  }

  gameLoop(currentTime = 0) {
    // Calculate delta time
    this.deltaTime = Math.min(currentTime - this.lastTime, 100); // Cap at 100ms
    this.lastTime = currentTime;
    
    // Update FPS
    this.frameCount++;
    this.fpsTimer += this.deltaTime;
    if (this.fpsTimer >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = 0;
    }
    
    // Update and render based on game state
    if (this.gameState === 'playing') {
      this.update(this.deltaTime);
    }
    
    this.render();
    
    // Continue loop
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  update(deltaTime) {
    // Update game time
    this.gameTime += deltaTime / 1000;
    this.stageTime += deltaTime / 1000;
    
    // Check for victory
    const gameDuration = this.getGameDuration();
    if (this.gameTime >= gameDuration) {
      this.gameState = 'victory';
      return;
    }
    
    // Check stage progression
    this.updateStage();
    
    // Update effects
    if (this.freezeTime > 0) {
      this.freezeTime -= deltaTime;
    }
    if (this.magnetTime > 0) {
      this.magnetTime -= deltaTime;
    }
    if (this.screenShake > 0) {
      this.screenShake -= deltaTime;
    }
    
    // Update player
    if (this.player && !this.player.isDead) {
      this.player.update(deltaTime);
      this.player.keepInBounds(0, 0, this.canvas.width, this.canvas.height);
      
      // Check collision with obstacles and resolve
      this.resolvePlayerObstacleCollisions();
      
      // Update weapons
      for (const weapon of this.player.weapons) {
        weapon.update(deltaTime, this.player, this.enemies, this);
        
        // Check if weapon projectiles hit chests
        for (const projectile of weapon.projectiles || []) {
          // Check barrels first
          for (let i = this.barrels.length - 1; i >= 0; i--) {
            const barrel = this.barrels[i];
            if (!barrel.isDestroyed && barrel.checkCollision(projectile)) {
              const droppedItem = barrel.takeDamage(1);
              if (droppedItem) {
                // Spawn auxiliary item
                const item = new Item(barrel.x, barrel.y, droppedItem);
                this.items.push(item);
              }
              break;
            }
          }
          
          // Check chests
          for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            if (item.type === 'chest' && !item.isOpen && item.checkWeaponCollision(projectile)) {
              item.openChest();
              // Chest now contains upgrade card, show level-up screen
              this.gameState = 'levelup';
              this.levelUpChoices = [];
              this.selectedChoice = 0;
              
              // Generate 3 random choices for chest reward
              const availableChoices = [];
              const weaponTypes = ['bullet', 'sword', 'lightning', 'spear', 'blade', 'laser',
                                  'shotgun', 'missile', 'ice', 'shockwave', 'boomerang', 'poison'];
              weaponTypes.forEach(type => {
                availableChoices.push({ type: 'weapon', value: type });
              });
              
              Object.values(PASSIVE_TYPES).forEach(passive => {
                availableChoices.push({ type: 'passive', value: passive });
              });
              
              const shuffled = [...availableChoices].sort(() => Math.random() - 0.5);
              for (let j = 0; j < Math.min(3, shuffled.length); j++) {
                this.levelUpChoices.push(shuffled[j]);
              }
              
              this.items.splice(i, 1);
              break;
            }
          }
        }
        
        // Check for sword/melee weapons hitting barrels and chests
        if (weapon.currentSlashes) {
          for (const slash of weapon.currentSlashes) {
            // Check barrels
            for (let i = this.barrels.length - 1; i >= 0; i--) {
              const barrel = this.barrels[i];
              if (!barrel.isDestroyed && barrel.isInSlashRange(slash)) {
                const droppedItem = barrel.takeDamage(1);
                if (droppedItem) {
                  // Spawn auxiliary item
                  const item = new Item(barrel.x, barrel.y, droppedItem);
                  this.items.push(item);
                }
                break;
              }
            }
            
            // Check chests
            for (let i = this.items.length - 1; i >= 0; i--) {
              const item = this.items[i];
              if (item.type === 'chest' && !item.isOpen) {
                // Check if chest is within slash range
                const dx = item.x - slash.x;
                const dy = item.y - slash.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= slash.range + item.radius) {
                  const angleToChest = Math.atan2(dy, dx);
                  let angleDiff = Math.abs(angleToChest - slash.angle);
                  if (angleDiff > Math.PI) {
                    angleDiff = 2 * Math.PI - angleDiff;
                  }
                  
                  if (angleDiff <= slash.width / 2) {
                    item.openChest();
                    // Chest now contains upgrade card, show level-up screen
                    this.gameState = 'levelup';
                    this.levelUpChoices = [];
                    this.selectedChoice = 0;
                    
                    // Generate 3 random choices for chest reward
                    const availableChoices = [];
                    const weaponTypes = ['bullet', 'sword', 'lightning', 'spear', 'blade', 'laser',
                                        'shotgun', 'missile', 'ice', 'shockwave', 'boomerang', 'poison'];
                    weaponTypes.forEach(type => {
                      availableChoices.push({ type: 'weapon', value: type });
                    });
                    
                    Object.values(PASSIVE_TYPES).forEach(passive => {
                      availableChoices.push({ type: 'passive', value: passive });
                    });
                    
                    const shuffled = [...availableChoices].sort(() => Math.random() - 0.5);
                    for (let j = 0; j < Math.min(3, shuffled.length); j++) {
                      this.levelUpChoices.push(shuffled[j]);
                    }
                    
                    this.items.splice(i, 1);
                    break;
                  }
                }
              }
            }
          }
        }
      }
      
      // Check if player leveled up
      if (this.player.levelUpPending) {
        this.showLevelUpScreen();
        this.player.clearLevelUpPending();
      }
    } else if (this.player && this.player.isDead) {
      this.gameState = 'gameover';
    }
    
    // Spawn enemies
    if (this.freezeTime <= 0) {
      this.spawnEnemies(deltaTime);
    }
    
    // Spawn barrels
    this.spawnBarrels(deltaTime);
    
    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      if (this.freezeTime <= 0 || enemy.isBoss) {
        enemy.update(deltaTime, this.player, this);
      }
      
      // Remove dead enemies
      if (enemy.isDead) {
        this.onEnemyDeath(enemy);
        this.enemies.splice(i, 1);
        continue;
      }
      
      // Check collision with player
      if (this.player && !this.player.isDead && enemy.collidesWith(this.player)) {
        if (this.player.takeDamage(enemy.damage)) {
          this.screenShake = 300;
        }
      }
      
      // Update boss projectiles
      if ((enemy.isBoss || enemy.isMiniBoss) && enemy.projectiles) {
        for (let j = enemy.projectiles.length - 1; j >= 0; j--) {
          const proj = enemy.projectiles[j];
          proj.x += proj.vx;
          proj.y += proj.vy;
          
          // Check collision with player
          if (this.player && !this.player.isDead) {
            const dx = this.player.x - proj.x;
            const dy = this.player.y - proj.y;
            if (Math.sqrt(dx*dx + dy*dy) < this.player.radius + proj.radius) {
              this.player.takeDamage(proj.damage);
              enemy.projectiles.splice(j, 1);
              continue;
            }
          }
          
          // Remove if out of bounds
          if (proj.x < -50 || proj.x > this.canvas.width + 50 ||
              proj.y < -50 || proj.y > this.canvas.height + 50) {
            enemy.projectiles.splice(j, 1);
          }
        }
      }
    }
    
    // Resolve entity collisions
    this.resolveEnemyCollisions();
    
    // Update items
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.update(deltaTime, this.player, this.magnetTime > 0);
      
      if (item.collected) {
        // Handle special item effects
        if (item.type === 'magnet') {
          this.magnetTime = 2000;
        } else if (item.type === 'freeze') {
          this.freezeTime = 5000;
        }
        
        this.items.splice(i, 1);
      }
    }
    
    // Update barrels
    for (let i = this.barrels.length - 1; i >= 0; i--) {
      const barrel = this.barrels[i];
      barrel.update(deltaTime);
      
      if (barrel.isDestroyed) {
        this.barrels.splice(i, 1);
      }
    }
    
    // Update obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.update(deltaTime);
      
      // Handle lava damage to player
      if (obstacle.type === 'lava' && !obstacle.isDestroyed && this.player && !this.player.isDead) {
        if (obstacle.checkCollision(this.player)) {
          // Damage player when in lava (once per second)
          if (!this.player.lavaTimer || this.player.lavaTimer <= 0) {
            this.player.takeDamage(obstacle.damagePerSecond || 10);
            this.player.lavaTimer = 1000; // 1 second cooldown
          }
        }
      }
      
      if (obstacle.isDestroyed) {
        this.obstacles.splice(i, 1);
      }
    }
    
    // Update player lava timer
    if (this.player && this.player.lavaTimer > 0) {
      this.player.lavaTimer -= deltaTime;
    }
    
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (!updateParticle(this.particles[i])) {
        this.particles.splice(i, 1);
      }
    }
    
    // Update damage numbers
    this.updateDamageNumbers(deltaTime);
  }

  updateStage() {
    // Only auto-progress stages if no custom stage is set
    if (this.customStartStage === null) {
      // Calculate current stage based on time
      const newStage = Math.min(
        Math.floor(this.stageTime / STAGE_CONFIG.STAGE_DURATION),
        STAGE_CONFIG.STAGES.length - 1
      );
      
      if (newStage !== this.currentStage) {
        this.currentStage = newStage;
        this.stageTime = 0;
        
        // Increase difficulty
        this.enemySpawnRate *= 0.8; // Spawn faster
        
        // Clear old obstacles and spawn new ones for the stage
        this.obstacles = [];
        this.spawnStageObstacles();
      }
    } else {
      // Custom stage selected - keep it fixed (no logging to avoid spam)
    }
    
    // Spawn mini-boss at 5 minutes
    if (this.gameTime >= 300 && !this.miniBossSpawned && this.gameTime < 305) {
      this.spawnMiniBoss();
      this.miniBossSpawned = true;
    }
    
    // Spawn boss 1 minute before game ends
    const gameDuration = this.getGameDuration();
    const bossSpawnTime = Math.max(30, gameDuration - 60); // Boss spawns 1 min before end, but not before 30s
    
    // Debug: Log boss spawn conditions for troubleshooting
    if (this.gameTime > 25 && this.gameTime < 35 && !this.bossSpawned) {
      console.log(`Boss Debug - GameTime: ${this.gameTime}, Duration: ${gameDuration}, BossSpawnTime: ${bossSpawnTime}, BossSpawned: ${this.bossSpawned}`);
    }
    
    if (!this.bossSpawned && this.gameTime >= bossSpawnTime) {
      console.log(`Spawning boss at ${this.gameTime} seconds (spawn time: ${bossSpawnTime})`);
      this.spawnBoss();
      this.bossSpawned = true;
    }
  }

  spawnEnemies(deltaTime) {
    this.enemySpawnTimer += deltaTime;
    
    // Progressive spawn rate based on game time
    let currentSpawnRate = this.enemySpawnRate;
    if (this.gameTime < 10) {
      currentSpawnRate = this.enemySpawnRate * 0.8; // Faster initial spawning for immediate action
    } else if (this.gameTime < 30) {
      currentSpawnRate = this.enemySpawnRate; // Normal rate early on
    } else if (this.gameTime < 60) {
      currentSpawnRate = this.enemySpawnRate * 1.2; // Slightly slower
    } else if (this.gameTime < 120) {
      currentSpawnRate = this.enemySpawnRate; // Normal rate
    } else {
      currentSpawnRate = this.enemySpawnRate * Math.max(0.5, 1 - this.gameTime / 1200); // Speed up over time
    }
    
    // Progressive max enemies
    let maxEnemies = 10; // Start with only 10 enemies max
    if (this.gameTime > 30) maxEnemies = 20;
    if (this.gameTime > 60) maxEnemies = 30;
    if (this.gameTime > 120) maxEnemies = 50;
    if (this.gameTime > 180) maxEnemies = 70;
    if (this.gameTime > 240) maxEnemies = ENEMY_CONFIG.MAX_ENEMIES;
    
    if (this.enemySpawnTimer >= currentSpawnRate && 
        this.enemies.length < maxEnemies) {
      this.enemySpawnTimer = 0;
      this.wave = Math.floor(this.gameTime / 30) + 1; // Update wave counter
      
      // Spawn 1-3 enemies at once later in game
      let spawnCount = 1;
      if (this.gameTime > 120) spawnCount = Math.min(2, Math.floor(Math.random() * 2) + 1);
      if (this.gameTime > 240) spawnCount = Math.min(3, Math.floor(Math.random() * 3) + 1);
      
      for (let i = 0; i < spawnCount && this.enemies.length < maxEnemies; i++) {
        // Get spawn position avoiding obstacles
        const pos = this.getSafeSpawnPosition();
        if (!pos) continue; // Skip if no safe position found
        
        // Progressive enemy types based on game time
        let type = 'BASIC';
        if (this.gameTime < 30) {
          // First 30 seconds - only basic enemies
          type = 'BASIC';
        } else if (this.gameTime < 60) {
          // 30-60 seconds - basic and fast
          type = Math.random() < 0.7 ? 'BASIC' : 'FAST';
        } else if (this.gameTime < 120) {
          // 60-120 seconds - add tank and swarm
          const types = ['BASIC', 'FAST', 'TANK', 'SWARM'];
          type = randomElement(types);
        } else {
          // After 2 minutes - all enemy types based on stage
          const enemyTypes = Object.keys(ENEMY_CONFIG.TYPES);
          const availableTypes = enemyTypes.slice(0, Math.min(3 + this.currentStage * 2, enemyTypes.length));
          type = randomElement(availableTypes);
        }
        
        // Create enemy
        const enemy = new Enemy(pos.x, pos.y, type);
        
        // Scale difficulty with time (more gradual)
        const difficultyMultiplier = 1 + this.gameTime / 600; // +100% at 10 minutes
        enemy.maxHp *= difficultyMultiplier;
        enemy.hp = enemy.maxHp;
        enemy.damage *= Math.sqrt(difficultyMultiplier);
        enemy.speed *= Math.min(1.5, 1 + this.gameTime / 900);
        
        this.enemies.push(enemy);
      }
    }
  }

  spawnStageObstacles() {
    const stageName = STAGE_CONFIG.STAGES[this.currentStage] || 'FOREST';
    const obstacleCount = 5 + Math.floor(Math.random() * 5); // 5-10 obstacles per stage
    
    for (let i = 0; i < obstacleCount; i++) {
      // Random position, avoiding center where player spawns
      let x, y;
      do {
        x = 100 + Math.random() * (this.canvas.width - 200);
        y = 100 + Math.random() * (this.canvas.height - 200);
      } while (Math.abs(x - this.canvas.width/2) < 100 && Math.abs(y - this.canvas.height/2) < 100);
      
      const obstacle = new Obstacle(x, y, null, stageName);
      this.obstacles.push(obstacle);
    }
  }

  getSafeSpawnPosition() {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const pos = getRandomEdgePosition(this.canvas.width, this.canvas.height);
      let isSafe = true;
      
      // Check collision with obstacles
      for (const obstacle of this.obstacles) {
        if (!obstacle.isDestroyed) {
          const dx = pos.x - obstacle.x;
          const dy = pos.y - obstacle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = obstacle.radius + 30; // Add buffer space
          
          if (distance < minDistance) {
            isSafe = false;
            break;
          }
        }
      }
      
      // Check collision with barrels
      if (isSafe) {
        for (const barrel of this.barrels) {
          if (!barrel.isDestroyed) {
            const dx = pos.x - barrel.x;
            const dy = pos.y - barrel.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = barrel.radius + 25; // Add buffer space
            
            if (distance < minDistance) {
              isSafe = false;
              break;
            }
          }
        }
      }
      
      if (isSafe) {
        return pos;
      }
      
      attempts++;
    }
    
    // Fallback: return edge position even if not completely safe
    return getRandomEdgePosition(this.canvas.width, this.canvas.height);
  }

  spawnBarrels(deltaTime) {
    this.barrelSpawnTimer += deltaTime;
    
    // Spawn barrels every 5-10 seconds
    const spawnInterval = 5000 + Math.random() * 5000;
    
    if (this.barrelSpawnTimer >= spawnInterval && this.barrels.length < 5) {
      this.barrelSpawnTimer = 0;
      
      // Random position on map (not too close to edges)
      const x = 100 + Math.random() * (this.canvas.width - 200);
      const y = 100 + Math.random() * (this.canvas.height - 200);
      
      const stageName = STAGE_CONFIG.STAGES[this.currentStage] || 'FOREST';
      const barrel = new Barrel(x, y, stageName);
      this.barrels.push(barrel);
    }
  }

  spawnMiniBoss() {
    const pos = getRandomEdgePosition(this.canvas.width, this.canvas.height);
    const miniBoss = new Enemy(pos.x, pos.y, 'MINI_BOSS', false, true);
    this.enemies.push(miniBoss);
    this.screenShake = 500;
  }

  spawnBoss() {
    const stageName = STAGE_CONFIG.STAGES[this.currentStage];
    const pos = getRandomEdgePosition(this.canvas.width, this.canvas.height);
    const boss = new Enemy(pos.x, pos.y, stageName, true, false);
    this.enemies.push(boss);
    this.screenShake = 1000;
  }

  onEnemyDeath(enemy) {
    // Add score
    this.player.score += enemy.expValue * 2;
    
    // Drop experience orbs - progressive value based on game time
    const orbCount = enemy.isBoss ? 10 : enemy.isMiniBoss ? 5 : randomInt(1, 3);
    for (let i = 0; i < orbCount; i++) {
      let orbType;
      
      if (enemy.isBoss) {
        orbType = EXP_ORBS.TYPES[randomInt(3, 6)];
      } else if (enemy.isMiniBoss) {
        orbType = EXP_ORBS.TYPES[randomInt(2, 5)];
      } else {
        // Progressive exp values for normal enemies
        if (this.gameTime < 60) {
          // First minute - only 10 exp orbs
          orbType = EXP_ORBS.TYPES[1]; // 10 exp
        } else if (this.gameTime < 120) {
          // 1-2 minutes - 10 or 15 exp
          orbType = EXP_ORBS.TYPES[randomInt(1, 2)];
        } else if (this.gameTime < 240) {
          // 2-4 minutes - 10, 15, or 20 exp
          orbType = EXP_ORBS.TYPES[randomInt(1, 3)];
        } else {
          // After 4 minutes - normal range
          orbType = randomElement(EXP_ORBS.TYPES.slice(0, 4));
        }
      }
      
      const item = new Item(
        enemy.x + randomInt(-20, 20),
        enemy.y + randomInt(-20, 20),
        'exp',
        orbType.value
      );
      this.items.push(item);
    }
    
    // Drop chest with chance
    const dropChance = enemy.isBoss ? 1.0 : enemy.isMiniBoss ? 1.0 : ITEM_DROP_RATES.NORMAL_ENEMY;
    if (Math.random() < dropChance) {
      const chest = new Item(enemy.x, enemy.y, 'chest');
      chest.contents = enemy.isBoss ? this.getHighValueItem() : this.getRandomItem();
      this.items.push(chest);
    }
    
    // Create death particles
    for (let i = 0; i < 10; i++) {
      this.particles.push(createParticle(enemy.x, enemy.y, enemy.color));
    }
    
    // Screen shake for bosses
    if (enemy.isBoss || enemy.isMiniBoss) {
      this.screenShake = enemy.isBoss ? 500 : 300;
    }
  }

  getRandomItem() {
    // Random between weapon, passive, or auxiliary item
    const roll = Math.random();
    if (roll < 0.4) {
      return { type: 'weapon', value: WeaponFactory.getRandomWeaponType() };
    } else if (roll < 0.7) {
      return { type: 'passive', value: randomElement(Object.values(PASSIVE_TYPES)) };
    } else {
      return { type: 'auxiliary', value: randomElement(Object.values(AUXILIARY_ITEMS)) };
    }
  }

  getHighValueItem() {
    // Boss drops are always good
    const roll = Math.random();
    if (roll < 0.6) {
      return { type: 'weapon', value: WeaponFactory.getRandomWeaponType() };
    } else {
      return { type: 'passive', value: randomElement(Object.values(PASSIVE_TYPES)) };
    }
  }

  showLevelUpScreen() {
    this.gameState = 'levelup';
    this.levelUpChoices = [];
    this.selectedChoice = 0;
    
    // Generate 3 unique random choices
    const availableChoices = [];
    
    // Add available weapons
    const weaponTypes = ['bullet', 'sword', 'lightning', 'spear', 'blade', 'laser',
                         'shotgun', 'missile', 'ice', 'shockwave', 'boomerang', 'poison'];
    weaponTypes.forEach(type => {
      availableChoices.push({ type: 'weapon', value: type });
    });
    
    // Add passive types
    Object.values(PASSIVE_TYPES).forEach(passive => {
      availableChoices.push({ type: 'passive', value: passive });
    });
    
    // Don't include auxiliary items in level-up choices anymore
    // They come from barrels now
    
    // Shuffle and pick 3
    const shuffled = [...availableChoices].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(3, shuffled.length); i++) {
      this.levelUpChoices.push(shuffled[i]);
    }
  }

  selectLevelUpChoice() {
    const choice = this.levelUpChoices[this.selectedChoice];
    
    if (choice.type === 'weapon') {
      const weapon = WeaponFactory.createWeapon(choice.value);
      this.player.addWeapon(weapon);
    } else if (choice.type === 'passive') {
      this.player.addPassive({ type: choice.value });
    } else if (choice.type === 'auxiliary') {
      // Create item immediately
      const item = new Item(this.player.x, this.player.y, choice.value);
      this.items.push(item);
    }
    
    this.gameState = 'playing';
    this.levelUpChoices = [];
  }

  magnetizeAllItems() {
    // Pull all experience orbs to player
    for (const item of this.items) {
      if (item.type === 'exp') {
        item.isBeingMagnetized = true;
      }
    }
  }

  resolvePlayerObstacleCollisions() {
    for (const obstacle of this.obstacles) {
      if (!obstacle.isDestroyed && obstacle.checkCollision(this.player)) {
        // Calculate separation vector
        const dx = this.player.x - obstacle.x;
        const dy = this.player.y - obstacle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const overlap = (this.player.radius + obstacle.radius) - distance;
        
        if (overlap > 0) {
          // Push player away from obstacle
          const separationX = (dx / distance) * overlap;
          const separationY = (dy / distance) * overlap;
          
          this.player.x += separationX;
          this.player.y += separationY;
        }
      }
    }
  }

  resolveEnemyCollisions() {
    // Enemy-obstacle collisions
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;
      
      for (const obstacle of this.obstacles) {
        if (!obstacle.isDestroyed && obstacle.checkCollision(enemy)) {
          const dx = enemy.x - obstacle.x;
          const dy = enemy.y - obstacle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const overlap = (enemy.radius + obstacle.radius) - distance;
          
          if (overlap > 0) {
            const separationX = (dx / distance) * overlap;
            const separationY = (dy / distance) * overlap;
            
            enemy.x += separationX;
            enemy.y += separationY;
          }
        }
      }
      
      // Enemy-player collision (player pushes enemies)
      if (this.player && !this.player.isDead) {
        const dx = enemy.x - this.player.x;
        const dy = enemy.y - this.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const overlap = (enemy.radius + this.player.radius) - distance;
        
        if (overlap > 0) {
          const separationX = (dx / distance) * overlap;
          const separationY = (dy / distance) * overlap;
          
          // Push enemy away from player
          enemy.x += separationX;
          enemy.y += separationY;
        }
      }
    }
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Apply screen shake
    if (this.screenShake > 0) {
      const shakeAmount = this.screenShake / 100;
      this.ctx.save();
      this.ctx.translate(
        (Math.random() - 0.5) * shakeAmount,
        (Math.random() - 0.5) * shakeAmount
      );
    }
    
    // Draw stage background
    this.drawBackground();
    
    // Draw obstacles
    for (const obstacle of this.obstacles) {
      obstacle.draw(this.ctx);
    }
    
    // Draw barrels
    for (const barrel of this.barrels) {
      barrel.draw(this.ctx);
    }
    
    // Draw items
    for (const item of this.items) {
      item.draw(this.ctx);
    }
    
    // Draw enemies
    for (const enemy of this.enemies) {
      enemy.draw(this.ctx);
      
      // Draw boss projectiles
      if (enemy.projectiles) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.8;
        for (const proj of enemy.projectiles) {
          this.ctx.fillStyle = proj.color;
          this.ctx.beginPath();
          this.ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
          this.ctx.fill();
        }
        this.ctx.restore();
      }
    }
    
    // Draw player and weapons
    if (this.player) {
      this.player.draw(this.ctx);
      for (const weapon of this.player.weapons) {
        weapon.draw(this.ctx);
      }
    }
    
    // Draw particles
    for (const particle of this.particles) {
      drawParticle(this.ctx, particle);
    }
    
    // Reset screen shake
    if (this.screenShake > 0) {
      this.ctx.restore();
    }
    
    // Draw UI based on game state
    if (this.gameState === 'playing' || this.gameState === 'paused') {
      this.drawHUD();
    } else if (this.gameState === 'levelup') {
      this.drawLevelUpScreen();
    } else if (this.gameState === 'gameover') {
      this.drawGameOverScreen();
    } else if (this.gameState === 'victory') {
      this.drawVictoryScreen();
    }
    
    // Draw effects
    if (this.freezeTime > 0) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(150, 200, 255, 0.2)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }
    
    // Draw pause overlay
    if (this.gameState === 'paused') {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(this.i18n.t('game.paused'), this.canvas.width / 2, this.canvas.height / 2);
      
      this.ctx.font = '24px Arial';
      this.ctx.fillText(this.i18n.t('game.pressEscToResume'), this.canvas.width / 2, this.canvas.height / 2 + 60);
      this.ctx.restore();
    }
  }

  drawBackground() {
    const stageColors = STAGE_CONFIG.COLORS[STAGE_CONFIG.STAGES[this.currentStage]];
    if (stageColors) {
      // Draw gradient background
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      gradient.addColorStop(0, stageColors.bg);
      gradient.addColorStop(1, stageColors.ground);
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  drawHUD() {
    // HUD background
    this.ctx.save();
    
    // HP Bar
    const hpBarWidth = 200;
    const hpBarHeight = 20;
    const hpBarX = 20;
    const hpBarY = 20;
    
    // HP Bar background
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
    
    // HP Bar fill
    const hpPercent = this.player.hp / this.player.maxHp;
    this.ctx.fillStyle = hpPercent > 0.5 ? '#00FF00' : hpPercent > 0.25 ? '#FFFF00' : '#FF0000';
    this.ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, hpBarHeight);
    
    // HP Bar border
    this.ctx.strokeStyle = '#FFF';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
    
    // HP Text
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(`${Math.ceil(this.player.hp)} / ${this.player.maxHp}`, hpBarX + hpBarWidth / 2, hpBarY + hpBarHeight / 2);
    
    // EXP Bar
    const expBarY = hpBarY + hpBarHeight + 10;
    
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(hpBarX, expBarY, hpBarWidth, hpBarHeight);
    
    const expPercent = this.player.exp / this.player.expToNext;
    this.ctx.fillStyle = '#00FFFF';
    this.ctx.fillRect(hpBarX, expBarY, hpBarWidth * expPercent, hpBarHeight);
    
    this.ctx.strokeStyle = '#FFF';
    this.ctx.strokeRect(hpBarX, expBarY, hpBarWidth, hpBarHeight);
    
    this.ctx.fillStyle = '#FFF';
    this.ctx.fillText(`${this.i18n.t('game.level')} ${this.player.level}`, hpBarX + hpBarWidth / 2, expBarY + hpBarHeight / 2);
    
    // Score and Time
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`${this.i18n.t('game.score')}: ${this.player.score}`, this.canvas.width - 20, 30);
    
    const gameDuration = this.getGameDuration();
    const timeRemaining = Math.max(0, gameDuration - this.gameTime);
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = Math.floor(timeRemaining % 60);
    this.ctx.fillText(`${this.i18n.t('game.time')}: ${minutes}:${seconds.toString().padStart(2, '0')}`, this.canvas.width - 20, 60);
    
    // Stage
    const currentStageName = STAGE_CONFIG.STAGES[this.currentStage];
    if (currentStageName) {
      const stageName = this.i18n.t(`game.stage.${currentStageName.toLowerCase()}`);
      this.ctx.fillText(`${stageName}`, this.canvas.width - 20, 90);
    }
    
    // Boss HP Bar
    const boss = this.enemies.find(e => e.isBoss);
    if (boss) {
      const bossBarWidth = 400;
      const bossBarHeight = 30;
      const bossBarX = (this.canvas.width - bossBarWidth) / 2;
      const bossBarY = 50;
      
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(bossBarX - 5, bossBarY - 5, bossBarWidth + 10, bossBarHeight + 10);
      
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(bossBarX, bossBarY, bossBarWidth, bossBarHeight);
      
      const bossHpPercent = boss.hp / boss.maxHp;
      this.ctx.fillStyle = '#FF0000';
      this.ctx.fillRect(bossBarX, bossBarY, bossBarWidth * bossHpPercent, bossBarHeight);
      
      this.ctx.strokeStyle = '#FFF';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(bossBarX, bossBarY, bossBarWidth, bossBarHeight);
      
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = 'bold 20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.i18n.t('game.boss'), this.canvas.width / 2, bossBarY - 10);
    }
    
    // Item Display - Passive Items
    this.drawItemInventory();
    
    // FPS
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`FPS: ${this.fps}`, 10, this.canvas.height - 10);
    
    this.ctx.restore();
  }

  drawItemInventory() {
    if (!this.player) return;
    
    this.ctx.save();
    
    // Position for item display (left side below exp bar)
    const startX = 20;
    const startY = 90;
    const itemSize = 24;
    const itemSpacing = 28;
    const maxItemsPerRow = 8;
    
    // Background for inventory
    const inventoryWidth = maxItemsPerRow * itemSpacing;
    const inventoryHeight = 80;
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(startX - 5, startY - 5, inventoryWidth + 10, inventoryHeight);
    
    // Title
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Items:', startX, startY - 8);
    
    let itemIndex = 0;
    
    // Draw passive items
    for (const passive of this.player.passives) {
      const row = Math.floor(itemIndex / maxItemsPerRow);
      const col = itemIndex % maxItemsPerRow;
      const x = startX + col * itemSpacing;
      const y = startY + 10 + row * itemSpacing;
      
      // Draw passive item icon
      this.ctx.fillStyle = '#4169E1';  // RoyalBlue for passives
      this.ctx.fillRect(x, y, itemSize, itemSize);
      
      // Draw border
      this.ctx.strokeStyle = '#FFF';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, y, itemSize, itemSize);
      
      // Draw passive icon/symbol
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      // Simple passive type indicators
      let symbol = '';
      switch(passive.type) {
        case 'maxHp': symbol = '♥'; break;
        case 'hpRegen': symbol = '⚕'; break;
        case 'speed': symbol = '⚡'; break;
        case 'damage': symbol = '⚔'; break;
        case 'cooldown': symbol = '⏰'; break;
        case 'expGain': symbol = '⭐'; break;
        case 'pickupRange': symbol = '⭕'; break;
        case 'weaponSize': symbol = '🔸'; break;
        case 'damageReduction': symbol = '🛡'; break;
        case 'weaponCount': symbol = '+'; break;
        default: symbol = '?'; break;
      }
      
      this.ctx.fillText(symbol, x + itemSize/2, y + itemSize/2);
      itemIndex++;
    }
    
    // Draw active weapons
    for (const weapon of this.player.weapons) {
      const row = Math.floor(itemIndex / maxItemsPerRow);
      const col = itemIndex % maxItemsPerRow;
      const x = startX + col * itemSpacing;
      const y = startY + 10 + row * itemSpacing;
      
      // Draw weapon icon
      this.ctx.fillStyle = '#FF6347';  // Tomato red for weapons
      this.ctx.fillRect(x, y, itemSize, itemSize);
      
      // Draw border
      this.ctx.strokeStyle = '#FFF';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, y, itemSize, itemSize);
      
      // Draw weapon level indicator
      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = '8px Arial';
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(weapon.level.toString(), x + itemSize - 2, y + 2);
      
      // Draw weapon symbol
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      
      let weaponSymbol = '';
      switch(weapon.type) {
        case 'bullet': weaponSymbol = '●'; break;
        case 'sword': weaponSymbol = '⚔'; break;
        case 'lightning': weaponSymbol = '⚡'; break;
        case 'spear': weaponSymbol = '▶'; break;
        case 'blade': weaponSymbol = '⭘'; break;
        case 'laser': weaponSymbol = '━'; break;
        case 'shotgun': weaponSymbol = '◊'; break;
        case 'missile': weaponSymbol = '🚀'; break;
        case 'ice': weaponSymbol = '❄'; break;
        case 'shockwave': weaponSymbol = '○'; break;
        case 'boomerang': weaponSymbol = '⟲'; break;
        case 'poison': weaponSymbol = '☠'; break;
        default: weaponSymbol = '?'; break;
      }
      
      this.ctx.fillText(weaponSymbol, x + itemSize/2, y + itemSize/2 + 2);
      itemIndex++;
    }
    
    this.ctx.restore();
  }

  drawLevelUpScreen() {
    // Darken background
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Title
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.i18n.t('game.levelUp'), this.canvas.width / 2, 100);
    
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(this.i18n.t('game.chooseUpgrade'), this.canvas.width / 2, 150);
    
    // Draw choice cards
    const cardWidth = 200;
    const cardHeight = 250;
    const cardSpacing = 20;
    const totalWidth = this.levelUpChoices.length * cardWidth + (this.levelUpChoices.length - 1) * cardSpacing;
    const startX = (this.canvas.width - totalWidth) / 2;
    const cardY = this.canvas.height / 2 - cardHeight / 2;
    
    for (let i = 0; i < this.levelUpChoices.length; i++) {
      const choice = this.levelUpChoices[i];
      const cardX = startX + i * (cardWidth + cardSpacing);
      const isSelected = i === this.selectedChoice;
      
      // Card background
      this.ctx.fillStyle = isSelected ? '#444' : '#222';
      this.ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
      
      // Card border
      this.ctx.strokeStyle = isSelected ? '#FFD700' : '#666';
      this.ctx.lineWidth = isSelected ? 4 : 2;
      this.ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
      
      // Card content
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = 'bold 18px Arial';
      this.ctx.textAlign = 'center';
      
      let title = '';
      let description = '';
      
      if (choice.type === 'weapon') {
        title = this.i18n.t(`weapons.${choice.value}`);
        description = this.i18n.t(`descriptions.${choice.value}`);
        
        // Check if player already has this weapon
        const existing = this.player.weapons.find(w => w.type === choice.value);
        if (existing) {
          title += ` (Lv ${existing.level + 1})`;
        }
      } else if (choice.type === 'passive') {
        title = this.i18n.t(`passives.${choice.value}`);
        description = this.i18n.t('game.passive');
      } else {
        title = this.i18n.t(`items.${choice.value}`);
        description = this.i18n.t('game.instant');
      }
      
      this.ctx.fillText(title, cardX + cardWidth / 2, cardY + 40);
      
      this.ctx.font = '14px Arial';
      this.ctx.fillStyle = '#AAA';
      
      // Word wrap description
      const words = description.split(' ');
      let line = '';
      let y = cardY + 80;
      for (const word of words) {
        const testLine = line + word + ' ';
        const metrics = this.ctx.measureText(testLine);
        if (metrics.width > cardWidth - 20 && line.length > 0) {
          this.ctx.fillText(line, cardX + cardWidth / 2, y);
          line = word + ' ';
          y += 20;
        } else {
          line = testLine;
        }
      }
      this.ctx.fillText(line, cardX + cardWidth / 2, y);
      
      // Icon/Visual representation
      this.ctx.save();
      this.ctx.translate(cardX + cardWidth / 2, cardY + 150);
      
      if (choice.type === 'weapon') {
        // Draw weapon icon
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 30, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (choice.type === 'passive') {
        // Draw passive icon
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(-25, -25, 50, 50);
      } else {
        // Draw item icon
        this.ctx.fillStyle = '#FF00FF';
        this.drawStar(0, 0, 15, 30, 6);
      }
      
      this.ctx.restore();
      
      // Selection hint
      if (isSelected) {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(this.i18n.t('game.pressEnterToSelect'), cardX + cardWidth / 2, cardY + cardHeight - 20);
      }
    }
    
    this.ctx.restore();
  }

  drawGameOverScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(139, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = 'bold 72px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(this.i18n.t('game.gameOver'), this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.font = '36px Arial';
    this.ctx.fillText(`${this.i18n.t('game.score')}: ${this.player.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`${this.i18n.t('game.level')}: ${this.player.level}`, this.canvas.width / 2, this.canvas.height / 2 + 60);
    
    const survivalTime = Math.floor(this.gameTime);
    const minutes = Math.floor(survivalTime / 60);
    const seconds = survivalTime % 60;
    this.ctx.fillText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`, this.canvas.width / 2, this.canvas.height / 2 + 100);
    
    // Restart prompt
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#FFF';
    this.ctx.fillText(this.i18n.t('game.pressRToRestart'), this.canvas.width / 2, this.canvas.height / 2 + 140);
    
    this.ctx.restore();
  }

  drawVictoryScreen() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 100, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 72px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(this.i18n.t('game.victory'), this.canvas.width / 2, this.canvas.height / 2 - 50);
    
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = '36px Arial';
    this.ctx.fillText(`${this.i18n.t('game.finalScore')}: ${this.player.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`${this.i18n.t('game.level')}: ${this.player.level}`, this.canvas.width / 2, this.canvas.height / 2 + 60);
    this.ctx.fillText(`${this.i18n.t('game.survivalTime')}: 10:00`, this.canvas.width / 2, this.canvas.height / 2 + 100);
    
    // Draw fireworks effect
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height / 2;
      this.drawFirework(x, y);
    }
    
    // Restart prompt
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#FFF';
    this.ctx.fillText(this.i18n.t('game.pressRToRestart'), this.canvas.width / 2, this.canvas.height / 2 + 140);
    
    this.ctx.restore();
  }

  drawFirework(x, y) {
    const time = Date.now() / 1000;
    const radius = (Math.sin(time * 2) + 1) * 20 + 10;
    
    this.ctx.save();
    this.ctx.globalAlpha = 0.7;
    
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i + time;
      const sparkX = x + Math.cos(angle) * radius;
      const sparkY = y + Math.sin(angle) * radius;
      
      this.ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
      this.ctx.beginPath();
      this.ctx.arc(sparkX, sparkY, 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    this.ctx.restore();
  }

  drawStar(x, y, innerRadius, outerRadius, points) {
    const angle = Math.PI / points;
    
    this.ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const px = x + radius * Math.cos(angle * i - Math.PI / 2);
      const py = y + radius * Math.sin(angle * i - Math.PI / 2);
      
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
  }
  
  drawPlayerHealthBar() {
    if (!this.player) return;
    
    const barWidth = 40;
    const barHeight = 4;
    const barX = this.player.x - barWidth / 2;
    const barY = this.player.y + this.player.radius + 10;
    
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Health fill
    const hpPercent = this.player.hp / this.player.maxHp;
    this.ctx.fillStyle = hpPercent > 0.5 ? '#00FF00' : hpPercent > 0.25 ? '#FFFF00' : '#FF0000';
    this.ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
    
    // Border
    this.ctx.strokeStyle = '#FFF';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(barX, barY, barWidth, barHeight);
  }
  
  showDamageNumber(x, y, amount, color = '#FFFFFF') {
    this.damageNumbers.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y,
      amount: Math.round(amount),
      color: color,
      lifetime: 1000,
      velocity: -2
    });
  }
  
  updateDamageNumbers(deltaTime) {
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dmg = this.damageNumbers[i];
      dmg.y += dmg.velocity;
      dmg.lifetime -= deltaTime;
      
      if (dmg.lifetime <= 0) {
        this.damageNumbers.splice(i, 1);
      }
    }
  }
  
  drawDamageNumbers() {
    for (const dmg of this.damageNumbers) {
      const alpha = dmg.lifetime / 1000;
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = dmg.color;
      this.ctx.font = 'bold 16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 2;
      this.ctx.strokeText(`+${dmg.amount}`, dmg.x, dmg.y);
      this.ctx.fillText(`+${dmg.amount}`, dmg.x, dmg.y);
      this.ctx.restore();
    }
  }
}