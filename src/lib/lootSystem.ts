import { LootItem } from '@/stores/gameStore';

// Loot generation system for combat rewards
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
    loot.push({
      name: 'Gold',
      type: 'gold',
      amount: goldAmount,
      price: goldAmount
    });
  }
  
  // Chance for weapon (30%)
  if (Math.random() < 0.3) {
    loot.push(generateRandomWeapon(enemyLevel));
  }
  
  // Chance for spell (25%)
  if (Math.random() < 0.25) {
    loot.push(generateRandomSpell(enemyLevel));
  }
  
  // Chance for potion (40%)
  if (Math.random() < 0.4) {
    loot.push(generateRandomPotion(enemyLevel));
  }
  
  // Small chance for rare item (10%)
  if (Math.random() < 0.1) {
    loot.push(generateRareItem(enemyLevel));
  }
  
  return loot;
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
