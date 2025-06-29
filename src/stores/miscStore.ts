import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// Background Images store for managing transitions between background images
interface BackgroundState {
  fetchedBg1: string
  fetchedBg2: string
  img1active: boolean
  img2active: boolean
  
  // Actions
  setBackground1: (bg: string) => void
  setBackground2: (bg: string) => void
  activateImage1: () => void
  activateImage2: () => void
  toggleActiveImage: () => void
  clearBackgrounds: () => void
}

export const useBackgroundStore = create<BackgroundState>()(
  subscribeWithSelector((set) => ({
    fetchedBg1: '',
    fetchedBg2: '',
    img1active: false,
    img2active: false,
    
    setBackground1: (bg) => set({ fetchedBg1: bg }),
    setBackground2: (bg) => set({ fetchedBg2: bg }),
    
    activateImage1: () => set({
      img1active: true,
      img2active: false
    }),
    
    activateImage2: () => set({
      img1active: false,
      img2active: true
    }),
    
    toggleActiveImage: () => set((state) => ({
      img1active: !state.img1active,
      img2active: !state.img2active
    })),
    
    clearBackgrounds: () => set({
      fetchedBg1: '',
      fetchedBg2: '',
      img1active: false,
      img2active: false
    })
  }))
)

// Description Window store for item tooltips
interface DescriptionWindowState {
  item?: object
  name?: string
  damage?: number
  type?: string
  healing?: number
  mana?: number
  armor?: number
  element?: string
  weaponClass?: string
  manaCost?: number
  price?: number
  amount?: number
  point?: number
  x?: number
  y?: number
  visible?: boolean
  
  // Actions
  setDescription: (desc: Partial<DescriptionWindowState>) => void
  clearDescription: () => void
}

export const useDescriptionStore = create<DescriptionWindowState>()(
  subscribeWithSelector((set) => ({
    item: undefined,
    name: undefined,
    damage: undefined,
    type: undefined,
    healing: undefined,
    mana: undefined,
    armor: undefined,
    element: undefined,
    weaponClass: undefined,
    manaCost: undefined,
    price: undefined,
    amount: undefined,
    point: undefined,
    x: undefined,
    y: undefined,
    visible: false,
    
    setDescription: (desc) => set((state) => ({ ...state, ...desc })),
      clearDescription: () => set({
      item: undefined,
      name: undefined,
      damage: undefined,
      type: undefined,
      healing: undefined,
      mana: undefined,
      armor: undefined,
      element: undefined,
      weaponClass: undefined,
      manaCost: undefined,
      price: undefined,
      amount: undefined,
      point: undefined,
      x: undefined,
      y: undefined,
      visible: false
    })
  }))
)

// General Misc store for interactive points, loading state, etc.
interface MiscState {
  loading: boolean
  interactivePoints: number
  started: boolean
  diceNumber: number
  
  // Actions
  setLoading: (loading: boolean) => void
  setInteractivePoints: (points: number) => void
  addInteractivePoints: (points: number) => void
  setStarted: (started: boolean) => void
  setDiceNumber: (dice: number) => void
}

export const useMiscStore = create<MiscState>()(
  subscribeWithSelector((set) => ({
    loading: false,
    interactivePoints: 3, // Start with 3 interactive points
    started: false,
    diceNumber: 0,
    
    setLoading: (loading) => set({ loading }),
    setInteractivePoints: (points) => set({ interactivePoints: points }),
    addInteractivePoints: (points) => set((state) => ({ 
      interactivePoints: state.interactivePoints + points 
    })),
    setStarted: (started) => set({ started }),
    setDiceNumber: (dice) => set({ diceNumber: dice })
  }))
)
