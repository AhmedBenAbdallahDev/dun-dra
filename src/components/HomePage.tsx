import React, { useState, useEffect } from 'react'
import { useAdventureStore } from '@/stores/adventureStore'
import { useUIStore } from '@/stores/uiStore'
import { Plus, Play, Clock, Heart, Zap, Trash2, Settings } from 'lucide-react'
import CreateAdventureModal from './CreateAdventureModal'
import SettingsUI from './SettingsUI'

const getClassIcon = (className: string) => {
  switch (className.toLowerCase()) {
    case 'mage':
    case 'wizard':
      return '🧙‍♂️'
    case 'warrior':
    case 'knight':
      return '⚔️'
    case 'rogue':
    case 'assassin':
      return '🗡️'
    case 'archer':
    case 'ranger':
      return '🏹'
    case 'paladin':
      return '🛡️'
    case 'barbarian':
      return '🪓'
    default:
      return '⚔️'
  }
}

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 1) {
    return 'Just now'
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`
  } else if (diffInHours < 168) { // 7 days
    return `${Math.floor(diffInHours / 24)} days ago`
  } else {
    return date.toLocaleDateString()
  }
}

interface HomePageProps {
  onStartGame: () => void
}

export default function HomePage({ onStartGame }: HomePageProps) {
  const { 
    adventures, 
    setCurrentAdventure, 
    getLatestAdventure,
    deleteAdventure 
  } = useAdventureStore()
  const { toggleSettingsWindow } = useUIStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch by only showing latest adventure after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const latestAdventure = isMounted ? getLatestAdventure() : null

  const handleResumeAdventure = (adventureId: string) => {
    setCurrentAdventure(adventureId)
    onStartGame()
  }

  const handleResumeLatest = () => {
    if (latestAdventure) {
      setCurrentAdventure(latestAdventure.id)
      onStartGame()
    }
  }

  const handleDeleteAdventure = (adventureId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this adventure?')) {
      deleteAdventure(adventureId)
    }
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    onStartGame()
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <SettingsUI />
      <div className="max-w-6xl mx-auto">
        {/* Header */}        <div className="text-center mb-12 relative">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent mb-4">
            Mythic Conjurer
          </h1>
          <p className="text-slate-300 text-xl">
            Embark on magical adventures and shape your destiny
          </p>
          <button 
            onClick={() => toggleSettingsWindow()}
            className="absolute top-0 right-0 md:right-8 bg-slate-700/80 hover:bg-slate-600/80 p-2 rounded-full text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
            aria-label="Settings"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          {latestAdventure && (            <button
              onClick={handleResumeLatest}
              className="bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600/60 
                         px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl 
                         transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
            >
              <Play className="w-6 h-6" />
              Resume Latest Adventure
            </button>
          )}
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600/60 
                       px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl 
                       transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
          >
            <Plus className="w-6 h-6" />
            Create New Adventure
          </button>
          
          <button
            onClick={() => toggleSettingsWindow()}
            className="bg-slate-700/80 hover:bg-slate-600/80 border border-slate-600/60 
                       px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl 
                       transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
          >
            <Settings className="w-6 h-6" />
            AI Settings
          </button>
        </div>

        {/* Adventures Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Your Adventures</h2>
          
          {adventures.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎲</div>
              <h3 className="text-2xl font-semibold text-slate-300 mb-2">No Adventures Yet</h3>
              <p className="text-slate-400 mb-6">Create your first adventure to begin your journey!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                           px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl 
                           transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create Adventure
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adventures
                .sort((a, b) => b.lastPlayed - a.lastPlayed)
                .map((adventure) => (
                  <div
                    key={adventure.id}
                    onClick={() => handleResumeAdventure(adventure.id)}
                    className="bg-slate-800/90 backdrop-blur-sm border border-slate-600/60 rounded-xl p-6 
                               shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105 
                               transition-all duration-200 group"
                  >
                    {/* Adventure Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getClassIcon(adventure.class)}</span>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                            {adventure.name}
                          </h3>
                          <p className="text-sm text-slate-400">Level {adventure.level} {adventure.class}</p>
                        </div>
                      </div>
                        <div className="flex gap-2">
                        <button
                          onClick={(e) => handleDeleteAdventure(adventure.id, e)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 
                                     rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-slate-300">
                          {adventure.hp}/{adventure.maxHp}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-slate-300">
                          {adventure.mana}/{adventure.maxMana}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">💰</span>
                        <span className="text-sm text-slate-300">{adventure.gold}</span>
                      </div>
                    </div>

                    {/* Location & Time */}
                    <div className="mb-4">
                      <p className="text-sm text-slate-400">
                        📍 {adventure.place || 'Unknown Location'}
                      </p>
                      <p className="text-sm text-slate-400">
                        🕐 {adventure.time || '00:00'}
                      </p>
                    </div>

                    {/* Last Played */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      Last played {formatTimestamp(adventure.lastPlayed)}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Adventure Modal */}
      {showCreateModal && (
        <CreateAdventureModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  )
}
