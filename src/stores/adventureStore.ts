import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LootItem {
  id?: string
  name: string
  damage?: number
  price?: number
  type: string
  weaponClass?: string
  healing?: number
  manaCost?: number
  element?: string
  cooldown?: number
  amount?: number
  point?: number
  description?: string
  armor?: number
  mana?: number
  effect?: string
  rarity?: string
  quantity?: number
}

export interface Adventure {
  id: string
  name: string
  class: string
  level: number
  hp: number
  maxHp: number
  mana: number
  maxMana: number
  gold: number
  createdAt: number
  lastPlayed: number
  place: string
  time: string
  inventory: LootItem[]
  spells: LootItem[]
  story?: string
  isActive: boolean
}

interface AdventureState {
  adventures: Adventure[]
  currentAdventureId: string | null
  addAdventure: (adventure: Omit<Adventure, 'id' | 'createdAt' | 'lastPlayed'>) => string
  updateAdventure: (id: string, updates: Partial<Adventure>) => void
  deleteAdventure: (id: string) => void
  setCurrentAdventure: (id: string | null) => void
  getCurrentAdventure: () => Adventure | null
  getLatestAdventure: () => Adventure | null
  updateLastPlayed: (id: string) => void
}

export const useAdventureStore = create<AdventureState>()(
  persist(
    (set, get) => ({
      adventures: [],
      currentAdventureId: null,

      addAdventure: (adventureData) => {
        const id = `adventure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newAdventure: Adventure = {
          ...adventureData,
          id,
          createdAt: Date.now(),
          lastPlayed: Date.now(),
        }
        
        set((state) => ({
          adventures: [...state.adventures, newAdventure],
          currentAdventureId: id
        }))
        
        return id
      },

      updateAdventure: (id, updates) => {
        set((state) => ({
          adventures: state.adventures.map(adventure =>
            adventure.id === id
              ? { ...adventure, ...updates, lastPlayed: Date.now() }
              : adventure
          )
        }))
      },

      deleteAdventure: (id) => {
        set((state) => ({
          adventures: state.adventures.filter(adventure => adventure.id !== id),
          currentAdventureId: state.currentAdventureId === id ? null : state.currentAdventureId
        }))
      },

      setCurrentAdventure: (id) => {
        set({ currentAdventureId: id })
        if (id) {
          get().updateLastPlayed(id)
        }
      },

      getCurrentAdventure: () => {
        const { adventures, currentAdventureId } = get()
        return adventures.find(adventure => adventure.id === currentAdventureId) || null
      },

      getLatestAdventure: () => {
        const { adventures } = get()
        if (adventures.length === 0) return null
        return adventures.reduce((latest, current) =>
          current.lastPlayed > latest.lastPlayed ? current : latest
        )
      },

      updateLastPlayed: (id) => {
        set((state) => ({
          adventures: state.adventures.map(adventure =>
            adventure.id === id
              ? { ...adventure, lastPlayed: Date.now() }
              : adventure
          )
        }))
      }
    }),
    {
      name: 'mythic-conjurer-adventures'
    }
  )
)
