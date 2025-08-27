// Helper utility functions

// Calculate distance between two points
export function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Check collision between two circles
export function checkCircleCollision(obj1, obj2) {
  const dist = distance(obj1.x, obj1.y, obj2.x, obj2.y);
  return dist < (obj1.radius + obj2.radius);
}

// Get random number between min and max
export function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Get random integer between min and max (inclusive)
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get angle between two points in radians
export function angle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

// Normalize a vector
export function normalize(x, y) {
  const length = Math.sqrt(x * x + y * y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: x / length, y: y / length };
}

// Clamp a value between min and max
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Linear interpolation
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

// Format time in MM:SS
export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Get random element from array
export function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Shuffle array (Fisher-Yates)
export function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get random position on canvas edge
export function getRandomEdgePosition(width, height, margin = 50) {
  const edge = randomInt(0, 3);
  let x, y;
  
  switch(edge) {
    case 0: // Top
      x = random(0, width);
      y = -margin;
      break;
    case 1: // Right
      x = width + margin;
      y = random(0, height);
      break;
    case 2: // Bottom
      x = random(0, width);
      y = height + margin;
      break;
    case 3: // Left
      x = -margin;
      y = random(0, height);
      break;
    default:
      x = 0;
      y = 0;
  }
  
  return { x, y };
}

// Draw text with outline
export function drawTextWithOutline(ctx, text, x, y, fontSize = 16, color = '#FFFFFF', outlineColor = '#000000') {
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw outline
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = 3;
  ctx.strokeText(text, x, y);
  
  // Draw fill
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

// Create particle effect
export function createParticle(x, y, color, velocity = null) {
  return {
    x,
    y,
    vx: velocity ? velocity.x : random(-2, 2),
    vy: velocity ? velocity.y : random(-2, 2),
    radius: random(2, 5),
    color,
    alpha: 1,
    lifetime: 30
  };
}

// Update particle
export function updateParticle(particle) {
  particle.x += particle.vx;
  particle.y += particle.vy;
  particle.lifetime--;
  particle.alpha = particle.lifetime / 30;
  return particle.lifetime > 0;
}

// Draw particle
export function drawParticle(ctx, particle) {
  ctx.save();
  ctx.globalAlpha = particle.alpha;
  ctx.fillStyle = particle.color;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Object pool for performance
export class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.active = [];
    
    // Initialize pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }
  
  get() {
    let obj;
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.createFn();
    }
    this.active.push(obj);
    return obj;
  }
  
  release(obj) {
    const index = this.active.indexOf(obj);
    if (index !== -1) {
      this.active.splice(index, 1);
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
  
  releaseAll() {
    while (this.active.length > 0) {
      const obj = this.active.pop();
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
}