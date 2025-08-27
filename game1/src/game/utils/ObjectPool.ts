/**
 * Generic object pool for performance optimization
 * Reduces garbage collection by reusing objects
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private activeObjects: Set<T> = new Set();
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    initialSize: number = 100,
    maxSize: number = 1000
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;

    // Pre-populate the pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }

  /**
   * Get an object from the pool
   */
  acquire(): T {
    let obj: T;

    if (this.pool.length > 0) {
      obj = this.pool.pop()!;
    } else if (this.activeObjects.size < this.maxSize) {
      obj = this.createFn();
    } else {
      // Pool is exhausted, forcibly reclaim the oldest active object
      const firstActive = this.activeObjects.values().next().value;
      this.activeObjects.delete(firstActive);
      this.resetFn(firstActive);
      obj = firstActive;
    }

    this.activeObjects.add(obj);
    return obj;
  }

  /**
   * Return an object to the pool
   */
  release(obj: T): void {
    if (!this.activeObjects.has(obj)) {
      return; // Object wasn't from this pool
    }

    this.activeObjects.delete(obj);
    this.resetFn(obj);

    if (this.pool.length < this.maxSize) {
      this.pool.push(obj);
    }
  }

  /**
   * Release multiple objects at once
   */
  releaseAll(objects: T[]): void {
    for (const obj of objects) {
      this.release(obj);
    }
  }

  /**
   * Clear all objects from the pool
   */
  clear(): void {
    this.pool = [];
    this.activeObjects.clear();
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      poolSize: this.pool.length,
      activeCount: this.activeObjects.size,
      totalCapacity: this.maxSize,
      utilizationRate: (this.activeObjects.size / this.maxSize) * 100,
    };
  }
}

/**
 * Factory functions for common game objects
 */
export const PoolFactories = {
  createEnemy: () => ({
    id: '',
    type: 'enemy' as const,
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    radius: 0,
    health: 0,
    maxHealth: 0,
    damage: 0,
    speed: 0,
    active: false,
    enemyType: 'basic' as const,
    xpValue: 0,
  }),

  resetEnemy: (enemy: any) => {
    enemy.id = '';
    enemy.position.x = 0;
    enemy.position.y = 0;
    enemy.velocity.x = 0;
    enemy.velocity.y = 0;
    enemy.health = 0;
    enemy.maxHealth = 0;
    enemy.active = false;
  },

  createProjectile: () => ({
    id: '',
    type: 'projectile' as const,
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    radius: 0,
    health: 1,
    maxHealth: 1,
    damage: 0,
    speed: 0,
    active: false,
    ownerId: '',
    direction: { x: 0, y: 0 },
    lifetime: 0,
    maxLifetime: 0,
    pierce: 0,
    weaponType: 'bullet' as const,
  }),

  resetProjectile: (projectile: any) => {
    projectile.id = '';
    projectile.position.x = 0;
    projectile.position.y = 0;
    projectile.velocity.x = 0;
    projectile.velocity.y = 0;
    projectile.lifetime = 0;
    projectile.active = false;
  },

  createXPOrb: () => ({
    id: '',
    type: 'xp_orb' as const,
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    radius: 0,
    health: 1,
    maxHealth: 1,
    damage: 0,
    speed: 0,
    active: false,
    value: 0,
    magnetRange: 0,
    isBeingCollected: false,
  }),

  resetXPOrb: (orb: any) => {
    orb.id = '';
    orb.position.x = 0;
    orb.position.y = 0;
    orb.velocity.x = 0;
    orb.velocity.y = 0;
    orb.active = false;
    orb.isBeingCollected = false;
  },
};