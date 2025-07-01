'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCharacterStore, useGameStore, useUIStore } from '@/stores';
import { generateShop } from '@/lib/gameData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Heart, 
  Zap, 
  Coins, 
  Store, 
  Settings, 
  Menu, 
  Save, 
  Upload, 
  RotateCcw,
  User,
  Sword,
  Home
} from 'lucide-react';

interface UiButtonsProps {
  onBackToHome?: () => void;
  onMapTravel?: (destination: string) => void;
}

export default function UiButtons({ onBackToHome, onMapTravel }: UiButtonsProps) {
  const [showStats, setShowStats] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { stats } = useCharacterStore();
  const { gameData, setCurrentShop, gold } = useGameStore();  const { loading, toggleShopWindow, toggleSettingsWindow, setStarted, reset: resetUI, started } = useUIStore();
  
  const handleMusicToggle = async () => {
    console.log('🎵 UiButtons: Music toggle clicked:', { 
      currentlyPlaying: audioPlaying, 
      hasAudioElement: !!audioElement 
    });
    
    try {
      if (!audioElement) {
        // Create audio element with placeholder/example audio
        // In a real implementation, this would load from a music file
        const audio = new Audio();
        audio.loop = true;
        audio.volume = 0.3; // Set a reasonable volume
        
        // For now, we'll just toggle the state without actual audio
        // This can be extended later when audio files are available
        setAudioElement(audio);
        setAudioPlaying(true);
        console.log('🎵 Music started (placeholder - no audio file available)');
      } else {
        if (audioPlaying) {
          audioElement.pause();
          setAudioPlaying(false);
          console.log('Music paused');
        } else {
          try {
            await audioElement.play();
            setAudioPlaying(true);
            console.log('Music resumed');
          } catch (error) {
            console.log('Audio play failed (no file available):', error);
            setAudioPlaying(!audioPlaying); // Toggle state anyway for UI feedback
          }
        }
      }
    } catch (error) {
      console.error('Music toggle error:', error);
      // Still toggle state for UI feedback
      setAudioPlaying(!audioPlaying);
    }
  };

  const handleFullscreenToggle = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen toggle error:', error);
    }
  };

    // Add click outside listener to close the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menuElement = document.getElementById('simple-menu');
      const menuButton = document.querySelector('button:has(.lucide-menu)');
      
      if (menuElement && menuElement.style.display !== 'none' && 
          menuButton && !menuButton.contains(event.target as Node) && 
          !menuElement.contains(event.target as Node)) {
        menuElement.style.display = 'none';
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });
  
  const handleOpenShop = () => {
    const testShop = generateShop('general');
    setCurrentShop(testShop);
    toggleShopWindow();
  };
  const handleNewGame = () => {
    // First hide the menu to prevent any state issues
    const menuElement = document.getElementById('simple-menu');
    if (menuElement) {
      menuElement.style.display = 'none';
    }
    
    // Then reset UI state
    resetUI();
    setStarted(false);
    
    // Add a delay to break potential update cycles
    setTimeout(() => {
      window.location.href = window.location.pathname; // Full reset without triggering reload state changes
    }, 100);
  };

  const handleSaveGame = () => {
    // Game data is auto-saved via Zustand persist middleware
    // Show confirmation message
    console.log('Game saved successfully!');
    const toast = document.createElement('div');
    toast.textContent = 'Game Saved Successfully!';
    toast.style.cssText = `
      position: fixed; 
      top: 20px; 
      right: 20px; 
      background: #10b981; 
      color: white; 
      padding: 12px 20px; 
      border-radius: 8px; 
      z-index: 9999;
      font-weight: 500;
    `;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };
  const handleLoadGame = () => {
    // First hide the menu to prevent any state issues
    const menuElement = document.getElementById('simple-menu');
    if (menuElement) {
      menuElement.style.display = 'none';
    }
    
    // Show loading message
    const toast = document.createElement('div');
    toast.textContent = 'Loading Game...';
    toast.style.cssText = `
      position: fixed; 
      top: 20px; 
      right: 20px; 
      background: #3b82f6; 
      color: white; 
      padding: 12px 20px; 
      border-radius: 8px; 
      z-index: 9999;
      font-weight: 500;
    `;
    document.body.appendChild(toast);
    
    // Game data is auto-loaded via Zustand persist middleware
    // Add a delay to break potential update cycles
    setTimeout(() => {
      document.body.removeChild(toast);
      window.location.href = window.location.pathname; // Reload without state update cycles
    }, 1000);
  };  const StatCard = () => (
    <Card className="absolute bottom-16 md:bottom-20 left-2 md:left-4 bg-slate-900/95 border-slate-700 text-white z-50 backdrop-blur-sm shadow-2xl max-w-[280px] w-[calc(100vw-1rem)] md:w-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-100 text-sm md:text-base">
          <User className="h-4 w-4" />
          Character Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Heart className="h-4 w-4 text-red-500" />
          <span className="text-sm">
            <span className="text-red-400 font-medium">{stats.hp}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-300">{stats.maxHp}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Zap className="h-4 w-4 text-blue-500" />
          <span className="text-sm">
            <span className="text-blue-400 font-medium">{stats.mp}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-300">{stats.maxMp}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Coins className="h-4 w-4 text-yellow-500" />
          <span className="text-sm text-yellow-400 font-medium">{gold}</span>
        </div>
        <div className="flex items-center gap-3">
          <Sword className="h-4 w-4 text-amber-500" />
          <span className="text-sm text-slate-300">{gameData.heroClass || 'Unknown'}</span>
        </div>
      </CardContent>
    </Card>
  );

  const MapCard = () => (
    <Card className="absolute bottom-16 md:bottom-20 left-1/2 transform -translate-x-1/2 bg-slate-900/95 border-slate-700 text-white z-50 backdrop-blur-sm shadow-2xl max-w-md w-[calc(100vw-2rem)] md:w-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-100 text-sm md:text-base">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zM9 21l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6h6zm12-6l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6v-6z"/>
          </svg>
          Quick Travel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={loading || gameData.event?.inCombat}
            onClick={() => {
              setShowMap(false);
              onMapTravel?.("I'll go to nearest Tavern to rest.");
            }}
            className="h-auto p-3 flex flex-col items-center space-y-2 text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 transition-all duration-200"
          >
            <Image src="/images/landscape-svgs/tavern.svg" alt="Tavern" width={32} height={32} className="w-8 h-8" />
            <span className="text-xs">Tavern</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            disabled={loading || gameData.event?.inCombat}
            onClick={() => {
              setShowMap(false);
              onMapTravel?.("I'll go to nearest Town.");
            }}
            className="h-auto p-3 flex flex-col items-center space-y-2 text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 transition-all duration-200"
          >
            <Image src="/images/landscape-svgs/town.svg" alt="Town" width={32} height={32} className="w-8 h-8" />
            <span className="text-xs">Town</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            disabled={loading || gameData.event?.inCombat}
            onClick={() => {
              setShowMap(false);
              onMapTravel?.("I'll go to nearest Woods.");
            }}
            className="h-auto p-3 flex flex-col items-center space-y-2 text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 transition-all duration-200"
          >
            <Image src="/images/landscape-svgs/forest.svg" alt="Woods" width={32} height={32} className="w-8 h-8" />
            <span className="text-xs">Woods</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            disabled={loading || gameData.event?.inCombat}
            onClick={() => {
              setShowMap(false);
              onMapTravel?.("I'll go to nearest Harbor.");
            }}
            className="h-auto p-3 flex flex-col items-center space-y-2 text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 transition-all duration-200"
          >
            <Image src="/images/landscape-svgs/dock.svg" alt="Harbor" width={32} height={32} className="w-8 h-8" />
            <span className="text-xs">Harbor</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            disabled={loading || gameData.event?.inCombat}
            onClick={() => {
              setShowMap(false);
              onMapTravel?.("I'll go to weaponsmith.");
            }}
            className="h-auto p-3 flex flex-col items-center space-y-2 text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 transition-all duration-200"
          >
            <Image src="/images/landscape-svgs/shop1.svg" alt="Weaponsmith" width={32} height={32} className="w-8 h-8" />
            <span className="text-xs">Weaponsmith</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            disabled={loading || gameData.event?.inCombat}
            onClick={() => {
              setShowMap(false);
              onMapTravel?.("I'll go to spell shop.");
            }}
            className="h-auto p-3 flex flex-col items-center space-y-2 text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 transition-all duration-200"
          >
            <Image src="/images/landscape-svgs/shop2.svg" alt="Spell Shop" width={32} height={32} className="w-8 h-8" />
            <span className="text-xs">Spell Shop</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            disabled={loading || gameData.event?.inCombat}
            onClick={() => {
              setShowMap(false);
              onMapTravel?.("I'll go to potion shop.");
            }}
            className="h-auto p-3 flex flex-col items-center space-y-2 text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 transition-all duration-200 col-span-2"
          >
            <Image src="/images/landscape-svgs/shop3.svg" alt="Potion Shop" width={32} height={32} className="w-8 h-8" />
            <span className="text-xs">Potion Shop</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      {/* Modern Bottom Navbar */}
      <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-700/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Mythic Conjurer
              </h1>
              
              {/* Quick Stats Bar - Compact mobile version */}
              <div className="flex items-center space-x-1 md:space-x-3">
                {/* Mobile: Compact stats */}
                <div className="md:hidden flex items-center space-x-1">
                  <div className="flex items-center gap-1 bg-slate-800/60 px-2 py-1 rounded text-xs border border-red-600/30">
                    <Heart className="h-3 w-3 text-red-400" />
                    <span className="text-red-400">{stats.hp}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-800/60 px-2 py-1 rounded text-xs border border-blue-600/30">
                    <Zap className="h-3 w-3 text-blue-400" />
                    <span className="text-blue-400">{stats.mp}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-800/60 px-2 py-1 rounded text-xs border border-slate-700">
                    <Coins className="h-3 w-3 text-yellow-400" />
                    <span className="text-yellow-400">{gold}</span>
                  </div>
                </div>
                
                {/* Desktop: Full stats with progress bars */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-2 rounded-lg border border-red-600/30 hover:border-red-500/50 transition-all group">
                    <Heart className="h-4 w-4 text-red-400 group-hover:animate-pulse" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm">
                        <span className="text-red-400 font-medium">{stats.hp}</span>
                        <span className="text-slate-500">/</span>
                        <span className="text-slate-300">{stats.maxHp}</span>
                      </span>
                      <div className="w-16 h-1 bg-red-900/50 rounded-full overflow-hidden mt-0.5">
                        <div 
                          className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-2 rounded-lg border border-blue-600/30 hover:border-blue-500/50 transition-all group">
                    <Zap className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">
                      <span className="text-blue-400 font-medium">{stats.mp}</span>
                      <span className="text-slate-500">/</span>
                      <span className="text-slate-300">{stats.maxMp}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700">
                    <Coins className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400 font-medium">{gold}</span>
                  </div>
                </div>
              </div>
            </div>            {/* Action Buttons - Compact mobile layout */}
            <div className="flex items-center space-x-1 md:space-x-3">
              {/* Character Actions - Hidden on mobile, shown in menu */}
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStats(!showStats)}
                  className="text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  <User className="h-4 w-4 mr-2" />
                  Stats
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  disabled={loading || gameData.event?.inCombat}
                  className="text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6h6zm12-6l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6v-6z"/>
                  </svg>
                  Map
                </Button>
              </div>
              
              {/* Game Actions - Compact on mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenShop}
                className="text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg px-2 md:px-4"
              >
                <Store className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Shop</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSettingsWindow}
                className="text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg px-2 md:px-4"
              >
                <Settings className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Settings</span>
              </Button>              {/* Enhanced Menu Button with mobile improvements */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Simple menu that doesn't cause setState in render
                  const menuElement = document.getElementById('simple-menu');
                  if (menuElement) {
                    menuElement.style.display = menuElement.style.display === 'none' ? 'block' : 'none';
                  }
                }}
                className="text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
              >
                <Menu className="h-4 w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Menu</span>
              </Button>
                
              {/* Enhanced simple menu with mobile character actions */}
              <div 
                id="simple-menu" 
                className="absolute bottom-14 right-2 bg-slate-900/95 border border-slate-700 rounded-lg shadow-xl backdrop-blur-sm z-50 hidden min-w-[180px]"
              >
                {/* Mobile-only character actions */}
                <div className="md:hidden">
                  <button 
                    onClick={() => {
                      setShowStats(!showStats);
                      document.getElementById('simple-menu')!.style.display = 'none';
                    }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-t-lg flex items-center transition-colors"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Character Stats
                  </button>
                  <div className="h-px bg-slate-700"></div>
                </div>
                
                {onBackToHome && (
                  <div>
                    <button 
                      onClick={onBackToHome}
                      className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-t-lg md:rounded-t-lg flex items-center transition-colors"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Back to Home
                    </button>
                    <div className="h-px bg-slate-700"></div>
                  </div>
                )}
                <button 
                  onClick={handleSaveGame}
                  className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Game
                </button>
                <button 
                  onClick={handleLoadGame}
                  className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Load Game
                </button>
                <div className="h-px bg-slate-700"></div>
                <button 
                  onClick={toggleSettingsWindow}
                  className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center transition-colors"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </button>
                <button 
                  onClick={handleNewGame}
                  className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-b-lg flex items-center transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Game
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Stat overlays - Only Stats and Map, no duplicates */}
      {showStats && <StatCard />}
      {showMap && <MapCard />}
      
      {/* Music and Fullscreen buttons - floating position like Svelte version */}
      {started && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMusicToggle}
            className="fixed top-4 right-4 z-40 text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 backdrop-blur-sm transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d={audioPlaying 
                ? "M6 7l8-5v20l-8-5v-10zm8 0h4v10h-4v-10z" // Pause icon
                : "M8 5v14l11-7z" // Play icon
              }/>
            </svg>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFullscreenToggle}
            className="fixed top-4 right-16 z-40 text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 backdrop-blur-sm transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
          </Button>
        </>
      )}
        {/* Enhanced loading indicator with mobile improvements */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 border border-slate-700 rounded-lg p-4 md:p-6 shadow-2xl backdrop-blur-sm max-w-sm w-full">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"></div>
              <span className="text-slate-300 text-sm md:text-base">Loading...</span>
            </div>
          </div>
        </div>
      )}    </div>
  );
}