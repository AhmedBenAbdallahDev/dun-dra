import { LootItem } from '@/stores/gameStore';

// Enhanced loot generation system with validation and guaranteed stats
export function generateCombatLoot(enemyName: string, enemyMaxHp: number): LootItem[] {
  const loot: LootItem[] = [];
  
  // Base loot chance and quality based on enemy difficulty
  const enemyLevel = Math.floor(enemyMaxHp / 20) + 1;
  const lootChance = Math.min(0.8, 0.4 + (enemyLevel * 0.1)); // 40-80% chance
  
  if (Math.random() > lootChance) {
    return loot; // No loot this time
  }
  
  // Always give some gold
  const goldAmount = Math.floor(Math.random() * (enemyLevel * 15)) + (enemyLevel * 5);
  if (goldAmount > 0) {
    loot.push(validateAndFixItem({
      name: 'Gold',
      type: 'gold',
      amount: goldAmount,
      price: goldAmount
    }));
  }
  
  // Chance for weapon (30%)
  if (Math.random() < 0.3) {
    loot.push(validateAndFixItem(generateRandomWeapon(enemyLevel)));
  }
  
  // Chance for spell (25%)
  if (Math.random() < 0.25) {
    loot.push(validateAndFixItem(generateRandomSpell(enemyLevel)));
  }
  
  // Chance for potion (40%)
  if (Math.random() < 0.4) {
    loot.push(validateAndFixItem(generateRandomPotion(enemyLevel)));
  }
  
  // Small chance for rare item (10%)
  if (Math.random() < 0.1) {
    loot.push(validateAndFixItem(generateRareItem(enemyLevel)));
  }
  
  return loot;
}

// 🔧 CRITICAL: Item validation and fixing function
function validateAndFixItem(item: LootItem): LootItem {
  const fixedItem = { ...item };
  
  // Note: Icon will be generated dynamically by getUnifiedItemIcon when needed
  // No need to store icon in the item data
  
  // Fix weapons - must have damage
  if (fixedItem.type === 'weapon') {
    if (!fixedItem.damage || fixedItem.damage <= 0) {
      fixedItem.damage = Math.max(1, Math.floor(Math.random() * 6) + 1);
      console.warn(`⚠️ Fixed weapon ${fixedItem.name} - added damage: ${fixedItem.damage}`);
    }
    
    // Ensure weapon has weaponClass
    if (!fixedItem.weaponClass) {
      const weaponClasses = ['sword', 'dagger', 'bow', 'mace', 'spear', 'axe'];
      fixedItem.weaponClass = weaponClasses[Math.floor(Math.random() * weaponClasses.length)];
      console.warn(`⚠️ Fixed weapon ${fixedItem.name} - added weaponClass: ${fixedItem.weaponClass}`);
    }
    
    // Ensure weapon has reasonable price
    if (!fixedItem.price || fixedItem.price <= 0) {
      fixedItem.price = fixedItem.damage * 10 + Math.floor(Math.random() * 20);
    }
  }
  
  // Fix potions - must have healing or mana
  if (fixedItem.type === 'potion') {
    if ((!fixedItem.healing || fixedItem.healing <= 0) && (!fixedItem.mana || fixedItem.mana <= 0)) {
      // Determine if it should be health or mana potion based on name
      const isHealthPotion = !fixedItem.name?.toLowerCase().includes('mana');
      
      if (isHealthPotion) {
        fixedItem.healing = Math.max(10, Math.floor(Math.random() * 30) + 10);
        fixedItem.name = fixedItem.name || 'Health Potion';
        console.warn(`⚠️ Fixed potion ${fixedItem.name} - added healing: ${fixedItem.healing}`);
      } else {
        fixedItem.mana = Math.max(10, Math.floor(Math.random() * 30) + 10);
        fixedItem.name = fixedItem.name || 'Mana Potion';
        console.warn(`⚠️ Fixed potion ${fixedItem.name} - added mana: ${fixedItem.mana}`);
      }
    }
    
    // Ensure potion has reasonable price
    if (!fixedItem.price || fixedItem.price <= 0) {
      const potionValue = (fixedItem.healing || 0) + (fixedItem.mana || 0);
      fixedItem.price = Math.floor(potionValue * 0.8) + Math.floor(Math.random() * 10);
    }
  }
  
  // Fix spells - must have damage or healing, and manaCost
  if (fixedItem.type?.includes('spell')) {
    if ((!fixedItem.damage || fixedItem.damage <= 0) && (!fixedItem.healing || fixedItem.healing <= 0)) {
      const isHealingSpell = fixedItem.type === 'healing spell' || fixedItem.name?.toLowerCase().includes('heal');
      
      if (isHealingSpell) {
        fixedItem.healing = Math.max(5, Math.floor(Math.random() * 15) + 5);
        fixedItem.type = 'healing spell';
        console.warn(`⚠️ Fixed spell ${fixedItem.name} - added healing: ${fixedItem.healing}`);
      } else {
        fixedItem.damage = Math.max(5, Math.floor(Math.random() * 15) + 5);
        fixedItem.type = 'destruction spell';
        console.warn(`⚠️ Fixed spell ${fixedItem.name} - added damage: ${fixedItem.damage}`);
      }
    }
    
    // Ensure spell has mana cost
    if (!fixedItem.manaCost || fixedItem.manaCost <= 0) {
      const spellPower = (fixedItem.damage || 0) + (fixedItem.healing || 0);
      fixedItem.manaCost = Math.max(1, Math.floor(spellPower * 1.2) + Math.floor(Math.random() * 3));
      console.warn(`⚠️ Fixed spell ${fixedItem.name} - added manaCost: ${fixedItem.manaCost}`);
    }
    
    // Ensure spell has element
    if (!fixedItem.element) {
      const elements = ['fire', 'ice', 'lightning', 'dark', 'light', 'arcane'];
      fixedItem.element = elements[Math.floor(Math.random() * elements.length)];
      console.warn(`⚠️ Fixed spell ${fixedItem.name} - added element: ${fixedItem.element}`);
    }
    
    // Ensure spell has reasonable price
    if (!fixedItem.price || fixedItem.price <= 0) {
      const spellPower = (fixedItem.damage || 0) + (fixedItem.healing || 0);
      fixedItem.price = spellPower * 15 + (fixedItem.manaCost || 0) * 5;
    }
  }
  
  // Fix gold/currency - must have amount and price
  if (fixedItem.type === 'gold' || fixedItem.type === 'currency') {
    if (!fixedItem.amount || fixedItem.amount <= 0) {
      fixedItem.amount = Math.max(1, Math.floor(Math.random() * 50) + 10);
      console.warn(`⚠️ Fixed gold ${fixedItem.name} - added amount: ${fixedItem.amount}`);
    }
    
    if (!fixedItem.price || fixedItem.price <= 0) {
      fixedItem.price = fixedItem.amount;
    }
  }
  
  // Ensure all items have a name
  if (!fixedItem.name || fixedItem.name.trim() === '') {
    fixedItem.name = generateNameFromType(fixedItem.type || 'item');
    console.warn(`⚠️ Fixed item - generated name: ${fixedItem.name}`);
  }
  
  // Ensure all items have a type
  if (!fixedItem.type || fixedItem.type.trim() === '') {
    fixedItem.type = 'item';
    console.warn(`⚠️ Fixed item ${fixedItem.name} - set type to: item`);
  }
  
  // Set rarity if not set
  if (!fixedItem.rarity) {
    fixedItem.rarity = calculateRarity(fixedItem);
  }
  
  return fixedItem;
}

// Generate appropriate name based on type
function generateNameFromType(type: string): string {
  const typeNames: Record<string, string[]> = {
    'weapon': ['Iron Sword', 'Steel Blade', 'Rusty Knife', 'Old Axe', 'Wooden Club'],
    'potion': ['Health Potion', 'Mana Potion', 'Healing Elixir', 'Magic Brew', 'Recovery Tonic'],
    'destruction spell': ['Fire Bolt', 'Ice Shard', 'Lightning Strike', 'Dark Missile', 'Magic Arrow'],
    'healing spell': ['Heal', 'Cure Wounds', 'Life Force', 'Restoration', 'Divine Healing'],
    'gold': ['Gold Coins', 'Treasure', 'Gold Pieces', 'Currency', 'Coin Purse'],
    'item': ['Mysterious Item', 'Strange Object', 'Unknown Artifact', 'Curious Thing', 'Found Item']
  };
  
  const names = typeNames[type] || typeNames['item'];
  return names[Math.floor(Math.random() * names.length)];
}

// Calculate rarity based on item stats
function calculateRarity(item: LootItem): string {
  const power = (item.damage || 0) + (item.healing || 0) + (item.mana || 0);
  const price = item.price || 0;
  
  if (power >= 40 || price >= 200) return 'legendary';
  if (power >= 25 || price >= 100) return 'epic';
  if (power >= 15 || price >= 50) return 'rare';
  if (power >= 8 || price >= 25) return 'uncommon';
  return 'common';
}

function generateRandomWeapon(level: number): LootItem {
  const weaponClasses = ['sword', 'dagger', 'bow', 'mace', 'spear', 'axe', 'flail'];
  const weaponClass = weaponClasses[Math.floor(Math.random() * weaponClasses.length)];
  
  const baseDamage = Math.min(9, Math.floor(Math.random() * (level + 2)) + 1);
  const price = baseDamage * 10 + Math.floor(Math.random() * 20);
  
  const adjectives = ['Sharp', 'Ancient', 'Rusty', 'Fine', 'Battle-worn', 'Enchanted', 'Heavy'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  
  return {
    name: `${adjective} ${weaponClass.charAt(0).toUpperCase() + weaponClass.slice(1)}`,
    damage: baseDamage,
    type: 'weapon',
    weaponClass,
    price,
    rarity: baseDamage >= 7 ? 'rare' : baseDamage >= 4 ? 'uncommon' : 'common'
  };
}

function generateRandomSpell(level: number): LootItem {
  const elements = ['fire', 'ice', 'lightning', 'dark', 'light', 'toxic'];
  const element = elements[Math.floor(Math.random() * elements.length)];
  
  const isHealing = Math.random() < 0.3;
  const basePower = Math.min(9, Math.floor(Math.random() * (level + 2)) + 1);
  const manaCost = Math.floor(basePower * 1.5) + Math.floor(Math.random() * 5);
  const cooldown = basePower >= 6 ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2) + 1;
  const price = basePower * 15 + manaCost * 5;
  
  const spellTypes = ['Bolt', 'Blast', 'Strike', 'Wave', 'Shield', 'Aura'];
  const spellType = spellTypes[Math.floor(Math.random() * spellTypes.length)];
  
  return {
    name: `${element.charAt(0).toUpperCase() + element.slice(1)} ${spellType}`,
    damage: isHealing ? undefined : basePower,
    healing: isHealing ? basePower : undefined,
    type: isHealing ? 'healing spell' : 'destruction spell',
    element,
    manaCost,
    cooldown,
    price,
    rarity: basePower >= 7 ? 'rare' : basePower >= 4 ? 'uncommon' : 'common'
  };
}

function generateRandomPotion(level: number): LootItem {
  const isHealthPotion = Math.random() < 0.7;
  const potionPower = Math.min(50, Math.floor(Math.random() * (level * 8)) + 10);
  const price = Math.floor(potionPower * 0.8) + Math.floor(Math.random() * 10);
  
  if (isHealthPotion) {
    return {
      name: `Health Potion`,
      healing: potionPower,
      type: 'potion',
      price,
      rarity: potionPower >= 35 ? 'rare' : potionPower >= 20 ? 'uncommon' : 'common'
    };
  } else {
    return {
      name: `Mana Potion`,
      mana: potionPower,
      type: 'potion',
      price,
      rarity: potionPower >= 35 ? 'rare' : potionPower >= 20 ? 'uncommon' : 'common'
    };
  }
}

function generateRareItem(level: number): LootItem {
  const rareItems = [
    {
      name: 'Ancient Scroll',
      type: 'consumable',
      damage: level + Math.floor(Math.random() * 3),
      description: 'A mysterious scroll with powerful magic',
      rarity: 'rare'
    },
    {
      name: 'Mystic Crystal',
      type: 'consumable',
      healing: level * 2 + Math.floor(Math.random() * 10),
      description: 'A glowing crystal that radiates healing energy',
      rarity: 'rare'
    },
    {
      name: 'Lucky Charm',
      type: 'accessory',
      description: 'Increases luck in combat',
      effect: 'luck_boost',
      rarity: 'rare'
    }
  ];
  
  const item = rareItems[Math.floor(Math.random() * rareItems.length)];
  return {
    ...item,
    price: (level * 25) + Math.floor(Math.random() * 50)
  };
}
