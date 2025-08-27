import { GameState, Enemy, Projectile, XPOrb, Vector2 } from '../types';
import { SpatialGrid } from '../utils/SpatialGrid';
import { MathUtils, Vec2 } from '../utils/math';
import { GAME_CONFIG } from '../../constants/gameConfig';

export class CollisionSystem {
  private enemyGrid: SpatialGrid<Enemy>;
  private projectileGrid: SpatialGrid<Projectile>;
  private xpOrbGrid: SpatialGrid<XPOrb>;
  private playerInvulnerableTime: number = 0;
  
  constructor(
    enemyGrid: SpatialGrid<Enemy>,
    projectileGrid: SpatialGrid<Projectile>,
    xpOrbGrid: SpatialGrid<XPOrb>
  ) {
    this.enemyGrid = enemyGrid;
    this.projectileGrid = projectileGrid;
    this.xpOrbGrid = xpOrbGrid;
  }
  
  public processCollisions(gameState: GameState): void {
    // Add all active entities to spatial grids
    this.updateSpatialGrids(gameState);
    
    // Check player-enemy collisions
    this.checkPlayerEnemyCollisions(gameState);
    
    // Check projectile-enemy collisions
    this.checkProjectileEnemyCollisions(gameState);
    
    // Check player-XP orb collisions
    this.checkPlayerXPOrbCollisions(gameState);
  }
  
  private updateSpatialGrids(gameState: GameState): void {
    // Clear grids
    this.enemyGrid.clear();
    this.projectileGrid.clear();
    this.xpOrbGrid.clear();
    
    // Re-add all active entities
    for (const enemy of gameState.enemies) {
      if (enemy.active) {
        this.enemyGrid.add(enemy);
      }
    }
    
    for (const projectile of gameState.projectiles) {
      if (projectile.active) {
        this.projectileGrid.add(projectile);
      }
    }
    
    for (const orb of gameState.xpOrbs) {
      if (orb.active) {
        this.xpOrbGrid.add(orb);
      }
    }
  }
  
  private checkPlayerEnemyCollisions(gameState: GameState): void {
    const player = gameState.player;
    const currentTime = Date.now();
    
    // Check if player is invulnerable
    if (currentTime - this.playerInvulnerableTime < GAME_CONFIG.PLAYER.INVULNERABILITY_TIME) {
      return;
    }
    
    // Get enemies near player
    const nearbyEnemies = this.enemyGrid.getEntitiesInRadius(
      player.position,
      player.radius + 50 // Check slightly larger radius for performance
    );
    
    for (const enemy of nearbyEnemies) {
      if (!enemy.active) continue;
      
      // Check collision
      if (MathUtils.circleCollision(
        player.position,
        player.radius,
        enemy.position,
        enemy.radius
      )) {
        // Damage player
        player.health -= enemy.damage;
        
        // Set invulnerability
        this.playerInvulnerableTime = currentTime;
        
        // Knockback enemy
        const knockbackDir = Vec2.normalize(
          Vec2.subtract(enemy.position, player.position)
        );
        enemy.position = Vec2.add(
          enemy.position,
          Vec2.multiply(knockbackDir, 30)
        );
        
        // Only take damage from one enemy per frame
        break;
      }
    }
  }
  
  private checkProjectileEnemyCollisions(gameState: GameState): void {
    for (const projectile of gameState.projectiles) {
      if (!projectile.active || projectile.pierce <= 0) continue;
      
      // Get enemies near projectile
      const nearbyEnemies = this.enemyGrid.getEntitiesInRadius(
        projectile.position,
        projectile.radius + 50
      );
      
      for (const enemy of nearbyEnemies) {
        if (!enemy.active) continue;
        
        // Check collision
        if (MathUtils.circleCollision(
          projectile.position,
          projectile.radius,
          enemy.position,
          enemy.radius
        )) {
          // Damage enemy
          enemy.health -= projectile.damage;
          
          // Reduce pierce
          projectile.pierce--;
          
          // Check if enemy died
          if (enemy.health <= 0) {
            this.onEnemyKilled(gameState, enemy);
          }
          
          // Deactivate projectile if no more pierce
          if (projectile.pierce <= 0) {
            projectile.active = false;
            break;
          }
        }
      }
    }
  }
  
  private checkPlayerXPOrbCollisions(gameState: GameState): void {
    const player = gameState.player;
    
    // Get orbs near player
    const nearbyOrbs = this.xpOrbGrid.getEntitiesInRadius(
      player.position,
      player.radius + player.pickupRadius
    );
    
    for (const orb of nearbyOrbs) {
      if (!orb.active) continue;
      
      // Check if within pickup radius (for magnetism)
      const distance = Vec2.distance(orb.position, player.position);
      
      if (distance <= player.pickupRadius && !orb.isBeingCollected) {
        orb.isBeingCollected = true;
      }
      
      // Check actual collection
      if (MathUtils.circleCollision(
        player.position,
        player.radius,
        orb.position,
        orb.radius
      )) {
        // Collect XP
        player.experience += orb.value;
        orb.active = false;
        
        // Update score
        gameState.score += orb.value;
      }
    }
  }
  
  private onEnemyKilled(gameState: GameState, enemy: Enemy): void {
    // Mark enemy as inactive
    enemy.active = false;
    
    // Update kill count
    gameState.kills++;
    
    // Update score
    gameState.score += enemy.xpValue * 10;
    
    // Spawn XP orbs
    this.spawnXPOrbs(gameState, enemy.position, enemy.xpValue);
  }
  
  private spawnXPOrbs(gameState: GameState, position: Vector2, totalValue: number): void {
    // Determine number of orbs based on value
    let orbCount = 1;
    let valuePerOrb = totalValue;
    
    if (totalValue >= 20) {
      orbCount = 3;
      valuePerOrb = Math.floor(totalValue / 3);
    } else if (totalValue >= 10) {
      orbCount = 2;
      valuePerOrb = Math.floor(totalValue / 2);
    }
    
    for (let i = 0; i < orbCount; i++) {
      // Create XP orb (using a simple object for now, should use pool in production)
      const orb: XPOrb = {
        id: MathUtils.generateId(),
        type: 'xp_orb' as const,
        position: {
          x: position.x + MathUtils.randomRange(-20, 20),
          y: position.y + MathUtils.randomRange(-20, 20),
        },
        velocity: { x: 0, y: 0 },
        radius: GAME_CONFIG.EXPERIENCE.ORB_RADIUS,
        health: 1,
        maxHealth: 1,
        damage: 0,
        speed: 0,
        active: true,
        value: valuePerOrb,
        magnetRange: gameState.player.pickupRadius,
        isBeingCollected: false,
      };
      
      gameState.xpOrbs.push(orb);
    }
  }
}