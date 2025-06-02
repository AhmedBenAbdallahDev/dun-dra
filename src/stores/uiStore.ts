import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

// Message types
type MessageType = 'error' | 'buy' | 'sell' | 'bug' | 'maintenance';

// UI State interface
interface UIState {
  errorWarnMsg: string
  buyWarnMsg: string
  sellWarnMsg: string
  showInfoWindow: boolean
  loading: boolean
  showDescription: string
  x: number
  y: number
  diceNumber: number
  query: string
  time: string
  place: string
  currentImg: string
  death: boolean
  interactivePoints: number
  bugWindow: boolean
  maintenanceWindow: boolean
  started: boolean
  heroClass: string
  shopWindow: boolean
  inventoryWindow: boolean
  settingsWindow: boolean
    // Actions
  setErrorWarnMsg: (msg: string) => void
  setBuyWarnMsg: (msg: string) => void
  setSellWarnMsg: (msg: string) => void
  setShowInfoWindow: (show: boolean) => void
  setLoading: (loading: boolean) => void
  setShowDescription: (show: string) => void
  setMousePosition: (x: number, y: number) => void
  setDiceNumber: (number: number) => void
  setQuery: (query: string) => void
  setTime: (time: string) => void
  setPlace: (place: string) => void
  setCurrentImg: (img: string) => void
  setDeath: (death: boolean) => void
  setInteractivePoints: (points: number) => void
  addInteractivePoints: (points: number) => void
  setBugWindow: (show: boolean) => void
  setMaintenanceWindow: (show: boolean) => void
  setStarted: (started: boolean) => void
  setHeroClass: (heroClass: string) => void
  toggleShopWindow: () => void
  toggleInventoryWindow: () => void
  toggleSettingsWindow: () => void
  addMessage: (type: MessageType, message: string) => void
  
  // Clear messages
  clearMessages: () => void
  
  // Reset function
  reset: () => void
}

export const useUIStore = create<UIState>()(
  subscribeWithSelector((set) => ({
    errorWarnMsg: '',
    buyWarnMsg: '',
    sellWarnMsg: '',
    showInfoWindow: false,
    loading: false,
    showDescription: 'none',
    x: 0,
    y: 0,
    diceNumber: 0,
    query: '',
    time: '00:00',
    place: '',
    currentImg: '',
    death: false,
    interactivePoints: 50,
    bugWindow: false,
    maintenanceWindow: false,
    started: false,
    heroClass: '',    shopWindow: false,
    inventoryWindow: false,
    settingsWindow: false,
    
    setErrorWarnMsg: (msg) => set({ errorWarnMsg: msg }),
    setBuyWarnMsg: (msg) => set({ buyWarnMsg: msg }),
    setSellWarnMsg: (msg) => set({ sellWarnMsg: msg }),
    setShowInfoWindow: (show) => set({ showInfoWindow: show }),
    setLoading: (loading) => set({ loading }),
    setShowDescription: (show) => set({ showDescription: show }),
    setMousePosition: (x, y) => set({ x, y }),
    setDiceNumber: (number) => set({ diceNumber: number }),
    setQuery: (query) => set({ query }),
    setTime: (time) => set({ time }),
    setPlace: (place) => set({ place }),
    setCurrentImg: (img) => set({ currentImg: img }),
    setDeath: (death) => set({ death }),
    setInteractivePoints: (points) => set({ interactivePoints: points }),
    addInteractivePoints: (points) => set((state) => ({
      interactivePoints: state.interactivePoints + points
    })),    setBugWindow: (show) => set({ bugWindow: show }),
    setMaintenanceWindow: (show) => set({ maintenanceWindow: show }),
    setStarted: (started) => set({ started }),
    setHeroClass: (heroClass) => set({ heroClass }),
      toggleShopWindow: () => set((state) => ({ shopWindow: !state.shopWindow })),
    toggleInventoryWindow: () => set((state) => ({ inventoryWindow: !state.inventoryWindow })),
    toggleSettingsWindow: () => set((state) => ({ settingsWindow: !state.settingsWindow })),
    
    addMessage: (type: MessageType, message: string) => {
      switch (type) {
        case 'error':
          set({ errorWarnMsg: message });
          break;
        case 'buy':
          set({ buyWarnMsg: message });
          break;
        case 'sell':
          set({ sellWarnMsg: message });
          break;
        case 'bug':
          set({ bugWindow: true });
          break;
        case 'maintenance':
          set({ maintenanceWindow: true });
          break;
      }
    },
    
    clearMessages: () => set({
      errorWarnMsg: '',
      buyWarnMsg: '',
      sellWarnMsg: ''
    }),
      reset: () => set({
      errorWarnMsg: '',
      buyWarnMsg: '',
      sellWarnMsg: '',
      showInfoWindow: false,
      loading: false,
      showDescription: 'none',
      x: 0,
      y: 0,
      diceNumber: 0,
      query: '',
      time: '00:00',
      place: '',
      currentImg: '',
      death: false,
      interactivePoints: 50,
      bugWindow: false,
      maintenanceWindow: false,      started: false,
      heroClass: '',
      shopWindow: false,
      inventoryWindow: false,
      settingsWindow: false
    })
  }))
)
