import React from 'react';
import { Upgrade } from '../../game/types';
import './UpgradeMenu.css';

interface UpgradeMenuProps {
  upgrades: Upgrade[];
  onSelect: (upgradeId: string) => void;
}

const UpgradeMenu: React.FC<UpgradeMenuProps> = ({ upgrades, onSelect }) => {
  return (
    <div className="upgrade-menu-overlay">
      <div className="upgrade-menu">
        <h2 className="upgrade-title">Level Up!</h2>
        <p className="upgrade-subtitle">Choose an upgrade:</p>
        <div className="upgrade-options">
          {upgrades.map((upgrade) => (
            <div
              key={upgrade.id}
              className="upgrade-card"
              onClick={() => onSelect(upgrade.id)}
            >
              <h3 className="upgrade-name">{upgrade.name}</h3>
              <p className="upgrade-description">{upgrade.description}</p>
              <div className="upgrade-level">
                Level {upgrade.level}/{upgrade.maxLevel}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpgradeMenu;