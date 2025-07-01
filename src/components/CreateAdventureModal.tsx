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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600/60 rounded-2xl 
                      shadow-2xl w-full max-w-6xl my-4 sm:my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-600/60">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Create New Adventure
            </h2>
            <p className="text-slate-200 mt-1 text-sm sm:text-base">Choose your hero and begin your journey</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Adventure Name */}
          <div>
            <label className="block text-base sm:text-lg font-semibold text-slate-200 mb-2 sm:mb-3">
              Adventure Name
            </label>
            <input
              type="text"
              value={adventureName}
              onChange={(e) => setAdventureName(e.target.value)}
              placeholder="Enter your adventure name..."
              className="w-full px-4 py-4 bg-slate-700/70 border border-slate-600/80 rounded-xl 
                         text-white placeholder-slate-300 focus:outline-none focus:ring-2 
                         focus:ring-amber-500 focus:border-transparent transition-all text-base
                         leading-relaxed min-h-[3rem]"
              maxLength={50}
            />
            <p className="text-xs sm:text-sm text-slate-300 mt-1 sm:mt-2 font-medium">
              {adventureName.length}/50 characters
            </p>
          </div>

          {/* Character Class Selection */}
          <div>
            <label className="block text-base sm:text-lg font-semibold text-slate-200 mb-3 sm:mb-4">
              Choose Your Class
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {characterClasses.map((characterClass) => (
                <div
                  key={characterClass.name}
                  onClick={() => setSelectedClass(characterClass.name)}
                  className={`p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${selectedClass === characterClass.name
                      ? 'border-amber-500 bg-amber-500/25 shadow-lg shadow-amber-500/30'
                      : 'border-slate-600/80 bg-slate-700/40 hover:border-slate-500 hover:bg-slate-700/60'
                    }`}
                >
                  {/* Mobile Layout - Stack vertically */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{characterClass.icon}</span>
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{characterClass.name}</h3>
                        <p className="text-xs text-slate-200 leading-relaxed">{characterClass.description}</p>
                      </div>
                    </div>
                    
                    {/* Mobile Stats - 2x2 Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1 bg-slate-800/50 p-2 rounded">
                        <Heart className="w-3 h-3 text-red-400" />
                        <span className="text-slate-100 font-medium">HP: {characterClass.stats.hp}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-800/50 p-2 rounded">
                        <Zap className="w-3 h-3 text-blue-400" />
                        <span className="text-slate-100 font-medium">MP: {characterClass.stats.mana}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-800/50 p-2 rounded">
                        <Sword className="w-3 h-3 text-orange-400" />
                        <span className="text-slate-100 font-medium text-xs">{characterClass.stats.damage}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-800/50 p-2 rounded">
                        <Shield className="w-3 h-3 text-green-400" />
                        <span className="text-slate-100 font-medium">{characterClass.stats.armor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout - Original */}
                  <div className="hidden sm:block">
                    <div className="flex items-center gap-4 mb-4 lg:mb-6">
                      <span className="text-4xl lg:text-5xl">{characterClass.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-lg lg:text-xl font-bold text-white mb-1 lg:mb-2">{characterClass.name}</h3>
                        <p className="text-xs lg:text-sm text-slate-200 leading-relaxed">{characterClass.description}</p>
                      </div>
                    </div>

                    {/* Desktop Stats */}
                    <div className="grid grid-cols-2 gap-2 lg:gap-4 text-xs lg:text-sm">
                      <div className="flex items-center gap-2 bg-slate-800/50 p-2 lg:p-3 rounded-lg">
                        <Heart className="w-3 h-3 lg:w-4 lg:h-4 text-red-400" />
                        <span className="text-slate-100 font-medium">HP: {characterClass.stats.hp}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-800/50 p-2 lg:p-3 rounded-lg">
                        <Zap className="w-3 h-3 lg:w-4 lg:h-4 text-blue-400" />
                        <span className="text-slate-100 font-medium">Mana: {characterClass.stats.mana}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-800/50 p-2 lg:p-3 rounded-lg">
                        <Sword className="w-3 h-3 lg:w-4 lg:h-4 text-orange-400" />
                        <span className="text-slate-100 font-medium">{characterClass.stats.damage}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-800/50 p-2 lg:p-3 rounded-lg">
                        <Shield className="w-3 h-3 lg:w-4 lg:h-4 text-green-400" />
                        <span className="text-slate-100 font-medium">{characterClass.stats.armor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Starting Equipment Preview */}
          {selectedClass && (
            <div className="bg-slate-700/50 rounded-xl p-4 sm:p-6 border border-slate-600/60">
              <h3 className="text-base sm:text-lg font-semibold text-slate-100 mb-3 sm:mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                Starting Equipment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2 sm:gap-3 bg-slate-800/40 p-2 sm:p-3 rounded-lg">
                  <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                  <span className="text-slate-100 font-medium">100 Gold Coins</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 bg-slate-800/40 p-2 sm:p-3 rounded-lg">
                  <span className="text-amber-400">📍</span>
                  <span className="text-slate-100 font-medium">Starting Village</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 bg-slate-800/40 p-2 sm:p-3 rounded-lg">
                  <span className="text-blue-400">⚔️</span>
                  <span className="text-slate-100 font-medium">Basic {selectedClass} Equipment</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 bg-slate-800/40 p-2 sm:p-3 rounded-lg">
                  <span className="text-green-400">📚</span>
                  <span className="text-slate-100 font-medium">Starter Abilities</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 p-4 sm:p-6 border-t border-slate-600/60">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 sm:py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 
                       rounded-lg transition-all duration-200 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateAdventure}
            disabled={!isFormValid || isCreating}
            className={`px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 order-1 sm:order-2
              ${isFormValid && !isCreating
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
              }`}
          >
            {isCreating ? 'Creating...' : 'Begin Adventure'}
          </button>
        </div>
      </div>
    </div>
  )
}
