// Enemy class

import Entity from './Entity';
import { ENEMY_CONFIG, BOSS_CONFIG } from '../../utils/constants';
import { randomElement } from '../../utils/helpers';

export default class Enemy extends Entity {
  constructor(x, y, type = 'BASIC', isBoss = false, isMiniBoss = false) {
    // Get enemy config based on type
    let config;
    if (isBoss) {
      config = BOSS_CONFIG.STAGE_BOSSES[type] || BOSS_CONFIG.STAGE_BOSSES.FOREST;
    } else if (isMiniBoss) {
      config = BOSS_CONFIG.MINI_BOSS;
    } else {
      config = ENEMY_CONFIG.TYPES[type] || ENEMY_CONFIG.TYPES.BASIC;
    }
    
    super(x, y, config.radius, config.color);
    
    // Enemy properties
    this.type = type;
    this.isBoss = isBoss;
    this.isMiniBoss = isMiniBoss;
    
    // Stats from config
    this.maxHp = config.hp;
    this.hp = this.maxHp;
    this.speed = config.speed;
    this.damage = config.damage;
    this.expValue = config.exp;
    
    // Special properties for bosses
    if (isBoss || isMiniBoss) {
      this.auraColor = config.auraColor;
      this.auraRadius = config.auraRadius;
      
      // Boss attack pattern
      this.attackTimer = 0;
      this.attackCooldown = 2000; // 2 seconds between attacks
      this.projectiles = [];
    }
    
    // Visual variations for normal enemies
    if (!isBoss && !isMiniBoss) {
      this.visualType = this.getVisualType(type);
    }
    
    // Frozen state
    this.isFrozen = false;
    this.frozenTime = 0;
    
    // Poison state
    this.isPoisoned = false;
    this.poisonDamage = 0;
    this.poisonTime = 0;
    this.poisonTickTimer = 0;
    
    // Slowed state
    this.isSlowed = false;
    this.slowAmount = 0;
    this.slowTime = 0;
  }

  // Get visual type for enemy variety
  getVisualType(type) {
    const visualTypes = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond'];
    const typeIndex = Object.keys(ENEMY_CONFIG.TYPES).indexOf(type);
    return visualTypes[typeIndex % visualTypes.length];
  }

  // Update enemy
  update(deltaTime, player, gameEngine) {
    // Handle frozen state
    if (this.isFrozen) {
      this.frozenTime -= deltaTime;
      if (this.frozenTime <= 0) {
        this.isFrozen = false;
        this.frozenTime = 0;
      }
      return; // Don't move when frozen
    }
    
    // Handle slowed state
    let speedMultiplier = 1;
    if (this.isSlowed) {
      speedMultiplier = 1 - this.slowAmount;
      this.slowTime -= deltaTime;
      if (this.slowTime <= 0) {
        this.isSlowed = false;
        this.slowAmount = 0;
        this.slowTime = 0;
      }
    }
    
    // Handle poison state
    if (this.isPoisoned) {
      this.poisonTickTimer += deltaTime;
      if (this.poisonTickTimer >= 500) { // Tick every 0.5 seconds
        this.takeDamage(this.poisonDamage);
        this.poisonTickTimer = 0;
      }
      
      this.poisonTime -= deltaTime;
      if (this.poisonTime <= 0) {
        this.isPoisoned = false;
        this.poisonDamage = 0;
        this.poisonTime = 0;
        this.poisonTickTimer = 0;
      }
    }
    
    // Move towards player
    if (player && !player.isDead) {
      const angle = this.angleTo(player);
      const actualSpeed = this.speed * speedMultiplier;
      this.vx = Math.cos(angle) * actualSpeed;
      this.vy = Math.sin(angle) * actualSpeed;
      
      // Boss attacks
      if ((this.isBoss || this.isMiniBoss) && gameEngine) {
        this.attackTimer += deltaTime;
        if (this.attackTimer >= this.attackCooldown) {
          this.performAttack(player, gameEngine);
          this.attackTimer = 0;
        }
      }
    }
    
    // Update position
    super.update(deltaTime);
  }

  // Boss attack patterns
  performAttack(player, gameEngine) {
    if (this.isBoss) {
      // Circular bullet pattern
      const bulletCount = 8;
      const angleStep = (Math.PI * 2) / bulletCount;
      
      for (let i = 0; i < bulletCount; i++) {
        const angle = angleStep * i;
        const bullet = {
          x: this.x,
          y: this.y,
          vx: Math.cos(angle) * 2,
          vy: Math.sin(angle) * 2,
          radius: 5,
          damage: this.damage * 0.5,
          color: '#FF0000'
        };
        this.projectiles.push(bullet);
      }
    } else if (this.isMiniBoss) {
      // Aimed shot at player
      const angle = this.angleTo(player);
      const bullet = {
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * 3,
        vy: Math.sin(angle) * 3,
        radius: 8,
        damage: this.damage * 0.7,
        color: '#FF6600'
      };
      this.projectiles.push(bullet);
    }
  }

  // Draw enemy
  draw(ctx) {
    // Draw aura for bosses
    if (this.isBoss || this.isMiniBoss) {
      ctx.save();
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.auraRadius || this.radius * 2);
      gradient.addColorStop(0, this.auraColor || 'rgba(255, 0, 0, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.auraRadius || this.radius * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // Draw frozen effect
    if (this.isFrozen) {
      ctx.save();
      ctx.fillStyle = 'rgba(150, 200, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // Draw slowed effect
    if (this.isSlowed) {
      ctx.save();
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    
    // Draw poison effect
    if (this.isPoisoned) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // Draw enemy based on visual type
    ctx.save();
    
    // Flash effect when invulnerable
    if (this.isInvulnerable && Math.floor(Date.now() / 100) % 2) {
      ctx.globalAlpha = 0.5;
    }
    
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    if (this.isBoss || this.isMiniBoss) {
      // Draw stage-specific boss designs
      if (this.isBoss) {
        this.drawStageBoss(ctx);
      } else {
        // Draw hexagon for mini-bosses
        this.drawPolygon(ctx, this.x, this.y, this.radius, 6);
      }
    } else {
      // Draw based on visual type for normal enemies
      switch(this.visualType) {
        case 'square':
          ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
          ctx.strokeRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
          break;
        case 'triangle':
          this.drawTriangle(ctx, this.x, this.y, this.radius);
          break;
        case 'hexagon':
          this.drawPolygon(ctx, this.x, this.y, this.radius, 6);
          break;
        case 'star':
          this.drawStar(ctx, this.x, this.y, this.radius * 0.5, this.radius, 5);
          break;
        case 'diamond':
          this.drawDiamond(ctx, this.x, this.y, this.radius);
          break;
        default: // circle
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
      }
    }
    
    ctx.restore();
    
    // Draw HP bar for bosses
    if (this.isBoss || this.isMiniBoss) {
      this.drawHpBar(ctx);
    }
  }

  // Draw HP bar
  drawHpBar(ctx) {
    const barWidth = this.radius * 3;
    const barHeight = 6;
    const barY = this.y - this.radius - 15;
    
    ctx.save();
    
    // Background
    ctx.fillStyle = '#333333';
    ctx.fillRect(this.x - barWidth / 2, barY, barWidth, barHeight);
    
    // HP fill
    const hpPercent = this.hp / this.maxHp;
    ctx.fillStyle = hpPercent > 0.5 ? '#00FF00' : hpPercent > 0.25 ? '#FFFF00' : '#FF0000';
    ctx.fillRect(this.x - barWidth / 2, barY, barWidth * hpPercent, barHeight);
    
    // Border
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x - barWidth / 2, barY, barWidth, barHeight);
    
    ctx.restore();
  }

  // Shape drawing helpers
  drawTriangle(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size * 0.866, y + size * 0.5);
    ctx.lineTo(x + size * 0.866, y + size * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawPolygon(ctx, x, y, radius, sides) {
    const angle = (Math.PI * 2) / sides;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const px = x + radius * Math.cos(angle * i - Math.PI / 2);
      const py = y + radius * Math.sin(angle * i - Math.PI / 2);
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawStar(ctx, cx, cy, innerRadius, outerRadius, points) {
    const angle = Math.PI / points;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + radius * Math.cos(angle * i - Math.PI / 2);
      const y = cy + radius * Math.sin(angle * i - Math.PI / 2);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawDiamond(ctx, x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Draw stage-specific boss designs
  drawStageBoss(ctx) {
    switch(this.type) {
      case 'FOREST':
        // Forest Boss - Ancient Tree Spirit
        this.drawTreeBoss(ctx);
        break;
      case 'DESERT':
        // Desert Boss - Sand Golem
        this.drawSandBoss(ctx);
        break;
      case 'VOLCANO':
        // Volcano Boss - Lava Beast
        this.drawLavaBoss(ctx);
        break;
      case 'SNOW':
        // Snow Boss - Ice Titan
        this.drawIceBoss(ctx);
        break;
      case 'SPACE':
        // Space Boss - Cosmic Entity
        this.drawSpaceBoss(ctx);
        break;
      default:
        // Fallback to star shape
        this.drawStar(ctx, this.x, this.y, this.radius * 0.6, this.radius, 8);
    }
  }

  drawTreeBoss(ctx) {
    // Ancient Tree Spirit - multiple layered circles with branch-like protrusions
    ctx.save();
    
    // Main trunk body
    ctx.fillStyle = '#8B4513';  // Brown
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.radius * 0.8, this.radius, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Leafy crown
    ctx.fillStyle = '#228B22';  // Forest green
    ctx.beginPath();
    ctx.arc(this.x, this.y - this.radius * 0.4, this.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Branch arms
    const branches = 6;
    for (let i = 0; i < branches; i++) {
      const angle = (Math.PI * 2 / branches) * i;
      const branchLength = this.radius * 1.3;
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(
        this.x + Math.cos(angle) * branchLength,
        this.y + Math.sin(angle) * branchLength
      );
      ctx.stroke();
      
      // Small leaves at branch tips
      ctx.fillStyle = '#32CD32';
      ctx.beginPath();
      ctx.arc(
        this.x + Math.cos(angle) * branchLength,
        this.y + Math.sin(angle) * branchLength,
        4, 0, Math.PI * 2
      );
      ctx.fill();
    }
    
    ctx.restore();
  }

  drawSandBoss(ctx) {
    // Sand Golem - rocky, angular design
    ctx.save();
    
    // Main body - irregular polygon
    const sides = 8;
    ctx.fillStyle = '#D2B48C';  // Tan
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 / sides) * i;
      const radius = this.radius * (0.8 + Math.sin(i * 2) * 0.2); // Irregular
      if (i === 0) {
        ctx.moveTo(
          this.x + Math.cos(angle) * radius,
          this.y + Math.sin(angle) * radius
        );
      } else {
        ctx.lineTo(
          this.x + Math.cos(angle) * radius,
          this.y + Math.sin(angle) * radius
        );
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Sand swirls
    ctx.strokeStyle = '#CD853F';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const spiralAngle = (Date.now() * 0.001 + i * Math.PI * 0.7) % (Math.PI * 2);
      const spiralRadius = this.radius * (0.3 + i * 0.15);
      ctx.beginPath();
      ctx.arc(
        this.x + Math.cos(spiralAngle) * 10,
        this.y + Math.sin(spiralAngle) * 10,
        spiralRadius, 0, Math.PI * 2
      );
      ctx.stroke();
    }
    
    ctx.restore();
  }

  drawLavaBoss(ctx) {
    // Lava Beast - glowing, fiery design
    ctx.save();
    
    // Glowing core
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    gradient.addColorStop(0, '#FFFF00');  // Yellow core
    gradient.addColorStop(0.5, '#FF4500'); // Orange middle
    gradient.addColorStop(1, '#8B0000');   // Dark red edge
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Lava spikes
    const spikes = 12;
    for (let i = 0; i < spikes; i++) {
      const angle = (Math.PI * 2 / spikes) * i;
      const spikeLength = this.radius * (0.3 + Math.sin(Date.now() * 0.003 + i) * 0.2);
      
      ctx.fillStyle = '#FF6347';  // Tomato red
      ctx.beginPath();
      ctx.moveTo(
        this.x + Math.cos(angle) * this.radius,
        this.y + Math.sin(angle) * this.radius
      );
      ctx.lineTo(
        this.x + Math.cos(angle - 0.2) * (this.radius + spikeLength),
        this.y + Math.sin(angle - 0.2) * (this.radius + spikeLength)
      );
      ctx.lineTo(
        this.x + Math.cos(angle + 0.2) * (this.radius + spikeLength),
        this.y + Math.sin(angle + 0.2) * (this.radius + spikeLength)
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    
    ctx.restore();
  }

  drawIceBoss(ctx) {
    // Ice Titan - crystalline, angular design
    ctx.save();
    
    // Main crystal body
    ctx.fillStyle = '#B0E0E6';  // Powder blue
    ctx.strokeStyle = '#4682B4'; // Steel blue
    ctx.lineWidth = 3;
    
    // Draw hexagonal crystal
    this.drawPolygon(ctx, this.x, this.y, this.radius, 6);
    
    // Ice shards around the boss
    const shards = 8;
    for (let i = 0; i < shards; i++) {
      const angle = (Math.PI * 2 / shards) * i + Date.now() * 0.0005;
      const distance = this.radius * 1.4;
      const shardX = this.x + Math.cos(angle) * distance;
      const shardY = this.y + Math.sin(angle) * distance;
      
      ctx.fillStyle = '#87CEEB';  // Sky blue
      ctx.beginPath();
      // Diamond shard
      ctx.moveTo(shardX, shardY - 8);
      ctx.lineTo(shardX + 4, shardY);
      ctx.lineTo(shardX, shardY + 8);
      ctx.lineTo(shardX - 4, shardY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    
    // Frost effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  drawSpaceBoss(ctx) {
    // Cosmic Entity - otherworldly design
    ctx.save();
    
    // Pulsing cosmic core
    const pulseSize = this.radius * (0.9 + Math.sin(Date.now() * 0.005) * 0.1);
    
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, pulseSize);
    gradient.addColorStop(0, '#9932CC');  // Dark orchid
    gradient.addColorStop(0.5, '#4B0082'); // Indigo
    gradient.addColorStop(1, '#191970');   // Midnight blue
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Cosmic tentacles
    const tentacles = 10;
    for (let i = 0; i < tentacles; i++) {
      const angle = (Math.PI * 2 / tentacles) * i + Date.now() * 0.002;
      const waveOffset = Math.sin(Date.now() * 0.003 + i) * 0.5;
      
      ctx.strokeStyle = '#8A2BE2';  // Blue violet
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      
      // Curved tentacle
      for (let j = 1; j <= 5; j++) {
        const segmentAngle = angle + Math.sin(Date.now() * 0.004 + j) * 0.3;
        const segmentDistance = (this.radius * j * 0.3) + waveOffset * j;
        ctx.lineTo(
          this.x + Math.cos(segmentAngle) * segmentDistance,
          this.y + Math.sin(segmentAngle) * segmentDistance
        );
      }
      ctx.stroke();
    }
    
    // Cosmic particles
    for (let i = 0; i < 6; i++) {
      const particleAngle = Date.now() * 0.001 + i * Math.PI * 0.3;
      const particleDistance = this.radius * 0.7 + Math.sin(Date.now() * 0.002 + i) * 10;
      
      ctx.fillStyle = '#FFD700';  // Gold
      ctx.beginPath();
      ctx.arc(
        this.x + Math.cos(particleAngle) * particleDistance,
        this.y + Math.sin(particleAngle) * particleDistance,
        2, 0, Math.PI * 2
      );
      ctx.fill();
    }
    
    ctx.restore();
  }

  // Apply effects
  freeze(duration = 5000) {
    this.isFrozen = true;
    this.frozenTime = duration;
  }

  slow(amount, duration) {
    this.isSlowed = true;
    this.slowAmount = Math.min(0.9, amount); // Max 90% slow
    this.slowTime = duration;
  }

  poison(damagePerTick, duration) {
    this.isPoisoned = true;
    this.poisonDamage = damagePerTick;
    this.poisonTime = duration;
    this.poisonTickTimer = 0;
  }
}