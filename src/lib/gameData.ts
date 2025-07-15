// Game data loading utilities
import { CharacterItem } from '@/stores/characterStore';

// Import all game data
import weaponsData from '@/data/weapons.json';
import spellsData from '@/data/spells.json';
import potionsData from '@/data/potions.json';
import placesData from '@/data/places.json';

// Import starter data
import medievalTavernStarter from '@/data/gamestarters/medievalTavernStarter.json';
import medievalMageInventory from '@/data/gamestarters/medievalMageInventory.json';
import medievalMageSpells from '@/data/gamestarters/medievalMageSpells.json';
import medievalWarriorInventory from '@/data/gamestarters/medievalWarriorInventory.json';
import medievalWarriorSpells from '@/data/gamestarters/medievalWarriorSpells.json';
import medievalRogueInventory from '@/data/gamestarters/medievalRogueInventory.json';
import medievalRogueSpells from '@/data/gamestarters/medievalRogueSpells.json';
import medievalArcherInventory from '@/data/gamestarters/medievalArcherInventory.json';
import medievalArcherSpells from '@/data/gamestarters/medievalArcherSpells.json';
import medievalBarbarianInventory from '@/data/gamestarters/medievalBarbarianInventory.json';
import medievalBarbarianSpells from '@/data/gamestarters/medievalBarbarianSpells.json';
import medievalClericInventory from '@/data/gamestarters/medievalClericInventory.json';
import medievalClericSpells from '@/data/gamestarters/medievalClericSpells.json';

export interface GameDataSets {
  weapons: CharacterItem[];
  spells: CharacterItem[];
  potions: CharacterItem[];
  places: string[];
}

export interface StarterData {
  inventory: CharacterItem[];
  spells: CharacterItem[];
  story: string;
  choices: string[];
}

// Load all game data
export function loadGameData(): GameDataSets {
  return {
    weapons: weaponsData as CharacterItem[],
    spells: spellsData as CharacterItem[],
    potions: potionsData as CharacterItem[],
    places: placesData
  };
}

// Load character class starter data
export function loadCharacterStarterData(heroClass: string): StarterData {
  const starterStories = medievalTavernStarter as string[];
  
  let inventory: CharacterItem[] = [];
  let spells: CharacterItem[] = [];
  
  const classLower = heroClass.toLowerCase();
  
  if (classLower === 'mage' || classLower === 'wizard') {
    inventory = medievalMageInventory as CharacterItem[];
    spells = medievalMageSpells as CharacterItem[];
  } else if (classLower === 'warrior' || classLower === 'knight') {
    inventory = medievalWarriorInventory as CharacterItem[];
    spells = medievalWarriorSpells as CharacterItem[];
  } else if (classLower === 'rogue' || classLower === 'thief') {
    inventory = medievalRogueInventory as CharacterItem[];
    spells = medievalRogueSpells as CharacterItem[];
  } else if (classLower === 'archer' || classLower === 'ranger') {
    inventory = medievalArcherInventory as CharacterItem[];
    spells = medievalArcherSpells as CharacterItem[];
  } else if (classLower === 'barbarian' || classLower === 'berserker') {
    inventory = medievalBarbarianInventory as CharacterItem[];
    spells = medievalBarbarianSpells as CharacterItem[];
  } else if (classLower === 'cleric' || classLower === 'priest') {
    inventory = medievalClericInventory as CharacterItem[];
    spells = medievalClericSpells as CharacterItem[];
  } else {
    // Default fallback for unknown classes
    inventory = medievalWarriorInventory as CharacterItem[];
    spells = medievalWarriorSpells as CharacterItem[];
  }
  
  // Get random starter story
  const randomStory = starterStories[Math.floor(Math.random() * starterStories.length)] || 'Your adventure begins...';
  
  const choices = [
    'Approach the bartender for information',
    'Find a table and observe the other patrons', 
    'Head to a room to rest',
    'Strike up a conversation with another patron'
  ];
  
  return {
    inventory,
    spells,
    story: randomStory,
    choices
  };
}

// Get random item from a category
export function getRandomItem(category: 'weapons' | 'spells' | 'potions'): CharacterItem | null {
  const data = loadGameData();
  const items = data[category];
  
  if (!items || items.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

// Get item by name
export function getItemByName(name: string, category?: 'weapons' | 'spells' | 'potions'): CharacterItem | null {
  const data = loadGameData();
  
  if (category) {
    const items = data[category];
    return items.find(item => item.name === name) || null;
  }
  
  // Search all categories
  const allItems = [...data.weapons, ...data.spells, ...data.potions];
  return allItems.find(item => item.name === name) || null;
}

// Get items by type
export function getItemsByType(type: string, category?: 'weapons' | 'spells' | 'potions'): CharacterItem[] {
  const data = loadGameData();
  
  if (category) {
    const items = data[category];
    return items.filter(item => item.type === type);
  }
  
  // Search all categories
  const allItems = [...data.weapons, ...data.spells, ...data.potions];
  return allItems.filter(item => item.type === type);
}

// Generate shop inventory
export function generateShopInventory(shopType: string = 'general', itemCount: number = 5): CharacterItem[] {
  const data = loadGameData();
  let availableItems: CharacterItem[] = [];
  
  switch (shopType) {
    case 'weapon':
      availableItems = data.weapons;
      break;
    case 'magic':
      availableItems = [...data.spells, ...data.potions];
      break;
    case 'potion':
      availableItems = data.potions;
      break;
    case 'general':
    default:
      availableItems = [...data.weapons, ...data.spells, ...data.potions];
      break;
  }
  
  // Shuffle and take random items
  const shuffled = [...availableItems].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, itemCount);
}

// Generate loot
export function generateLoot(): CharacterItem[] {
  const data = loadGameData();
  const lootCount = Math.floor(Math.random() * 3) + 1; // 1-3 items
  
  const allItems = [...data.weapons, ...data.spells, ...data.potions];
  const shuffled = [...allItems].sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, lootCount);
}

// Utility function to get random items from an array
function getRandomItems<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, items.length));
}

// Generate a random shop
export function generateShop(type: 'general' | 'weapon' | 'magic' | 'potion' = 'general') {
  const gameData = loadGameData();
  
  const shopData = {
    general: {
      name: "General Store",
      description: "A well-stocked merchant selling various goods and supplies.",
      items: [
        ...getRandomItems(gameData.weapons, 3),
        ...getRandomItems(gameData.potions, 4),
        ...getRandomItems(gameData.spells, 2)
      ]
    },
    weapon: {
      name: "Weapon Shop",
      description: "A specialized armory with fine weapons and armor.",
      items: getRandomItems(gameData.weapons, 8)
    },
    magic: {
      name: "Magic Shop",
      description: "A mystical shop filled with spells and magical items.",
      items: [
        ...getRandomItems(gameData.spells, 6),
        ...getRandomItems(gameData.potions, 3)
      ]
    },
    potion: {
      name: "Potion Shop",
      description: "An alchemist's shop with healing potions and elixirs.",
      items: getRandomItems(gameData.potions, 8)
    }
  };

  return shopData[type];
}
