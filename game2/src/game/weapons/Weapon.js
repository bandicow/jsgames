// Base Weapon class

export default class Weapon {
  constructor(type) {
    this.type = type;
    this.level = 1;
    this.maxLevel = 5;
    this.cooldown = 1000; // Base cooldown in ms
    this.currentCooldown = 0;
    this.damage = 10;
    this.projectiles = [];
    this.active = true;
  }

  // Update weapon
  update(deltaTime, player, enemies, gameEngine) {
    // Update cooldown
    if (this.currentCooldown > 0) {
      this.currentCooldown -= deltaTime;
    }

    // Try to fire if cooldown is ready
    if (this.currentCooldown <= 0 && enemies.length > 0 && this.active) {
      this.fire(player, enemies, gameEngine);
      this.currentCooldown = player.getCooldown(this.cooldown);
    }

    // Update projectiles
    this.updateProjectiles(deltaTime, enemies, gameEngine);
  }

  // Fire weapon (to be overridden by subclasses)
  fire(player, enemies, gameEngine) {
    // Override in subclasses
  }

  // Update projectiles
  updateProjectiles(deltaTime, enemies, gameEngine) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      
      // Update position
      if (projectile.update) {
        projectile.update(deltaTime);
      } else {
        projectile.x += projectile.vx * (deltaTime / 16);
        projectile.y += projectile.vy * (deltaTime / 16);
      }

      // Check if out of bounds
      if (this.isProjectileOutOfBounds(projectile)) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision with obstacles first
      if (gameEngine && gameEngine.obstacles) {
        for (const obstacle of gameEngine.obstacles) {
          if (!obstacle.isDestroyed && obstacle.checkProjectileCollision && obstacle.checkProjectileCollision(projectile)) {
            // Projectile hits obstacle - remove it
            this.projectiles.splice(i, 1);
            break;
          }
        }
        // If projectile was removed by obstacle collision, skip enemy checks
        if (i >= this.projectiles.length || this.projectiles[i] !== projectile) {
          continue;
        }
      }

      // Check collision with enemies
      if (projectile.pierce === undefined || projectile.pierce > 0) {
        for (const enemy of enemies) {
          if (this.checkProjectileCollision(projectile, enemy)) {
            const damage = this.calculateDamage(projectile);
            enemy.takeDamage(damage);
            
            // Apply special effects
            this.applySpecialEffects(projectile, enemy);

            // Handle piercing
            if (projectile.pierce !== undefined) {
              projectile.pierce--;
              if (projectile.pierce <= 0) {
                this.projectiles.splice(i, 1);
                break;
              }
            } else if (!projectile.persistent) {
              this.projectiles.splice(i, 1);
              break;
            }
          }
        }
      }
    }
  }

  // Draw weapon and projectiles
  draw(ctx) {
    // Draw projectiles with transparency
    ctx.save();
    ctx.globalAlpha = 0.8;
    
    for (const projectile of this.projectiles) {
      if (projectile.draw) {
        projectile.draw(ctx);
      } else {
        // Enhanced projectile visibility with larger size and outline
        const radius = (projectile.radius || 8);  // Increased from 5 to 8
        const color = projectile.color || '#FFD700';  // Better gold color
        
        // Draw white outline for better visibility
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw main projectile
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  }

  // Level up weapon
  levelUp() {
    if (this.level < this.maxLevel) {
      this.level++;
      this.onLevelUp();
      return true;
    }
    return false;
  }

  // Called when weapon levels up (override in subclasses)
  onLevelUp() {
    // Default level up behavior
    this.damage *= 1.15;  // Reduced from 1.2
  }

  // Check if projectile is out of bounds
  isProjectileOutOfBounds(projectile) {
    return projectile.x < -100 || projectile.x > 1700 || 
           projectile.y < -100 || projectile.y > 1000;
  }

  // Check projectile collision
  checkProjectileCollision(projectile, enemy) {
    const dx = projectile.x - enemy.x;
    const dy = projectile.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (projectile.radius || 5) + enemy.radius;
  }

  // Calculate damage
  calculateDamage(projectile) {
    return projectile.damage || this.damage;
  }

  // Apply special effects (override in subclasses)
  applySpecialEffects(projectile, enemy) {
    // Override in subclasses for special effects
  }

  // Helper to find nearest enemy
  findNearestEnemy(player, enemies) {
    let nearest = null;
    let minDistance = Infinity;
    
    for (const enemy of enemies) {
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    }
    
    return nearest;
  }

  // Helper to find random enemy
  findRandomEnemy(enemies) {
    if (enemies.length === 0) return null;
    return enemies[Math.floor(Math.random() * enemies.length)];
  }
}