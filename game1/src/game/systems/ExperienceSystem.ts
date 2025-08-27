import { GameState, UpgradeType, Upgrade, WeaponType } from '../types';
import { GAME_CONFIG } from '../../constants/gameConfig';
import { MathUtils } from '../utils/math';

export class ExperienceSystem {
  private pendingLevelUps: number = 0;
  private availableUpgrades: Upgrade[] = [];
  
  public update(gameState: GameState): void {
    const player = gameState.player;
    
    // Check for level up
    while (player.experience >= player.experienceToNext) {
      this.levelUp(gameState);
    }
  }
  
  private levelUp(gameState: GameState): void {
    const player = gameState.player;
    
    // Increase level
    player.level++;
    
    // Carry over excess experience
    player.experience -= player.experienceToNext;
    
    // Calculate next level requirement
    player.experienceToNext = Math.floor(
      GAME_CONFIG.EXPERIENCE.BASE_TO_NEXT *
      Math.pow(GAME_CONFIG.EXPERIENCE.LEVEL_MULTIPLIER, player.level - 1)
    );
    
    // Generate upgrade choices
    this.pendingLevelUps++;
    this.generateUpgradeChoices(gameState);
    
    // Heal player on level up (20% of max health)
    player.health = Math.min(
      player.maxHealth,
      player.health + player.maxHealth * 0.2
    );
    
    // Bonus score
    gameState.score += 100 * player.level;
  }
  
  private generateUpgradeChoices(gameState: GameState): void {
    const player = gameState.player;
    const possibleUpgrades: Upgrade[] = [];
    
    // Create upgrade options
    for (const [upgradeType, config] of Object.entries(GAME_CONFIG.UPGRADES)) {
      const type = upgradeType as UpgradeType;
      
      // Check if upgrade is maxed
      const existingUpgrade = player.upgrades.find(u => u.effect.type === type);
      if (existingUpgrade && existingUpgrade.level >= config.maxLevel) {
        continue;
      }
      
      const upgrade: Upgrade = {
        id: MathUtils.generateId(),
        name: config.name,
        description: config.description,
        level: existingUpgrade ? existingUpgrade.level + 1 : 1,
        maxLevel: config.maxLevel,
        effect: {
          type,
          value: config.value,
          target: this.getUpgradeTarget(type),
        },
      };
      
      possibleUpgrades.push(upgrade);
    }
    
    // Add weapon unlock upgrades
    const unlockedWeapons = player.weapons.map(w => w.type);
    const allWeapons = Object.values(WeaponType);
    
    for (const weaponType of allWeapons) {
      if (!unlockedWeapons.includes(weaponType)) {
        const upgrade: Upgrade = {
          id: MathUtils.generateId(),
          name: `Unlock ${weaponType}`,
          description: `Unlock the ${weaponType} weapon`,
          level: 1,
          maxLevel: 1,
          effect: {
            type: UpgradeType.DAMAGE, // Placeholder
            value: 0,
            target: weaponType,
          },
        };
        
        possibleUpgrades.push(upgrade);
      }
    }
    
    // Randomly select 3 upgrades
    const shuffled = possibleUpgrades.sort(() => Math.random() - 0.5);
    this.availableUpgrades = shuffled.slice(0, 3);
  }
  
  private getUpgradeTarget(type: UpgradeType): WeaponType | 'all' | undefined {
    // Some upgrades target specific weapons
    switch (type) {
      case UpgradeType.DAMAGE:
      case UpgradeType.FIRE_RATE:
      case UpgradeType.PROJECTILE_COUNT:
      case UpgradeType.PIERCE:
      case UpgradeType.AREA:
        return 'all'; // Apply to all weapons
      default:
        return undefined;
    }
  }
  
  public applyUpgrade(gameState: GameState, upgradeId: string): void {
    const player = gameState.player;
    const upgrade = this.availableUpgrades.find(u => u.id === upgradeId);
    
    if (!upgrade) return;
    
    // Check if it's a weapon unlock
    if (upgrade.name.startsWith('Unlock')) {
      const weaponType = upgrade.effect.target as WeaponType;
      const weaponConfig = GAME_CONFIG.WEAPONS[weaponType];
      
      player.weapons.push({
        type: weaponType,
        level: 1,
        damage: weaponConfig.damage,
        fireRate: weaponConfig.fireRate,
        projectileSpeed: weaponConfig.projectileSpeed,
        projectileCount: weaponConfig.projectileCount,
        pierce: weaponConfig.pierce,
        area: weaponConfig.area,
        lastFired: 0,
      });
    } else {
      // Apply upgrade effect
      switch (upgrade.effect.type) {
        case UpgradeType.DAMAGE:
          for (const weapon of player.weapons) {
            weapon.damage *= 1 + upgrade.effect.value;
          }
          break;
          
        case UpgradeType.FIRE_RATE:
          for (const weapon of player.weapons) {
            weapon.fireRate *= 1 + upgrade.effect.value;
          }
          break;
          
        case UpgradeType.PROJECTILE_COUNT:
          for (const weapon of player.weapons) {
            weapon.projectileCount += upgrade.effect.value;
          }
          break;
          
        case UpgradeType.PROJECTILE_SPEED:
          for (const weapon of player.weapons) {
            weapon.projectileSpeed *= 1 + upgrade.effect.value;
          }
          break;
          
        case UpgradeType.MOVE_SPEED:
          player.moveSpeed *= 1 + upgrade.effect.value;
          break;
          
        case UpgradeType.HEALTH:
          player.maxHealth += upgrade.effect.value;
          player.health += upgrade.effect.value;
          break;
          
        case UpgradeType.HEALTH_REGEN:
          // This is handled in the game loop
          break;
          
        case UpgradeType.PICKUP_RADIUS:
          player.pickupRadius *= 1 + upgrade.effect.value;
          break;
          
        case UpgradeType.PIERCE:
          for (const weapon of player.weapons) {
            weapon.pierce += upgrade.effect.value;
          }
          break;
          
        case UpgradeType.AREA:
          for (const weapon of player.weapons) {
            weapon.area *= 1 + upgrade.effect.value;
          }
          break;
      }
      
      // Add or update upgrade in player's upgrade list
      const existingUpgrade = player.upgrades.find(
        u => u.effect.type === upgrade.effect.type
      );
      
      if (existingUpgrade) {
        existingUpgrade.level++;
      } else {
        player.upgrades.push(upgrade);
      }
    }
    
    // Clear pending level up
    this.pendingLevelUps--;
    this.availableUpgrades = [];
    
    // Generate next choices if more level ups pending
    if (this.pendingLevelUps > 0) {
      this.generateUpgradeChoices(gameState);
    }
  }
  
  public getAvailableUpgrades(): Upgrade[] {
    return this.availableUpgrades;
  }
  
  public hasPendingLevelUps(): boolean {
    return this.pendingLevelUps > 0;
  }
}