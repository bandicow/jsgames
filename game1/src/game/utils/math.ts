import { Vector2 } from '../types';

/**
 * Vector2 utility functions
 */
export const Vec2 = {
  /**
   * Create a new vector
   */
  create(x: number = 0, y: number = 0): Vector2 {
    return { x, y };
  },

  /**
   * Add two vectors
   */
  add(a: Vector2, b: Vector2): Vector2 {
    return { x: a.x + b.x, y: a.y + b.y };
  },

  /**
   * Subtract two vectors
   */
  subtract(a: Vector2, b: Vector2): Vector2 {
    return { x: a.x - b.x, y: a.y - b.y };
  },

  /**
   * Multiply vector by scalar
   */
  multiply(v: Vector2, scalar: number): Vector2 {
    return { x: v.x * scalar, y: v.y * scalar };
  },

  /**
   * Get vector magnitude
   */
  magnitude(v: Vector2): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  },

  /**
   * Get squared magnitude (faster, no sqrt)
   */
  magnitudeSq(v: Vector2): number {
    return v.x * v.x + v.y * v.y;
  },

  /**
   * Normalize vector
   */
  normalize(v: Vector2): Vector2 {
    const mag = Vec2.magnitude(v);
    if (mag === 0) return { x: 0, y: 0 };
    return { x: v.x / mag, y: v.y / mag };
  },

  /**
   * Get distance between two points
   */
  distance(a: Vector2, b: Vector2): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Get squared distance (faster, no sqrt)
   */
  distanceSq(a: Vector2, b: Vector2): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return dx * dx + dy * dy;
  },

  /**
   * Lerp between two vectors
   */
  lerp(a: Vector2, b: Vector2, t: number): Vector2 {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
    };
  },

  /**
   * Rotate vector by angle (radians)
   */
  rotate(v: Vector2, angle: number): Vector2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: v.x * cos - v.y * sin,
      y: v.x * sin + v.y * cos,
    };
  },

  /**
   * Get angle between two vectors
   */
  angle(a: Vector2, b: Vector2): number {
    return Math.atan2(b.y - a.y, b.x - a.x);
  },

  /**
   * Clamp vector magnitude
   */
  clampMagnitude(v: Vector2, maxMagnitude: number): Vector2 {
    const mag = Vec2.magnitude(v);
    if (mag <= maxMagnitude) return v;
    return Vec2.multiply(Vec2.normalize(v), maxMagnitude);
  },

  /**
   * Clone vector
   */
  clone(v: Vector2): Vector2 {
    return { x: v.x, y: v.y };
  },

  /**
   * Check if two vectors are equal
   */
  equals(a: Vector2, b: Vector2, epsilon: number = 0.0001): boolean {
    return Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon;
  },
};

/**
 * Math utility functions
 */
export const MathUtils = {
  /**
   * Clamp a value between min and max
   */
  clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  },

  /**
   * Linear interpolation
   */
  lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  },

  /**
   * Random float between min and max
   */
  randomRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  },

  /**
   * Random integer between min and max (inclusive)
   */
  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Convert degrees to radians
   */
  degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  /**
   * Convert radians to degrees
   */
  radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  },

  /**
   * Check if circles are colliding
   */
  circleCollision(
    pos1: Vector2,
    radius1: number,
    pos2: Vector2,
    radius2: number
  ): boolean {
    const distSq = Vec2.distanceSq(pos1, pos2);
    const radiusSum = radius1 + radius2;
    return distSq <= radiusSum * radiusSum;
  },

  /**
   * Get random point on circle
   */
  randomPointOnCircle(center: Vector2, radius: number): Vector2 {
    const angle = Math.random() * Math.PI * 2;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    };
  },

  /**
   * Get random point in circle
   */
  randomPointInCircle(center: Vector2, radius: number): Vector2 {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * radius;
    return {
      x: center.x + Math.cos(angle) * r,
      y: center.y + Math.sin(angle) * r,
    };
  },

  /**
   * Smooth step interpolation
   */
  smoothStep(edge0: number, edge1: number, x: number): number {
    const t = MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  },

  /**
   * Generate UUID
   */
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
};