// Game Types
export interface Vector2 {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  active: boolean;
  sprite?: string;
}

export type EntityType = 'player' | 'enemy' | 'projectile' | 'xp_orb' | 'effect';

export interface Player extends Entity {
  level: number;
  experience: number;
  experienceToNext: number;
  weapons: Weapon[];
  upgrades: Upgrade[];
  moveSpeed: number;
  pickupRadius: number;
}

export interface Enemy extends Entity {
  enemyType: EnemyType;
  xpValue: number;
  target?: Vector2;
}

export enum EnemyType {
  BASIC = 'basic',
  FAST = 'fast',
  TANK = 'tank',
  BOSS = 'boss'
}

export interface Projectile extends Entity {
  ownerId: string;
  direction: Vector2;
  lifetime: number;
  maxLifetime: number;
  pierce: number;
  weaponType: WeaponType;
}

export interface XPOrb extends Entity {
  value: number;
  magnetRange: number;
  isBeingCollected: boolean;
}

export interface Weapon {
  type: WeaponType;
  level: number;
  damage: number;
  fireRate: number;
  projectileSpeed: number;
  projectileCount: number;
  pierce: number;
  area: number;
  lastFired: number;
}

export enum WeaponType {
  BULLET = 'bullet',
  FIREBALL = 'fireball',
  LIGHTNING = 'lightning',
  BLADE = 'blade',
  AURA = 'aura'
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  icon?: string;
  effect: UpgradeEffect;
  level: number;
  maxLevel: number;
}

export interface UpgradeEffect {
  type: UpgradeType;
  value: number;
  target?: WeaponType | 'all';
}

export enum UpgradeType {
  DAMAGE = 'damage',
  FIRE_RATE = 'fireRate',
  PROJECTILE_SPEED = 'projectileSpeed',
  PROJECTILE_COUNT = 'projectileCount',
  MOVE_SPEED = 'moveSpeed',
  HEALTH = 'health',
  HEALTH_REGEN = 'healthRegen',
  PICKUP_RADIUS = 'pickupRadius',
  PIERCE = 'pierce',
  AREA = 'area'
}

export interface Wave {
  number: number;
  enemyCount: number;
  enemyTypes: EnemyType[];
  spawnRate: number;
  duration: number;
  startTime: number;
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  xpOrbs: XPOrb[];
  effects: Entity[];
  wave: Wave;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  time: number;
  kills: number;
  performanceMetrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  entityCount: number;
  updateTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export interface InputState {
  keys: Set<string>;
  mouse: {
    x: number;
    y: number;
    buttons: Set<number>;
  };
}