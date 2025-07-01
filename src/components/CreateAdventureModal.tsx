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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto">
      <div className="h-screen w-screen md:h-auto md:w-full bg-slate-900 md:bg-slate-800/95 
                      md:border md:border-slate-600/30 md:rounded-xl md:shadow-2xl md:max-w-3xl 
                      md:my-4 md:mx-4 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 md:p-4 border-b border-slate-600/30">
          <div>
            <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-slate-300 to-slate-100 bg-clip-text text-transparent">
              Create Adventure
            </h2>
            <p className="text-slate-300 text-sm md:text-base">Choose your hero</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-3 md:p-4 space-y-4 overflow-y-auto">
          {/* Adventure Name */}
          <div>
            <label className="block text-base font-semibold text-slate-200 mb-2">
              Adventure Name
            </label>
            <input
              type="text"
              value={adventureName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdventureName(e.target.value)}
              placeholder="Enter your adventure name..."
              className="w-full px-3 py-3 bg-slate-700/70 border border-slate-600/80 rounded-lg 
                         text-white placeholder-slate-300 focus:outline-none focus:ring-2 
                         focus:ring-amber-500 focus:border-transparent transition-all text-base
                         leading-relaxed min-h-[44px]"
              maxLength={50}
            />
            <p className="text-xs text-slate-300 mt-1 font-medium">
              {adventureName.length}/50 characters
            </p>
          </div>

          {/* Character Class Selection */}
          <div>
            <label className="block text-base font-semibold text-slate-200 mb-2">
              Choose Your Class
            </label>
            
            {/* Mobile: Ultra Compact Vertical List */}
            <div className="md:hidden space-y-2">
              {characterClasses.map((characterClass) => (
                <div
                  key={characterClass.name}
                  onClick={() => setSelectedClass(characterClass.name)}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 min-h-[50px]
                    ${selectedClass === characterClass.name
                      ? 'border-slate-400 bg-slate-700/40 shadow-lg'
                      : 'border-slate-600/80 bg-slate-700/20 hover:border-slate-500 active:scale-[0.98]'
                    }`}
                >
                  <span className="text-2xl mr-3 flex-shrink-0">{characterClass.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white">{characterClass.name}</h3>
                    <p className="text-xs text-slate-300 truncate">{characterClass.description}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
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
              ))}
            </div>

            {/* Desktop: Grid Layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {characterClasses.map((characterClass) => (
                <div
                  key={characterClass.name}
                  onClick={() => setSelectedClass(characterClass.name)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105
                    ${selectedClass === characterClass.name
                      ? 'border-slate-400 bg-slate-700/50 shadow-xl'
                      : 'border-slate-600/80 bg-slate-700/30 hover:border-slate-500'
                    }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{characterClass.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{characterClass.name}</h3>
                      <p className="text-sm text-slate-200">{characterClass.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded">
                      <Heart className="w-3 h-3 text-red-400" />
                      <span className="text-slate-100">HP: {characterClass.stats.hp}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded">
                      <Zap className="w-3 h-3 text-blue-400" />
                      <span className="text-slate-100">MP: {characterClass.stats.mana}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded">
                      <Sword className="w-3 h-3 text-orange-400" />
                      <span className="text-slate-100 text-xs">{characterClass.stats.damage}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/50 p-2 rounded">
                      <Shield className="w-3 h-3 text-green-400" />
                      <span className="text-slate-100">{characterClass.stats.armor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>          {/* Starting Equipment Preview */}
          {selectedClass && (
            <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
              <h3 className="text-base font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-slate-400" />
                Starting Equipment
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 bg-slate-800/40 p-2 rounded">
                  <Coins className="w-3 h-3 text-yellow-400" />
                  <span className="text-slate-100">100 Gold</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/40 p-2 rounded">
                  <span className="text-blue-400 text-sm">⚔️</span>
                  <span className="text-slate-100">{selectedClass} Kit</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Compact */}
        <div className="bg-slate-900/95 border-t border-slate-600/30 p-3">
          <div className="flex flex-col md:flex-row justify-end gap-2 md:gap-3">
            <button
              onClick={onClose}
              className="px-4 py-3 md:py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 
                         rounded-lg transition-all duration-200 order-2 md:order-1 font-medium
                         border border-slate-600/60 hover:border-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAdventure}
              disabled={!isFormValid || isCreating}
              className={`px-6 py-3 md:py-2 rounded-lg font-semibold transition-all duration-200 order-1 md:order-2 min-h-[44px]
                ${isFormValid && !isCreating
                  ? 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:scale-105'
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
