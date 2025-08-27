// Sword Weapon - Melee slashing attack

import Weapon from './Weapon';

export default class SwordWeapon extends Weapon {
  constructor() {
    super('sword');
    this.cooldown = 800;
    this.damage = 12;  // Reduced from 25
    this.slashRange = 60;
    this.slashAngle = Math.PI / 3; // 60 degrees
    this.slashDuration = 200;
    this.currentSlashes = [];
    this.directions = ['front'];
  }

  fire(player, enemies, gameEngine) {
    // Create slashes based on level
    const baseAngle = Math.atan2(player.facingDirection.y, player.facingDirection.x);
    
    for (const direction of this.directions) {
      let angle = baseAngle;
      
      switch(direction) {
        case 'front':
          // No change
          break;
        case 'back':
          angle += Math.PI;
          break;
        case 'left':
          angle -= Math.PI / 2;
          break;
        case 'right':
          angle += Math.PI / 2;
          break;
      }
      
      const slash = {
        x: player.x,
        y: player.y,
        angle: angle,
        range: this.slashRange * player.stats.weaponSizeMultiplier,
        width: this.slashAngle,
        damage: this.damage * player.getDamage() / 10,
        lifetime: this.slashDuration,
        hitEnemies: new Set(),
        color: 'rgba(255, 255, 255, 0.6)'
      };
      
      this.currentSlashes.push(slash);
    }
    
    // Hit enemies immediately
    for (const slash of this.currentSlashes) {
      for (const enemy of enemies) {
        if (this.isEnemyInSlash(enemy, slash) && !slash.hitEnemies.has(enemy)) {
          enemy.takeDamage(slash.damage);
          slash.hitEnemies.add(enemy);
        }
      }
    }
  }

  update(deltaTime, player, enemies, gameEngine) {
    // Update cooldown
    if (this.currentCooldown > 0) {
      this.currentCooldown -= deltaTime;
    }

    // Fire if ready
    if (this.currentCooldown <= 0 && enemies.length > 0 && this.active) {
      this.fire(player, enemies, gameEngine);
      this.currentCooldown = player.getCooldown(this.cooldown);
    }

    // Update active slashes
    for (let i = this.currentSlashes.length - 1; i >= 0; i--) {
      const slash = this.currentSlashes[i];
      slash.lifetime -= deltaTime;
      
      if (slash.lifetime <= 0) {
        this.currentSlashes.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    
    for (const slash of this.currentSlashes) {
      const alpha = slash.lifetime / this.slashDuration;
      ctx.globalAlpha = alpha * 0.6;
      
      // Draw slash arc
      ctx.fillStyle = slash.color;
      ctx.beginPath();
      ctx.moveTo(slash.x, slash.y);
      ctx.arc(slash.x, slash.y, slash.range, 
              slash.angle - slash.width/2, 
              slash.angle + slash.width/2);
      ctx.closePath();
      ctx.fill();
      
      // Draw slash edge
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(slash.x, slash.y, slash.range, 
              slash.angle - slash.width/2, 
              slash.angle + slash.width/2);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  isEnemyInSlash(enemy, slash) {
    const dx = enemy.x - slash.x;
    const dy = enemy.y - slash.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > slash.range + enemy.radius) return false;
    
    // Check angle
    const angleToEnemy = Math.atan2(dy, dx);
    let angleDiff = Math.abs(angleToEnemy - slash.angle);
    
    // Normalize angle difference
    if (angleDiff > Math.PI) {
      angleDiff = 2 * Math.PI - angleDiff;
    }
    
    return angleDiff <= slash.width / 2;
  }

  onLevelUp() {
    switch(this.level) {
      case 2:
        this.damage *= 1.2;  // Reduced from 1.4
        break;
      case 3:
        this.directions = ['front', 'back'];
        break;
      case 4:
        this.slashRange = 80;
        this.damage *= 1.2;  // Reduced from 1.3
        break;
      case 5:
        this.directions = ['front', 'back', 'left', 'right'];
        break;
    }
  }
}