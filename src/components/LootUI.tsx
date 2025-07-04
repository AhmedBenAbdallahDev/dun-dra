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

interface LootUIProps {
  onAnswer: (answer: string) => void;
}

export default function LootUI({ onAnswer }: LootUIProps) {
  const { gameData, clearLootBox, setEvent } = useGameStore();
  const { addInventoryItem, addSpell, addGold } = useCharacterStore();
  const { loading } = useMiscStore();
  const [isLooting, setIsLooting] = useState(false);

  // Comprehensive icon system matching GamePanel
  const getItemIcon = (item: LootItem): string => {
    // Weapons - specific weapon class icons with expanded variety
    if (item.type === 'weapon') {
      const weaponIcons: Record<string, string> = {
        // Melee Weapons
        'sword': '/images/sword.svg',
        'greatsword': '/images/sword.svg',
        'longsword': '/images/sword.svg',
        'shortsword': '/images/sword.svg',
        'broadsword': '/images/sword.svg',
        'scimitar': '/images/sword.svg',
        'rapier': '/images/sword.svg',
        'katana': '/images/sword.svg',
        
        // Axes
        'axe': '/images/axe.svg',
        'hatchet': '/images/axe.svg',
        'battleaxe': '/images/axe.svg',
        'greataxe': '/images/axe.svg',
        'tomahawk': '/images/axe.svg',
        
        // Ranged Weapons
        'bow': '/images/bow.svg',
        'longbow': '/images/bow.svg',
        'shortbow': '/images/bow.svg',
        'crossbow': '/images/bow.svg',
        'compound bow': '/images/bow.svg',
        
        // Daggers & Knives
        'dagger': '/images/dagger.svg',
        'knife': '/images/dagger.svg',
        'stiletto': '/images/dagger.svg',
        'dirk': '/images/dagger.svg',
        'kukri': '/images/dagger.svg',
        'tanto': '/images/dagger.svg',
        
        // Blunt Weapons
        'mace': '/images/mace.svg',
        'club': '/images/mace.svg',
        'hammer': '/images/mace.svg',
        'warhammer': '/images/mace.svg',
        'maul': '/images/mace.svg',
        'morningstar': '/images/mace.svg',
        
        // Polearms
        'spear': '/images/spear.svg',
        'lance': '/images/spear.svg',
        'pike': '/images/spear.svg',
        'halberd': '/images/spear.svg',
        'glaive': '/images/spear.svg',
        'trident': '/images/spear.svg',
        
        // Flails & Chains
        'flail': '/images/flail.svg',
        'chain': '/images/flail.svg',
        'nunchaku': '/images/flail.svg',
        
        // Magic Weapons
        'staff': '/images/arcane.svg',
        'wand': '/images/arcane.svg',
        'rod': '/images/arcane.svg',
        'scepter': '/images/arcane.svg',
        'orb': '/images/arcane.svg',
      };
      return weaponIcons[item.weaponClass?.toLowerCase() || 'sword'] || '/images/sword.svg';
    }
    
    // Potions - Enhanced with different potion types
    if (item.type === 'potion' || item.name?.toLowerCase().includes('potion')) {
      const itemName = item.name?.toLowerCase() || '';
      
      // Health potions (red)
      if (itemName.includes('health') || itemName.includes('healing') || itemName.includes('life') || item.healing) {
        return '/images/potion.svg'; // Red healing potion
      }
      
      // Mana potions (blue) 
      if (itemName.includes('mana') || itemName.includes('magic') || itemName.includes('arcane') || item.mana) {
        return '/images/ice.svg'; // Blue mana effect
      }
      
      // Poison potions (green)
      if (itemName.includes('poison') || itemName.includes('toxic') || itemName.includes('venom')) {
        return '/images/toxic.svg';
      }
      
      return '/images/potion.svg';
    }
    
    // Spells - Enhanced element-based icons with more variety
    if (item.type === 'spell' || item.type === 'healing spell' || item.type === 'destruction spell') {
      const spellIcons: Record<string, string> = {
        // Primary Elements
        'fire': '/images/fire.svg',
        'flame': '/images/fire.svg',
        'burn': '/images/fire.svg',
        'inferno': '/images/fire.svg',
        'ignite': '/images/fire.svg',
        
        'ice': '/images/ice.svg',
        'frost': '/images/ice.svg',
        'freeze': '/images/ice.svg',
        'blizzard': '/images/ice.svg',
        'chill': '/images/ice.svg',
        'cold': '/images/ice.svg',
        
        'lightning': '/images/lightning.svg',
        'thunder': '/images/lightning.svg',
        'shock': '/images/lightning.svg',
        'storm': '/images/lightning.svg',
        'electric': '/images/lightning.svg',
        'bolt': '/images/lightning.svg',
        
        // Nature Elements
        'toxic': '/images/toxic.svg',
        'poison': '/images/toxic.svg',
        'acid': '/images/toxic.svg',
        'venom': '/images/toxic.svg',
        'earth': '/images/toxic.svg',
        'nature': '/images/toxic.svg',
        'plant': '/images/toxic.svg',
        'thorn': '/images/toxic.svg',
        
        // Light & Dark
        'light': '/images/light.svg',
        'holy': '/images/light.svg',
        'divine': '/images/light.svg',
        'radiant': '/images/light.svg',
        'heal': '/images/light.svg',
        'cure': '/images/light.svg',
        'blessing': '/images/light.svg',
        
        'dark': '/images/dark.svg',
        'shadow': '/images/dark.svg',
        'unholy': '/images/dark.svg',
        'curse': '/images/dark.svg',
        'death': '/images/dark.svg',
        'drain': '/images/dark.svg',
        'necro': '/images/dark.svg',
        
        // Arcane & Mystic
        'arcane': '/images/arcane.svg',
        'magic': '/images/arcane.svg',
        'mystic': '/images/arcane.svg',
        'enchant': '/images/arcane.svg',
        'charm': '/images/arcane.svg',
        'illusion': '/images/arcane.svg',
        'teleport': '/images/arcane.svg',
        'summon': '/images/arcane.svg',
        
        // Hybrid Elements
        'water': '/images/ice.svg',
        'steam': '/images/fire.svg',
        'wind': '/images/lightning.svg',
        'air': '/images/lightning.svg',
        'spirit': '/images/light.svg',
        'psychic': '/images/arcane.svg',
        'force': '/images/arcane.svg',
      };
      
      // Check both element and name for icon matching
      const element = item.element?.toLowerCase() || '';
      const spellName = item.name?.toLowerCase() || '';
      
      // First try element match
      if (element && spellIcons[element]) {
        return spellIcons[element];
      }
      
      // Then try name-based matching
      for (const [key, icon] of Object.entries(spellIcons)) {
        if (spellName.includes(key)) {
          return icon;
        }
      }
      
      return '/images/arcane.svg'; // Default for spells
    }
    
    // Enhanced special items based on name patterns and type
    const itemName = item.name?.toLowerCase() || '';
    const itemType = item.type?.toLowerCase() || '';
    
    // Currency and valuables
    if (itemType === 'gold' || itemName.includes('gold') || itemName.includes('coin') || 
        itemName.includes('currency') || itemName.includes('money')) {
      return '/images/gold.svg';
    }
    
    // Tools and utilities
    if (itemName.includes('key') || itemName.includes('lockpick') || itemName.includes('tool')) {
      return '/images/item.svg';
    }
    
    // Magical artifacts and gems
    if (itemName.includes('gem') || itemName.includes('crystal') || itemName.includes('orb') ||
        itemName.includes('stone') || itemName.includes('shard')) {
      return '/images/arcane.svg';
    }
    
    // Books, scrolls and knowledge items
    if (itemName.includes('scroll') || itemName.includes('book') || itemName.includes('tome') || 
        itemName.includes('grimoire') || itemName.includes('manual') || itemName.includes('guide')) {
      return '/images/arcane.svg';
    }
    
    // Jewelry and accessories
    if (itemName.includes('ring') || itemName.includes('amulet') || itemName.includes('necklace') || 
        itemName.includes('pendant') || itemName.includes('charm') || itemName.includes('talisman') ||
        itemType === 'accessory' || itemType === 'jewelry') {
      return '/images/unique.svg';
    }
    
    // Food and consumables
    if (itemName.includes('bread') || itemName.includes('food') || itemName.includes('meal') || 
        itemName.includes('ration') || itemName.includes('apple') || itemName.includes('meat') ||
        itemType === 'food' || itemType === 'consumable') {
      return '/images/potion.svg'; // Use potion icon for consumables
    }
    
    // Bombs and explosives
    if (itemName.includes('bomb') || itemName.includes('explosive') || itemName.includes('grenade') ||
        itemName.includes('dynamite') || itemName.includes('powder')) {
      return '/images/fire.svg'; // Fire for explosives
    }
    
    // Arrows and ammunition
    if (itemName.includes('arrow') || itemName.includes('bolt') || itemName.includes('ammo') ||
        itemName.includes('dart') || itemName.includes('shot')) {
      return '/images/bow.svg';
    }
    
    // Armor and protection
    if (itemType === 'armor' || itemName.includes('armor') || itemName.includes('shield') ||
        itemName.includes('helmet') || itemName.includes('boots') || itemName.includes('gloves')) {
      return '/images/item.svg'; // Generic item for armor
    }
    
    // Special artifacts and legendary items
    if (itemName.includes('artifact') || itemName.includes('relic') || itemName.includes('legendary') || 
        itemName.includes('epic') || itemName.includes('ancient') || itemName.includes('blessed') ||
        item.rarity === 'legendary' || item.rarity === 'epic') {
      return '/images/unique.svg';
    }
    
    // Skills and abilities
    if (itemType === 'skill' || itemName.includes('skill') || itemName.includes('ability') ||
        itemName.includes('technique') || itemName.includes('backstab') || itemName.includes('stealth')) {
      return '/images/dagger.svg'; // Skill icon
    }
    
    // Element-based fallback for items with element property
    if (item.element) {
      const elementIcons: Record<string, string> = {
        'fire': '/images/fire.svg',
        'ice': '/images/ice.svg',
        'lightning': '/images/lightning.svg',
        'arcane': '/images/arcane.svg',
        'toxic': '/images/toxic.svg',
        'light': '/images/light.svg',
        'dark': '/images/dark.svg',
      };
      return elementIcons[item.element.toLowerCase()] || '/images/arcane.svg';
    }
    
    // Type-based fallback
    if (itemType === 'unique' || itemType === 'rare') {
      return '/images/unique.svg';
    }
    
    // Ultimate fallback
    return '/images/item.svg';
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
