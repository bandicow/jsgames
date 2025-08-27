import { GameState, Projectile, Enemy, WeaponType } from '../types';
import { GAME_CONFIG } from '../../constants/gameConfig';
import { ObjectPool } from '../utils/ObjectPool';
import { Vec2, MathUtils } from '../utils/math';

export class WeaponSystem {
  private projectilePool: ObjectPool<Projectile>;
  
  constructor(projectilePool: ObjectPool<Projectile>) {
    this.projectilePool = projectilePool;
  }
  
  public update(gameState: GameState, deltaTime: number): void {
    const player = gameState.player;
    const currentTime = Date.now();
    
    // Process each weapon
    for (const weapon of player.weapons) {
      // const weaponConfig = GAME_CONFIG.WEAPONS[weapon.type as WeaponType];
      const fireInterval = 1000 / weapon.fireRate;
      
      // Check if weapon can fire
      if (currentTime - weapon.lastFired >= fireInterval) {
        // Find nearest enemy for targeting
        const nearestEnemy = this.findNearestEnemy(gameState);
        
        if (nearestEnemy || weapon.type === WeaponType.AURA || weapon.type === WeaponType.BLADE) {
          this.fireWeapon(gameState, weapon, nearestEnemy);
          weapon.lastFired = currentTime;
        }
      }
    }
    
    // Update special weapon behaviors
    this.updateSpecialWeapons(gameState, deltaTime);
  }
  
  private findNearestEnemy(gameState: GameState): Enemy | null {
    const player = gameState.player;
    let nearestEnemy: Enemy | null = null;
    let minDistance = Infinity;
    
    for (const enemy of gameState.enemies) {
      if (!enemy.active) continue;
      
      const distance = Vec2.distance(player.position, enemy.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestEnemy = enemy;
      }
    }
    
    return nearestEnemy;
  }
  
  private fireWeapon(gameState: GameState, weapon: any, target: Enemy | null): void {
    // const player = gameState.player;
    
    switch (weapon.type) {
      case WeaponType.BULLET:
        this.fireBullet(gameState, weapon, target);
        break;
        
      case WeaponType.FIREBALL:
        this.fireFireball(gameState, weapon, target);
        break;
        
      case WeaponType.LIGHTNING:
        this.fireLightning(gameState, weapon, target);
        break;
        
      case WeaponType.BLADE:
        this.createBlade(gameState, weapon);
        break;
        
      case WeaponType.AURA:
        this.createAura(gameState, weapon);
        break;
    }
  }
  
  private fireBullet(gameState: GameState, weapon: any, target: Enemy | null): void {
    if (!target) return;
    
    const player = gameState.player;
    const weaponConfig = GAME_CONFIG.WEAPONS[weapon.type as WeaponType];
    
    // Fire projectiles
    for (let i = 0; i < weapon.projectileCount; i++) {
      const projectile = this.projectilePool.acquire();
      
      // Calculate direction with spread for multiple projectiles
      const baseDirection = Vec2.normalize(
        Vec2.subtract(target.position, player.position)
      );
      
      const spreadAngle = (i - (weapon.projectileCount - 1) / 2) * 0.1;
      const direction = Vec2.rotate(baseDirection, spreadAngle);
      
      // Initialize projectile
      projectile.id = MathUtils.generateId();
      projectile.type = 'projectile' as const;
      projectile.active = true;
      projectile.position = Vec2.clone(player.position);
      projectile.velocity = Vec2.multiply(direction, weapon.projectileSpeed);
      projectile.radius = weaponConfig.radius * weapon.area;
      projectile.damage = weapon.damage;
      projectile.speed = weapon.projectileSpeed;
      projectile.ownerId = player.id;
      projectile.direction = direction;
      projectile.lifetime = 0;
      projectile.maxLifetime = 3; // 3 seconds
      projectile.pierce = weapon.pierce;
      projectile.weaponType = weapon.type;
      projectile.health = 1;
      projectile.maxHealth = 1;
      
      gameState.projectiles.push(projectile);
    }
  }
  
  private fireFireball(gameState: GameState, weapon: any, target: Enemy | null): void {
    if (!target) return;
    
    const player = gameState.player;
    const weaponConfig = GAME_CONFIG.WEAPONS[weapon.type as WeaponType];
    
    // Fire a slower, larger projectile that pierces
    const projectile = this.projectilePool.acquire();
    
    const direction = Vec2.normalize(
      Vec2.subtract(target.position, player.position)
    );
    
    projectile.id = MathUtils.generateId();
    projectile.type = 'projectile' as const;
    projectile.active = true;
    projectile.position = Vec2.clone(player.position);
    projectile.velocity = Vec2.multiply(direction, weapon.projectileSpeed);
    projectile.radius = weaponConfig.radius * weapon.area;
    projectile.damage = weapon.damage;
    projectile.speed = weapon.projectileSpeed;
    projectile.ownerId = player.id;
    projectile.direction = direction;
    projectile.lifetime = 0;
    projectile.maxLifetime = 4;
    projectile.pierce = weapon.pierce;
    projectile.weaponType = weapon.type;
    projectile.health = 1;
    projectile.maxHealth = 1;
    
    gameState.projectiles.push(projectile);
  }
  
  private fireLightning(gameState: GameState, weapon: any, target: Enemy | null): void {
    if (!target) return;
    
    const player = gameState.player;
    const weaponConfig = GAME_CONFIG.WEAPONS[weapon.type as WeaponType];
    
    // Fire a very fast projectile that pierces many enemies
    const projectile = this.projectilePool.acquire();
    
    const direction = Vec2.normalize(
      Vec2.subtract(target.position, player.position)
    );
    
    projectile.id = MathUtils.generateId();
    projectile.type = 'projectile' as const;
    projectile.active = true;
    projectile.position = Vec2.clone(player.position);
    projectile.velocity = Vec2.multiply(direction, weapon.projectileSpeed);
    projectile.radius = weaponConfig.radius * weapon.area;
    projectile.damage = weapon.damage;
    projectile.speed = weapon.projectileSpeed;
    projectile.ownerId = player.id;
    projectile.direction = direction;
    projectile.lifetime = 0;
    projectile.maxLifetime = 1.5;
    projectile.pierce = weapon.pierce;
    projectile.weaponType = weapon.type;
    projectile.health = 1;
    projectile.maxHealth = 1;
    
    gameState.projectiles.push(projectile);
  }
  
  private createBlade(gameState: GameState, weapon: any): void {
    const player = gameState.player;
    const weaponConfig = GAME_CONFIG.WEAPONS[weapon.type as WeaponType];
    
    // Create rotating blades around player
    for (let i = 0; i < weapon.projectileCount; i++) {
      const projectile = this.projectilePool.acquire();
      
      const angle = (Math.PI * 2 * i) / weapon.projectileCount + Date.now() * 0.002;
      const orbitRadius = 60;
      
      projectile.id = MathUtils.generateId();
      projectile.type = 'projectile' as const;
      projectile.active = true;
      projectile.position = {
        x: player.position.x + Math.cos(angle) * orbitRadius,
        y: player.position.y + Math.sin(angle) * orbitRadius,
      };
      projectile.velocity = { x: 0, y: 0 };
      projectile.radius = weaponConfig.radius * weapon.area;
      projectile.damage = weapon.damage;
      projectile.speed = 0;
      projectile.ownerId = player.id;
      projectile.direction = { x: 0, y: 0 };
      projectile.lifetime = 0;
      projectile.maxLifetime = 0.5; // Short lifetime, constantly recreated
      projectile.pierce = Infinity;
      projectile.weaponType = weapon.type;
      projectile.health = 1;
      projectile.maxHealth = 1;
      
      gameState.projectiles.push(projectile);
    }
  }
  
  private createAura(gameState: GameState, weapon: any): void {
    const player = gameState.player;
    const weaponConfig = GAME_CONFIG.WEAPONS[weapon.type as WeaponType];
    
    // Create an aura projectile centered on player
    const projectile = this.projectilePool.acquire();
    
    projectile.id = MathUtils.generateId();
    projectile.type = 'projectile' as const;
    projectile.active = true;
    projectile.position = Vec2.clone(player.position);
    projectile.velocity = { x: 0, y: 0 };
    projectile.radius = weaponConfig.radius * weapon.area;
    projectile.damage = weapon.damage;
    projectile.speed = 0;
    projectile.ownerId = player.id;
    projectile.direction = { x: 0, y: 0 };
    projectile.lifetime = 0;
    projectile.maxLifetime = 0.2; // Very short, constantly recreated
    projectile.pierce = Infinity;
    projectile.weaponType = weapon.type;
    projectile.health = 1;
    projectile.maxHealth = 1;
    
    gameState.projectiles.push(projectile);
  }
  
  private updateSpecialWeapons(gameState: GameState, deltaTime: number): void {
    const player = gameState.player;
    
    // Update blade positions (orbit around player)
    for (const projectile of gameState.projectiles) {
      if (projectile.active && projectile.weaponType === WeaponType.BLADE) {
        const angle = Date.now() * 0.002 + 
          parseFloat(projectile.id.split('-')[0]) * 0.001;
        const orbitRadius = 60;
        
        projectile.position = {
          x: player.position.x + Math.cos(angle) * orbitRadius,
          y: player.position.y + Math.sin(angle) * orbitRadius,
        };
      }
      
      // Update aura position (follow player)
      if (projectile.active && projectile.weaponType === WeaponType.AURA) {
        projectile.position = Vec2.clone(player.position);
      }
    }
  }
}