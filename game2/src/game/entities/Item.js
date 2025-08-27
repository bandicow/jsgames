// Item class for pickups

import { EXP_ORBS, AUXILIARY_ITEMS } from '../../utils/constants';
import { randomElement } from '../../utils/helpers';

export default class Item {
  constructor(x, y, type, value = null) {
    this.x = x;
    this.y = y;
    this.type = type; // 'exp', 'chest', 'heal', 'magnet', 'powerUp', 'coin', 'freeze', 'shield'
    this.value = value;
    this.radius = 10;
    this.collected = false;
    this.lifetime = -1; // -1 means infinite lifetime
    this.magnetSpeed = 8;
    this.isBeingMagnetized = false;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.glowIntensity = 0;
    this.glowDirection = 1;
    
    // Set properties based on type
    this.setupProperties();
  }

  setupProperties() {
    if (this.type === 'exp') {
      // Find matching exp orb type
      const orbType = EXP_ORBS.TYPES.find(orb => orb.value === this.value) || EXP_ORBS.TYPES[0];
      this.color = orbType.color;
      this.radius = orbType.radius;
      this.glowColor = this.color;
    } else if (this.type === 'chest') {
      this.radius = 15;
      this.color = '#8B4513';
      this.hp = 1; // Needs to be hit to open
      this.isOpen = false;
    } else {
      // Auxiliary items
      switch(this.type) {
        case 'heal':
          this.color = '#FF69B4';
          this.radius = 12;
          this.symbol = '❤';
          break;
        case 'magnet':
          this.color = '#B22222';
          this.radius = 12;
          this.symbol = '🧲';
          break;
        case 'powerUp':
          this.color = '#FFD700';
          this.radius = 12;
          this.symbol = '⚡';
          break;
        case 'coin':
          this.color = '#FFD700';
          this.radius = 8;
          this.symbol = '$';
          this.value = 100; // Score value
          break;
        case 'freeze':
          this.color = '#87CEEB';
          this.radius = 12;
          this.symbol = '❄';
          break;
        case 'shield':
          this.color = '#00CED1';
          this.radius = 12;
          this.symbol = '🛡';
          break;
        default:
          this.color = '#FFFFFF';
          this.radius = 10;
      }
    }
  }

  update(deltaTime, player, magnetActive = false) {
    if (this.collected) return;
    
    // Lifetime countdown
    if (this.lifetime > 0) {
      this.lifetime -= deltaTime;
      if (this.lifetime <= 0) {
        this.collected = true;
        return;
      }
    }
    
    // Glow effect
    this.glowIntensity += this.glowDirection * deltaTime * 0.002;
    if (this.glowIntensity >= 1) {
      this.glowIntensity = 1;
      this.glowDirection = -1;
    } else if (this.glowIntensity <= 0) {
      this.glowIntensity = 0;
      this.glowDirection = 1;
    }
    
    // Magnetization towards player (not for chests)
    if (player && !player.isDead && this.type !== 'chest') {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const pickupRange = player.getPickupRange();
      
      // Check if within magnetization range or if magnet item is active
      const shouldMagnetize = magnetActive || distance < pickupRange + EXP_ORBS.MAGNET_RANGE;
      
      if (shouldMagnetize) {
        this.isBeingMagnetized = true;
        
        // Move towards player with acceleration
        const speed = this.magnetSpeed * (1 - distance / (pickupRange + EXP_ORBS.MAGNET_RANGE));
        this.x += (dx / distance) * speed;
        this.y += (dy / distance) * speed;
      } else {
        this.isBeingMagnetized = false;
      }
      
      // Check collection
      if (distance < player.radius + this.radius) {
        this.collect(player);
      }
    }
  }

  draw(ctx) {
    if (this.collected) return;
    
    // Bobbing effect
    const bobAmount = Math.sin(Date.now() * 0.003 + this.bobOffset) * 2;
    const drawY = this.y + bobAmount;
    
    // Draw glow/shadow
    if (this.type === 'exp') {
      ctx.save();
      const gradient = ctx.createRadialGradient(this.x, drawY, 0, this.x, drawY, this.radius * 2);
      gradient.addColorStop(0, this.glowColor + '66');
      gradient.addColorStop(1, this.glowColor + '00');
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.5 + this.glowIntensity * 0.3;
      ctx.beginPath();
      ctx.arc(this.x, drawY, this.radius * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // Draw item
    ctx.save();
    
    if (this.type === 'chest') {
      // Draw chest
      ctx.fillStyle = this.isOpen ? '#D4AF37' : this.color;
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 2;
      
      // Chest body
      ctx.fillRect(this.x - this.radius, drawY - this.radius/2, this.radius * 2, this.radius);
      ctx.strokeRect(this.x - this.radius, drawY - this.radius/2, this.radius * 2, this.radius);
      
      // Chest lid
      if (!this.isOpen) {
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.arc(this.x, drawY - this.radius/2, this.radius, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Lock
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, drawY - this.radius/2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.type === 'exp') {
      // Draw exp orb
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.x, drawY, this.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(this.x - this.radius * 0.3, drawY - this.radius * 0.3, this.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Draw auxiliary items
      // Background circle
      ctx.fillStyle = this.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, drawY, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Symbol
      if (this.symbol) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${this.radius}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, this.x, drawY);
      }
    }
    
    ctx.restore();
  }

  collect(player) {
    if (this.collected) return;
    
    if (this.type === 'exp') {
      player.gainExp(this.value);
      player.score += Math.floor(this.value / 5);
    } else if (this.type === 'chest') {
      // Chests can't be collected directly - must be opened by weapons
      return;
    } else {
      // Use auxiliary item
      player.useItem(this);
      player.score += 10;
    }
    
    this.collected = true;
  }

  // Open chest (for when it's hit)
  openChest() {
    if (this.type !== 'chest' || this.isOpen) return null;
    
    this.isOpen = true;
    this.collected = true; // Mark as collected after opening
    
    // Return random item type to spawn
    const itemTypes = Object.values(AUXILIARY_ITEMS);
    return randomElement(itemTypes);
  }
  
  // Check if chest can be hit by weapons
  checkWeaponCollision(projectile) {
    if (this.type !== 'chest' || this.isOpen || this.collected) return false;
    
    const dx = projectile.x - this.x;
    const dy = projectile.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = projectile.radius || 5;
    
    return distance < radius + this.radius;
  }

  // Check if item can be collected
  canCollect(player) {
    if (this.collected) return false;
    
    if (this.type === 'chest' && !this.isOpen) {
      return false; // Chest needs to be opened first
    }
    
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < player.radius + this.radius;
  }
}