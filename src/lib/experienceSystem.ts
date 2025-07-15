import { useCharacterStore } from '@/stores/characterStore';

// Experience and leveling system
interface LevelInfo {
  level: number;
  expRequired: number;
  hpBonus: number;
  mpBonus: number;
  damageBonus: number;
}

// Level progression table
const LEVEL_TABLE: LevelInfo[] = [
  { level: 1, expRequired: 0, hpBonus: 0, mpBonus: 0, damageBonus: 0 },
  { level: 2, expRequired: 100, hpBonus: 10, mpBonus: 10, damageBonus: 2 },
  { level: 3, expRequired: 250, hpBonus: 20, mpBonus: 15, damageBonus: 4 },
  { level: 4, expRequired: 450, hpBonus: 30, mpBonus: 20, damageBonus: 6 },
  { level: 5, expRequired: 700, hpBonus: 45, mpBonus: 30, damageBonus: 8 },
  { level: 6, expRequired: 1000, hpBonus: 60, mpBonus: 40, damageBonus: 10 },
  { level: 7, expRequired: 1350, hpBonus: 80, mpBonus: 50, damageBonus: 12 },
  { level: 8, expRequired: 1750, hpBonus: 100, mpBonus: 65, damageBonus: 15 },
  { level: 9, expRequired: 2200, hpBonus: 125, mpBonus: 80, damageBonus: 18 },
  { level: 10, expRequired: 2700, hpBonus: 150, mpBonus: 100, damageBonus: 20 },
];

export function calculateLevel(experience: number): LevelInfo {
  for (let i = LEVEL_TABLE.length - 1; i >= 0; i--) {
    if (experience >= LEVEL_TABLE[i].expRequired) {
      return LEVEL_TABLE[i];
    }
  }
  return LEVEL_TABLE[0]; // Default to level 1
}

export function getExpToNextLevel(experience: number, currentLevel: number): number {
  const nextLevelIndex = Math.min(currentLevel, LEVEL_TABLE.length - 1);
  if (nextLevelIndex >= LEVEL_TABLE.length - 1) return 0; // Max level
  
  return LEVEL_TABLE[nextLevelIndex].expRequired - experience;
}

export function addExperienceToCharacter(expGained: number): { leveledUp: boolean; newLevel: number; oldLevel: number } {
  const store = useCharacterStore.getState();
  const currentExp = store.experience || 0;
  const newExp = currentExp + expGained;
  
  const oldLevel = calculateLevel(currentExp);
  const newLevel = calculateLevel(newExp);
  
  const leveledUp = newLevel.level > oldLevel.level;
  
  // Update experience
  store.setExperience(newExp);
  
  if (leveledUp) {
    // Calculate stat increases
    const hpIncrease = newLevel.hpBonus - oldLevel.hpBonus;
    const mpIncrease = newLevel.mpBonus - oldLevel.mpBonus;
    
    // Increase max stats
    const newMaxHp = store.stats.maxHp + hpIncrease;
    const newMaxMp = store.stats.maxMp + mpIncrease;
    
    store.setStats({
      maxHp: newMaxHp,
      maxMp: newMaxMp,
      hp: newMaxHp, // Full heal on level up
      mp: newMaxMp  // Full mana restore on level up
    });
    
    console.log(`🎉 LEVEL UP! ${oldLevel.level} → ${newLevel.level}`, {
      hpIncrease,
      mpIncrease,
      newMaxHp,
      newMaxMp
    });
  }
  
  return {
    leveledUp,
    newLevel: newLevel.level,
    oldLevel: oldLevel.level
  };
}
