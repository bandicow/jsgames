// Bullet Weapon - Basic forward projectile

import Weapon from './Weapon';

export default class BulletWeapon extends Weapon {
  constructor() {
    super('bullet');
    this.cooldown = 500;
    this.damage = 8;  // Reduced from 15
    this.bulletSpeed = 8;
    this.bulletCount = 1;
  }

  fire(player, enemies, gameEngine) {
    const nearest = this.findNearestEnemy(player, enemies);
    if (!nearest) return;

    // Calculate angle to nearest enemy
    const angle = Math.atan2(nearest.y - player.y, nearest.x - player.x);
    
    // Fire bullets based on level
    for (let i = 0; i < this.bulletCount; i++) {
      const spreadAngle = this.level >= 5 ? (i - 0.5) * 0.2 : 0;
      const finalAngle = angle + spreadAngle;
      
      const bullet = {
        x: player.x,
        y: player.y,
        vx: Math.cos(finalAngle) * this.bulletSpeed,
        vy: Math.sin(finalAngle) * this.bulletSpeed,
        radius: 6 * player.stats.weaponSizeMultiplier,
        damage: this.damage * player.getDamage() / 10,
        color: '#FFFF00',
        trail: []
      };
      
      this.projectiles.push(bullet);
    }
  }

  updateProjectiles(deltaTime, enemies, gameEngine) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const bullet = this.projectiles[i];
      
      // Add to trail
      bullet.trail.push({ x: bullet.x, y: bullet.y });
      if (bullet.trail.length > 5) {
        bullet.trail.shift();
      }
      
      // Update position
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;

      // Check bounds
      if (this.isProjectileOutOfBounds(bullet)) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision with obstacles first
      if (gameEngine && gameEngine.obstacles) {
        for (const obstacle of gameEngine.obstacles) {
          if (!obstacle.isDestroyed && obstacle.checkProjectileCollision && obstacle.checkProjectileCollision(bullet)) {
            this.projectiles.splice(i, 1);
            break;
          }
        }
        // If bullet was removed by obstacle collision, skip enemy checks
        if (i >= this.projectiles.length || this.projectiles[i] !== bullet) {
          continue;
        }
      }

      // Check collision with enemies
      for (const enemy of enemies) {
        if (this.checkProjectileCollision(bullet, enemy)) {
          enemy.takeDamage(bullet.damage);
          this.projectiles.splice(i, 1);
          break;
        }
      }
    }
  }

  draw(ctx) {
    ctx.save();
    
    for (const bullet of this.projectiles) {
      // Draw trail
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = bullet.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < bullet.trail.length; i++) {
        const point = bullet.trail[i];
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();
      
      // Draw bullet
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = bullet.color;
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  onLevelUp() {
    switch(this.level) {
      case 2:
        this.damage *= 1.2;  // Reduced from 1.3
        break;
      case 3:
        this.cooldown *= 0.7; // Faster fire rate
        break;
      case 4:
        this.damage *= 1.2;  // Reduced from 1.3
        break;
      case 5:
        this.bulletCount = 2; // Fire 2 bullets
        break;
    }
  }
}