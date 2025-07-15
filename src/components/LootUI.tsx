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
  const [lootedItems, setLootedItems] = useState<Set<string>>(new Set());

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

  const getItemTypeIcon = (item: LootItem) => {
    if (item.type === 'gold' || item.type === 'currency') return <Coins className="w-4 h-4" />;
    if (item.type === 'weapon') return <Sword className="w-4 h-4" />;
    if (item.healing) return <Heart className="w-4 h-4" />;
    if (item.type?.includes('spell')) return <Sparkles className="w-4 h-4" />;
    if (item.mana) return <Zap className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  const lootItem = async (item: LootItem) => {
    if (loading || isLooting || lootedItems.has(item.name)) return;
    
    setIsLooting(true);
    setLootedItems(prev => new Set(prev).add(item.name));
    
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

      // Wait for animation before removing from UI
      await new Promise(resolve => setTimeout(resolve, 300));

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
      setLootedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.name);
        return newSet;
      });
    } finally {
      setTimeout(() => setIsLooting(false), 200);
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
          <Card className="bg-slate-900/95 border-slate-600/40 shadow-2xl backdrop-blur-sm">
            <CardHeader className="text-center pb-4 bg-slate-800/30 border-b border-slate-600/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Package className="w-6 h-6 text-amber-400" />
                <CardTitle className="text-2xl md:text-3xl bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  Treasure Found!
                </CardTitle>
                <Package className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-slate-300">
                You&apos;ve discovered {lootBox.length} valuable {lootBox.length === 1 ? 'item' : 'items'}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {!lootBox.length ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading treasure...</p>
                </div>
              ) : (
                <>
                  {/* Enhanced Items Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-500/30 scrollbar-track-transparent">
                    <AnimatePresence mode="popLayout">
                      {lootBox.map((item, index) => {
                        const isItemLooted = lootedItems.has(item.name);
                        return (
                          <motion.div
                            key={`${item.name}-${index}`}
                            layout
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ 
                              opacity: isItemLooted ? 0 : 1, 
                              y: 0, 
                              scale: isItemLooted ? 0.5 : 1,
                              rotateZ: isItemLooted ? 180 : 0
                            }}
                            exit={{ 
                              opacity: 0, 
                              scale: 0, 
                              y: -50,
                              rotateZ: 360,
                              transition: { duration: 0.4, ease: "easeInOut" }
                            }}
                            transition={{ 
                              delay: index * 0.05, 
                              type: "spring", 
                              stiffness: 300,
                              damping: 25
                            }}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="lg"
                                  onClick={() => lootItem(item)}
                                  disabled={loading || isLooting || isItemLooted}
                                  className={`
                                    relative w-full aspect-square p-2 h-auto
                                    ${isItemLooted 
                                      ? 'bg-slate-800/50 border-slate-600/30 opacity-50' 
                                      : 'bg-slate-800/70 border-slate-600/50 hover:border-slate-500/70 hover:bg-slate-700/80'
                                    }
                                    hover:scale-105 active:scale-95 transition-all duration-200
                                    group overflow-hidden backdrop-blur-sm
                                    ${isLooting && !isItemLooted ? 'animate-pulse' : ''}
                                  `}
                                >
                                  {/* Background glow effect */}
                                  <div className="absolute inset-0 bg-gradient-to-br from-slate-300/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                  
                                  {/* Rarity border glow */}
                                  <div className={`absolute inset-0 rounded-lg opacity-30 ${
                                    item.rarity === 'legendary' ? 'shadow-lg shadow-orange-500/20' :
                                    item.rarity === 'epic' ? 'shadow-lg shadow-purple-500/20' :
                                    item.rarity === 'rare' ? 'shadow-lg shadow-blue-500/20' :
                                    item.rarity === 'uncommon' ? 'shadow-lg shadow-green-500/20' :
                                    'shadow-lg shadow-slate-500/10'
                                  }`} />
                                  
                                  {/* Item icon */}
                                  <div className="relative z-10 flex flex-col items-center justify-center h-full">
                                    <Image
                                      src={getItemIcon(item)}
                                      alt={item.name || 'Loot item'}
                                      width={32}
                                      height={32}
                                      className="w-6 h-6 md:w-8 md:h-8 drop-shadow-lg filter transition-all duration-200 group-hover:brightness-110"
                                    />
                                    
                                    {/* Type indicator */}
                                    <div className="absolute -top-1 -right-1 bg-slate-900/90 rounded-full p-1 border border-slate-600/50">
                                      {getItemTypeIcon(item)}
                                    </div>
                                    
                                    {/* Amount badge for stackable items */}
                                    {item.amount && item.amount > 1 && (
                                      <Badge 
                                        variant="secondary" 
                                        className="absolute -bottom-1 -right-1 h-5 w-5 p-0 text-xs bg-amber-600/90 text-white border border-amber-500/50"
                                      >
                                        {item.amount}
                                      </Badge>
                                    )}
                                    
                                    {/* Looted overlay */}
                                    {isItemLooted && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute inset-0 bg-green-500/20 rounded-lg flex items-center justify-center"
                                      >
                                        <div className="text-green-400 text-lg">✓</div>
                                      </motion.div>
                                    )}
                                  </div>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="top" 
                                align="center"
                                avoidCollisions={true}
                                className="max-w-xs bg-slate-900/98 backdrop-blur-md border-2 border-purple-500/60 text-slate-100 shadow-2xl"
                                sideOffset={8}
                              >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="font-bold text-base text-slate-200">{item.name}</div>
                                  {item.rarity && (
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${getRarityBadgeColor(item)} border-current`}
                                    >
                                      {item.rarity}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="text-sm text-slate-300 space-y-1">
                                  <div className="capitalize flex items-center gap-2">
                                    <span>Type: </span>
                                    <span className="text-slate-200">{item.type}</span>
                                    {item.weaponClass && (
                                      <>
                                        <span>•</span>
                                        <span className="text-slate-400">{item.weaponClass}</span>
                                      </>
                                    )}
                                  </div>
                                  {item.element && (
                                    <div className="flex items-center gap-2">
                                      <span>Element:</span>
                                      <span className="text-slate-200 capitalize">{item.element}</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Enhanced stats display matching DescriptionWindow */}
                                {(item.damage || item.healing || item.mana || item.armor || item.manaCost || item.price) && (
                                  <div className="grid grid-cols-2 gap-2">
                                    {item.damage && (
                                      <div className="flex items-center justify-between bg-red-900/30 rounded-lg px-2 py-1">
                                        <span className="text-red-400 text-xs font-medium">⚔️ Damage</span>
                                        <span className="text-white font-bold text-xs">{item.damage}</span>
                                      </div>
                                    )}
                                    {item.healing && (
                                      <div className="flex items-center justify-between bg-green-900/30 rounded-lg px-2 py-1">
                                        <span className="text-green-400 text-xs font-medium">❤️ Healing</span>
                                        <span className="text-white font-bold text-xs">{item.healing}</span>
                                      </div>
                                    )}
                                    {item.mana && (
                                      <div className="flex items-center justify-between bg-blue-900/30 rounded-lg px-2 py-1">
                                        <span className="text-blue-400 text-xs font-medium">⚡ Mana</span>
                                        <span className="text-white font-bold text-xs">{item.mana}</span>
                                      </div>
                                    )}
                                    {item.armor && (
                                      <div className="flex items-center justify-between bg-gray-900/30 rounded-lg px-2 py-1">
                                        <span className="text-gray-400 text-xs font-medium">🛡️ Armor</span>
                                        <span className="text-white font-bold text-xs">{item.armor}</span>
                                      </div>
                                    )}
                                    {item.manaCost && (
                                      <div className="flex items-center justify-between bg-purple-900/30 rounded-lg px-2 py-1">
                                        <span className="text-purple-400 text-xs font-medium">� Cost</span>
                                        <span className="text-white font-bold text-xs">{item.manaCost}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Price Section */}
                                {item.price && (
                                  <div className="border-t border-purple-500/30 pt-2">
                                    <div className="flex items-center justify-between bg-yellow-900/20 rounded-lg px-2 py-1 border border-yellow-500/30">
                                      <span className="text-yellow-300 font-medium flex items-center gap-1 text-xs">
                                        <span>💰</span>
                                        <span>Price</span>
                                      </span>
                                      <span className="text-yellow-400 font-bold text-xs flex items-center gap-1">
                                        <span>{item.price}</span>
                                        <span className="text-xs">gold</span>
                                      </span>
                                    </div>
                                  </div>
                                )}
                                
                                {item.description && (
                                  <div className="text-xs text-slate-400 italic border-t border-purple-500/20 pt-2">
                                    {item.description}
                                  </div>
                                )}
                                
                                <div className="text-xs text-purple-300 border-t border-purple-500/20 pt-2 font-medium">
                                  Click to loot this item
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700/50">
                    <Button
                      onClick={lootAll}
                      disabled={loading || isLooting}
                      className="flex-1 bg-slate-700/70 hover:bg-slate-600/80 border border-slate-600/50 hover:border-slate-500/70 text-white h-12 transition-all duration-200"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      {isLooting ? 'Looting...' : 'Take All Treasure'}
                    </Button>
                    
                    <Button
                      onClick={skipLoot}
                      disabled={loading || isLooting}
                      variant="outline"
                      className="flex-1 bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/70 hover:text-slate-200 hover:border-slate-500/70 h-12 transition-all duration-200"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Leave Everything
                    </Button>
                  </div>

                  {/* Quick stats */}
                  <div className="flex justify-center gap-4 text-xs text-slate-400 pt-2">
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
