// Player class

import Entity from './Entity';
import { PLAYER_CONFIG } from '../../utils/constants';

export default class Player extends Entity {
  constructor(x, y) {
    super(x, y, PLAYER_CONFIG.RADIUS, PLAYER_CONFIG.COLOR);
    
    // Player stats
    this.maxHp = PLAYER_CONFIG.BASE_HP;
    this.hp = this.maxHp;
    this.speed = PLAYER_CONFIG.BASE_SPEED;
    this.damage = PLAYER_CONFIG.BASE_DAMAGE;
    
    // Experience and level
    this.level = 1;
    this.exp = 0;
    this.expToNext = 250;  // Start with 250 exp requirement for slower leveling
    
    // Score
    this.score = 0;
    
    // Movement
    this.moveDirection = { x: 0, y: 0 };
    this.facingDirection = { x: 1, y: 0 }; // Default facing right
    
    // Stats multipliers from passives
    this.stats = {
      hpMultiplier: 1,
      hpRegen: 0,
      speedMultiplier: 1,
      damageMultiplier: 1,
      cooldownMultiplier: 1,
      expMultiplier: 1,
      pickupRangeMultiplier: 1,
      weaponSizeMultiplier: 1,
      damageReduction: 0,
      extraWeaponCount: 0
    };
    
    // Weapons array (can hold multiple weapons)
    this.weapons = [];
    this.maxWeapons = 6;
    
    // Passives array
    this.passives = [];
    
    // Shield
    this.shield = 0;
    
    // Level up flag
    this.levelUpPending = false;
    
    // Power-up state
    this.isPoweredUp = false;
    this.powerUpTime = 0;
    
    // Pickup range
    this.pickupRange = PLAYER_CONFIG.INITIAL_PICKUP_RANGE || 75;
    
    // HP regeneration timer
    this.hpRegenTimer = 0;
    
    // Input keys state
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false
    };
  }

  // Update player
  update(deltaTime) {
    // Handle movement
    this.handleMovement();
    
    // Update position
    super.update(deltaTime);
    
    // HP regeneration
    if (this.stats.hpRegen > 0) {
      this.hpRegenTimer += deltaTime;
      if (this.hpRegenTimer >= 1000) { // Every second
        this.heal(this.stats.hpRegen);
        this.hpRegenTimer = 0;
      }
    }
    
    // Update power-up
    if (this.isPoweredUp) {
      this.powerUpTime -= deltaTime;
      if (this.powerUpTime <= 0) {
        this.isPoweredUp = false;
        this.powerUpTime = 0;
      }
    }
    
    // Weapons are updated in GameEngine with proper parameters
  }

  // Handle keyboard movement
  handleMovement() {
    // Calculate movement direction
    this.moveDirection.x = 0;
    this.moveDirection.y = 0;
    
    if (this.keys.w) this.moveDirection.y = -1;
    if (this.keys.s) this.moveDirection.y = 1;
    if (this.keys.a) this.moveDirection.x = -1;
    if (this.keys.d) this.moveDirection.x = 1;
    
    // Normalize diagonal movement
    const length = Math.sqrt(
      this.moveDirection.x * this.moveDirection.x + 
      this.moveDirection.y * this.moveDirection.y
    );
    
    if (length > 0) {
      this.moveDirection.x /= length;
      this.moveDirection.y /= length;
      
      // Update facing direction
      this.facingDirection.x = this.moveDirection.x;
      this.facingDirection.y = this.moveDirection.y;
    }
    
    // Apply movement with speed multiplier
    const actualSpeed = this.speed * this.stats.speedMultiplier;
    this.vx = this.moveDirection.x * actualSpeed;
    this.vy = this.moveDirection.y * actualSpeed;
  }

  // Draw player and effects
  draw(ctx) {
    // Draw pickup range (debug/visual)
    if (false) { // Set to true to see pickup range
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.getPickupRange(), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    
    // Draw shield
    if (this.shield > 0) {
      ctx.save();
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    
    // Draw power-up effect
    if (this.isPoweredUp) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // Draw player character
    this.drawPlayerCharacter(ctx);
    
    // Draw level indicator
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Lv${this.level}`, this.x, this.y);
    ctx.restore();
  }

  drawPlayerCharacter(ctx) {
    ctx.save();
    
    // Flash effect when invulnerable
    if (this.isInvulnerable && Math.floor(Date.now() / 100) % 2) {
      ctx.globalAlpha = 0.5;
    }
    
    // Character body (main circle)
    ctx.fillStyle = '#4A90E2';  // Blue body
    ctx.strokeStyle = '#2F5F8F';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Character head (smaller circle on top)
    ctx.fillStyle = '#FFD6A5';  // Skin tone
    ctx.strokeStyle = '#C89A5F';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.radius * 0.6, this.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(this.x - 2, this.y - this.radius * 0.6 - 1, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x + 2, this.y - this.radius * 0.6 - 1, 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Arms
    ctx.strokeStyle = '#FFD6A5';  // Skin tone
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x - this.radius * 0.8, this.y - this.radius * 0.2);
    ctx.lineTo(this.x - this.radius * 1.2, this.y + this.radius * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.x + this.radius * 0.8, this.y - this.radius * 0.2);
    ctx.lineTo(this.x + this.radius * 1.2, this.y + this.radius * 0.1);
    ctx.stroke();
    
    // Legs
    ctx.strokeStyle = '#2F5F8F';  // Darker blue for legs
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.x - this.radius * 0.4, this.y + this.radius);
    ctx.lineTo(this.x - this.radius * 0.4, this.y + this.radius * 1.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.x + this.radius * 0.4, this.y + this.radius);
    ctx.lineTo(this.x + this.radius * 0.4, this.y + this.radius * 1.4);
    ctx.stroke();
    
    // Equipment indicator (based on weapons)
    if (this.weapons.length > 0) {
      // Draw weapon indicator on shoulder
      ctx.fillStyle = '#FF6347';
      ctx.beginPath();
      ctx.arc(this.x + this.radius * 0.6, this.y - this.radius * 0.3, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Movement direction indicator (small arrow)
    if (this.moveDirection.x !== 0 || this.moveDirection.y !== 0) {
      const angle = Math.atan2(this.moveDirection.y, this.moveDirection.x);
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x + Math.cos(angle) * (this.radius + 5), 
                 this.y + Math.sin(angle) * (this.radius + 5));
      ctx.lineTo(this.x + Math.cos(angle) * (this.radius + 10), 
                 this.y + Math.sin(angle) * (this.radius + 10));
      ctx.stroke();
    }
    
    ctx.restore();
  }

  // Take damage (with shield and damage reduction)
  takeDamage(amount) {
    if (this.isInvulnerable || this.isDead) return false;
    
    // Check shield first
    if (this.shield > 0) {
      this.shield--;
      this.setInvulnerable(500); // Brief invulnerability after shield hit
      return false;
    }
    
    // Apply damage reduction
    const actualDamage = Math.max(1, amount * (1 - this.stats.damageReduction));
    
    // Take damage
    const died = super.takeDamage(actualDamage);
    
    if (!died) {
      this.setInvulnerable(PLAYER_CONFIG.INVULNERABILITY_TIME);
    }
    
    return died;
  }

  // Gain experience
  gainExp(amount) {
    this.exp += amount * this.stats.expMultiplier;
    
    // Check for level up
    while (this.exp >= this.expToNext) {
      this.exp -= this.expToNext;
      this.levelUp();
    }
  }

  // Level up
  levelUp() {
    this.level++;
    this.expToNext = Math.floor(100 * Math.pow(1.3, this.level - 1));  // Gentler exp curve
    
    // Small heal on level up
    this.heal(this.maxHp * 0.1);
    
    // Set flag for game engine to show level up screen
    this.levelUpPending = true;
    
    return true; // Signal that level up occurred
  }
  
  // Clear level up pending flag
  clearLevelUpPending() {
    this.levelUpPending = false;
  }

  // Add weapon
  addWeapon(weapon) {
    // Check if weapon type already exists
    const existingWeapon = this.weapons.find(w => w.type === weapon.type);
    
    if (existingWeapon) {
      // Level up existing weapon
      existingWeapon.levelUp();
      return false; // Didn't add new weapon
    } else if (this.weapons.length < this.maxWeapons + this.stats.extraWeaponCount) {
      // Add new weapon
      this.weapons.push(weapon);
      return true; // Added new weapon
    }
    
    return false; // Couldn't add weapon
  }

  // Add passive
  addPassive(passive) {
    this.passives.push(passive);
    this.applyPassive(passive);
  }

  // Apply passive effect
  applyPassive(passive) {
    switch(passive.type) {
      case 'maxHp':
        this.stats.hpMultiplier += 0.2;
        this.maxHp = PLAYER_CONFIG.BASE_HP * this.stats.hpMultiplier;
        this.hp = Math.min(this.hp + 20, this.maxHp); // Heal a bit on upgrade
        break;
      case 'hpRegen':
        this.stats.hpRegen += 1;
        break;
      case 'speed':
        this.stats.speedMultiplier += 0.2;
        break;
      case 'damage':
        this.stats.damageMultiplier += 0.25;
        break;
      case 'cooldown':
        this.stats.cooldownMultiplier *= 0.8;
        break;
      case 'expGain':
        this.stats.expMultiplier += 0.3;
        break;
      case 'pickupRange':
        this.stats.pickupRangeMultiplier += 0.5;
        break;
      case 'weaponSize':
        this.stats.weaponSizeMultiplier += 0.3;
        break;
      case 'damageReduction':
        this.stats.damageReduction = Math.min(0.8, this.stats.damageReduction + 0.2);
        break;
      case 'weaponCount':
        this.stats.extraWeaponCount = Math.min(2, this.stats.extraWeaponCount + 1);
        break;
    }
  }

  // Use auxiliary item
  useItem(item) {
    switch(item.type) {
      case 'heal':
        this.heal(this.maxHp * 0.5);
        break;
      case 'shield':
        this.shield = Math.max(this.shield, 1); // Max 1 shield
        break;
      case 'powerUp':
        this.isPoweredUp = true;
        this.powerUpTime = 10000; // 10 seconds
        break;
      case 'coin':
        this.score += 100;
        break;
      // Magnet and freeze are handled by game engine
    }
  }

  // Get actual pickup range
  getPickupRange() {
    return this.pickupRange * this.stats.pickupRangeMultiplier;
  }

  // Get actual damage
  getDamage() {
    const multiplier = this.isPoweredUp ? 2 : 1;
    return this.damage * this.stats.damageMultiplier * multiplier;
  }

  // Get actual cooldown
  getCooldown(baseCooldown) {
    const multiplier = this.isPoweredUp ? 0.5 : 1;
    return baseCooldown * this.stats.cooldownMultiplier * multiplier;
  }

  // Set key state
  setKey(key, pressed) {
    if (this.keys.hasOwnProperty(key)) {
      this.keys[key] = pressed;
    }
  }
}