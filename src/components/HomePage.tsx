import React, { useState, useEffect } from 'react'
import { useAdventureStore, type Adventure } from '@/stores/adventureStore'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-3 md:p-6">
      <SettingsUI />
      <div className="max-w-5xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-2xl shadow-amber-500/20">
              <span className="text-2xl md:text-3xl">🏰</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
              Mythic Conjurer
            </h1>
          </div>
          <p className="text-slate-300 text-lg md:text-xl mb-2">
            Embark on magical adventures powered by AI
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>AI-Powered Storytelling</span>
          </div>
          <button 
            onClick={() => toggleSettingsWindow()}
            className="absolute top-0 right-0 md:right-8 bg-slate-800/80 hover:bg-slate-700/80 p-3 rounded-xl text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 border border-slate-600/50 hover:border-amber-500/50"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>        {/* Quick Actions */}
        <div className="flex flex-col md:flex-row gap-3 justify-center mb-6">
          {latestAdventure && (
            <button
              onClick={handleResumeLatest}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 
                         px-6 py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl 
                         transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2
                         border border-emerald-500/20 hover:border-emerald-400/30"
            >
              <Play className="w-4 h-4" />
              Resume Latest Adventure
            </button>
          )}
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 
                       px-6 py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl 
                       transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2
                       border border-amber-500/20 hover:border-amber-400/30"
          >
            <Plus className="w-4 h-4" />
            New Adventure
          </button>
          
          <button
            onClick={() => toggleSettingsWindow()}
            className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 
                       px-6 py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl 
                       transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2
                       border border-slate-600/30 hover:border-slate-500/50"
          >
            <Settings className="w-4 h-4" />
            AI Settings
          </button>
        </div>

        {/* Adventures Grid */}
        <div className="h-fit">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">Your Adventures</h2>
          
          {adventures.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/20">
                <span className="text-4xl">🎲</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-200 mb-3">Ready for Adventure?</h3>
              <p className="text-slate-400 mb-6 text-base max-w-md mx-auto">
                Create your first magical adventure and let AI craft an epic tale just for you!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 
                           px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl 
                           transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto
                           border border-amber-500/20 hover:border-amber-400/30 text-base"
              >
                <Plus className="w-5 h-5" />
                Start Your Journey
              </button>
            </div>
          ) : (
            <div className={`grid gap-3 md:gap-4 ${
              adventures.length === 1 
                ? 'grid-cols-1 max-w-md mx-auto' 
                : adventures.length === 2 
                ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {adventures
                .sort((a: Adventure, b: Adventure) => b.lastPlayed - a.lastPlayed)
                .map((adventure: Adventure) => (
                  <div
                    key={adventure.id}
                    onClick={() => handleResumeAdventure(adventure.id)}
                    className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-600/60 rounded-2xl p-5 
                               shadow-xl hover:shadow-2xl cursor-pointer transform hover:scale-105 
                               transition-all duration-300 group h-fit hover:border-amber-500/30"
                  >
                    {/* Adventure Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getClassIcon(adventure.class)}</span>
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                            {adventure.name}
                          </h3>
                          <p className="text-sm text-slate-300 font-medium">Level {adventure.level} {adventure.class}</p>
                        </div>
                      </div>
                        <div className="flex gap-1">
                        <button
                          onClick={(e: React.MouseEvent) => handleDeleteAdventure(adventure.id, e)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 
                                     rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="flex items-center gap-1.5 bg-slate-700/40 p-2 rounded-lg">
                        <Heart className="w-3 h-3 text-red-400" />
                        <span className="text-xs text-slate-100 font-medium">
                          {adventure.hp}/{adventure.maxHp}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-700/40 p-2 rounded-lg">
                        <Zap className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-slate-100 font-medium">
                          {adventure.mana}/{adventure.maxMana}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-700/40 p-2 rounded-lg">
                        <span className="text-yellow-400 text-sm">💰</span>
                        <span className="text-xs text-slate-100 font-medium">{adventure.gold}</span>
                      </div>
                    </div>

                    {/* Location & Time */}
                    <div className="mb-3 bg-slate-700/30 p-2 rounded-lg">
                      <p className="text-xs text-slate-200 font-medium mb-1">
                        📍 {adventure.place || 'Unknown Location'}
                      </p>
                      <p className="text-xs text-slate-200 font-medium">
                        🕐 {adventure.time || '00:00'}
                      </p>
                    </div>

                    {/* Last Played */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>Last played {formatTimestamp(adventure.lastPlayed)}</span>
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
