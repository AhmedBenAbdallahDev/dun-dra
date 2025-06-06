import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// AI Configuration store for configurable AI settings
interface AIConfigState {
  aiProvider: string
  apiKey: string
  baseUrl: string
  model: string
  maxTokens: number
  temperature: number
  
  // Configuration object for easy access
  config: {
    provider: string
    apiKey: string
    baseURL: string
    model: string
    maxTokens: number
    temperature: number
  }
  
  // Predefined configurations
  providers: {
    [key: string]: {
      name: string
      baseUrl: string
      defaultModel: string
      requiresKey: boolean
    }
  }
  
  // Actions
  setProvider: (provider: string) => void
  setApiKey: (key: string) => void
  setBaseUrl: (url: string) => void
  setModel: (model: string) => void
  setMaxTokens: (tokens: number) => void
  setTemperature: (temp: number) => void
  loadPreset: (presetName: string) => void
  reset: () => void
}

const defaultProviders = {
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'anthropic/claude-3.5-sonnet',
    requiresKey: true
  },
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4',
    requiresKey: true
  },
  local: {
    name: 'Local/Ollama',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama2',
    requiresKey: false
  },
  custom: {
    name: 'Custom Endpoint',
    baseUrl: '',
    defaultModel: '',
    requiresKey: false
  }
}

export const useAIConfigStore = create<AIConfigState>()(  persist(
    (set, get) => ({
      aiProvider: 'openrouter',
      apiKey: '',
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'anthropic/claude-3.5-sonnet',
      maxTokens: 2048,
      temperature: 0.7,
      providers: defaultProviders,
      
      get config() {
        const state = get()
        return {
          provider: state.aiProvider,
          apiKey: state.apiKey,
          baseURL: state.baseUrl,
          model: state.model,
          maxTokens: state.maxTokens,
          temperature: state.temperature
        }
      },
      
      setProvider: (provider) => {
        const config = defaultProviders[provider as keyof typeof defaultProviders]
        if (config) {
          set({
            aiProvider: provider,
            baseUrl: config.baseUrl,
            model: config.defaultModel
          })
        }
      },
      
      setApiKey: (key) => set({ apiKey: key }),
      setBaseUrl: (url) => set({ baseUrl: url }),
      setModel: (model) => set({ model }),
      setMaxTokens: (tokens) => set({ maxTokens: tokens }),
      setTemperature: (temp) => set({ temperature: temp }),
      
      loadPreset: (presetName) => {
        const config = defaultProviders[presetName as keyof typeof defaultProviders]
        if (config) {
          set({
            aiProvider: presetName,
            baseUrl: config.baseUrl,
            model: config.defaultModel
          })
        }
      },
      
      reset: () => set({
        aiProvider: 'openrouter',
        apiKey: '',
        baseUrl: 'https://openrouter.ai/api/v1',
        model: 'anthropic/claude-3.5-sonnet',
        maxTokens: 2048,
        temperature: 0.7
      })
    }),
    {
      name: 'ai-config-storage',
      partialize: (state) => ({
        aiProvider: state.aiProvider,
        apiKey: state.apiKey,
        baseUrl: state.baseUrl,
        model: state.model,
        maxTokens: state.maxTokens,
        temperature: state.temperature
      })
    }
  )
)
