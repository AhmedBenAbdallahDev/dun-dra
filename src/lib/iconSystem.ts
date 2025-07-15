// Unified Icon System for All Game Items
// This ensures every item has an appropriate icon

export interface ItemIconMapping {
  name?: string;
  type?: string;
  weaponClass?: string;
  element?: string;
  healing?: number;
  damage?: number;
  mana?: number;
  rarity?: string;
}

export function getUnifiedItemIcon(item: ItemIconMapping): string {
  // Priority 1: Specific name-based icons (for unique items)
  const nameBasedIcon = getNameBasedIcon(item.name?.toLowerCase() || '');
  if (nameBasedIcon) return nameBasedIcon;
  
  // Priority 2: Type-based icons with comprehensive mapping
  if (item.type) {
    const typeIcon = getTypeBasedIcon(item.type, item);
    if (typeIcon) return typeIcon;
  }
  
  // Priority 3: Fallback based on stats
  const statsIcon = getStatsBasedIcon(item);
  if (statsIcon) return statsIcon;
  
  // Final fallback
  return '/images/item.svg';
}

function getNameBasedIcon(name: string): string | null {
  // Specific item name patterns
  const namePatterns: Record<string, string> = {
    // Currency
    'gold': '/images/gold.svg',
    'coin': '/images/gold.svg',
    'money': '/images/gold.svg',
    'treasure': '/images/gold.svg',
    
    // Common potions
    'health potion': '/images/potion.svg',
    'healing potion': '/images/potion.svg',
    'mana potion': '/images/potion.svg',
    'magic potion': '/images/potion.svg',
    'life potion': '/images/potion.svg',
    'vitality potion': '/images/potion.svg',
    'energy potion': '/images/potion.svg',
    
    // Scrolls and books
    'scroll': '/images/arcane.svg',
    'tome': '/images/arcane.svg',
    'book': '/images/arcane.svg',
    'grimoire': '/images/arcane.svg',
    'manual': '/images/arcane.svg',
    
    // Crystals and gems
    'crystal': '/images/unique.svg',
    'gem': '/images/unique.svg',
    'stone': '/images/unique.svg',
    'orb': '/images/unique.svg',
    'jewel': '/images/unique.svg',
    
    // Armor pieces
    'armor': '/images/item.svg',
    'shield': '/images/item.svg',
    'helmet': '/images/item.svg',
    'gauntlet': '/images/item.svg',
    'boot': '/images/item.svg',
    
    // Tools and misc
    'key': '/images/item.svg',
    'tool': '/images/item.svg',
    'rope': '/images/item.svg',
    'torch': '/images/fire.svg',
    'lantern': '/images/light.svg',
  };
  
  // Check for exact matches first
  if (namePatterns[name]) return namePatterns[name];
  
  // Check for partial matches
  for (const [pattern, icon] of Object.entries(namePatterns)) {
    if (name.includes(pattern)) return icon;
  }
  
  return null;
}

function getTypeBasedIcon(type: string, item: ItemIconMapping): string | null {
  const lowerType = type.toLowerCase();
  
  switch (lowerType) {
    case 'gold':
    case 'currency':
    case 'coin':
      return '/images/gold.svg';
      
    case 'weapon':
      return getWeaponIcon(item.weaponClass);
      
    case 'potion':
      return '/images/potion.svg';
      
    case 'destruction spell':
    case 'healing spell':
    case 'unique spell':
    case 'spell':
      return getSpellIcon(item.element);
      
    case 'armor':
    case 'shield':
      return '/images/item.svg';
      
    case 'consumable':
    case 'food':
      if (item.healing) return '/images/potion.svg';
      if (item.mana) return '/images/arcane.svg';
      return '/images/item.svg';
      
    case 'accessory':
    case 'jewelry':
    case 'ring':
    case 'amulet':
      return '/images/unique.svg';
      
    case 'material':
    case 'ingredient':
      return '/images/item.svg';
      
    case 'key item':
    case 'quest item':
      return '/images/unique.svg';
      
    default:
      return null;
  }
}

function getWeaponIcon(weaponClass?: string): string {
  if (!weaponClass) return '/images/sword.svg';
  
  const weaponIcons: Record<string, string> = {
    // Swords
    'sword': '/images/sword.svg',
    'greatsword': '/images/sword.svg',
    'longsword': '/images/sword.svg',
    'shortsword': '/images/sword.svg',
    'broadsword': '/images/sword.svg',
    'scimitar': '/images/sword.svg',
    'rapier': '/images/sword.svg',
    'katana': '/images/sword.svg',
    'blade': '/images/sword.svg',
    
    // Axes
    'axe': '/images/axe.svg',
    'hatchet': '/images/axe.svg',
    'battleaxe': '/images/axe.svg',
    'greataxe': '/images/axe.svg',
    'tomahawk': '/images/axe.svg',
    
    // Ranged
    'bow': '/images/bow.svg',
    'longbow': '/images/bow.svg',
    'shortbow': '/images/bow.svg',
    'crossbow': '/images/bow.svg',
    'compound bow': '/images/bow.svg',
    
    // Daggers
    'dagger': '/images/dagger.svg',
    'knife': '/images/dagger.svg',
    'stiletto': '/images/dagger.svg',
    'dirk': '/images/dagger.svg',
    
    // Maces
    'mace': '/images/mace.svg',
    'club': '/images/mace.svg',
    'hammer': '/images/mace.svg',
    'maul': '/images/mace.svg',
    'warhammer': '/images/mace.svg',
    
    // Spears
    'spear': '/images/spear.svg',
    'lance': '/images/spear.svg',
    'pike': '/images/spear.svg',
    'halberd': '/images/spear.svg',
    'trident': '/images/spear.svg',
    
    // Flails
    'flail': '/images/flail.svg',
    'morningstar': '/images/flail.svg',
    'chain': '/images/flail.svg',
  };
  
  const key = weaponClass.toLowerCase();
  return weaponIcons[key] || '/images/sword.svg';
}

function getSpellIcon(element?: string): string {
  if (!element) return '/images/arcane.svg';
  
  const elementIcons: Record<string, string> = {
    'fire': '/images/fire.svg',
    'flame': '/images/fire.svg',
    'burn': '/images/fire.svg',
    'heat': '/images/fire.svg',
    
    'ice': '/images/ice.svg',
    'frost': '/images/ice.svg',
    'cold': '/images/ice.svg',
    'freeze': '/images/ice.svg',
    'snow': '/images/ice.svg',
    
    'lightning': '/images/lightning.svg',
    'thunder': '/images/lightning.svg',
    'electric': '/images/lightning.svg',
    'shock': '/images/lightning.svg',
    'storm': '/images/lightning.svg',
    
    'dark': '/images/dark.svg',
    'shadow': '/images/dark.svg',
    'death': '/images/dark.svg',
    'void': '/images/dark.svg',
    'curse': '/images/dark.svg',
    
    'light': '/images/light.svg',
    'holy': '/images/light.svg',
    'divine': '/images/light.svg',
    'radiant': '/images/light.svg',
    'sun': '/images/light.svg',
    
    'toxic': '/images/toxic.svg',
    'poison': '/images/toxic.svg',
    'acid': '/images/toxic.svg',
    'venom': '/images/toxic.svg',
    
    'arcane': '/images/arcane.svg',
    'magic': '/images/arcane.svg',
    'mystical': '/images/arcane.svg',
    'ethereal': '/images/arcane.svg',
  };
  
  const key = element.toLowerCase();
  return elementIcons[key] || '/images/arcane.svg';
}

function getStatsBasedIcon(item: ItemIconMapping): string | null {
  // If has healing, it's probably a potion or healing item
  if (item.healing && item.healing > 0) {
    return '/images/potion.svg';
  }
  
  // If has mana, it's probably a mana item or spell
  if (item.mana && item.mana > 0) {
    return '/images/arcane.svg';
  }
  
  // If has damage, it's probably a weapon
  if (item.damage && item.damage > 0) {
    return '/images/sword.svg';
  }
  
  // Based on rarity
  if (item.rarity) {
    const rarityIcons: Record<string, string> = {
      'legendary': '/images/unique.svg',
      'epic': '/images/unique.svg',
      'rare': '/images/unique.svg',
      'uncommon': '/images/item.svg',
      'common': '/images/item.svg',
    };
    return rarityIcons[item.rarity.toLowerCase()] || null;
  }
  
  return null;
}

// Smart icon suggestion based on AI-like logic for unknown items
export function generateIconFromName(itemName: string): string {
  const name = itemName.toLowerCase();
  
  // Pattern matching for icon generation
  const patterns = [
    // Weapon patterns
    { pattern: /(sword|blade|katana|scimitar|rapier)/, icon: '/images/sword.svg' },
    { pattern: /(axe|hatchet|cleaver)/, icon: '/images/axe.svg' },
    { pattern: /(bow|arrow)/, icon: '/images/bow.svg' },
    { pattern: /(dagger|knife|stiletto)/, icon: '/images/dagger.svg' },
    { pattern: /(mace|club|hammer|maul)/, icon: '/images/mace.svg' },
    { pattern: /(spear|lance|pike|trident)/, icon: '/images/spear.svg' },
    { pattern: /(flail|chain|morningstar)/, icon: '/images/flail.svg' },
    
    // Potion patterns
    { pattern: /(potion|elixir|tonic|brew|draught|vial)/, icon: '/images/potion.svg' },
    { pattern: /(heal|health|life|vital|cure|remedy)/, icon: '/images/potion.svg' },
    
    // Magic patterns
    { pattern: /(fire|flame|burn|heat|inferno)/, icon: '/images/fire.svg' },
    { pattern: /(ice|frost|freeze|cold|blizzard)/, icon: '/images/ice.svg' },
    { pattern: /(lightning|thunder|storm|shock|bolt)/, icon: '/images/lightning.svg' },
    { pattern: /(dark|shadow|death|curse|void)/, icon: '/images/dark.svg' },
    { pattern: /(light|holy|divine|radiant|blessed)/, icon: '/images/light.svg' },
    { pattern: /(poison|toxic|acid|venom)/, icon: '/images/toxic.svg' },
    { pattern: /(magic|arcane|mystical|enchanted|spell)/, icon: '/images/arcane.svg' },
    
    // Currency patterns
    { pattern: /(gold|coin|money|treasure|wealth)/, icon: '/images/gold.svg' },
    
    // Special items
    { pattern: /(crystal|gem|jewel|orb|stone)/, icon: '/images/unique.svg' },
    { pattern: /(scroll|tome|book|grimoire|manual)/, icon: '/images/arcane.svg' },
    { pattern: /(key|tool|rope|torch|lantern)/, icon: '/images/item.svg' },
  ];
  
  for (const { pattern, icon } of patterns) {
    if (pattern.test(name)) {
      return icon;
    }
  }
  
  return '/images/item.svg';
}
