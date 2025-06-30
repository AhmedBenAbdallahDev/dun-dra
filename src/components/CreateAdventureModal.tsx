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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-600/60 rounded-2xl 
                      shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600/60">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Create New Adventure
            </h2>
            <p className="text-slate-300 mt-1">Choose your hero and begin your journey</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Adventure Name */}
          <div>
            <label className="block text-lg font-semibold text-slate-200 mb-3">
              Adventure Name
            </label>
            <input
              type="text"
              value={adventureName}
              onChange={(e) => setAdventureName(e.target.value)}
              placeholder="Enter your adventure name..."
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/60 rounded-xl 
                         text-white placeholder-slate-400 focus:outline-none focus:ring-2 
                         focus:ring-purple-500 focus:border-transparent transition-all"
              maxLength={50}
            />
            <p className="text-sm text-slate-400 mt-2">
              {adventureName.length}/50 characters
            </p>
          </div>

          {/* Character Class Selection */}
          <div>
            <label className="block text-lg font-semibold text-slate-200 mb-4">
              Choose Your Class
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {characterClasses.map((characterClass) => (
                <div
                  key={characterClass.name}
                  onClick={() => setSelectedClass(characterClass.name)}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 
                    ${selectedClass === characterClass.name
                      ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/25'
                      : 'border-slate-600/60 bg-slate-700/30 hover:border-slate-500 hover:bg-slate-700/50'
                    }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl">{characterClass.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{characterClass.name}</h3>
                      <p className="text-sm text-slate-300">{characterClass.description}</p>
                    </div>
                  </div>

                  {/* Stats Display */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-slate-300">HP: {characterClass.stats.hp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-300">Mana: {characterClass.stats.mana}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sword className="w-4 h-4 text-orange-400" />
                      <span className="text-slate-300">{characterClass.stats.damage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300">{characterClass.stats.armor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Starting Equipment Preview */}
          {selectedClass && (
            <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/40">
              <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Starting Equipment
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-slate-300">100 Gold Coins</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">📍</span>
                  <span className="text-slate-300">Starting Village</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">⚔️</span>
                  <span className="text-slate-300">Basic {selectedClass} Equipment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">📚</span>
                  <span className="text-slate-300">Starter Abilities</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-slate-600/60">
          <button
            onClick={onClose}
            className="px-6 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 
                       rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateAdventure}
            disabled={!isFormValid || isCreating}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 
              ${isFormValid && !isCreating
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
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
