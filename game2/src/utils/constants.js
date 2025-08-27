// Game Configuration Constants

export const GAME_CONFIG = {
  CANVAS_WIDTH: 1600,
  CANVAS_HEIGHT: 900,
  FPS: 60,
  GAME_DURATION: 600, // 10 minutes in seconds
  STAGE_DURATION: 120, // 2 minutes per stage
};

export const PLAYER_CONFIG = {
  BASE_HP: 100,
  BASE_SPEED: 4,  // Increased for better mobility
  BASE_DAMAGE: 5,  // Balanced damage
  RADIUS: 15,
  COLOR: '#4A90E2',
  INVULNERABILITY_TIME: 1500, // ms after getting hit - increased for fairness
  INITIAL_PICKUP_RANGE: 75,  // Increased from 50
};

export const ENEMY_CONFIG = {
  BASE_HP: 8,  // Slightly lower for early game
  BASE_SPEED: 0.8,  // Slower early enemies
  BASE_DAMAGE: 3,  // Less damage early game
  BASE_RADIUS: 10,
  SPAWN_RATE: 3000, // ms - even slower initial spawn rate
  MAX_ENEMIES: 100,
  TYPES: {
    BASIC: { hp: 10, speed: 1, damage: 5, radius: 10, color: '#FF6B6B', exp: 5 },
    FAST: { hp: 8, speed: 2, damage: 3, radius: 8, color: '#FFA500', exp: 10 },
    TANK: { hp: 30, speed: 0.5, damage: 10, radius: 15, color: '#8B4513', exp: 15 },
    SWARM: { hp: 5, speed: 1.5, damage: 2, radius: 6, color: '#9370DB', exp: 5 },
    SHOOTER: { hp: 15, speed: 0.8, damage: 7, radius: 12, color: '#FF1493', exp: 20 },
    GHOST: { hp: 12, speed: 1.2, damage: 6, radius: 10, color: 'rgba(255,255,255,0.6)', exp: 15 },
    ELECTRIC: { hp: 20, speed: 1, damage: 8, radius: 11, color: '#00FFFF', exp: 20 },
    TOXIC: { hp: 18, speed: 0.9, damage: 4, radius: 13, color: '#32CD32', exp: 15 },
    ICE: { hp: 25, speed: 0.6, damage: 6, radius: 14, color: '#87CEEB', exp: 20 },
    FIRE: { hp: 22, speed: 1.1, damage: 9, radius: 12, color: '#FF4500', exp: 25 }
  }
};

export const BOSS_CONFIG = {
  MINI_BOSS: {
    hp: 500,
    speed: 0.8,
    damage: 15,
    radius: 30,
    color: '#8B0000',
    exp: 100,
    auraColor: 'rgba(255, 0, 0, 0.3)',
    auraRadius: 50
  },
  STAGE_BOSSES: {
    FOREST: { hp: 1000, speed: 0.5, damage: 20, radius: 40, color: '#228B22', exp: 200 },
    DESERT: { hp: 1500, speed: 0.6, damage: 25, radius: 45, color: '#D2691E', exp: 300 },
    VOLCANO: { hp: 2000, speed: 0.7, damage: 30, radius: 50, color: '#DC143C', exp: 400 },
    SNOW: { hp: 2500, speed: 0.4, damage: 35, radius: 55, color: '#F0F8FF', exp: 500 },
    SPACE: { hp: 3000, speed: 0.8, damage: 40, radius: 60, color: '#4B0082', exp: 1000 }
  }
};

export const EXP_ORBS = {
  TYPES: [
    { value: 5, color: '#FF0000', radius: 3 },    // Red
    { value: 10, color: '#FFA500', radius: 4 },   // Orange
    { value: 15, color: '#FFFF00', radius: 5 },   // Yellow
    { value: 20, color: '#00FF00', radius: 6 },   // Green
    { value: 30, color: '#0000FF', radius: 7 },   // Blue
    { value: 40, color: '#4B0082', radius: 8 },   // Indigo
    { value: 50, color: '#8B008B', radius: 9 }    // Violet
  ],
  BASE_PICKUP_RANGE: 75,  // Increased from 50
  MAGNET_RANGE: 200  // Much larger magnet range
};

export const WEAPON_TYPES = {
  BULLET: 'bullet',
  SWORD: 'sword',
  LIGHTNING: 'lightning',
  SPEAR: 'spear',
  BLADE: 'blade',
  LASER: 'laser',
  SHOTGUN: 'shotgun',
  MISSILE: 'missile',
  ICE: 'ice',
  SHOCKWAVE: 'shockwave',
  BOOMERANG: 'boomerang',
  POISON: 'poison'
};

export const PASSIVE_TYPES = {
  MAX_HP: 'maxHp',
  HP_REGEN: 'hpRegen',
  SPEED: 'speed',
  DAMAGE: 'damage',
  COOLDOWN: 'cooldown',
  EXP_GAIN: 'expGain',
  PICKUP_RANGE: 'pickupRange',
  WEAPON_SIZE: 'weaponSize',
  DAMAGE_REDUCTION: 'damageReduction',
  WEAPON_COUNT: 'weaponCount'
};

export const AUXILIARY_ITEMS = {
  HEAL: 'heal',
  MAGNET: 'magnet',
  POWER_UP: 'powerUp',
  COIN: 'coin',
  FREEZE: 'freeze',
  SHIELD: 'shield'
};

export const LEVEL_CONFIG = {
  BASE_EXP_REQUIRED: 100,  // First level requirement
  EXP_MULTIPLIER: 1.3,  // Gentler curve
  UPGRADE_CHOICES: 3
};

export const STAGE_CONFIG = {
  STAGES: ['FOREST', 'DESERT', 'VOLCANO', 'SNOW', 'SPACE'],
  STAGE_DURATION: 120, // 2 minutes per stage
  COLORS: {
    FOREST: { bg: '#1a4d1a', ground: '#2d5a2d' },
    DESERT: { bg: '#c19a6b', ground: '#a0826d' },
    VOLCANO: { bg: '#4a1f1f', ground: '#5c2e2e' },
    SNOW: { bg: '#e6f3ff', ground: '#d0e7ff' },
    SPACE: { bg: '#000033', ground: '#000066' }
  }
};

export const ITEM_DROP_RATES = {
  NORMAL_ENEMY: 0.05,  // 5% chance
  MINI_BOSS: 1.0,      // 100% chance
  BOSS: 1.0            // 100% chance
};