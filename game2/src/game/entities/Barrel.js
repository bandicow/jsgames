// Barrel class - destructible container that drops auxiliary items

import { AUXILIARY_ITEMS } from '../../utils/constants';
import { randomElement } from '../../utils/helpers';

export default class Barrel {
  constructor(x, y, stage = 'FOREST') {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.hp = 3; // Takes 3 hits to break
    this.maxHp = 3;
    this.stage = stage;
    this.isDestroyed = false;
    this.hitFlash = 0;
    
    // Visual properties based on stage
    this.setupVisuals();
  }
  
  setupVisuals() {
    switch(this.stage) {
      case 'FOREST':
        this.color = '#8B4513'; // Brown for wooden barrel
        this.borderColor = '#654321';
        break;
      case 'DESERT':
        this.color = '#D2691E'; // Sandy color for clay pot
        this.borderColor = '#A0522D';
        break;
      case 'VOLCANO':
        this.color = '#8B0000'; // Dark red for lava rock container
        this.borderColor = '#660000';
        break;
      case 'SNOW':
        this.color = '#87CEEB'; // Light blue for ice chest
        this.borderColor = '#4682B4';
        break;
      case 'SPACE':
        this.color = '#4B0082'; // Indigo for alien container
        this.borderColor = '#8A2BE2';
        break;
      default:
        this.color = '#8B4513';
        this.borderColor = '#654321';
    }
  }
  
  takeDamage(damage = 1) {
    if (this.isDestroyed) return null;
    
    this.hp -= damage;
    this.hitFlash = 100; // Flash white when hit
    
    if (this.hp <= 0) {
      this.isDestroyed = true;
      // Return random auxiliary item type
      const itemTypes = Object.values(AUXILIARY_ITEMS);
      return randomElement(itemTypes);
    }
    
    return null;
  }
  
  update(deltaTime) {
    // Update hit flash
    if (this.hitFlash > 0) {
      this.hitFlash -= deltaTime;
    }
  }
  
  draw(ctx) {
    if (this.isDestroyed) return;
    
    ctx.save();
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.radius + 5, this.radius * 0.8, this.radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Flash effect when hit
    if (this.hitFlash > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (this.hitFlash / 100) * 0.5 + ')';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw barrel/container
    if (this.stage === 'FOREST' || this.stage === 'DESERT') {
      // Circular barrel/pot
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = this.borderColor;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw bands for barrel or pattern for pot
      if (this.stage === 'FOREST') {
        // Wooden barrel bands
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.radius * 0.5, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.x, this.y + this.radius * 0.5, this.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      // Square/crystalline containers
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
      
      ctx.strokeStyle = this.borderColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
    }
    
    // Draw HP indicator
    if (this.hp < this.maxHp) {
      const hpPercent = this.hp / this.maxHp;
      ctx.fillStyle = '#333';
      ctx.fillRect(this.x - this.radius, this.y - this.radius - 10, this.radius * 2, 4);
      ctx.fillStyle = hpPercent > 0.5 ? '#00FF00' : '#FF0000';
      ctx.fillRect(this.x - this.radius, this.y - this.radius - 10, this.radius * 2 * hpPercent, 4);
    }
    
    ctx.restore();
  }
  
  // Check collision with projectile
  checkCollision(projectile) {
    const dx = projectile.x - this.x;
    const dy = projectile.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = projectile.radius || 5;
    
    return distance < radius + this.radius;
  }
  
  // Check if within slash range
  isInSlashRange(slash) {
    const dx = this.x - slash.x;
    const dy = this.y - slash.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > slash.range + this.radius) return false;
    
    // Check angle
    const angleToBarrel = Math.atan2(dy, dx);
    let angleDiff = Math.abs(angleToBarrel - slash.angle);
    
    // Normalize angle difference
    if (angleDiff > Math.PI) {
      angleDiff = 2 * Math.PI - angleDiff;
    }
    
    return angleDiff <= slash.width / 2;
  }
}