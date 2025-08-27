// Weapon Factory - Creates and manages all weapon types

import BulletWeapon from './BulletWeapon';
import SwordWeapon from './SwordWeapon';
import LightningWeapon from './LightningWeapon';
// Import other weapons as they're created
// For now, we'll create simplified versions of the remaining weapons

import Weapon from './Weapon';

// Simplified weapon implementations for the remaining types
class SpearWeapon extends Weapon {
  constructor() {
    super('spear');
    this.cooldown = 700;
    this.damage = 12;  // Reduced from 20
    this.pierce = 3;
    this.spearCount = 1;
  }

  fire(player, enemies) {
    const nearest = this.findNearestEnemy(player, enemies);
    if (!nearest) return;

    const angle = Math.atan2(nearest.y - player.y, nearest.x - player.x);
    
    for (let i = 0; i < this.spearCount; i++) {
      const offsetAngle = (i - Math.floor(this.spearCount/2)) * 0.2;
      const spearAngle = angle + offsetAngle;
      this.projectiles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(spearAngle) * 10,
        vy: Math.sin(spearAngle) * 10,
        radius: 6 * player.stats.weaponSizeMultiplier,
        damage: this.damage * player.getDamage() / 10,
        color: '#8B4513',
        pierce: this.pierce,
        angle: spearAngle,
        length: 25,
        width: 4,
        draw: function(ctx) {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate(this.angle);
          
          // Draw spear shaft
          ctx.fillStyle = '#8B4513';  // Brown shaft
          ctx.fillRect(-this.length/2, -this.width/2, this.length * 0.8, this.width);
          
          // Draw spear tip (metallic point)
          ctx.fillStyle = '#C0C0C0';  // Silver tip
          ctx.beginPath();
          ctx.moveTo(this.length/2, 0);
          ctx.lineTo(this.length/2 - 8, -3);
          ctx.lineTo(this.length/2 - 8, 3);
          ctx.closePath();
          ctx.fill();
          
          // Draw spear end (feathers/fletching)
          ctx.fillStyle = '#FF4500';  // Orange feathers
          ctx.beginPath();
          ctx.moveTo(-this.length/2, 0);
          ctx.lineTo(-this.length/2 + 5, -2);
          ctx.lineTo(-this.length/2 + 5, 2);
          ctx.closePath();
          ctx.fill();
          
          // Add shaft outline for visibility
          ctx.strokeStyle = '#654321';
          ctx.lineWidth = 1;
          ctx.strokeRect(-this.length/2, -this.width/2, this.length * 0.8, this.width);
          
          ctx.restore();
        }
      });
    }
  }

  onLevelUp() {
    switch(this.level) {
      case 2: this.damage *= 1.3; break;
      case 3: this.pierce = 5; break;
      case 4: this.damage *= 1.3; break;
      case 5: this.spearCount = 2; break;
    }
  }
}

class BladeWeapon extends Weapon {
  constructor() {
    super('blade');
    this.cooldown = 0;
    this.damage = 8;  // Reduced from 15
    this.bladeCount = 1;
    this.rotationSpeed = 0.05;
    this.orbitRadius = 60;
    this.blades = [];
    this.rotation = 0;
  }

  fire() {} // Blades are always active

  update(deltaTime, player, enemies, gameEngine) {
    // Update rotation
    this.rotation += this.rotationSpeed;
    
    // Update blade positions
    for (let i = 0; i < this.bladeCount; i++) {
      const angle = this.rotation + (i * Math.PI * 2 / this.bladeCount);
      const blade = {
        x: player.x + Math.cos(angle) * this.orbitRadius * player.stats.weaponSizeMultiplier,
        y: player.y + Math.sin(angle) * this.orbitRadius * player.stats.weaponSizeMultiplier,
        radius: 15 * player.stats.weaponSizeMultiplier,
        damage: this.damage * player.getDamage() / 10
      };
      
      // Check collision with enemies
      for (const enemy of enemies) {
        const dx = enemy.x - blade.x;
        const dy = enemy.y - blade.y;
        if (Math.sqrt(dx*dx + dy*dy) < blade.radius + enemy.radius) {
          enemy.takeDamage(blade.damage * deltaTime / 100);
        }
      }
      
      this.blades[i] = blade;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    
    for (const blade of this.blades) {
      // Draw blade
      ctx.fillStyle = '#C0C0C0';
      ctx.strokeStyle = '#808080';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = this.rotation * 2 + i * Math.PI / 2;
        const x = blade.x + Math.cos(angle) * blade.radius;
        const y = blade.y + Math.sin(angle) * blade.radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    
    ctx.restore();
  }

  onLevelUp() {
    switch(this.level) {
      case 2: this.damage *= 1.3; break;
      case 3: this.rotationSpeed = 0.08; break;
      case 4: this.orbitRadius = 80; break;
      case 5: this.bladeCount = 3; break;
    }
  }
}

class LaserWeapon extends Weapon {
  constructor() {
    super('laser');
    this.cooldown = 1000;
    this.damage = 20;  // Reduced from 40
    this.laserCount = 1;
    this.beamDuration = 500;
    this.activeBeams = [];
  }

  fire(player, enemies) {
    for (let i = 0; i < this.laserCount; i++) {
      const target = enemies[Math.floor(Math.random() * enemies.length)];
      if (!target) continue;

      const angle = Math.atan2(target.y - player.y, target.x - player.x);
      this.activeBeams.push({
        x: player.x,
        y: player.y,
        angle: angle,
        length: 800,
        lifetime: this.beamDuration,
        damage: this.damage * player.getDamage() / 10,
        hitEnemies: new Set()
      });
    }
  }

  update(deltaTime, player, enemies, gameEngine) {
    super.update(deltaTime, player, enemies, gameEngine);
    
    // Update beams
    for (let i = this.activeBeams.length - 1; i >= 0; i--) {
      const beam = this.activeBeams[i];
      beam.lifetime -= deltaTime;
      
      if (beam.lifetime <= 0) {
        this.activeBeams.splice(i, 1);
        continue;
      }
      
      // Check collisions
      for (const enemy of enemies) {
        if (beam.hitEnemies.has(enemy)) continue;
        
        // Line-circle collision
        const dx = Math.cos(beam.angle);
        const dy = Math.sin(beam.angle);
        const fx = enemy.x - beam.x;
        const fy = enemy.y - beam.y;
        
        const a = dx * dx + dy * dy;
        const b = 2 * (fx * dx + fy * dy);
        const c = (fx * fx + fy * fy) - enemy.radius * enemy.radius;
        
        const discriminant = b * b - 4 * a * c;
        if (discriminant >= 0) {
          const t = (-b - Math.sqrt(discriminant)) / (2 * a);
          if (t >= 0 && t <= beam.length) {
            enemy.takeDamage(beam.damage);
            beam.hitEnemies.add(enemy);
          }
        }
      }
    }
  }

  draw(ctx) {
    ctx.save();
    
    for (const beam of this.activeBeams) {
      const alpha = beam.lifetime / this.beamDuration;
      
      // Draw beam
      ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
      ctx.lineWidth = 10;
      ctx.shadowColor = '#FF0000';
      ctx.shadowBlur = 20;
      
      ctx.beginPath();
      ctx.moveTo(beam.x, beam.y);
      ctx.lineTo(
        beam.x + Math.cos(beam.angle) * beam.length,
        beam.y + Math.sin(beam.angle) * beam.length
      );
      ctx.stroke();
      
      // Draw core
      ctx.strokeStyle = `rgba(255, 100, 100, ${alpha})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    
    ctx.restore();
  }

  onLevelUp() {
    switch(this.level) {
      case 2: this.damage *= 1.3; break;
      case 3: this.laserCount = 2; break;
      case 4: this.beamDuration = 700; break;
      case 5: this.damage *= 1.5; break;
    }
  }
}

// Simplified implementations for remaining weapons
class ShotgunWeapon extends Weapon {
  constructor() {
    super('shotgun');
    this.cooldown = 1200;
    this.damage = 4;  // Reduced from 8
    this.pelletCount = 5;
  }

  fire(player, enemies) {
    const nearest = this.findNearestEnemy(player, enemies);
    if (!nearest) return;

    const baseAngle = Math.atan2(nearest.y - player.y, nearest.x - player.x);
    const spread = Math.PI / 6;
    
    for (let i = 0; i < this.pelletCount; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * spread;
      this.projectiles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * 7,
        vy: Math.sin(angle) * 7,
        radius: 5 * player.stats.weaponSizeMultiplier,
        damage: this.damage * player.getDamage() / 10,
        color: '#FFA500'
      });
    }
  }

  onLevelUp() {
    switch(this.level) {
      case 2: this.damage *= 1.3; break;
      case 3: this.pelletCount = 7; break;
      case 4: this.damage *= 1.3; break;
      case 5: this.pelletCount = 10; break;
    }
  }
}

class MissileWeapon extends Weapon {
  constructor() {
    super('missile');
    this.cooldown = 1500;
    this.damage = 18;  // Reduced from 35
    this.missileCount = 1;
  }

  fire(player, enemies) {
    for (let i = 0; i < this.missileCount; i++) {
      const initialTarget = this.findNearestEnemy(player, enemies);
      if (!initialTarget) continue;

      const missile = {
        x: player.x,
        y: player.y,
        vx: 0,
        vy: 0,
        target: initialTarget,
        maxSpeed: 8,  // Increased max speed
        acceleration: 0.3,
        turnRate: 0.15,
        radius: 6 * player.stats.weaponSizeMultiplier,
        damage: this.damage * player.getDamage() / 10,
        color: '#FF00FF',
        trail: [],
        update: function(deltaTime, enemies) {
          // Find new target if current is dead or too far
          if (!this.target || this.target.isDead) {
            this.target = this.findNewTarget(enemies);
          }
          
          if (this.target) {
            // Calculate desired direction to target
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
              const desiredVx = (dx / distance) * this.maxSpeed;
              const desiredVy = (dy / distance) * this.maxSpeed;
              
              // Steering force
              const steerX = desiredVx - this.vx;
              const steerY = desiredVy - this.vy;
              
              // Apply steering with turn rate limit
              this.vx += steerX * this.turnRate;
              this.vy += steerY * this.turnRate;
              
              // Limit to max speed
              const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
              if (currentSpeed > this.maxSpeed) {
                this.vx = (this.vx / currentSpeed) * this.maxSpeed;
                this.vy = (this.vy / currentSpeed) * this.maxSpeed;
              }
            }
          } else {
            // No target - continue straight with slight acceleration
            const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (currentSpeed < this.maxSpeed) {
              const accel = Math.min(this.acceleration, this.maxSpeed - currentSpeed);
              if (currentSpeed > 0) {
                this.vx += (this.vx / currentSpeed) * accel;
                this.vy += (this.vy / currentSpeed) * accel;
              } else {
                this.vx = this.maxSpeed * 0.5;
                this.vy = 0;
              }
            }
          }
          
          // Update trail
          this.trail.push({ x: this.x, y: this.y });
          if (this.trail.length > 12) this.trail.shift();
          
          // Move missile
          this.x += this.vx * (deltaTime / 16);
          this.y += this.vy * (deltaTime / 16);
        },
        findNewTarget: function(enemies) {
          let nearest = null;
          let nearestDistance = Infinity;
          
          for (const enemy of enemies) {
            if (!enemy.isDead) {
              const dx = enemy.x - this.x;
              const dy = enemy.y - this.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < nearestDistance) {
                nearest = enemy;
                nearestDistance = distance;
              }
            }
          }
          
          return nearest;
        }
      };
      
      this.projectiles.push(missile);
    }
  }

  // Override updateProjectiles to pass enemies array to missiles
  updateProjectiles(deltaTime, enemies, gameEngine) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const missile = this.projectiles[i];
      
      // Update missile with enemies array for homing
      if (missile.update) {
        missile.update(deltaTime, enemies);
      } else {
        missile.x += missile.vx * (deltaTime / 16);
        missile.y += missile.vy * (deltaTime / 16);
      }

      // Check if out of bounds
      if (this.isProjectileOutOfBounds(missile)) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision with obstacles first
      if (gameEngine && gameEngine.obstacles) {
        for (const obstacle of gameEngine.obstacles) {
          if (!obstacle.isDestroyed && obstacle.checkProjectileCollision && obstacle.checkProjectileCollision(missile)) {
            this.projectiles.splice(i, 1);
            break;
          }
        }
        // If missile was removed by obstacle collision, skip enemy checks
        if (i >= this.projectiles.length || this.projectiles[i] !== missile) {
          continue;
        }
      }

      // Check collision with enemies
      for (const enemy of enemies) {
        if (this.checkProjectileCollision(missile, enemy)) {
          const damage = this.calculateDamage(missile);
          enemy.takeDamage(damage);
          
          // Missiles always destroy on hit
          this.projectiles.splice(i, 1);
          break;
        }
      }
    }
  }

  onLevelUp() {
    switch(this.level) {
      case 2: this.damage *= 1.3; break;
      case 3: this.missileCount = 2; break;
      case 4: this.cooldown *= 0.7; break;
      case 5: this.missileCount = 3; break;
    }
  }
}

class IceWeapon extends Weapon {
  constructor() {
    super('ice');
    this.cooldown = 800;
    this.damage = 6;  // Reduced from 12
    this.slowAmount = 0.5;
    this.freezeChance = 0;
  }

  fire(player, enemies) {
    const nearest = this.findNearestEnemy(player, enemies);
    if (!nearest) return;

    const angle = Math.atan2(nearest.y - player.y, nearest.x - player.x);
    
    for (let i = -1; i <= 1; i++) {
      this.projectiles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle + i * 0.2) * 6,
        vy: Math.sin(angle + i * 0.2) * 6,
        radius: 5 * player.stats.weaponSizeMultiplier,
        damage: this.damage * player.getDamage() / 10,
        color: '#87CEEB',
        slowAmount: this.slowAmount,
        freezeChance: this.freezeChance
      });
    }
  }

  applySpecialEffects(projectile, enemy) {
    enemy.slow(projectile.slowAmount, 2000);
    if (projectile.freezeChance > 0 && Math.random() < projectile.freezeChance) {
      enemy.freeze(1000);
    }
  }

  onLevelUp() {
    switch(this.level) {
      case 2: this.damage *= 1.3; break;
      case 3: this.cooldown *= 0.7; break;
      case 4: this.slowAmount = 0.7; break;
      case 5: this.freezeChance = 0.3; break;
    }
  }
}

class ShockwaveWeapon extends Weapon {
  constructor() {
    super('shockwave');
    this.cooldown = 2000;
    this.damage = 10;  // Reduced from 20
    this.radius = 80;
    this.activeWaves = [];
  }

  fire(player) {
    this.activeWaves.push({
      x: player.x,
      y: player.y,
      radius: 0,
      maxRadius: this.radius * player.stats.weaponSizeMultiplier,
      damage: this.damage * player.getDamage() / 10,
      hitEnemies: new Set(),
      lifetime: 500
    });
  }

  update(deltaTime, player, enemies, gameEngine) {
    super.update(deltaTime, player, enemies, gameEngine);
    
    for (let i = this.activeWaves.length - 1; i >= 0; i--) {
      const wave = this.activeWaves[i];
      wave.radius += 200 * deltaTime / 1000;
      wave.lifetime -= deltaTime;
      
      if (wave.radius >= wave.maxRadius || wave.lifetime <= 0) {
        this.activeWaves.splice(i, 1);
        continue;
      }
      
      // Check collisions
      for (const enemy of enemies) {
        if (wave.hitEnemies.has(enemy)) continue;
        
        const dist = Math.sqrt(Math.pow(enemy.x - wave.x, 2) + Math.pow(enemy.y - wave.y, 2));
        if (dist < wave.radius + enemy.radius && dist > wave.radius - 20) {
          enemy.takeDamage(wave.damage);
          enemy.applyKnockback(Math.atan2(enemy.y - wave.y, enemy.x - wave.x), 5);
          wave.hitEnemies.add(enemy);
        }
      }
    }
  }

  draw(ctx) {
    ctx.save();
    
    for (const wave of this.activeWaves) {
      const alpha = (1 - wave.radius / wave.maxRadius) * 0.5;
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = `rgba(100, 200, 255, ${alpha * 0.5})`;
      ctx.lineWidth = 20;
      ctx.stroke();
    }
    
    ctx.restore();
  }

  onLevelUp() {
    switch(this.level) {
      case 2: this.damage *= 1.3; break;
      case 3: this.radius = 100; break;
      case 4: this.damage *= 1.3; break;
      case 5: this.radius = 140; break;
    }
  }
}

class BoomerangWeapon extends Weapon {
  constructor() {
    super('boomerang');
    this.cooldown = 1000;
    this.damage = 10;  // Reduced from 18
    this.boomerangCount = 1;
  }

  fire(player, enemies) {
    for (let i = 0; i < this.boomerangCount; i++) {
      const angle = (Math.PI * 2 / this.boomerangCount) * i;
      
      const boomerang = {
        x: player.x,
        y: player.y,
        originX: player.x,
        originY: player.y,
        angle: angle,
        distance: 0,
        maxDistance: 200 * player.stats.weaponSizeMultiplier,
        returning: false,
        speed: 8,
        radius: 8 * player.stats.weaponSizeMultiplier,
        damage: this.damage * player.getDamage() / 10,
        color: '#8B4513',
        rotation: 0,
        hitEnemies: new Set(),
        update: function(deltaTime) {
          this.rotation += 0.3;
          
          if (!this.returning) {
            this.distance += this.speed;
            if (this.distance >= this.maxDistance) {
              this.returning = true;
            }
          } else {
            this.distance -= this.speed;
            if (this.distance <= 0) {
              this.distance = 0;
              this.collected = true;
            }
          }
          
          this.x = this.originX + Math.cos(this.angle) * this.distance;
          this.y = this.originY + Math.sin(this.angle) * this.distance;
        }
      };
      
      this.projectiles.push(boomerang);
    }
  }

  updateProjectiles(deltaTime, enemies, gameEngine) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const boomerang = this.projectiles[i];
      boomerang.update(deltaTime);
      
      if (boomerang.collected) {
        this.projectiles.splice(i, 1);
        continue;
      }
      
      // Check collision with obstacles first
      if (gameEngine && gameEngine.obstacles) {
        for (const obstacle of gameEngine.obstacles) {
          if (!obstacle.isDestroyed && obstacle.checkProjectileCollision && obstacle.checkProjectileCollision(boomerang)) {
            // Boomerang bounces off obstacles - reverse direction
            boomerang.vx *= -0.8;
            boomerang.vy *= -0.8;
            break;
          }
        }
      }
      
      // Check collisions with enemies
      for (const enemy of enemies) {
        const dx = enemy.x - boomerang.x;
        const dy = enemy.y - boomerang.y;
        if (Math.sqrt(dx*dx + dy*dy) < boomerang.radius + enemy.radius) {
          if (!boomerang.hitEnemies.has(enemy)) {
            enemy.takeDamage(boomerang.damage);
            boomerang.hitEnemies.add(enemy);
          }
        }
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.8;
    
    for (const boomerang of this.projectiles) {
      ctx.save();
      ctx.translate(boomerang.x, boomerang.y);
      ctx.rotate(boomerang.rotation);
      
      ctx.fillStyle = boomerang.color;
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2;
      
      // Draw boomerang shape
      ctx.beginPath();
      ctx.arc(-boomerang.radius/2, 0, boomerang.radius/2, 0, Math.PI);
      ctx.arc(boomerang.radius/2, 0, boomerang.radius/2, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      
      ctx.restore();
    }
    
    ctx.restore();
  }

  onLevelUp() {
    switch(this.level) {
      case 2: this.maxDistance = 250; break;
      case 3: this.damage *= 1.5; break;
      case 4: this.speed = 10; break;
      case 5: this.boomerangCount = 3; break;
    }
  }
}

class PoisonWeapon extends Weapon {
  constructor() {
    super('poison');
    this.cooldown = 1500;
    this.damage = 3;  // Reduced from 5
    this.poolSize = 30;
    this.poolDuration = 3000;
    this.poolCount = 1;
    this.activePools = [];
  }

  fire(player, enemies) {
    for (let i = 0; i < this.poolCount; i++) {
      const target = this.findRandomEnemy(enemies);
      if (!target) continue;

      this.activePools.push({
        x: target.x,
        y: target.y,
        radius: this.poolSize,
        damage: this.damage * player.getDamage() / 10,
        lifetime: this.poolDuration,
        tickTimer: 0,
        color: 'rgba(0, 255, 0, 0.5)'
      });
    }
  }

  update(deltaTime, player, enemies, gameEngine) {
    super.update(deltaTime, player, enemies, gameEngine);
    
    for (let i = this.activePools.length - 1; i >= 0; i--) {
      const pool = this.activePools[i];
      pool.lifetime -= deltaTime;
      pool.tickTimer += deltaTime;
      
      if (pool.lifetime <= 0) {
        this.activePools.splice(i, 1);
        continue;
      }
      
      // Damage tick every 500ms
      if (pool.tickTimer >= 500) {
        pool.tickTimer = 0;
        
        for (const enemy of enemies) {
          const dist = Math.sqrt(Math.pow(enemy.x - pool.x, 2) + Math.pow(enemy.y - pool.y, 2));
          if (dist < pool.radius + enemy.radius) {
            enemy.poison(pool.damage, 2000);
          }
        }
      }
    }
  }

  draw(ctx) {
    ctx.save();
    
    for (const pool of this.activePools) {
      const alpha = Math.min(1, pool.lifetime / 1000) * 0.6;
      
      // Draw pool
      const gradient = ctx.createRadialGradient(pool.x, pool.y, 0, pool.x, pool.y, pool.radius);
      gradient.addColorStop(0, `rgba(0, 255, 0, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(0, 200, 0, ${alpha * 0.7})`);
      gradient.addColorStop(1, `rgba(0, 150, 0, ${alpha * 0.3})`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pool.x, pool.y, pool.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Bubbles effect
      for (let j = 0; j < 3; j++) {
        const bubbleX = pool.x + (Math.random() - 0.5) * pool.radius;
        const bubbleY = pool.y + (Math.random() - 0.5) * pool.radius;
        const bubbleSize = Math.random() * 3 + 1;
        
        ctx.fillStyle = `rgba(100, 255, 100, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  }

  onLevelUp() {
    switch(this.level) {
      case 2: this.damage *= 1.5; break;
      case 3: this.poolSize = 40; break;
      case 4: this.poolDuration = 4000; break;
      case 5: this.poolCount = 3; break;
    }
  }
}

// Weapon Factory class
export default class WeaponFactory {
  static createWeapon(type) {
    switch(type) {
      case 'bullet': return new BulletWeapon();
      case 'sword': return new SwordWeapon();
      case 'lightning': return new LightningWeapon();
      case 'spear': return new SpearWeapon();
      case 'blade': return new BladeWeapon();
      case 'laser': return new LaserWeapon();
      case 'shotgun': return new ShotgunWeapon();
      case 'missile': return new MissileWeapon();
      case 'ice': return new IceWeapon();
      case 'shockwave': return new ShockwaveWeapon();
      case 'boomerang': return new BoomerangWeapon();
      case 'poison': return new PoisonWeapon();
      default: return new BulletWeapon();
    }
  }

  static getRandomWeaponType() {
    const types = [
      'bullet', 'sword', 'lightning', 'spear', 'blade', 'laser',
      'shotgun', 'missile', 'ice', 'shockwave', 'boomerang', 'poison'
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  static getWeaponInfo(type) {
    const info = {
      bullet: { name: 'Bullet', description: 'Shoots forward projectiles' },
      sword: { name: 'Sword', description: 'Slashes enemies nearby' },
      lightning: { name: 'Lightning', description: 'Strikes random enemies' },
      spear: { name: 'Spear', description: 'Piercing projectiles' },
      blade: { name: 'Blade', description: 'Orbiting blades' },
      laser: { name: 'Laser', description: 'Penetrating beam' },
      shotgun: { name: 'Shotgun', description: 'Spread shot' },
      missile: { name: 'Missile', description: 'Homing projectiles' },
      ice: { name: 'Ice Shard', description: 'Slows enemies' },
      shockwave: { name: 'Shockwave', description: 'Area damage' },
      boomerang: { name: 'Boomerang', description: 'Returns to player' },
      poison: { name: 'Poison Pool', description: 'Creates poison areas' }
    };
    return info[type] || { name: 'Unknown', description: 'Unknown weapon' };
  }
}