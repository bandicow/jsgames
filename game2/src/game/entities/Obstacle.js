// Obstacle class - environmental obstacles that block movement

export default class Obstacle {
  constructor(x, y, type, stage = 'FOREST') {
    this.x = x;
    this.y = y;
    this.type = type; // 'tree', 'rock', 'lava', 'ice', 'asteroid'
    this.stage = stage;
    this.radius = 25;
    this.hp = 5; // Can be destroyed by attacks
    this.maxHp = 5;
    this.isDestroyed = false;
    this.hitFlash = 0;
    this.blockMovement = true;
    
    // Visual properties
    this.setupVisuals();
  }
  
  setupVisuals() {
    switch(this.stage) {
      case 'FOREST':
        // Trees - brighter green for better visibility
        this.type = 'tree';
        this.color = '#32CD32';  // LimeGreen for better visibility
        this.trunkColor = '#8B4513';
        this.radius = 30;
        break;
      case 'DESERT':
        // Rock formations - more contrasted color
        this.type = 'rock';
        this.color = '#D2B48C';  // Tan - brighter than before
        this.radius = 35;
        break;
      case 'VOLCANO':
        // Lava pools (doesn't block but damages) - brighter red
        this.type = 'lava';
        this.color = '#FF6347';  // Tomato red for better visibility
        this.radius = 40;
        this.blockMovement = false;
        this.damagePerSecond = 10;
        break;
      case 'SNOW':
        // Ice blocks - much more visible blue
        this.type = 'ice';
        this.color = '#87CEEB';  // SkyBlue but will add dark border
        this.radius = 30;
        break;
      case 'SPACE':
        // Asteroids - lighter gray for better contrast
        this.type = 'asteroid';
        this.color = '#A9A9A9';  // DarkGray - lighter than before
        this.radius = 35;
        break;
      default:
        this.type = 'tree';
        this.color = '#32CD32';
        this.trunkColor = '#8B4513';
    }
  }
  
  takeDamage(damage) {
    if (this.isDestroyed) return;
    
    this.hp -= damage;
    this.hitFlash = 100;
    
    if (this.hp <= 0) {
      this.isDestroyed = true;
    }
  }
  
  update(deltaTime) {
    // Update hit flash
    if (this.hitFlash > 0) {
      this.hitFlash -= deltaTime;
    }
    
    // Lava animation
    if (this.type === 'lava') {
      this.bubbleAnimation = (this.bubbleAnimation || 0) + deltaTime * 0.001;
    }
  }
  
  draw(ctx) {
    if (this.isDestroyed) return;
    
    ctx.save();
    
    // Draw shadow - darker and more prominent
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.radius, this.radius * 0.8, this.radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Flash effect when hit
    if (this.hitFlash > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (this.hitFlash / 100) * 0.5 + ')';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw based on type
    switch(this.type) {
      case 'tree':
        // Draw trunk
        ctx.fillStyle = this.trunkColor;
        ctx.fillRect(this.x - 8, this.y - 10, 16, 30);
        
        // Draw leaves
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y - 15, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add dark outline for visibility
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw lighter leaves
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(this.x - 10, this.y - 20, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Outline for lighter leaves
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 2;
        ctx.stroke();
        break;
        
      case 'rock':
        // Draw jagged rock
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x - this.radius, this.y + this.radius * 0.5);
        ctx.lineTo(this.x - this.radius * 0.6, this.y - this.radius * 0.7);
        ctx.lineTo(this.x - this.radius * 0.2, this.y - this.radius);
        ctx.lineTo(this.x + this.radius * 0.3, this.y - this.radius * 0.8);
        ctx.lineTo(this.x + this.radius * 0.8, this.y - this.radius * 0.3);
        ctx.lineTo(this.x + this.radius, this.y + this.radius * 0.5);
        ctx.closePath();
        ctx.fill();
        
        // Rock texture - darker outline for visibility
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 4;
        ctx.stroke();
        break;
        
      case 'lava':
        // Animated lava pool
        const time = this.bubbleAnimation || 0;
        
        // Base lava
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Lava glow
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, '#FFFF00');
        gradient.addColorStop(0.5, '#FF8C00');
        gradient.addColorStop(1, '#FF4500');
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.9, 0, Math.PI * 2);
        ctx.fill();
        
        // Bubbles
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#FFFF00';
        for (let i = 0; i < 3; i++) {
          const bubbleX = this.x + Math.sin(time * 2 + i * 2) * this.radius * 0.6;
          const bubbleY = this.y + Math.cos(time * 3 + i * 2) * this.radius * 0.6;
          const bubbleSize = 3 + Math.sin(time * 5 + i) * 2;
          ctx.beginPath();
          ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
        
      case 'ice':
        // Ice block
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        
        // Ice shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(this.x - this.radius, this.y - this.radius);
        ctx.lineTo(this.x, this.y - this.radius);
        ctx.lineTo(this.x - this.radius, this.y);
        ctx.closePath();
        ctx.fill();
        
        // Ice border - thicker and darker for visibility
        ctx.strokeStyle = '#191970';  // MidnightBlue for strong contrast
        ctx.lineWidth = 4;
        ctx.strokeRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        break;
        
      case 'asteroid':
        // Space rock
        ctx.fillStyle = this.color;
        ctx.beginPath();
        // Irregular shape
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 / 8) * i;
          const radiusVariation = this.radius * (0.8 + Math.sin(i * 1.5) * 0.2);
          if (i === 0) {
            ctx.moveTo(
              this.x + Math.cos(angle) * radiusVariation,
              this.y + Math.sin(angle) * radiusVariation
            );
          } else {
            ctx.lineTo(
              this.x + Math.cos(angle) * radiusVariation,
              this.y + Math.sin(angle) * radiusVariation
            );
          }
        }
        ctx.closePath();
        ctx.fill();
        
        // Add dark outline for visibility
        ctx.strokeStyle = '#2F2F2F';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Crater details
        ctx.fillStyle = '#505050';
        ctx.beginPath();
        ctx.arc(this.x - 5, this.y - 5, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y + 3, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    
    // Draw HP bar if damaged
    if (this.hp < this.maxHp && this.blockMovement) {
      const hpPercent = this.hp / this.maxHp;
      ctx.fillStyle = '#333';
      ctx.fillRect(this.x - this.radius, this.y - this.radius - 15, this.radius * 2, 4);
      ctx.fillStyle = hpPercent > 0.5 ? '#00FF00' : '#FF0000';
      ctx.fillRect(this.x - this.radius, this.y - this.radius - 15, this.radius * 2 * hpPercent, 4);
    }
    
    ctx.restore();
  }
  
  // Check collision with entity
  checkCollision(entity) {
    const dx = entity.x - this.x;
    const dy = entity.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < entity.radius + this.radius;
  }
  
  // Check if projectile hits obstacle
  checkProjectileCollision(projectile) {
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
    const angleToObstacle = Math.atan2(dy, dx);
    let angleDiff = Math.abs(angleToObstacle - slash.angle);
    
    // Normalize angle difference
    if (angleDiff > Math.PI) {
      angleDiff = 2 * Math.PI - angleDiff;
    }
    
    return angleDiff <= slash.width / 2;
  }
}