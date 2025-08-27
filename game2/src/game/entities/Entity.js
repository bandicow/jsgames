// Base Entity class for all game objects

export default class Entity {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.vx = 0; // Velocity X
    this.vy = 0; // Velocity Y
    this.hp = 100;
    this.maxHp = 100;
    this.isDead = false;
    this.isInvulnerable = false;
    this.invulnerabilityTime = 0;
  }

  // Update entity position and state
  update(deltaTime) {
    // Update position based on velocity
    this.x += this.vx;
    this.y += this.vy;
    
    // Update invulnerability
    if (this.invulnerabilityTime > 0) {
      this.invulnerabilityTime -= deltaTime;
      if (this.invulnerabilityTime <= 0) {
        this.isInvulnerable = false;
        this.invulnerabilityTime = 0;
      }
    }
  }

  // Draw entity on canvas
  draw(ctx) {
    ctx.save();
    
    // Flash effect when invulnerable
    if (this.isInvulnerable && Math.floor(Date.now() / 100) % 2) {
      ctx.globalAlpha = 0.5;
    }
    
    // Draw entity circle
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
  }

  // Take damage
  takeDamage(amount) {
    if (this.isInvulnerable || this.isDead) return false;
    
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDead = true;
      return true;
    }
    return false;
  }

  // Heal
  heal(amount) {
    if (this.isDead) return;
    
    this.hp = Math.min(this.hp + amount, this.maxHp);
  }

  // Set invulnerability
  setInvulnerable(duration) {
    this.isInvulnerable = true;
    this.invulnerabilityTime = duration;
  }

  // Check if entity is within bounds
  isInBounds(minX, minY, maxX, maxY) {
    return this.x >= minX && this.x <= maxX && 
           this.y >= minY && this.y <= maxY;
  }

  // Keep entity within bounds
  keepInBounds(minX, minY, maxX, maxY) {
    this.x = Math.max(minX + this.radius, Math.min(maxX - this.radius, this.x));
    this.y = Math.max(minY + this.radius, Math.min(maxY - this.radius, this.y));
  }

  // Get distance to another entity
  distanceTo(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Check collision with another entity
  collidesWith(other) {
    return this.distanceTo(other) < (this.radius + other.radius);
  }

  // Get angle to another entity
  angleTo(other) {
    return Math.atan2(other.y - this.y, other.x - this.x);
  }

  // Move towards a point
  moveTowards(targetX, targetY, speed) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      this.vx = (dx / distance) * speed;
      this.vy = (dy / distance) * speed;
    }
  }

  // Apply knockback
  applyKnockback(angle, force) {
    this.vx += Math.cos(angle) * force;
    this.vy += Math.sin(angle) * force;
  }
}