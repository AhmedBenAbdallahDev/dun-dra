import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// Selected Item interface - used for combat, selling, and item interactions
interface SelectedItemState {
  name?: string
  damage?: number
  healing?: number
  manaCost?: number
  price?: number
  type?: string
  weaponClass?: string
  element?: string
  combatScore?: number
  prompt?: string
  other?: boolean
  showDescription?: string
  
  // Actions
  setSelectedItem: (item: Partial<SelectedItemState>) => void
  clearSelectedItem: () => void
  setCombatScore: (score: number) => void
  setPrompt: (prompt: string) => void
}

export const useSelectedItemStore = create<SelectedItemState>()(
  subscribeWithSelector((set) => ({
    name: undefined,
    damage: undefined,
    healing: undefined,
    manaCost: undefined,
    price: undefined,
    type: undefined,
    weaponClass: undefined,
    element: undefined,
    combatScore: undefined,
    prompt: undefined,
    other: undefined,
    showDescription: 'none',
    
    setSelectedItem: (item) => set((state) => ({ ...state, ...item })),
    
    clearSelectedItem: () => set({
      name: undefined,
      damage: undefined,
      healing: undefined,
      manaCost: undefined,
      price: undefined,
      type: undefined,
      weaponClass: undefined,
      element: undefined,
      combatScore: undefined,
      prompt: undefined,
      other: undefined,
      showDescription: 'none'
    }),
    
    setCombatScore: (combatScore) => set({ combatScore }),
    
    setPrompt: (prompt) => set({ prompt })
  }))
)

// Cooldowns store - tracks spell cooldowns
interface CooldownsState {
  cooldowns: Record<string, number>
  
  // Actions
  setCooldown: (spellName: string, cooldown: number) => void
  decrementCooldowns: () => void
  getCooldown: (spellName: string) => number
  isCooldownActive: (spellName: string, requiredCooldown: number) => boolean
  clearCooldowns: () => void
}

export const useCooldownsStore = create<CooldownsState>()(
  subscribeWithSelector((set, get) => ({
    cooldowns: {},
    
    setCooldown: (spellName, cooldown) => set((state) => ({
      cooldowns: { ...state.cooldowns, [spellName]: cooldown }
    })),
    
    decrementCooldowns: () => set((state) => {
      const newCooldowns = { ...state.cooldowns }
      Object.keys(newCooldowns).forEach(key => {
        if (newCooldowns[key] > 0) {
          newCooldowns[key] += 1
        }
      })
      return { cooldowns: newCooldowns }
    }),
    
    getCooldown: (spellName) => {
      const { cooldowns } = get()
      return cooldowns[spellName] || 0
    },
    
    isCooldownActive: (spellName, requiredCooldown) => {
      const { cooldowns } = get()
      const currentCooldown = cooldowns[spellName] || 0
      return currentCooldown < requiredCooldown
    },
    
    clearCooldowns: () => set({ cooldowns: {} })
  }))
)
