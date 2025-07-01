import React, { useState } from 'react'
import { useAdventureStore } from '@/stores/adventureStore'
import { loadCharacterStarterData } from '@/lib/gameData'
import { X, Heart, Zap, Sword, Shield, Coins, Sparkles } from 'lucide-react'

const characterClasses = [
  {
    name: 'Mage',
    icon: '🧙‍♂️',
    description: 'Master of arcane arts and elemental magic',
    stats: { hp: 80, mana: 120, damage: 'High Magic', armor: 'Light' }
  },
  {
    name: 'Warrior',
    icon: '⚔️',
    description: 'Mighty fighter with sword and shield',
    stats: { hp: 120, mana: 60, damage: 'High Physical', armor: 'Heavy' }
  },
  {
    name: 'Rogue',
    icon: '🗡️',
    description: 'Swift and stealthy, master of shadows',
    stats: { hp: 100, mana: 80, damage: 'Critical Strikes', armor: 'Medium' }
  },
  {
    name: 'Archer',
    icon: '🏹',
    description: 'Precise ranged combat specialist',
    stats: { hp: 90, mana: 90, damage: 'Ranged', armor: 'Light' }
  },
  {
    name: 'Barbarian',
    icon: '🪓',
    description: 'Fierce warrior from the wild lands',
    stats: { hp: 140, mana: 40, damage: 'Brutal Melee', armor: 'Medium' }
  },
  {
    name: 'Cleric',
    icon: '✨',
    description: 'Divine healer and holy warrior',
    stats: { hp: 110, mana: 100, damage: 'Divine Magic', armor: 'Medium' }
  }
]

interface CreateAdventureModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function CreateAdventureModal({ onClose, onSuccess }: CreateAdventureModalProps) {
  const { addAdventure } = useAdventureStore()
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [adventureName, setAdventureName] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)
  const handleCreateAdventure = async () => {
    if (!adventureName.trim() || !selectedClass) return

    setIsCreating(true)
    
    const selectedClassData = characterClasses.find(c => c.name === selectedClass)
    if (!selectedClassData) return

    // Load starter data for the selected class
    const starterData = loadCharacterStarterData(selectedClass.toLowerCase())

    const newAdventure = {
      name: adventureName.trim(),
      class: selectedClass,
      level: 1,
      hp: selectedClassData.stats.hp,
      maxHp: selectedClassData.stats.hp,
      mana: selectedClassData.stats.mana,
      maxMana: selectedClassData.stats.mana,
      gold: 100,
      place: 'Starting Village',
      time: '08:00',
      inventory: starterData.inventory,
      spells: starterData.spells,
      story: starterData.story,
      isActive: true
    }

    try {
      addAdventure(newAdventure)
      onSuccess()
    } catch (error) {
      console.error('Failed to create adventure:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const isFormValid = adventureName.trim().length > 0 && selectedClass

  return (
    <div className="fixed inset-0 bg-black/50 md:backdrop-blur-sm z-50 flex items-start justify-center md:p-4 overflow-y-auto">
      <div className="h-screen w-screen md:h-auto md:w-full bg-slate-900 md:bg-slate-800/95 md:backdrop-blur-sm 
                      md:border md:border-slate-600/60 md:rounded-2xl md:shadow-2xl md:max-w-4xl 
                      md:my-4 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-600/60 bg-slate-900/95">
          <div>
            <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Create New Adventure
            </h2>
            <p className="text-slate-200 mt-1 text-sm md:text-base">Choose your hero and begin your journey</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
          {/* Adventure Name */}
          <div>
            <label className="block text-lg font-semibold text-slate-200 mb-3">
              Adventure Name
            </label>
            <input
              type="text"
              value={adventureName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdventureName(e.target.value)}
              placeholder="Enter your adventure name..."
              className="w-full px-4 py-4 bg-slate-700/70 border border-slate-600/80 rounded-xl 
                         text-white placeholder-slate-300 focus:outline-none focus:ring-2 
                         focus:ring-amber-500 focus:border-transparent transition-all text-base
                         leading-relaxed min-h-[3rem]"
              maxLength={50}
            />
            <p className="text-sm text-slate-300 mt-2 font-medium">
              {adventureName.length}/50 characters
            </p>
          </div>

          {/* Character Class Selection */}
          <div>
            <label className="block text-lg font-semibold text-slate-200 mb-4">
              Choose Your Class
            </label>
            
            {/* Mobile: Vertical Stack */}
            <div className="md:hidden space-y-3">
              {characterClasses.map((characterClass) => (
                <div
                  key={characterClass.name}
                  onClick={() => setSelectedClass(characterClass.name)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 min-h-[80px]
                    ${selectedClass === characterClass.name
                      ? 'border-amber-500 bg-gradient-to-r from-amber-500/20 to-orange-500/20 shadow-lg shadow-amber-500/20'
                      : 'border-slate-600/80 bg-slate-700/40 hover:border-slate-500 hover:bg-slate-700/60 active:scale-[0.98]'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl flex-shrink-0">{characterClass.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white leading-tight">{characterClass.name}</h3>
                      <p className="text-sm text-slate-200 leading-relaxed line-clamp-2">{characterClass.description}</p>
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-400" />
                        <span className="text-slate-100">{characterClass.stats.hp}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-blue-400" />
                        <span className="text-slate-100">{characterClass.stats.mana}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Grid Layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {characterClasses.map((characterClass) => (
                <div
                  key={characterClass.name}
                  onClick={() => setSelectedClass(characterClass.name)}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105
                    ${selectedClass === characterClass.name
                      ? 'border-amber-500 bg-gradient-to-br from-amber-500/25 to-orange-500/25 shadow-xl shadow-amber-500/30'
                      : 'border-slate-600/80 bg-slate-700/40 hover:border-slate-500 hover:bg-slate-700/60'
                    }`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-5xl">{characterClass.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{characterClass.name}</h3>
                      <p className="text-sm text-slate-200 leading-relaxed">{characterClass.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-slate-800/50 p-3 rounded-lg">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-slate-100 font-medium">HP: {characterClass.stats.hp}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/50 p-3 rounded-lg">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-100 font-medium">MP: {characterClass.stats.mana}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/50 p-3 rounded-lg">
                      <Sword className="w-4 h-4 text-orange-400" />
                      <span className="text-slate-100 font-medium text-xs">{characterClass.stats.damage}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/50 p-3 rounded-lg">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span className="text-slate-100 font-medium">{characterClass.stats.armor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>          {/* Starting Equipment Preview */}
          {selectedClass && (
            <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl p-4 md:p-6 border border-slate-600/60 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Starting Equipment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-lg border border-slate-600/30">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-slate-100 font-medium">100 Gold Coins</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-lg border border-slate-600/30">
                  <span className="text-amber-400">📍</span>
                  <span className="text-slate-100 font-medium">Starting Village</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-lg border border-slate-600/30">
                  <span className="text-blue-400">⚔️</span>
                  <span className="text-slate-100 font-medium">Basic {selectedClass} Equipment</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-800/40 p-3 rounded-lg border border-slate-600/30">
                  <span className="text-green-400">📚</span>
                  <span className="text-slate-100 font-medium">Starter Abilities</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Sticky on mobile */}
        <div className="bg-slate-900/95 backdrop-blur-sm border-t border-slate-600/60 p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-4">
            <button
              onClick={onClose}
              className="px-6 py-4 md:py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 
                         rounded-xl transition-all duration-200 order-2 md:order-1 font-medium
                         border border-slate-600/60 hover:border-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAdventure}
              disabled={!isFormValid || isCreating}
              className={`px-8 py-4 md:py-3 rounded-xl font-semibold transition-all duration-200 order-1 md:order-2 min-h-[48px]
                ${isFormValid && !isCreating
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                }`}
            >
              {isCreating ? 'Creating...' : 'Begin Adventure'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
