'use client';

import React from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { useUIStore } from '@/stores/uiStore';
import { useCooldownsStore, useSelectedItemStore } from '@/stores/selectedItemStore';
import { useGameStore } from '@/stores/gameStore';
import { useDescriptionStore } from '@/stores/miscStore';
import { CharacterItem } from '@/stores/characterStore';

interface GamePanelProps {
  title: string;
  actions: CharacterItem[];
}

export default function GamePanel({ title, actions }: GamePanelProps) {
  const { stats, heal, restoreMp, removeInventoryItem, spendMp } = useCharacterStore();
  const { setErrorMessage, setShowDescription } = useUIStore();
  const { cooldowns, setCooldown } = useCooldownsStore();
  const { name: selectedName } = useSelectedItemStore();
  const { gameData, addChatMessage } = useGameStore();
  const { setDescription } = useDescriptionStore();

  const hpPercentage = (stats.hp / stats.maxHp) * 100;
  const mpPercentage = (stats.mp / stats.maxMp) * 100;

  // Combat score calculation - EXACTLY MATCHES SVELTE calculateCombatScore  
  const calculateCombatScore = (baseValue: number, type: string): { combatScore: number, diceNumber: number } => {
    const maxDice = type === 'weapon' ? 20 : 23;
    const diceNumber = Math.floor(Math.random() * maxDice) + 1;
    const combatScore = baseValue * diceNumber;
    
    // 🎯 CRITICAL FIX: Store dice number in UI store immediately like Svelte does with $misc.diceNumber
    const { setDiceNumber } = useUIStore.getState();
    setDiceNumber(diceNumber);
    
    console.log('🎯 GamePanel: Combat score calculated:', {
      baseValue,
      type,
      diceNumber,
      maxDice,
      combatScore,
      calculation: `${baseValue} × ${diceNumber} = ${combatScore}`
    });
    
    return { combatScore, diceNumber };
  };

  // Generate combat prompt based on combat score - EXACTLY MATCHES SVELTE
  const generateCombatPrompt = (name: string, combatScore: number, enemyHp: number, isSpell: boolean = false): string => {
    const attackType = isSpell ? 'spell' : '';
    const exclamation = isSpell ? '!' : '!';
    
    if (combatScore >= 1 && combatScore < 20) {
      if (enemyHp > combatScore) {
        return `Attack with ${name}${attackType}${exclamation} (give hard times to player in gameData.story, where player lands the worst possible attack, which leads to player receiving damage but giving a little damage back at least. Combat goes on.)`;
      } else {
        return `Attack with ${name}${attackType}${exclamation} (this blow destroys the enemy and ends the combat successfully!)`;
      }
    }
    if (combatScore >= 20 && combatScore < 50) {
      if (enemyHp > combatScore) {
        return `Attack with ${name}${attackType}${exclamation} (give a medi-ocre gameData.story, where player lands a decent attack, which leads to player giving some damage to enemy but taking some damage back. Combat goes on.)`;
      } else {
        return `Attack with ${name}${attackType}${exclamation} (this blow destroys the enemy and ends the combat successfully!)`;
      }
    }
    if (combatScore >= 50 && combatScore < 85) {
      if (enemyHp > combatScore) {
        return `Attack with ${name}${attackType}${exclamation} (give a great gameData.story where player lands a powerful attack, giving great damage but receiving some little damage back. Combat goes on.)`;
      } else {
        return `Attack with ${name}${attackType}${exclamation} (this blow destroys the enemy and ends the combat successfully!)`;
      }
    }
    if (combatScore >= 85) {
      return `Attack with ${name}${attackType}${exclamation} (Create an epic gameData.story where player unleashes a devastating attack, wiping out the enemy end winning the combat.)`;
    }
    
    return `Attack with ${name}${attackType}${exclamation}`;
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>, item: CharacterItem) => {
    const { setMousePosition } = useUIStore.getState();
    setShowDescription('block');
    setMousePosition(event.clientX, event.clientY);
    
    // Set description data
    setDescription({
      name: item.name,
      damage: item.damage,
      type: item.type,
      healing: item.healing,
      mana: item.mana,
      armor: item.armor,
      element: item.element,
      weaponClass: item.weaponClass,
      manaCost: item.manaCost,
      price: item.price
    });
  };

  const hideWindow = () => {
    setShowDescription('none');
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

  const getItemIcon = (item: CharacterItem): string => {
    // Match Svelte logic exactly
    if (item.type === 'weapon') {
      return `/images/${item.weaponClass}.svg`;
    }
    if (item.type === 'potion') {
      return `/images/${item.type}.svg`; // This will be /images/potion.svg
    }
    if (item.element) {
      return `/images/${item.element}.svg`;
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

  const handleItemUsage = (item: CharacterItem) => {
    console.log('🔥 Item clicked:', {
      name: item.name,
      type: item.type,
      damage: item.damage,
      manaCost: item.manaCost,
      inCombat: gameData.event?.inCombat,
      currentHP: stats.hp,
      currentMP: stats.mp
    });
    
    const { type, name, damage, manaCost, healing, mana, cooldown } = item;
    const { mp, maxMp, hp, maxHp } = stats;
    const { inCombat, shopMode } = gameData.event || {};
    const { setSelectedItem, clearSelectedItem } = useSelectedItemStore.getState();

    // Clear previous selection
    clearSelectedItem();

    // Handle different item types like in Svelte version
    if (type === 'weapon') {
      if (shopMode) return;
      if (!damage) {
        setErrorMessage('You can only sell that item.');
        return;
      }
      if (!inCombat) {
        setErrorMessage('You are not in a combat.');
        return;
      }
      
      const { combatScore, diceNumber } = calculateCombatScore(damage, type);
      const enemyHp = gameData.enemy?.enemyHp || 0;
      const prompt = generateCombatPrompt(name, combatScore, enemyHp);
      
      // Set selectedItem exactly like Svelte
      console.log('🔥 GamePanel: Setting weapon selection:', {
        name,
        damage,
        combatScore,
        prompt: prompt.substring(0, 100) + '...',
        calculatedDice: diceNumber
      });
      setSelectedItem({
        name,
        damage,
        healing: undefined,
        combatScore,
        prompt,
        manaCost: 0
      });
      return;
    }

    if (type === 'destruction spell') {
      if (shopMode) return;
      if (!damage) {
        setErrorMessage('You can only sell that item.');
        return;
      }
      if (!inCombat) {
        setErrorMessage('You are not in a combat.');
        return;
      }
      if (mp < (manaCost || 0)) {
        setErrorMessage('You have not enough mana.');
        return;
      }
      if (cooldown && cooldowns[name] && cooldowns[name] < cooldown) {
        setErrorMessage(`This spell is on cooldown. ${cooldowns[name]}/${cooldown}`);
        return;
      }
      
      // Set cooldown first like Svelte
      if (cooldown) {
        setCooldown(name, cooldown);
      }
      
      const { combatScore, diceNumber } = calculateCombatScore(damage, type);
      const enemyHp = gameData.enemy?.enemyHp || 0;
      const prompt = generateCombatPrompt(name, combatScore, enemyHp, true);
      
      // Set selectedItem exactly like Svelte  
      console.log('🔥 GamePanel: Setting spell selection:', {
        name,
        damage,
        combatScore,
        manaCost,
        prompt: prompt.substring(0, 100) + '...',
        calculatedDice: diceNumber
      });
      setSelectedItem({
        name,
        damage,
        healing: undefined,
        combatScore,
        prompt,
        manaCost: manaCost || 0
      });
      return;
    }

    if (type === 'healing spell') {
      if (shopMode) return;
      if (hp >= maxHp) {
        setErrorMessage("You're at full health.");
        return;
      }
      if (mp < (manaCost || 0)) {
        setErrorMessage('You have not enough mana.');
        return;
      }
      if (cooldown && cooldowns[name] && cooldowns[name] < cooldown) {
        setErrorMessage(`This spell is on cooldown. ${cooldowns[name]}/${cooldown}`);
        return;
      }

      if (!inCombat) {
        // Direct healing outside combat like Svelte
        const { combatScore } = calculateCombatScore(healing || 0, type);
        addChatMessage({
          content: `Heal myself with ${name} spell by ${combatScore} amount.`,
          type: 'user',
          timestamp: Date.now()
        });
        heal(combatScore);
        if (manaCost) spendMp(manaCost);
        return;
      }

      // Set cooldown for combat healing like Svelte
      if (cooldown) {
        setCooldown(name, cooldown);
      }
      
      const { combatScore } = calculateCombatScore(healing || 0, type);
      
      // Set selectedItem for combat healing
      setSelectedItem({
        name,
        damage: undefined,
        healing,
        combatScore,
        prompt: `Heal myself with ${name} spell by ${combatScore} amount.`,
        manaCost: manaCost || 0
      });
      return;
    }

    if (type === 'unique spell') {
      if (shopMode) return;
      if (!inCombat) {
        setErrorMessage('You are not in a combat.');
        return;
      }
      if (mp < (manaCost || 0)) {
        setErrorMessage('You have not enough mana.');
        return;
      }
      if (cooldown && cooldowns[name] && cooldowns[name] < cooldown) {
        setErrorMessage(`This spell is on cooldown. ${cooldowns[name]}/${cooldown}`);
        return;
      }
      
      // Set cooldown like Svelte
      if (cooldown) {
        setCooldown(name, cooldown);
      }
      
      const { combatScore } = calculateCombatScore(1, type);
      let prompt = '';
      
      // Generate unique spell prompts exactly like Svelte
      if (name === 'Summon') {
        if (combatScore >= 1 && combatScore < 5) {
          prompt = 'Use my Summon spell and summon a little bird to help me in this combat.';
        } else if (combatScore >= 5 && combatScore < 10) {
          prompt = 'Use my Summon spell and summon a powerful tiger to help me in this combat.';
        } else if (combatScore >= 10 && combatScore < 15) {
          prompt = 'Use my Summon spell and summon a storm spirit (which is a magician) to help me in this combat.';
        } else if (combatScore >= 15 && combatScore <= 20) {
          prompt = 'Use my Summon spell and summon an ultimate demon to help me in this combat. (combat immedietaly ends with the power of the demon)';
        }
      } else if (name === 'Teleportation') {
        prompt = 'Use my Teleportation spell and teleport myself to a secure place away from combat.';
      }
      
      // Set selectedItem for unique spell
      setSelectedItem({
        name,
        damage: 0,
        healing: undefined,
        combatScore,
        prompt,
        manaCost: manaCost || 0,
        other: false
      });
      return;
    }

    if (type === 'potion') {
      if (shopMode) return;
      if (healing && hp >= maxHp) {
        setErrorMessage("You're at full health.");
        return;
      }
      if (inCombat) {
        setErrorMessage("You can't drink in combat.");
        return;
      }

      if (healing && hp < maxHp) {
        heal(parseInt(healing.toString()));
        removeInventoryItem(name);
        hideWindow();
        return;
      }
      
      if (mana && mp >= maxMp) {
        setErrorMessage("You're at full mana.");
        return;
      }
      
      if (mana && mp < maxMp) {
        restoreMp(parseInt(mana.toString()));
        removeInventoryItem(name);
        hideWindow();
        return;
      }
    }

    // For items that are not specifically implemented (like consumable foods etc) - exactly like Svelte
    if (
      type !== 'potion' &&
      type !== 'weapon' &&
      type !== 'destruction spell' &&
      type !== 'healing spell' &&
      type !== 'unique spell'
    ) {
      if (shopMode) return;
      if (healing && hp >= maxHp) {
        setErrorMessage("You're at full health.");
        return;
      }
      if (mana && mp >= maxMp) {
        setErrorMessage("You're at full mana.");
        return;
      }
      if (healing || (mana && inCombat)) {
        setErrorMessage("You can't consume in combat.");
        return;
      }
      
      if (damage) {
        const { combatScore } = calculateCombatScore(damage, type);
        const enemyHp = gameData.enemy?.enemyHp || 0;
        const prompt = generateCombatPrompt(name, combatScore, enemyHp);
        
        // Set selectedItem for other items
        setSelectedItem({
          name,
          damage,
          healing: undefined,
          combatScore,
          prompt,
          other: true
        });
        
        // Remove item from inventory like Svelte
        removeInventoryItem(name);
        hideWindow();
        return;
      } else {
        setErrorMessage('You can only sell this item.');
        return;
      }
    }
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
                className={`action-button relative group transition-all duration-200 ${
                  disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:scale-105 hover:shadow-lg'
                } ${
                  selectedName === item.name 
                    ? 'ring-2 ring-green-400 bg-green-900/30 shadow-green-400/20 shadow-lg' 
                    : 'hover:ring-1 hover:ring-amber-400/50'
                } ${
                  gameData.event.inCombat 
                    ? 'combat-mode border-red-500/30' 
                    : ''
                }`}
                disabled={disabled}
                onClick={() => handleItemUsage(item)}
                onMouseMove={(event) => handleMouseMove(event, item)}
                onMouseLeave={hideWindow}
                title={gameData.event.inCombat ? `Click to select ${item.name} for combat` : item.name}
              >
                {/* Item icon */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getItemIcon(item)}
                  alt={item.name}
                  className="pointer-events-none transition-transform group-hover:scale-110"
                />
                
                {/* Selection indicator */}
                {selectedName === item.name && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse">
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                )}
                
                {/* Combat mode indicator */}
                {gameData.event.inCombat && !disabled && (
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
                
                {/* Cooldown display */}
                {cooldownText && (
                  <div className="absolute top-1 right-1 text-xs bg-red-600 text-white px-1 rounded border border-red-400">
                    {cooldownText}
                  </div>
                )}
                
                {/* Damage/healing indicator */}
                {item.damage && (
                  <div className="absolute bottom-0 left-0 text-xs bg-orange-600 text-white px-1 rounded-tr border border-orange-400">
                    ⚔{item.damage}
                  </div>
                )}
                {item.healing && (
                  <div className="absolute bottom-0 left-0 text-xs bg-green-600 text-white px-1 rounded-tr border border-green-400">
                    ❤{item.healing}
                  </div>
                )}
                
                {/* Mana cost indicator */}
                {item.manaCost && item.manaCost > 0 && (
                  <div className="absolute bottom-0 right-0 text-xs bg-blue-600 text-white px-1 rounded-tl border border-blue-400">
                    🔮{item.manaCost}
                  </div>
                )}
                
                {/* Disabled overlay */}
                {disabled && (
                  <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                    <span className="text-red-400 text-xs">❌</span>
                  </div>
                )}
                
                {/* Hover hint for combat */}
                {gameData.event.inCombat && !disabled && selectedName !== item.name && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Click to select for combat
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
}
