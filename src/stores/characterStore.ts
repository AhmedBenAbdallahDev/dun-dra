import { create } from 'zustand'
import { subscribeWithSelector, persist } from 'zustand/middleware'

// Character data interfaces
interface CharacterStats {
  hp: number
  maxHp: number
  mp: number
  maxMp: number
}

export interface CharacterItem {
  id?: string
  name: string
  damage?: number
  type: string
  weaponClass?: string
  healing?: number
  manaCost?: number
  element?: string
  cooldown?: number
  price?: number
  point?: number
  mana?: number
  armor?: number
  description?: string
  rarity?: string
  effect?: string
  quantity?: number
}

interface Character {
  stats: CharacterStats
  inventory: CharacterItem[]
  spells: CharacterItem[]
}

interface CharacterState {
  character: Character
  stats: CharacterStats
  gold: number
  spells: CharacterItem[]
  inventory: CharacterItem[]
  
  // Actions
  setStats: (stats: Partial<CharacterStats>) => void
  setGold: (gold: number) => void
  addGold: (amount: number) => void
  subtractGold: (amount: number) => void
  setSpells: (spells: CharacterItem[]) => void
  addSpell: (spell: CharacterItem) => void
  removeSpell: (spellName: string) => void
  setInventory: (inventory: CharacterItem[]) => void
  addInventoryItem: (item: CharacterItem) => void
  addItemToInventory: (item: CharacterItem) => void
  removeInventoryItem: (itemName: string) => void
  removeItemFromInventory: (itemId: string) => void
  updateHp: (hp: number) => void
  updateMp: (mp: number) => void
  heal: (amount: number) => void
  restoreMp: (amount: number) => void
  takeDamage: (amount: number) => void
  spendMp: (amount: number) => void
  
  // Helper functions
  getHpPercentage: () => number
  getMpPercentage: () => number
  isDead: () => boolean
  canAfford: (price: number) => boolean
  hasMana: (cost: number) => boolean
  
  // Reset function
  reset: () => void
}

const initialStats: CharacterStats = {
  hp: 80,
  maxHp: 80,
  mp: 110,
  maxMp: 110
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      character: {
        stats: initialStats,
        inventory: [],
        spells: []
      },
      stats: initialStats,
      gold: 30,
      spells: [],
      inventory: [],
      
      setStats: (stats) => set((state) => ({
        stats: { ...state.stats, ...stats }
      })),
      
      setGold: (gold) => set({ gold }),
      
      addGold: (amount) => set((state) => ({
        gold: state.gold + amount
      })),
      
      subtractGold: (amount) => set((state) => ({
        gold: Math.max(0, state.gold - amount)
      })),
      
      setSpells: (spells) => set({ spells }),
      
      addSpell: (spell) => set((state) => ({
        spells: [...state.spells, spell]
      })),
      
      removeSpell: (spellName) => set((state) => ({
        spells: state.spells.filter(spell => spell.name !== spellName)
      })),
      
      setInventory: (inventory) => set({ inventory }),
        addInventoryItem: (item) => set((state) => ({
        inventory: [...state.inventory, item],
        character: {
          ...state.character,
          inventory: [...state.character.inventory, item]
        }
      })),
      
      addItemToInventory: (item) => set((state) => ({
        inventory: [...state.inventory, item],
        character: {
          ...state.character,
          inventory: [...state.character.inventory, item]
        }
      })),
      
      removeInventoryItem: (itemName) => set((state) => ({
        inventory: state.inventory.filter(item => item.name !== itemName),
        character: {
          ...state.character,
          inventory: state.character.inventory.filter(item => item.name !== itemName)
        }
      })),
      
      removeItemFromInventory: (itemId) => set((state) => ({
        inventory: state.inventory.filter(item => item.id !== itemId && item.name !== itemId),
        character: {
          ...state.character,
          inventory: state.character.inventory.filter(item => item.id !== itemId && item.name !== itemId)
        }
      })),
      
      updateHp: (hp) => set((state) => ({
        stats: { ...state.stats, hp: Math.max(0, Math.min(hp, state.stats.maxHp)) }
      })),
      
      updateMp: (mp) => set((state) => ({
        stats: { ...state.stats, mp: Math.max(0, Math.min(mp, state.stats.maxMp)) }
      })),
      
      heal: (amount) => set((state) => ({
        stats: { ...state.stats, hp: Math.min(state.stats.maxHp, state.stats.hp + amount) }
      })),
      
      restoreMp: (amount) => set((state) => ({
        stats: { ...state.stats, mp: Math.min(state.stats.maxMp, state.stats.mp + amount) }
      })),
      
      takeDamage: (amount) => set((state) => ({
        stats: { ...state.stats, hp: Math.max(0, state.stats.hp - amount) }
      })),
      
      spendMp: (amount) => set((state) => ({
        stats: { ...state.stats, mp: Math.max(0, state.stats.mp - amount) }
      })),
      
      getHpPercentage: () => {
        const { stats } = get()
        return (stats.hp / stats.maxHp) * 100
      },
      
      getMpPercentage: () => {
        const { stats } = get()
        return (stats.mp / stats.maxMp) * 100
      },
      
      isDead: () => {
        const { stats } = get()
        return stats.hp <= 0
      },
      
      canAfford: (price) => {
        const { gold } = get()
        return gold >= price
      },
      
      hasMana: (cost) => {
        const { stats } = get()
        return stats.mp >= cost
      },
        reset: () => set({
        character: {
          stats: initialStats,
          inventory: [],
          spells: []
        },
        stats: initialStats,
        gold: 30,
        spells: [],
        inventory: []
      })
    })),    {
      name: 'mythic-conjurer-character',
      partialize: (state) => ({
        character: state.character,
        stats: state.stats,
        gold: state.gold,
        spells: state.spells,
        inventory: state.inventory
      })
    }
  )
)
