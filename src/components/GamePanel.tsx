'use client';

import React from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { useUIStore } from '@/stores/uiStore';
import { useCooldownsStore } from '@/stores/selectedItemStore';
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
  const { gameData } = useGameStore();
  const { setDescription } = useDescriptionStore();

  const hpPercentage = (stats.hp / stats.maxHp) * 100;
  const mpPercentage = (stats.mp / stats.maxMp) * 100;

  // Combat score calculation - EXACTLY MATCHES SVELTE calculateCombatScore  
  const calculateCombatScore = (baseValue: number, type: string): number => {
    const maxDice = type === 'weapon' ? 20 : 23;
    const diceRoll = Math.floor(Math.random() * maxDice) + 1;
    return baseValue * diceRoll;
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>, item: CharacterItem) => {
    const { setMousePosition } = useUIStore.getState();
    setShowDescription(true);
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
    setShowDescription(false);
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

  const handleItemUsage = (item: CharacterItem) => {
    const { type, name, damage, manaCost, healing, mana, cooldown } = item;
    const { mp, maxMp, hp, maxHp } = stats;
    const { inCombat, shopMode } = gameData.event || {};

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
      
      const combatScore = calculateCombatScore(damage, type);
      // Handle weapon usage logic here
      console.log('Using weapon:', name, 'Combat score:', combatScore);
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
      
      // Set cooldown
      if (cooldown) {
        setCooldown(name, cooldown);
      }
      
      const combatScore = calculateCombatScore(damage, type);
      // Handle spell usage logic here
      console.log('Using spell:', name, 'Combat score:', combatScore);
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
        // Direct healing outside combat
        const healAmount = calculateCombatScore(healing || 0, type);
        heal(healAmount);
        if (manaCost) spendMp(manaCost);
        return;
      }

      // Set cooldown for combat healing
      if (cooldown) {
        setCooldown(name, cooldown);
      }
      
      const combatScore = calculateCombatScore(healing || 0, type);
      console.log('Using healing spell:', name, 'Heal amount:', combatScore);
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
}
