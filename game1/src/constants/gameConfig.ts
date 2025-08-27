import { EnemyType, WeaponType, UpgradeType } from '../game/types';

export const GAME_CONFIG = {
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  TARGET_FPS: 60,
  FRAME_TIME: 1000 / 60,
  
  // Performance thresholds
  MIN_FPS: 45,
  WARNING_FPS: 55,
  MAX_ENTITIES: 1000,
  OBJECT_POOL_SIZE: 1500,
  
  // Spatial grid
  GRID_CELL_SIZE: 100,
  
  // Player
  PLAYER: {
    MAX_HEALTH: 100,
    BASE_SPEED: 200, // pixels per second
    RADIUS: 15,
    PICKUP_RADIUS: 50,
    HEALTH_REGEN: 0.5, // per second
    INVULNERABILITY_TIME: 1000, // milliseconds
  },
  
  // Enemies
  ENEMIES: {
    [EnemyType.BASIC]: {
      health: 20,
      damage: 10,
      speed: 60,
      radius: 12,
      xpValue: 5,
      color: '#8B4513',
    },
    [EnemyType.FAST]: {
      health: 10,
      damage: 5,
      speed: 150,
      radius: 8,
      xpValue: 8,
      color: '#FF6347',
    },
    [EnemyType.TANK]: {
      health: 100,
      damage: 25,
      speed: 30,
      radius: 20,
      xpValue: 20,
      color: '#4B0082',
    },
    [EnemyType.BOSS]: {
      health: 500,
      damage: 50,
      speed: 45,
      radius: 30,
      xpValue: 100,
      color: '#8B0000',
    },
  },
  
  // Weapons
  WEAPONS: {
    [WeaponType.BULLET]: {
      damage: 10,
      fireRate: 2, // shots per second
      projectileSpeed: 500,
      projectileCount: 1,
      pierce: 1,
      area: 1,
      radius: 4,
      color: '#FFD700',
    },
    [WeaponType.FIREBALL]: {
      damage: 25,
      fireRate: 1,
      projectileSpeed: 300,
      projectileCount: 1,
      pierce: 3,
      area: 1.5,
      radius: 8,
      color: '#FF4500',
    },
    [WeaponType.LIGHTNING]: {
      damage: 15,
      fireRate: 3,
      projectileSpeed: 1000,
      projectileCount: 1,
      pierce: 5,
      area: 1,
      radius: 3,
      color: '#00BFFF',
    },
    [WeaponType.BLADE]: {
      damage: 20,
      fireRate: 4,
      projectileSpeed: 0, // Rotates around player
      projectileCount: 2,
      pierce: Infinity,
      area: 1,
      radius: 6,
      color: '#C0C0C0',
    },
    [WeaponType.AURA]: {
      damage: 5,
      fireRate: 10, // Continuous damage
      projectileSpeed: 0, // Aura around player
      projectileCount: 0,
      pierce: Infinity,
      area: 2,
      radius: 60,
      color: '#9370DB',
    },
  },
  
  // Waves
  WAVE: {
    BASE_SPAWN_RATE: 1, // enemies per second
    SPAWN_RATE_INCREASE: 0.2, // per wave
    BASE_ENEMY_COUNT: 10,
    ENEMY_COUNT_INCREASE: 5, // per wave
    DURATION: 30000, // 30 seconds per wave
    BOSS_WAVE_INTERVAL: 5, // Boss every 5 waves
  },
  
  // Experience
  EXPERIENCE: {
    BASE_TO_NEXT: 100,
    LEVEL_MULTIPLIER: 1.5,
    ORB_MAGNET_SPEED: 300,
    ORB_RADIUS: 5,
  },
  
  // Upgrades
  UPGRADES: {
    [UpgradeType.DAMAGE]: {
      name: 'Damage Up',
      description: 'Increase damage by 20%',
      value: 0.2,
      maxLevel: 10,
    },
    [UpgradeType.FIRE_RATE]: {
      name: 'Attack Speed',
      description: 'Increase fire rate by 15%',
      value: 0.15,
      maxLevel: 8,
    },
    [UpgradeType.PROJECTILE_COUNT]: {
      name: 'Multi Shot',
      description: 'Fire an additional projectile',
      value: 1,
      maxLevel: 5,
    },
    [UpgradeType.MOVE_SPEED]: {
      name: 'Speed Up',
      description: 'Increase movement speed by 10%',
      value: 0.1,
      maxLevel: 8,
    },
    [UpgradeType.HEALTH]: {
      name: 'Max Health',
      description: 'Increase max health by 20',
      value: 20,
      maxLevel: 10,
    },
    [UpgradeType.HEALTH_REGEN]: {
      name: 'Regeneration',
      description: 'Increase health regen by 0.5/s',
      value: 0.5,
      maxLevel: 5,
    },
    [UpgradeType.PICKUP_RADIUS]: {
      name: 'Magnet',
      description: 'Increase pickup radius by 25%',
      value: 0.25,
      maxLevel: 5,
    },
    [UpgradeType.PIERCE]: {
      name: 'Piercing',
      description: 'Projectiles pierce +1 enemy',
      value: 1,
      maxLevel: 5,
    },
    [UpgradeType.AREA]: {
      name: 'Area Damage',
      description: 'Increase damage area by 20%',
      value: 0.2,
      maxLevel: 5,
    },
  },
  
  // Colors
  COLORS: {
    BACKGROUND: '#1a1a2e',
    PLAYER: '#00ff00',
    XP_ORB: '#00ffff',
    HEALTH_BAR: '#ff0000',
    HEALTH_BAR_BG: '#333333',
    UI_TEXT: '#ffffff',
    GRID: '#252538',
  },
  
  // Debug
  DEBUG: {
    SHOW_FPS: true,
    SHOW_ENTITY_COUNT: true,
    SHOW_GRID: false,
    SHOW_COLLISION_BOXES: false,
    SHOW_PERFORMANCE_METRICS: true,
  },
};