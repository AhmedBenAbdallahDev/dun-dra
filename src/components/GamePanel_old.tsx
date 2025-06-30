'use client';

import React from 'react';
import Image from 'next/image';
import {
  useCharacterStore,
  useSelectedItemStore,
  useUIStore,
  useCooldownsStore,
  useGameStore,
  useMiscStore,
  useDescriptionStore
} from '@/stores';
import { CharacterItem } from '@/stores/characterStore';

interface GamePanelProps {
  title: string;
  actions: CharacterItem[];
}

export default function GamePanel({ title, actions }: GamePanelProps) {
  const { stats, heal, restoreMp, removeInventoryItem, spendMp } = useCharacterStore();
  const { setSelectedItemData } = useSelectedItemStore();
  const { setErrorMessage, setShowDescription } = useUIStore();
  const { cooldowns, setCooldown, isCooldownActive } = useCooldownsStore();
  const { gameData } = useGameStore();
  const { setDescription } = useDescriptionStore();
  const { interactivePoints, setInteractivePoints } = useMiscStore();

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
  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>, item: CharacterItem) => {
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
                <Image
                  src={getItemIcon(item)}
                  alt={item.name}
                  width={32}
                  height={32}
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
}
