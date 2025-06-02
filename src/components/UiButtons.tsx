'use client';

import React, { useState, useEffect } from 'react';
import { useCharacterStore, useGameStore, useUIStore } from '@/stores';
import { generateShop } from '@/lib/gameData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Heart, 
  Zap, 
  Coins, 
  Backpack, 
  Sparkles, 
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
}

export default function UiButtons({ onBackToHome }: UiButtonsProps) {
  const [showStats, setShowStats] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showSpells, setShowSpells] = useState(false);
  const { stats, inventory, spells } = useCharacterStore();
  const { gameData, setCurrentShop, gold } = useGameStore();
  const { loading, toggleShopWindow, toggleSettingsWindow, setStarted, reset: resetUI } = useUIStore();
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
  
  // Get element icon function
  const getElementIcon = (element?: string) => {
    if (!element) return '🔮';
    
    const elementIcons: Record<string, string> = {
      fire: '🔥',
      ice: '❄️',
      lightning: '⚡',
      earth: '🌍',
      wind: '💨',
      water: '💧',
      dark: '🌑',
      light: '☀️',
      arcane: '✨',
      toxic: '☠️'
    };
    
    return elementIcons[element.toLowerCase()] || '🔮';
  };

  // Get weapon icon function
  const getWeaponIcon = (weaponClass?: string) => {
    if (!weaponClass) return '⚔️';
    
    const weaponIcons: Record<string, string> = {
      sword: '⚔️',
      dagger: '🗡️',
      bow: '🏹',
      mace: '🔨',
      spear: '🔱',
      axe: '🪓',
      flail: '⛓️',
      staff: '🔮'
    };
    
    return weaponIcons[weaponClass.toLowerCase()] || '⚔️';
  };    const handleOpenShop = () => {
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
  };
  const handleLoadGame = () => {
    // First hide the menu to prevent any state issues
    const menuElement = document.getElementById('simple-menu');
    if (menuElement) {
      menuElement.style.display = 'none';
    }
    
    // Game data is auto-loaded via Zustand persist middleware
    // Add a delay to break potential update cycles
    setTimeout(() => {
      window.location.href = window.location.pathname; // Reload without state update cycles
    }, 100);
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
          <Sword className="h-4 w-4 text-purple-500" />
          <span className="text-sm text-slate-300">{gameData.heroClass || 'Unknown'}</span>
        </div>
      </CardContent>
    </Card>
  );

  const InventoryCard = () => (
    <Card className="absolute bottom-16 md:bottom-20 left-2 md:left-64 bg-slate-900/95 border-slate-700 text-white z-50 max-w-sm backdrop-blur-sm shadow-2xl w-[calc(100vw-1rem)] md:w-auto">      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-100 text-sm md:text-base">
          <Backpack className="h-4 w-4" />
          Inventory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-48 md:max-h-64 overflow-y-auto">
          {inventory.length === 0 ? (
            <div className="text-slate-400 text-sm italic">Empty inventory</div>
          ) : (
            inventory.map((item, index) => (
              <div key={index} className="p-2 md:p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-200 text-sm">{item.name}</div>
                  {item.quantity && item.quantity > 1 && (
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                      x{item.quantity}
                    </span>
                  )}
                </div>
                {item.damage && (
                  <div className="text-xs text-red-400 mt-1">{getWeaponIcon(item.weaponClass)} {item.damage} damage</div>
                )}
                {item.armor && (
                  <div className="text-xs text-blue-400 mt-1">🛡️ {item.armor} armor</div>
                )}
                {item.healing && (
                  <div className="text-xs text-green-400 mt-1">❤️ +{item.healing} HP</div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  const SpellsCard = () => (
    <Card className="absolute bottom-16 md:bottom-20 right-2 md:right-4 bg-slate-900/95 border-slate-700 text-white z-50 max-w-sm backdrop-blur-sm shadow-2xl w-[calc(100vw-1rem)] md:w-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-slate-100 text-sm md:text-base">
          <Sparkles className="h-4 w-4" />
          Spells
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-48 md:max-h-64 overflow-y-auto">
          {spells.length === 0 ? (
            <div className="text-slate-400 text-sm italic">No spells learned</div>
          ) : (
            spells.map((spell, index) => (
              <div key={index} className="p-2 md:p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="font-medium text-slate-200 text-sm">{spell.name}</div>
                <div className="flex flex-wrap gap-1 md:gap-2 mt-2">
                  {spell.damage && (
                    <span className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded">
                      💥 {spell.damage}
                    </span>
                  )}
                  {spell.manaCost && (
                    <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">
                      ⚡ {spell.manaCost} MP
                    </span>
                  )}
                  {spell.element && (
                    <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                      {getElementIcon(spell.element)} {spell.element}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
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
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Mythic Conjurer
              </h1>
              
              {/* Quick Stats Bar */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700">
                  <Heart className="h-4 w-4 text-red-400" />
                  <span className="text-sm">
                    <span className="text-red-400 font-medium">{stats.hp}</span>
                    <span className="text-slate-500">/</span>
                    <span className="text-slate-300">{stats.maxHp}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700">
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
            </div>            {/* Action Buttons */}
            <div className="flex items-center space-x-2 md:space-x-3">
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
                  onClick={() => setShowInventory(!showInventory)}
                  className="text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  <Backpack className="h-4 w-4 mr-2" />
                  Inventory
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSpells(!showSpells)}
                  className="text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Spells
                </Button>
              </div>
              
              {/* Game Actions */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenShop}
                className="text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
              >
                <Store className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Shop</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSettingsWindow}
                className="text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700 transition-all duration-200 transform hover:scale-105 active:scale-95 hover:shadow-lg"
              >
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Settings</span>
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
                  <button 
                    onClick={() => {
                      setShowInventory(!showInventory);
                      document.getElementById('simple-menu')!.style.display = 'none';
                    }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center transition-colors"
                  >
                    <Backpack className="h-4 w-4 mr-2" />
                    Inventory
                  </button>
                  <button 
                    onClick={() => {
                      setShowSpells(!showSpells);
                      document.getElementById('simple-menu')!.style.display = 'none';
                    }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center transition-colors"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Spells
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
      </div>

      {/* Stat overlays */}
      {showStats && <StatCard />}
      {showInventory && <InventoryCard />}
      {showSpells && <SpellsCard />}
        {/* Enhanced loading indicator with mobile improvements */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 border border-slate-700 rounded-lg p-4 md:p-6 shadow-2xl backdrop-blur-sm max-w-sm w-full">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
              <span className="text-slate-300 text-sm md:text-base">Loading...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
