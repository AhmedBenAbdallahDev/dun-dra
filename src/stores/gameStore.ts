import { create } from 'zustand'
import { subscribeWithSelector, persist } from 'zustand/middleware'

// Game data interfaces
interface Enemy {
  enemyName?: string
  enemyHp?: number
  enemyMaxHp?: number
}

interface GameEvent {
  inCombat: boolean
  shopMode: string | null
  lootMode: boolean
}

interface PlaceAndTime {
  place: string
  time: string
}

export interface LootItem {
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

export interface ChatMessage {
  content: string
  type: 'user' | 'ai' | 'system'
  timestamp?: number
}

interface GameData {
  lootBox: LootItem[]
  placeAndTime: PlaceAndTime
  shop: LootItem[]
  choices: string[]
  enemy: Enemy
  event: GameEvent
  story?: string
  heroClass?: string
  chatMessages?: ChatMessage[]
}

interface ShopData {
  name: string
  description: string
  items: LootItem[]
}

interface GameState {
  gameData: GameData
  currentShop: ShopData | null
  gold: number
  setGameData: (data: Partial<GameData>) => void
  setStory: (story: string) => void
  setChoices: (choices: string[]) => void
  setEnemy: (enemy: Enemy) => void
  setEvent: (event: Partial<GameEvent>) => void
  setPlaceAndTime: (placeAndTime: Partial<PlaceAndTime>) => void
  setShop: (shop: LootItem[]) => void
  setLootBox: (lootBox: LootItem[]) => void
  setCurrentShop: (shop: ShopData | null) => void
  setGold: (gold: number) => void
  addGold: (amount: number) => void
  spendGold: (amount: number) => void
  clearChoices: () => void
  clearShop: () => void
  clearLootBox: () => void
  updateGameData: (data: Partial<GameData>) => void
  addChatMessage: (message: ChatMessage) => void
  clearChatMessages: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    subscribeWithSelector((set) => ({
      gameData: {
        lootBox: [],
        placeAndTime: { place: '', time: '00:00' },
        shop: [],
        choices: [],
        enemy: {},
        event: { inCombat: false, shopMode: null, lootMode: false },
        story: '',
        heroClass: '',
        chatMessages: []
      },
      currentShop: null,
      gold: 30,
      
      setGameData: (data) => set((state) => ({
        gameData: { ...state.gameData, ...data }
      })),
      
      setStory: (story) => set((state) => ({
        gameData: { ...state.gameData, story }
      })),
      
      setChoices: (choices) => set((state) => ({
        gameData: { ...state.gameData, choices }
      })),
      
      setEnemy: (enemy) => set((state) => ({
        gameData: { ...state.gameData, enemy: { ...state.gameData.enemy, ...enemy } }
      })),
      
      setEvent: (event) => set((state) => ({
        gameData: { ...state.gameData, event: { ...state.gameData.event, ...event } }
      })),
      
      setPlaceAndTime: (placeAndTime) => set((state) => ({
        gameData: { ...state.gameData, placeAndTime: { ...state.gameData.placeAndTime, ...placeAndTime } }
      })),
      
      setShop: (shop) => set((state) => ({
        gameData: { ...state.gameData, shop }
      })),
        setLootBox: (lootBox) => set((state) => ({
        gameData: { ...state.gameData, lootBox }
      })),
      
      setCurrentShop: (shop) => set({ currentShop: shop }),
      
      setGold: (gold) => set({ gold }),
      
      addGold: (amount) => set((state) => ({
        gold: state.gold + amount
      })),
      
      spendGold: (amount) => set((state) => ({
        gold: Math.max(0, state.gold - amount)
      })),
      
      clearChoices: () => set((state) => ({
        gameData: { ...state.gameData, choices: [] }
      })),
      
      clearShop: () => set((state) => ({
        gameData: { ...state.gameData, shop: [] }
      })),
      
      clearLootBox: () => set((state) => ({
        gameData: { ...state.gameData, lootBox: [] }
      })),
      
      updateGameData: (data) => set((state) => ({
        gameData: { ...state.gameData, ...data }
      })),
        addChatMessage: (message) => set((state) => ({
        gameData: { ...state.gameData, chatMessages: [...(state.gameData.chatMessages || []), message] }
      })),
      
      clearChatMessages: () => set((state) => ({
        gameData: { ...state.gameData, chatMessages: [] }
      }))
    })),    {
      name: 'mythic-conjurer-game',
      partialize: (state) => ({ 
        gameData: state.gameData,
        currentShop: state.currentShop,
        gold: state.gold
      })
    }
  )
)
