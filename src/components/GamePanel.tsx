'use client';

import { useCharacterStore, useSelectedItemStore, useUIStore } from '@/stores';
import { useCooldownsStore } from '@/stores/selectedItemStore';
import { CharacterItem } from '@/stores/characterStore';

interface GamePanelProps {
  title: string;
  actions: CharacterItem[];
}

export default function GamePanel({ title, actions }: GamePanelProps) {
  const { stats, heal, restoreMp, removeInventoryItem } = useCharacterStore();
  const { setSelectedItem, name: selectedItemName } = useSelectedItemStore();
  const { setShowDescription } = useUIStore();
  const { cooldowns, setCooldown, isCooldownActive } = useCooldownsStore();

  const hpPercentage = (stats.hp / stats.maxHp) * 100;
  const mpPercentage = (stats.mp / stats.maxMp) * 100;
  const handleItemClick = (item: CharacterItem) => {
    // Check if spell is on cooldown
    if (item.type === 'spell' && item.cooldown && isCooldownActive(item.name, item.cooldown)) {
      console.log(`${item.name} is on cooldown`);
      return;
    }

    // Set selected item for combat or general use
    setSelectedItem({
      name: item.name,
      damage: item.damage,
      healing: item.healing,
      manaCost: item.manaCost,
      type: item.type,
      weaponClass: item.weaponClass,
      element: item.element,
      combatScore: item.damage || item.healing || 0,
      showDescription: item.name
    });

    // Show item description
    if (setShowDescription) {
      setShowDescription(item.name);
    }

    // If it's a consumable item (potion), use it immediately
    if (item.type === 'potion') {
      handlePotionUse(item);
    }

    // If it's a spell, set cooldown
    if (item.type === 'spell' && item.cooldown) {
      setCooldown(item.name, item.cooldown);
    }
  };

  const handlePotionUse = (item: CharacterItem) => {
    if (item.healing && stats.hp < stats.maxHp) {
      heal(item.healing);
      removeInventoryItem(item.name);
      console.log(`Used ${item.name} - healed for ${item.healing} HP`);
    } else if (item.manaCost && item.manaCost < 0 && stats.mp < stats.maxMp) {
      // Negative mana cost means it restores mana
      restoreMp(Math.abs(item.manaCost));
      removeInventoryItem(item.name);
      console.log(`Used ${item.name} - restored ${Math.abs(item.manaCost)} MP`);
    }
  };
  const isItemSelected = (item: CharacterItem) => {
    return selectedItemName === item.name;
  };

  const isItemDisabled = (item: CharacterItem) => {
    return item.type === 'spell' && item.cooldown && isCooldownActive(item.name, item.cooldown);
  };

  const getItemCooldownText = (item: CharacterItem) => {
    if (item.type === 'spell' && item.cooldown) {
      const currentCooldown = cooldowns[item.name] || 0;
      if (currentCooldown > 0) {
        return `${currentCooldown}/${item.cooldown}`;
      }
    }
    return null;
  };

  return (<div className="game-panel h-full bg-black/60 backdrop-blur-lg rounded-lg md:rounded-xl border border-gray-700/50 overflow-hidden">
      {/* Panel Header */}
      <div className="panel-header bg-gradient-to-r from-amber-900/80 to-amber-800/80 px-3 md:px-4 py-2 md:py-3 border-b border-amber-700/50">
        <h3 className="text-base md:text-lg font-semibold text-amber-200 font-medieval">{title}</h3>
        
        {/* Stats Bars - only show in Inventory panel */}
        {title === 'Inventory' && (
          <div className="mt-2 space-y-1 md:space-y-2">
            {/* HP Bar */}
            <div className="stat-bar">
              <div className="flex justify-between text-xs text-red-300 mb-1">
                <span>HP</span>
                <span>{stats.hp}/{stats.maxHp}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 md:h-2">
                <div 
                  className="bg-red-500 h-1.5 md:h-2 rounded-full transition-all duration-300"
                  style={{ width: `${hpPercentage}%` }}
                />
              </div>
            </div>
            
            {/* MP Bar */}
            <div className="stat-bar">
              <div className="flex justify-between text-xs text-blue-300 mb-1">
                <span>MP</span>
                <span>{stats.mp}/{stats.maxMp}</span>
              </div>              <div className="w-full bg-gray-800 rounded-full h-1.5 md:h-2">
                <div 
                  className="bg-blue-500 h-1.5 md:h-2 rounded-full transition-all duration-300"
                  style={{ width: `${mpPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel Content */}
      <div className="panel-content p-2 md:p-4 h-full overflow-y-auto">
        {actions && actions.length > 0 ? (
          <div className="space-y-1 md:space-y-2">            {actions.map((item, index) => {
              const cooldownText = getItemCooldownText(item);
              const disabled = isItemDisabled(item);
              
              return (
                <div
                  key={index}
                  className={`action-item border rounded-md md:rounded-lg p-2 md:p-3 transition-all duration-200 group ${
                    disabled
                      ? 'bg-gray-900/60 border-gray-700 cursor-not-allowed opacity-50'
                      : isItemSelected(item) 
                        ? 'bg-amber-800/60 border-amber-500 hover:bg-amber-700/60 cursor-pointer' 
                        : 'bg-gray-800/60 hover:bg-gray-700/60 border-gray-600/50 hover:border-amber-500/50 cursor-pointer'
                  }`}
                  onClick={() => !disabled && handleItemClick(item)}
                >
                <div className="flex items-center gap-2 md:gap-3">
                  {/* Item Icon */}
                  <div className="item-icon w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-amber-600 to-amber-800 rounded border border-amber-500/50 flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-200">
                      {getItemIcon(item)}
                    </span>
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-200 group-hover:text-white transition-colors text-sm md:text-base">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-400 space-x-1 md:space-x-2">
                      {item.damage && <span className="text-red-400">⚔ {item.damage}</span>}
                      {item.healing && <span className="text-green-400">💚 {item.healing}</span>}
                      {item.manaCost && <span className="text-blue-400">🔮 {item.manaCost}</span>}
                      {item.element && <span className="text-purple-400">{getElementIcon(item.element)} {item.element}</span>}
                    </div>
                  </div>
                    {/* Item Count/Price/Cooldown */}
                  {item.quantity && item.quantity > 1 && (
                    <div className="text-xs bg-amber-600 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                      {item.quantity}
                    </div>
                  )}
                  {cooldownText && (
                    <div className="text-xs bg-red-600 text-white px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                      {cooldownText}
                    </div>
                  )}
                </div>
              </div>
            )
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4 md:py-8">
            <div className="text-2xl md:text-4xl mb-2">📦</div>
            <p className="text-sm md:text-base">No {title.toLowerCase()} available</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get item icon
function getItemIcon(item: CharacterItem): string {
  if (item.type === 'weapon') {
    switch (item.weaponClass) {
      case 'sword': return '⚔️';
      case 'bow': return '🏹';
      case 'axe': return '🪓';
      case 'dagger': return '🗡️';
      case 'mace': return '🔨';
      case 'spear': return '🗳️';
      default: return '⚔️';
    }
  }
  if (item.type === 'spell') {
    return '🔮';
  }
  if (item.type === 'potion') {
    return '🧪';
  }
  return '📦';
}

// Helper function to get element icon
function getElementIcon(element: string): string {
  switch (element) {
    case 'fire': return '🔥';
    case 'ice': return '❄️';
    case 'lightning': return '⚡';
    case 'light': return '✨';
    case 'dark': return '🌑';
    case 'toxic': return '☠️';
    default: return '💫';
  }
}
