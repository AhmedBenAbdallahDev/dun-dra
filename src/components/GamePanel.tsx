'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
  const [isExpanded, setIsExpanded] = useState(false); // Always start collapsed
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 767;
      setIsMobile(mobile);
      // Auto-collapse on mobile when screen becomes mobile size
      if (mobile) {
        setIsExpanded(false);
      } else {
        // On desktop, expand by default
        setIsExpanded(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const { stats, heal, restoreMp, removeInventoryItem, spendMp } = useCharacterStore();
  const { setErrorMessage, setShowDescription, setDiceNumber } = useUIStore();
  const { cooldowns, setCooldown } = useCooldownsStore();
  const { name: selectedName, setSelectedItem, clearSelectedItem } = useSelectedItemStore();
  const { gameData, addChatMessage } = useGameStore();
  const { setDescription } = useDescriptionStore();

  const hpPercentage = (stats.hp / stats.maxHp) * 100;
  const mpPercentage = (stats.mp / stats.maxMp) * 100;

  // Enhanced combat score calculation with character stats influence
  const calculateCombatScore = (baseValue: number, type: string): { combatScore: number, diceNumber: number } => {
    const maxDice = type === 'weapon' ? 20 : 23;
    const diceNumber = Math.floor(Math.random() * maxDice) + 1;
    
    // 🎯 NEW FEATURE: Character stats affect combat effectiveness
    const { level, experience } = useCharacterStore.getState();
    
    // Calculate stat bonuses based on character progression
    const levelBonus = Math.floor(level * 0.5); // Small level bonus
    const experienceBonus = Math.floor((experience || 0) / 100); // 1 point per 100 exp
    
    // Weapon type bonuses (could be expanded with character classes)
    const weaponTypeBonus = type === 'weapon' ? 1 : 0;
    const spellTypeBonus = type.includes('spell') ? Math.floor(level * 0.3) : 0;
    
    // Calculate total stat bonus
    const totalStatBonus = levelBonus + experienceBonus + weaponTypeBonus + spellTypeBonus;
    
    // Apply bonus to base value (not dice) to maintain balance
    const enhancedBaseValue = Math.max(1, baseValue + totalStatBonus);
    const combatScore = enhancedBaseValue * diceNumber;
    
    // 🎯 CRITICAL FIX: Store dice number immediately like Svelte does with $misc.diceNumber
    setDiceNumber(diceNumber);
    
    console.log('🎯 GamePanel: Enhanced combat score calculated:', {
      baseValue,
      enhancedBaseValue,
      type,
      level,
      experience,
      statBonuses: {
        levelBonus,
        experienceBonus,
        weaponTypeBonus,
        spellTypeBonus,
        totalStatBonus
      },
      diceNumber,
      maxDice,
      combatScore,
      calculation: `(${baseValue} + ${totalStatBonus}) × ${diceNumber} = ${combatScore}`
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
    // 🎯 Enhanced icon mapping with creative symbols and comprehensive coverage
    
    // Weapons - specific weapon class icons with expanded variety
    if (item.type === 'weapon') {
      const weaponIcons: Record<string, string> = {
        // Melee Weapons
        'sword': '/images/sword.svg',
        'greatsword': '/images/sword.svg',
        'longsword': '/images/sword.svg',
        'shortsword': '/images/sword.svg',
        'broadsword': '/images/sword.svg',
        'scimitar': '/images/sword.svg',
        'rapier': '/images/sword.svg',
        'katana': '/images/sword.svg',
        
        // Axes
        'axe': '/images/axe.svg',
        'hatchet': '/images/axe.svg',
        'battleaxe': '/images/axe.svg',
        'greataxe': '/images/axe.svg',
        'tomahawk': '/images/axe.svg',
        
        // Ranged Weapons
        'bow': '/images/bow.svg',
        'longbow': '/images/bow.svg',
        'shortbow': '/images/bow.svg',
        'crossbow': '/images/bow.svg',
        'compound bow': '/images/bow.svg',
        
        // Daggers & Knives
        'dagger': '/images/dagger.svg',
        'knife': '/images/dagger.svg',
        'stiletto': '/images/dagger.svg',
        'dirk': '/images/dagger.svg',
        'kukri': '/images/dagger.svg',
        'tanto': '/images/dagger.svg',
        
        // Blunt Weapons
        'mace': '/images/mace.svg',
        'club': '/images/mace.svg',
        'hammer': '/images/mace.svg',
        'warhammer': '/images/mace.svg',
        'maul': '/images/mace.svg',
        'morningstar': '/images/mace.svg',
        
        // Polearms
        'spear': '/images/spear.svg',
        'lance': '/images/spear.svg',
        'pike': '/images/spear.svg',
        'halberd': '/images/spear.svg',
        'glaive': '/images/spear.svg',
        'trident': '/images/spear.svg',
        
        // Flails & Chains
        'flail': '/images/flail.svg',
        'chain': '/images/flail.svg',
        'nunchaku': '/images/flail.svg',
        
        // Magic Weapons
        'staff': '/images/arcane.svg',
        'wand': '/images/arcane.svg',
        'rod': '/images/arcane.svg',
        'scepter': '/images/arcane.svg',
        'orb': '/images/arcane.svg',
      };
      return weaponIcons[item.weaponClass?.toLowerCase() || 'sword'] || '/images/sword.svg';
    }
    
    // Potions - Enhanced with different potion types
    if (item.type === 'potion' || item.name?.toLowerCase().includes('potion')) {
      const itemName = item.name?.toLowerCase() || '';
      
      // Health potions (red)
      if (itemName.includes('health') || itemName.includes('healing') || itemName.includes('life') || item.healing) {
        return '/images/potion.svg'; // Red healing potion
      }
      
      // Mana potions (blue) 
      if (itemName.includes('mana') || itemName.includes('magic') || itemName.includes('arcane') || item.mana) {
        return '/images/ice.svg'; // Blue mana effect
      }
      
      // Poison potions (green)
      if (itemName.includes('poison') || itemName.includes('toxic') || itemName.includes('venom')) {
        return '/images/toxic.svg';
      }
      
      return '/images/potion.svg';
    }
    
    // Spells - Enhanced element-based icons with more variety
    if (item.type === 'spell' || item.type === 'healing spell' || item.type === 'destruction spell') {
      const spellIcons: Record<string, string> = {
        // Primary Elements
        'fire': '/images/fire.svg',
        'flame': '/images/fire.svg',
        'burn': '/images/fire.svg',
        'inferno': '/images/fire.svg',
        'ignite': '/images/fire.svg',
        
        'ice': '/images/ice.svg',
        'frost': '/images/ice.svg',
        'freeze': '/images/ice.svg',
        'blizzard': '/images/ice.svg',
        'chill': '/images/ice.svg',
        'cold': '/images/ice.svg',
        
        'lightning': '/images/lightning.svg',
        'thunder': '/images/lightning.svg',
        'shock': '/images/lightning.svg',
        'storm': '/images/lightning.svg',
        'electric': '/images/lightning.svg',
        'bolt': '/images/lightning.svg',
        
        // Nature Elements
        'toxic': '/images/toxic.svg',
        'poison': '/images/toxic.svg',
        'acid': '/images/toxic.svg',
        'venom': '/images/toxic.svg',
        'earth': '/images/toxic.svg',
        'nature': '/images/toxic.svg',
        'plant': '/images/toxic.svg',
        'thorn': '/images/toxic.svg',
        
        // Light & Dark
        'light': '/images/light.svg',
        'holy': '/images/light.svg',
        'divine': '/images/light.svg',
        'radiant': '/images/light.svg',
        'heal': '/images/light.svg',
        'cure': '/images/light.svg',
        'blessing': '/images/light.svg',
        
        'dark': '/images/dark.svg',
        'shadow': '/images/dark.svg',
        'unholy': '/images/dark.svg',
        'curse': '/images/dark.svg',
        'death': '/images/dark.svg',
        'drain': '/images/dark.svg',
        'necro': '/images/dark.svg',
        
        // Arcane & Mystic
        'arcane': '/images/arcane.svg',
        'magic': '/images/arcane.svg',
        'mystic': '/images/arcane.svg',
        'enchant': '/images/arcane.svg',
        'charm': '/images/arcane.svg',
        'illusion': '/images/arcane.svg',
        'teleport': '/images/arcane.svg',
        'summon': '/images/arcane.svg',
        
        // Hybrid Elements
        'water': '/images/ice.svg',
        'steam': '/images/fire.svg',
        'wind': '/images/lightning.svg',
        'air': '/images/lightning.svg',
        'spirit': '/images/light.svg',
        'psychic': '/images/arcane.svg',
        'force': '/images/arcane.svg',
      };
      
      // Check both element and name for icon matching
      const element = item.element?.toLowerCase() || '';
      const spellName = item.name?.toLowerCase() || '';
      
      // First try element match
      if (element && spellIcons[element]) {
        return spellIcons[element];
      }
      
      // Then try name-based matching
      for (const [key, icon] of Object.entries(spellIcons)) {
        if (spellName.includes(key)) {
          return icon;
        }
      }
      
      return '/images/arcane.svg'; // Default for spells
    }
    
    // Enhanced special items based on name patterns and type
    const itemName = item.name?.toLowerCase() || '';
    const itemType = item.type?.toLowerCase() || '';
    
    // Currency and valuables
    if (itemType === 'gold' || itemName.includes('gold') || itemName.includes('coin') || 
        itemName.includes('currency') || itemName.includes('money')) {
      return '/images/gold.svg';
    }
    
    // Tools and utilities
    if (itemName.includes('key') || itemName.includes('lockpick') || itemName.includes('tool')) {
      return '/images/item.svg';
    }
    
    // Magical artifacts and gems
    if (itemName.includes('gem') || itemName.includes('crystal') || itemName.includes('orb') ||
        itemName.includes('stone') || itemName.includes('shard')) {
      return '/images/arcane.svg';
    }
    
    // Books, scrolls and knowledge items
    if (itemName.includes('scroll') || itemName.includes('book') || itemName.includes('tome') || 
        itemName.includes('grimoire') || itemName.includes('manual') || itemName.includes('guide')) {
      return '/images/arcane.svg';
    }
    
    // Jewelry and accessories
    if (itemName.includes('ring') || itemName.includes('amulet') || itemName.includes('necklace') || 
        itemName.includes('pendant') || itemName.includes('charm') || itemName.includes('talisman') ||
        itemType === 'accessory' || itemType === 'jewelry') {
      return '/images/unique.svg';
    }
    
    // Food and consumables
    if (itemName.includes('bread') || itemName.includes('food') || itemName.includes('meal') || 
        itemName.includes('ration') || itemName.includes('apple') || itemName.includes('meat') ||
        itemType === 'food' || itemType === 'consumable') {
      return '/images/potion.svg'; // Use potion icon for consumables
    }
    
    // Bombs and explosives
    if (itemName.includes('bomb') || itemName.includes('explosive') || itemName.includes('grenade') ||
        itemName.includes('dynamite') || itemName.includes('powder')) {
      return '/images/fire.svg'; // Fire for explosives
    }
    
    // Arrows and ammunition
    if (itemName.includes('arrow') || itemName.includes('bolt') || itemName.includes('ammo') ||
        itemName.includes('dart') || itemName.includes('shot')) {
      return '/images/bow.svg';
    }
    
    // Armor and protection
    if (itemType === 'armor' || itemName.includes('armor') || itemName.includes('shield') ||
        itemName.includes('helmet') || itemName.includes('boots') || itemName.includes('gloves')) {
      return '/images/item.svg'; // Generic item for armor
    }
    
    // Special artifacts and legendary items
    if (itemName.includes('artifact') || itemName.includes('relic') || itemName.includes('legendary') || 
        itemName.includes('epic') || itemName.includes('ancient') || itemName.includes('blessed') ||
        item.rarity === 'legendary' || item.rarity === 'epic') {
      return '/images/unique.svg';
    }
    
    // Skills and abilities
    if (itemType === 'skill' || itemName.includes('skill') || itemName.includes('ability') ||
        itemName.includes('technique') || itemName.includes('backstab') || itemName.includes('stealth')) {
      return '/images/dagger.svg'; // Skill icon
    }
    
    // Element-based fallback for items with element property
    if (item.element) {
      const elementIcons: Record<string, string> = {
        'fire': '/images/fire.svg',
        'ice': '/images/ice.svg',
        'lightning': '/images/lightning.svg',
        'arcane': '/images/arcane.svg',
        'toxic': '/images/toxic.svg',
        'light': '/images/light.svg',
        'dark': '/images/dark.svg',
      };
      return elementIcons[item.element.toLowerCase()] || '/images/arcane.svg';
    }
    
    // Type-based fallback
    if (itemType === 'unique' || itemType === 'rare') {
      return '/images/unique.svg';
    }
    
    // Ultimate fallback
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
    // 🛡️ SAFETY: Prevent multiple rapid clicks
    if (!item || !item.name) {
      console.log('❌ Invalid item provided to handleItemUsage');
      return;
    }

    console.log('🔥🔥🔥 ITEM CLICKED - DETAILED DEBUG:', {
      itemName: item.name,
      itemType: item.type,
      itemDamage: item.damage,
      itemManaCost: item.manaCost,
      gameState: {
        inCombat: gameData.event?.inCombat,
        shopMode: gameData.event?.shopMode,
        hasEnemy: !!gameData.enemy,
        enemyHp: gameData.enemy?.enemyHp
      },
      playerStats: {
        hp: stats.hp,
        maxHp: stats.maxHp,
        mp: stats.mp,
        maxMp: stats.maxMp
      }
    });
    
    const { type, name, damage, manaCost, healing, mana, cooldown } = item;
    const { mp, maxMp, hp, maxHp } = stats;
    const { inCombat, shopMode } = gameData.event || {};

    // 🚨 CRITICAL FIX: Use the hooks directly instead of getState()
    // Clear previous selection first
    clearSelectedItem();
    
    // 🚨 ADD IMMEDIATE VISUAL FEEDBACK
    console.log(`🎯 PROCESSING ${type.toUpperCase()}: ${name}`);

    // Handle different item types like in Svelte version
    if (type === 'weapon') {
      console.log('🗡️ WEAPON CLICKED:', name);
      if (shopMode) {
        console.log('⚠️ Cannot use weapon in shop mode');
        return;
      }
      if (!damage) {
        console.log('⚠️ Weapon has no damage, can only sell');
        setErrorMessage('You can only sell that item.');
        return;
      }
      if (!inCombat) {
        console.log('⚠️ Not in combat, cannot use weapon');
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
      
      console.log('✅ WEAPON SELECTED SUCCESSFULLY!');
      return;
    }

    if (type === 'destruction spell') {
      console.log('🔥 DESTRUCTION SPELL CLICKED:', name);
      if (shopMode) {
        console.log('⚠️ Cannot use spell in shop mode');
        return;
      }
      if (!damage) {
        console.log('⚠️ Spell has no damage, can only sell');
        setErrorMessage('You can only sell that item.');
        return;
      }
      if (!inCombat) {
        console.log('⚠️ Not in combat, cannot use spell');
        setErrorMessage('You are not in a combat.');
        return;
      }
      if (mp < (manaCost || 0)) {
        console.log('⚠️ Not enough mana');
        setErrorMessage('You have not enough mana.');
        return;
      }
      if (cooldown && cooldowns[name] && cooldowns[name] < cooldown) {
        console.log('⚠️ Spell on cooldown');
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
      
      console.log('✅ DESTRUCTION SPELL SELECTED SUCCESSFULLY!');
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
      
      if (damage && damage > 0) {
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
    <div className={`game-panel-container ${isExpanded ? 'expanded' : ''} h-full flex flex-col bg-slate-900/60 border border-slate-600/30 rounded-xl overflow-hidden backdrop-blur-sm`}>
      {/* Header with HP/MP bars */}
      <div 
        className={`game-panel p-3 cursor-pointer select-none transition-all duration-200 ${
          isMobile ? 'hover:bg-slate-800/50 active:bg-slate-700/50' : ''
        }`}
        onClick={isMobile ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <h3 className={`game-panel ${isExpanded ? 'expanded' : ''} text-center text-sm font-semibold text-blue-400 mb-2 flex items-center justify-between`}>
          <span>{title}</span>
          {isMobile && (
            <span className={`text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          )}
        </h3>
        
        {/* HP Bar for Inventory */}
        {title === 'Inventory' && (
          <div className="mb-2">
            <div 
              className="hp-bar text-center text-xs font-medium py-1 px-2 rounded border border-red-500/40 text-red-100"
              style={{ '--hp-percentage': `${hpPercentage}%` } as React.CSSProperties}
            >
              HP: {stats.hp}/{stats.maxHp}
            </div>
          </div>
        )}
        
        {/* MP Bar for Spells */}
        {title === 'Spells' && (
          <div className="mb-2">
            <div 
              className="mp-bar text-center text-xs font-medium py-1 px-2 rounded border border-blue-500/40 text-blue-100"
              style={{ '--mp-percentage': `${mpPercentage}%` } as React.CSSProperties}
            >
              MP: {stats.mp}/{stats.maxMp}
            </div>
          </div>
        )}
      </div>

      {/* Items Grid - Mobile Optimized for Combat */}
      <div className={`game-panel-content flex-1 p-1 md:p-2 ${!isExpanded && isMobile ? 'hidden' : ''}`}>
        {actions && actions.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 md:gap-2 h-full content-start">
            {actions.map((item, index) => {
              const disabled = isDisabled(item);
              const cooldownText = getItemCooldownText(item);
              const isSelected = selectedName === item.name;
              
              return (
                <button
                  key={index}
                  className={`
                    relative group aspect-square w-full min-w-[36px] max-w-[48px] md:max-w-[56px] p-1 md:p-2
                    rounded-lg border-2 transition-all duration-200 overflow-hidden
                    flex items-center justify-center
                    ${disabled 
                      ? 'opacity-50 cursor-not-allowed bg-slate-800/50 border-slate-600/30' 
                      : 'hover:scale-105 hover:shadow-lg bg-slate-800/70 border-slate-600/50 hover:border-slate-500/70'
                    }
                    ${isSelected 
                      ? 'ring-2 ring-green-400 bg-green-900/30 border-green-500/50 shadow-green-400/20 shadow-lg scale-105 selected' 
                      : ''
                    }
                    ${gameData.event?.inCombat 
                      ? 'border-red-500/30 hover:border-red-400/50 cursor-pointer' 
                      : ''
                    }
                  `}
                  data-selected={isSelected}
                  disabled={disabled}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    console.log('🚨 ITEM BUTTON CLICKED!', { itemName: item.name, itemType: item.type });
                    try {
                      handleItemUsage(item);
                    } catch (error) {
                      console.error('❌ ERROR in handleItemUsage:', error);
                    }
                  }}
                  onMouseMove={(event: React.MouseEvent<HTMLButtonElement>) => handleMouseMove(event, item)}
                  onMouseLeave={hideWindow}
                  title={gameData.event?.inCombat ? `Click to select ${item.name} for combat` : item.name}
                >
                  {/* Item Icon - Responsive Sizing */}
                  <Image
                    src={getItemIcon(item)}
                    alt={item.name}
                    width={20}
                    height={20}
                    className="pointer-events-none transition-transform group-hover:scale-110 w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
                  />
                  
                  {/* Selection Indicator */}
                  {selectedName === item.name && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-pulse">
                      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
                    </div>
                  )}
                  
                  {/* Combat Mode Indicator */}
                  {gameData.event.inCombat && !disabled && (
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full animate-pulse">
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-60"></div>
                    </div>
                  )}
                  
                  {/* Cooldown Display */}
                  {cooldownText && (
                    <div className="absolute inset-0 bg-slate-900/80 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-amber-300">{cooldownText}</span>
                    </div>
                  )}
                  
                  {/* Item Count for Stackable Items */}
                  {item.quantity && item.quantity > 1 && (
                    <div className="absolute bottom-0 right-0 bg-blue-600/90 text-white text-xs rounded-tl-lg px-1 min-w-[16px] text-center">
                      {item.quantity}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center text-slate-400 text-sm">
            No {title.toLowerCase()} available
          </div>
        )}
      </div>
    </div>
  );
}
