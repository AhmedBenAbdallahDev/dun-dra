'use client';

import React from 'react';
import { useCharacterStore, useSelectedItemStore, useUIStore } from '@/stores';
import { useCooldownsStore } from '@/stores/selectedItemStore';
import { useGameStore } from '@/stores/gameStore';
import { useMiscStore } from '@/stores/miscStore';
import { useDescriptionStore } from '@/stores/miscStore';
import { CharacterItem } from '@/stores/characterStore';

interface GamePanelProps {
  title: string;
  actions: CharacterItem[];
}

export default function GamePanel({ title, actions }: GamePanelProps) {
  const { stats, heal, restoreMp, removeInventoryItem, spendMp } = useCharacterStore();
  const { setSelectedItemData } = useSelectedItemStore();
  const { setErrorMessage, setShowDescription } = useUIStore();
  const { cooldowns, setCooldown } = useCooldownsStore();
  const { gameData } = useGameStore();
  const { setDescription } = useDescriptionStore();

  const hpPercentage = (stats.hp / stats.maxHp) * 100;
  const mpPercentage = (stats.mp / stats.maxMp) * 100;

  // Combat score calculation - EXACTLY MATCHES SVELTE calculateCombatScore  
  const calculateCombatScore = (baseValue: number, type: string): number => {
    // Roll dice and apply multipliers based on type
    const diceRoll = Math.floor(Math.random() * 20) + 1;
    
    let multiplier = 1;
    
    if (type === 'weapon') {
      if (diceRoll >= 1 && diceRoll < 5) multiplier = 0.5;
      else if (diceRoll >= 5 && diceRoll < 10) multiplier = 1;
      else if (diceRoll >= 10 && diceRoll < 15) multiplier = 1.5;
      else if (diceRoll >= 15 && diceRoll <= 20) multiplier = 2;
    } else if (type.includes('spell')) {
      if (diceRoll >= 1 && diceRoll < 3) multiplier = 0.3;
      else if (diceRoll >= 3 && diceRoll < 8) multiplier = 0.8;
      else if (diceRoll >= 8 && diceRoll < 15) multiplier = 1.2;
      else if (diceRoll >= 15 && diceRoll <= 20) multiplier = 1.8;
    } else {
      // Other items use basic calculation
      multiplier = diceRoll / 20;
    }
    
    return Math.floor(baseValue * multiplier);
  };

  // Mouse handlers for tooltips
  const handleMouseMove = (event: React.MouseEvent, item: CharacterItem) => {
    setDescription({
      name: item.name || '',
      type: item.type || '',
      damage: item.damage || 0,
      healing: item.healing || 0,
      mana: item.mana || 0,
      armor: item.armor || 0,
      element: item.element || '',
      weaponClass: item.weaponClass || '',
      manaCost: item.manaCost || 0,
      price: item.price || 0,
      amount: 1,
      point: item.point || 0
    });
    setShowDescription('block');
  };

  const handleMouseLeave = () => {
    setShowDescription('none');
  };

  // Main item usage function - completely matches Svelte ActionBox.svelte useItem logic
  const handleItemUsage = (item: CharacterItem) => {
    const { type, name, damage, manaCost, healing, cooldown, point } = item;
    const { hp, maxHp, mp, maxMp } = stats;
    const { inCombat, shopMode } = gameData.event;

    // Clear any previous selected item
    setSelectedItemData({});

    // Weapon usage - MATCHES SVELTE LINES 81-142
    if (type === 'weapon') {
      if (shopMode) return;
      if (!damage) return setErrorMessage('You can only sell that item.');
      if (!inCombat) return setErrorMessage('You are not in a combat.');

      const combatScore = Math.floor(calculateCombatScore(damage, type));
      
      // Generate combat prompts based on damage tiers (EXACT SVELTE LOGIC)
      let prompt = '';
      if (combatScore >= 1 && combatScore < 20) {
        if (gameData.enemy && gameData.enemy.enemyHp && gameData.enemy.enemyHp > combatScore) {
          prompt = `Attack with ${name}! (give hard times to player in gameData.story, where player lands the worst possible attack, which leads to player receiving damage but giving a little damage back at least. Combat goes on.)`;
        } else {
          prompt = `Attack with ${name}! (this blow destroys the enemy and ends the combat successfully!)`;
        }
      }
      if (combatScore >= 20 && combatScore < 50) {
        if (gameData.enemy && gameData.enemy.enemyHp && gameData.enemy.enemyHp > combatScore) {
          prompt = `Attack with ${name}! (give a medi-ocre gameData.story, where player lands a decent attack, which leads to player giving some damage to enemy but taking some damage back. Combat goes on.)`;
        } else {
          prompt = `Attack with ${name}! (this blow destroys the enemy and ends the combat successfully!)`;
        }
      }
      if (combatScore >= 50 && combatScore < 85) {
        if (gameData.enemy && gameData.enemy.enemyHp && gameData.enemy.enemyHp > combatScore) {
          prompt = `Attack with ${name}! (give a great gameData.story where player lands a powerful attack, giving great damage but receiving some little damage back. Combat goes on.)`;
        } else {
          prompt = `Attack with ${name}! (this blow destroys the enemy and ends the combat successfully!)`;
        }
      }
      if (combatScore >= 85) {
        prompt = `Attack with ${name}! (Create an epic gameData.story where player unleashes a devastating attack, wiping out the enemy end winning the combat.)`;
      }

      setSelectedItemData({
        name,
        damage,
        healing: undefined,
        combatScore,
        prompt
      });
      return;
    }

    // Destruction spell usage - MATCHES SVELTE LINES 144-203
    if (type === 'destruction spell') {
      if (shopMode) return;
      if (!damage) return setErrorMessage('You can only sell that item.');
      if (!inCombat) return setErrorMessage('You are not in a combat.');
      if (mp < (manaCost || 0)) return setErrorMessage('You have not enough mana.');
      if (cooldown && isCooldownActive(name, cooldown)) {
        const currentCooldown = cooldowns[name] || 0;
        return setErrorMessage(`This spell is on cooldown. ${currentCooldown}/${cooldown}`);
      }
      
      if (cooldown) setCooldown(name, cooldown);

      const combatScore = Math.floor(calculateCombatScore(damage, type));
      
      // Generate spell combat prompts (EXACT SVELTE LOGIC)
      let prompt = '';
      if (combatScore >= 1 && combatScore < 20) {
        if (gameData.enemy && gameData.enemy.enemyHp && gameData.enemy.enemyHp > combatScore) {
          prompt = `Attack with ${name} spell! (give hard times to player in gameData.story, where player lands the worst possible attack, which leads to player receiving damage but giving a little damage back at least. Combat goes on.)`;
        } else {
          prompt = `Attack with ${name} spell! (this blow destroys the enemy and ends the combat successfully!)`;
        }
      }
      if (combatScore >= 20 && combatScore < 50) {
        if (gameData.enemy && gameData.enemy.enemyHp && gameData.enemy.enemyHp > combatScore) {
          prompt = `Attack with ${name} spell! (give a medi-ocre gameData.story, where player lands a decent attack, which leads to player giving some damage to enemy but taking some damage back. Combat goes on.)`;
        } else {
          prompt = `Attack with ${name} spell! (this blow destroys the enemy and ends the combat successfully!)`;
        }
      }
      if (combatScore >= 50 && combatScore < 85) {
        if (gameData.enemy && gameData.enemy.enemyHp && gameData.enemy.enemyHp > combatScore) {
          prompt = `Attack with ${name} spell! (give a great gameData.story where player lands a powerful attack, giving great damage but receiving some little damage back. Combat goes on.)`;
        } else {
          prompt = `Attack with ${name} spell! (this blow destroys the enemy and ends the combat successfully!)`;
        }
      }
      if (combatScore >= 85) {
        prompt = `Attack with ${name} spell! (Create an epic gameData.story where player unleashes a devastating attack, wiping out the enemy end winning the combat.)`;
      }

      setSelectedItemData({
        name,
        damage,
        healing: undefined,
        manaCost,
        combatScore,
        prompt
      });
      return;
    }

    // Healing spell usage - MATCHES SVELTE LINES 205-232
    if (type === 'healing spell') {
      if (shopMode) return;
      if (hp >= maxHp) return setErrorMessage("You're at full health.");
      if (mp < (manaCost || 0)) return setErrorMessage('You have not enough mana.');
      if (cooldown && isCooldownActive(name, cooldown)) {
        const currentCooldown = cooldowns[name] || 0;
        return setErrorMessage(`This spell is on cooldown. ${currentCooldown}/${cooldown}`);
      }

      if (!inCombat) {
        // Use immediately outside combat (SVELTE LOGIC)
        const healAmount = calculateCombatScore(healing || 0, type);
        heal(healAmount);
        spendMp(manaCost || 0);
        if (cooldown) setCooldown(name, cooldown);
        console.log(`Healed for ${healAmount} HP`);
        return;
      }

      if (cooldown) setCooldown(name, cooldown);
      const combatScore = calculateCombatScore(healing || 0, type);

      setSelectedItemData({
        name,
        healing,
        damage: undefined,
        manaCost,
        combatScore,
        prompt: `Heal myself with ${name} spell by ${combatScore} amount.`
      });
      return;
    }

    // Unique spell usage - MATCHES SVELTE LINES 234-276
    if (type === 'unique spell') {
      if (shopMode) return;
      if (!inCombat) return setErrorMessage('You are not in a combat.');
      if (mp < (manaCost || 0)) return setErrorMessage('You have not enough mana.');
      if (cooldown && isCooldownActive(name, cooldown)) {
        const currentCooldown = cooldowns[name] || 0;
        return setErrorMessage(`This spell is on cooldown. ${currentCooldown}/${cooldown}`);
      }
      
      if (cooldown) setCooldown(name, cooldown);
      const combatScore = calculateCombatScore(1, type);

      let prompt = '';
      if (name === 'Summon') {
        if (combatScore >= 1 && combatScore < 5) {
          prompt = `Use my Summon spell and summon a little bird to help me in this combat.`;
        }
        if (combatScore >= 5 && combatScore < 10) {
          prompt = `Use my Summon spell and summon a powerful tiger to help me in this combat.`;
        }
        if (combatScore >= 10 && combatScore < 15) {
          prompt = `Use my Summon spell and summon a storm spirit (which is a magician) to help me in this combat.`;
        }
        if (combatScore >= 15 && combatScore <= 20) {
          prompt = `Use my Summon spell and summon an ultimate demon to help me in this combat. (combat immedietaly ends with the power of the demon)`;
        }
      }
      if (name === 'Teleportation') {
        prompt = `Use my Teleportation spell and teleport myself to a secure place away from combat.`;
      }

      setSelectedItemData({
        name,
        damage: 0,
        healing: undefined,
        manaCost,
        combatScore,
        prompt
      });
      return;
    }

    // Potion usage - MATCHES SVELTE LINES 278-314
    if (type === 'potion') {
      if (shopMode) return;
      if (healing && hp >= maxHp) return setErrorMessage("You're at full health.");
      if (inCombat) return setErrorMessage("You can't drink in combat.");

      if (healing && hp < maxHp) {
        heal(parseInt(healing.toString()));
        removeInventoryItem(name);
        console.log(`Used ${name} - healed for ${healing} HP`);
        return;
      }
      if (item.mana && mp >= maxMp) return setErrorMessage("You're at full mana.");
      if (item.mana && mp < maxMp) {
        restoreMp(parseInt(item.mana.toString()));
        removeInventoryItem(name);
        console.log(`Used ${name} - restored ${item.mana} MP`);
        return;
      }
      if (point) {
        setInteractivePoints(interactivePoints + parseInt(point.toString()));
        removeInventoryItem(name);
        console.log(`Used ${name} - gained ${point} interactive points`);
      }
      return;
    }

    // Other items - MATCHES SVELTE LINES 315-328
    if (type !== 'potion' && type !== 'weapon' && type !== 'destruction spell' && 
        type !== 'healing spell' && type !== 'unique spell') {
      if (shopMode) return;
      if (healing && hp >= maxHp) return setErrorMessage("You're at full health.");
      if (item.mana && mp >= maxMp) return setErrorMessage("You're at full mana.");
      if (healing || (item.mana && inCombat)) return setErrorMessage("You can't consume in combat.");
      
      if (damage) {
        const combatScore = Math.floor(calculateCombatScore(damage, type));
        
        let prompt = `Attack with ${name}! (give a great gameData.story where player uses a consumable item in combat)`;
        if (combatScore >= 85) {
          prompt = `Attack with ${name}! (Create an epic gameData.story where player unleashes a devastating attack, wiping out the enemy end winning the combat.)`;
        }

        setSelectedItemData({
          name,
          damage,
          healing: undefined,
          combatScore,
          prompt,
          other: true
        });

        removeInventoryItem(name);
        return;
      } else {
        return setErrorMessage('You can only sell this item.');
      }
    }
  };

  const handleItemClick = (item: CharacterItem) => {
    // Increment all cooldowns with every choice (matches Svelte logic)
    incrementAllCooldowns();
    
    // Use the item
    handleItemUsage(item);
    
    // Always show item description
    if (setShowDescription) {
      setShowDescription(item.name);
    }
  };
  const isItemSelected = (item: CharacterItem) => {
    return selectedItemName === item.name;
  };

  const isItemDisabled = (item: CharacterItem) => {
    return item.type === 'spell' && item.cooldown && isCooldownActive(item.name, item.cooldown);
  };

  const isDisabled = (item: CharacterItem): boolean => {
    if (item.type === 'spell' && item.manaCost && stats.mp < item.manaCost) {
      return true;
    }
    if (item.type === 'spell' && item.cooldown) {
      const currentCooldown = cooldowns[item.name] || 0;
      if (currentCooldown > 0) {
        return true;
      }
    }
    return false;
  };

  const hideWindow = () => {
    setShowDescription(false);
  };

  const getItemIcon = (item: CharacterItem): string => {
    if (item.type === 'weapon') {
      return `/images/${item.weaponClass || 'sword'}.svg`;
    }
    if (item.type === 'spell' && item.element) {
      return `/images/${item.element}.svg`;
    }
    if (item.type === 'potion') {
      return '/images/potion.svg';
    }
    return '/images/item.svg';
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

  return (
    <div className="container-box">
      {/* HP/MP Bar at top */}
      {title === 'Inventory' && (
        <div 
          className="hp-bar"
          style={{ '--hp-percentage': `${hpPercentage}%` } as React.CSSProperties}
        >
          {stats.hp}/{stats.maxHp}
        </div>
      )}
      {title === 'Spells' && (
        <div 
          className="mp-bar"
          style={{ '--mp-percentage': `${mpPercentage}%` } as React.CSSProperties}
        >
          {stats.mp}/{stats.maxMp}
        </div>
      )}
      
      {/* Game Panel Box */}
      <div className="game-panel-box">
        <h3>{title}</h3>
        {actions && actions.length > 0 ? (
          actions.map((item, index) => {
            const disabled = isDisabled(item);
            const cooldownText = getItemCooldownText(item);
            
            return (
              <button
                key={index}
                className={`action-button ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={disabled}
                onClick={() => handleItemUsage(item)}
                onMouseMove={(event) => handleMouseMove(event, item)}
                onMouseLeave={hideWindow}
              >
                <img
                  src={getItemIcon(item)}
                  alt={item.name}
                  className="pointer-events-none"
                />
                {cooldownText && (
                  <div className="absolute top-1 right-1 text-xs bg-red-600 text-white px-1 rounded">
                    {cooldownText}
                  </div>
                )}
              </button>
            );
          })
        ) : (
          <div className="col-span-3 text-center text-gray-400 text-sm">
            No {title.toLowerCase()} available
          </div>
        )}
      </div>
    </div>
  );
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
                  onMouseMove={(event) => handleMouseMove(event, item)}
                  onMouseLeave={handleMouseLeave}
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
            ))}
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
