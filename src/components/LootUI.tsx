'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useGameStore, type LootItem } from '@/stores/gameStore';
import { useCharacterStore } from '@/stores/characterStore';
import { useMiscStore } from '@/stores/miscStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Coins, Package, Sparkles, Sword, Heart, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUnifiedItemIcon } from '@/lib/iconSystem';

interface LootUIProps {
  onAnswer: (answer: string) => void;
}

export default function LootUI({ onAnswer }: LootUIProps) {
  const { gameData, clearLootBox, setEvent } = useGameStore();
  const { addInventoryItem, addSpell, addGold } = useCharacterStore();
  const { loading } = useMiscStore();
  const [isLooting, setIsLooting] = useState(false);

  // Use unified icon system instead of local function
  const getItemIcon = (item: LootItem): string => {
    return getUnifiedItemIcon(item);
  };

  const getRarityBadgeColor = (item: LootItem): string => {
    switch (item.rarity) {
      case 'legendary': return 'text-orange-400 border-orange-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'uncommon': return 'text-green-400 border-green-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getItemRarityColor = (item: LootItem): string => {
    if (item.rarity === 'legendary') return 'from-orange-500 to-yellow-500';
    if (item.rarity === 'epic') return 'from-purple-500 to-pink-500';
    if (item.rarity === 'rare') return 'from-blue-500 to-cyan-500';
    if (item.rarity === 'uncommon') return 'from-green-500 to-emerald-500';
    return 'from-gray-500 to-gray-600';
  };

  const getItemTypeIcon = (item: LootItem) => {
    if (item.type === 'gold' || item.type === 'currency') return <Coins className="w-4 h-4" />;
    if (item.type === 'weapon') return <Sword className="w-4 h-4" />;
    if (item.healing) return <Heart className="w-4 h-4" />;
    if (item.type?.includes('spell')) return <Sparkles className="w-4 h-4" />;
    if (item.mana) return <Zap className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  const lootItem = async (item: LootItem) => {
    if (loading || isLooting) return;
    
    setIsLooting(true);
    
    try {
      if (item.type === 'weapon' || item.type === 'potion') {
        addInventoryItem(item);
      } else if (
        item.type === 'destruction spell' ||
        item.type === 'healing spell' ||
        item.type === 'unique spell'
      ) {
        addSpell(item);
      } else if (item.type === 'gold' || item.type === 'currency') {
        const amount = item.amount || item.price || 0;
        addGold(amount);
      } else {
        addInventoryItem(item);
      }

      // Remove the looted item from lootBox
      const newLootBox = gameData.lootBox.filter((lootItem) => lootItem.name !== item.name);
      useGameStore.getState().setLootBox(newLootBox);

      if (newLootBox.length === 0) {
        // Clear loot state and exit
        clearLootBox();
        setEvent({ inCombat: false, shopMode: null, lootMode: false });
        onAnswer("I've looted everything! What should I do now?");
      }
    } catch (error) {
      console.error('Error looting item:', error);
    } finally {
      setTimeout(() => setIsLooting(false), 500);
    }
  };

  const lootAll = async () => {
    if (loading || isLooting) return;
    
    setIsLooting(true);
    
    try {
      gameData.lootBox.forEach((item) => {
        if (item.type === 'weapon' || item.type === 'potion') {
          addInventoryItem(item);
        } else if (
          item.type === 'destruction spell' ||
          item.type === 'healing spell' ||
          item.type === 'unique spell'
        ) {
          addSpell(item);
        } else if (item.type === 'gold' || item.type === 'currency') {
          const amount = item.amount || item.price || 0;
          addGold(amount);
        } else {
          addInventoryItem(item);
        }
      });

      // Clear loot state BEFORE sending AI message
      clearLootBox();
      setEvent({ inCombat: false, shopMode: null, lootMode: false });

      onAnswer(
        "I've looted all the treasure! What should I do now?"
      );
    } catch (error) {
      console.error('Error looting all items:', error);
    } finally {
      setTimeout(() => setIsLooting(false), 1000);
    }
  };

  const skipLoot = () => {
    // Clear loot state BEFORE sending AI message
    clearLootBox();
    setEvent({ inCombat: false, shopMode: null, lootMode: false });
    
    onAnswer("I'll leave the loot and continue my adventure.");
  };

  const lootBox = gameData.lootBox || [];

  return (
    <TooltipProvider>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-amber-500/30 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Package className="w-6 h-6 text-amber-400" />
                <CardTitle className="text-2xl md:text-3xl bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Treasure Found!
                </CardTitle>
                <Package className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-gray-300">
                You&apos;ve discovered {lootBox.length} valuable {lootBox.length === 1 ? 'item' : 'items'}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {!lootBox.length ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading treasure...</p>
                </div>
              ) : (
                <>
                  {/* Enhanced Items Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-transparent">
                    <AnimatePresence>
                      {lootBox.map((item, index) => (
                        <motion.div
                          key={`${item.name}-${index}`}
                          initial={{ opacity: 0, y: 20, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0, y: -20 }}
                          transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => lootItem(item)}
                                disabled={loading || isLooting}
                                className={`
                                  relative w-full aspect-square p-2 h-auto
                                  bg-gradient-to-br ${getItemRarityColor(item)} 
                                  border-2 border-amber-500/20 hover:border-amber-400/50
                                  hover:scale-105 active:scale-95 transition-all duration-200
                                  group overflow-hidden
                                  ${isLooting ? 'animate-pulse' : ''}
                                `}
                              >
                                {/* Background glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                
                                {/* Item icon */}
                                <div className="relative z-10 flex flex-col items-center justify-center h-full">
                                  <Image
                                    src={getItemIcon(item)}
                                    alt={item.name || 'Loot item'}
                                    width={32}
                                    height={32}
                                    className="w-6 h-6 md:w-8 md:h-8 drop-shadow-lg"
                                  />
                                  
                                  {/* Type indicator */}
                                  <div className="absolute -top-1 -right-1 bg-slate-900/80 rounded-full p-1">
                                    {getItemTypeIcon(item)}
                                  </div>
                                  
                                  {/* Amount badge for stackable items */}
                                  {item.amount && item.amount > 1 && (
                                    <Badge 
                                      variant="secondary" 
                                      className="absolute -bottom-1 -right-1 h-5 w-5 p-0 text-xs bg-amber-600/90 text-white border-0"
                                    >
                                      {item.amount}
                                    </Badge>
                                  )}
                                </div>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="top" 
                              align="center"
                              avoidCollisions={true}
                              className="max-w-xs bg-slate-900/98 border-amber-500/40 text-white shadow-2xl backdrop-blur-sm"
                              sideOffset={8}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="font-semibold text-amber-400 text-sm">{item.name}</div>
                                  {item.rarity && (
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getRarityBadgeColor(item)} border-current`}
                                    >
                                      {item.rarity}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="text-xs text-gray-300 space-y-1">
                                  <div>Type: <span className="text-white">{item.type}</span></div>
                                  {item.element && <div>Element: <span className="text-amber-300">{item.element}</span></div>}
                                  {item.weaponClass && <div>Class: <span className="text-blue-300">{item.weaponClass}</span></div>}
                                </div>
                                
                                {/* Enhanced stats display */}
                                {(item.damage || item.healing || item.mana || item.armor || item.manaCost || item.price) && (
                                  <div className="grid grid-cols-2 gap-1 text-xs">
                                    {item.damage && (
                                      <div className="text-red-400">⚔ {item.damage}</div>
                                    )}
                                    {item.healing && (
                                      <div className="text-green-400">♥ {item.healing}</div>
                                    )}
                                    {item.mana && (
                                      <div className="text-blue-400">✦ {item.mana}</div>
                                    )}
                                    {item.armor && (
                                      <div className="text-purple-400">🛡 {item.armor}</div>
                                    )}
                                    {item.manaCost && (
                                      <div className="text-cyan-400">💧 {item.manaCost}</div>
                                    )}
                                    {item.price && (
                                      <div className="text-amber-400">💰 {item.price}</div>
                                    )}
                                  </div>
                                )}
                                
                                {item.description && (
                                  <div className="text-xs text-slate-400 italic border-t border-slate-700/50 pt-1">
                                    {item.description}
                                  </div>
                                )}
                                
                                <div className="text-xs text-amber-300 border-t border-amber-500/20 pt-1 font-medium">
                                  Click to loot this item
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700/50">
                    <Button
                      onClick={lootAll}
                      disabled={loading || isLooting}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 h-12"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      {isLooting ? 'Looting...' : 'Take All Treasure'}
                    </Button>
                    
                    <Button
                      onClick={skipLoot}
                      disabled={loading || isLooting}
                      variant="outline"
                      className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-12"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Leave Everything
                    </Button>
                  </div>

                  {/* Quick stats */}
                  <div className="flex justify-center gap-4 text-xs text-gray-400 pt-2">
                    <span>{lootBox.filter(item => item.type === 'weapon').length} weapons</span>
                    <span>{lootBox.filter(item => item.type?.includes('spell')).length} spells</span>
                    <span>{lootBox.filter(item => item.type === 'potion').length} potions</span>
                    <span>{lootBox.filter(item => item.type === 'gold' || item.type === 'currency').length} gold</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
