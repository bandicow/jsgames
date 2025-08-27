// Lightning Weapon - Random enemy instant strikes

import Weapon from './Weapon';

export default class LightningWeapon extends Weapon {
  constructor() {
    super('lightning');
    this.cooldown = 1500;
    this.damage = 15;  // Reduced from 30
    this.strikeCount = 1;
    this.chainCount = 0;
    this.activeStrikes = [];
  }

  fire(player, enemies, gameEngine) {
    if (enemies.length === 0) return;

    // Create lightning strikes
    const targetsHit = new Set();
    
    for (let i = 0; i < this.strikeCount; i++) {
      // Find random enemy not already hit
      const availableEnemies = enemies.filter(e => !targetsHit.has(e));
      if (availableEnemies.length === 0) break;
      
      const target = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
      targetsHit.add(target);
      
      // Create strike effect
      const strike = {
        x: target.x,
        y: target.y,
        targetX: target.x,
        targetY: target.y,
        startY: target.y - 400,
        lifetime: 300,
        maxLifetime: 300,
        chains: [],
        damage: this.damage * player.getDamage() / 10
      };
      
      // Deal damage immediately
      target.takeDamage(strike.damage);
      
      // Chain lightning at higher levels
      if (this.chainCount > 0) {
        let currentTarget = target;
        for (let j = 0; j < this.chainCount; j++) {
          const nearbyEnemies = enemies.filter(e => {
            if (e === currentTarget || targetsHit.has(e)) return false;
            const dist = Math.sqrt(Math.pow(e.x - currentTarget.x, 2) + Math.pow(e.y - currentTarget.y, 2));
            return dist < 150;
          });
          
          if (nearbyEnemies.length === 0) break;
          
          const nextTarget = nearbyEnemies[Math.floor(Math.random() * nearbyEnemies.length)];
          strike.chains.push({
            fromX: currentTarget.x,
            fromY: currentTarget.y,
            toX: nextTarget.x,
            toY: nextTarget.y
          });
          
          nextTarget.takeDamage(strike.damage * 0.7);
          targetsHit.add(nextTarget);
          currentTarget = nextTarget;
        }
      }
      
      this.activeStrikes.push(strike);
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

    // Update active strikes
    for (let i = this.activeStrikes.length - 1; i >= 0; i--) {
      const strike = this.activeStrikes[i];
      strike.lifetime -= deltaTime;
      
      if (strike.lifetime <= 0) {
        this.activeStrikes.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    ctx.save();
    
    for (const strike of this.activeStrikes) {
      const alpha = strike.lifetime / strike.maxLifetime;
      
      // Draw main lightning bolt
      ctx.strokeStyle = `rgba(255, 255, 100, ${alpha})`;
      ctx.lineWidth = 4;
      ctx.shadowColor = '#FFFF00';
      ctx.shadowBlur = 20;
      
      // Create jagged lightning path
      ctx.beginPath();
      ctx.moveTo(strike.targetX, strike.startY);
      
      const segments = 8;
      for (let i = 0; i <= segments; i++) {
        const progress = i / segments;
        const y = strike.startY + (strike.targetY - strike.startY) * progress;
        const offset = (Math.random() - 0.5) * 30 * (1 - Math.abs(progress - 0.5) * 2);
        const x = strike.targetX + offset;
        ctx.lineTo(x, y);
      }
      
      ctx.stroke();
      
      // Draw thinner bright core
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw chain lightning
      if (strike.chains.length > 0) {
        ctx.strokeStyle = `rgba(100, 200, 255, ${alpha * 0.7})`;
        ctx.lineWidth = 2;
        
        for (const chain of strike.chains) {
          ctx.beginPath();
          ctx.moveTo(chain.fromX, chain.fromY);
          
          const segments = 4;
          for (let i = 0; i <= segments; i++) {
            const progress = i / segments;
            const x = chain.fromX + (chain.toX - chain.fromX) * progress;
            const y = chain.fromY + (chain.toY - chain.fromY) * progress;
            const offset = (Math.random() - 0.5) * 15;
            ctx.lineTo(x + offset, y + offset);
          }
          
          ctx.stroke();
        }
      }
      
      // Draw impact circle
      ctx.fillStyle = `rgba(255, 255, 100, ${alpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(strike.targetX, strike.targetY, 20 * (1 - alpha) + 10, 0, Math.PI * 2);
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
        this.cooldown *= 0.7; // More frequent strikes
        break;
      case 4:
        this.chainCount = 2; // Chain to 2 enemies
        break;
      case 5:
        this.strikeCount = 2; // Strike 2 enemies at once
        break;
    }
  }
}