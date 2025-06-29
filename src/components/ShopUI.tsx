'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useCharacterStore, CharacterItem } from '@/stores/characterStore';
import { useUIStore } from '@/stores/uiStore';
import { useSelectedItemStore } from '@/stores/selectedItemStore';
import { useDescriptionStore } from '@/stores/miscStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface ShopItem {
  id: string;
  name: string;
  type: 'weapon' | 'potion' | 'spell' | 'armor' | 'misc';
  price: number;
  description: string;
  element?: string;
  damage?: number;
  healing?: number;
  mana?: number;
  armor?: number;
  effect?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  quantity?: number;
  weaponClass?: string;
  manaCost?: number;
  [key: string]: unknown;
}

export default function ShopUI() {  const { 
    shopWindow, 
    toggleShopWindow, 
    toggleInventoryWindow,
    setBuyWarnMsg,
    setSellWarnMsg
  } = useUIStore();
  
  const { 
    gameData
  } = useGameStore();
  
  const { 
    character,
    gold,
    inventory,
    addGold,
    subtractGold,
    addInventoryItem,
    removeInventoryItem
  } = useCharacterStore();
  
  const { setSelectedItem } = useSelectedItemStore();
  const { setDescription, clearDescription } = useDescriptionStore();
  
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy');
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  useEffect(() => {
    // Use gameData.shop like in Svelte version
    if (gameData.shop && gameData.shop.length > 0) {
      setShopItems(gameData.shop.map((item: unknown) => {
        const shopItem = item as Record<string, unknown>;
        return {
          id: (shopItem.id as string) || (shopItem.name as string),
          name: shopItem.name as string,
          type: shopItem.type as 'weapon' | 'potion' | 'spell' | 'armor' | 'misc',
          price: (shopItem.price as number) || 0,
          description: (shopItem.description as string) || '',
          element: shopItem.element as string,
          damage: shopItem.damage as number,
          healing: shopItem.healing as number,
          mana: shopItem.mana as number,
          armor: shopItem.armor as number,
          effect: shopItem.effect as string,
          rarity: shopItem.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
          quantity: (shopItem.quantity as number) || 1,
          weaponClass: shopItem.weaponClass as string,
          manaCost: shopItem.manaCost as number
        };
      }));
    }
  }, [gameData.shop]);

  // Buy item function - matches Svelte shop logic
  const buyItem = (item: ShopItem) => {
    if (gold < item.price) {
      setBuyWarnMsg("You don't have enough gold!");
      return;
    }

    // Deduct gold and add item to inventory
    subtractGold(item.price);
    
    // Convert shop item to character item format
    const characterItem: CharacterItem = {
      name: item.name,
      type: item.type as any,
      damage: item.damage,
      healing: item.healing,
      mana: item.mana,
      armor: item.armor,
      element: item.element,
      weaponClass: item.weaponClass,
      manaCost: item.manaCost,
      price: Math.floor(item.price * 0.7), // Sell price is 70% of buy price
      rarity: item.rarity
    };
    
    addInventoryItem(characterItem);
    setBuyWarnMsg(`You bought ${item.name} for ${item.price} gold!`);
  };

  // Sell item function - matches Svelte shop logic  
  const sellItem = (item: CharacterItem) => {
    if (!item.price) {
      setSellWarnMsg("This item cannot be sold!");
      return;
    }

    // Add gold and remove from inventory
    addGold(item.price);
    removeInventoryItem(item.name);
    setSellWarnMsg(`You sold ${item.name} for ${item.price} gold!`);
  };

  // Handle buy click - set up warning message like Svelte version
  const handleBuyClick = (item: ShopItem) => {
    if (gameData.event.shopMode) {
      // Clear any previous selection
      setSelectedItem({});
      
      // Set selected item for the warning dialog
      setSelectedItem({
        name: item.name,
        type: item.type,
        price: item.price,
        damage: item.damage,
        healing: item.healing,
        element: item.element,
        weaponClass: item.weaponClass
      });
      
      // Trigger buy warning message
      setBuyWarnMsg(`Do you wanna buy ${item.name}?`);
    }
  };

  // Handle sell click - set up warning message like Svelte version  
  const handleSellClick = (item: CharacterItem) => {
    if (gameData.event.shopMode) {
      // Clear any previous selection
      setSelectedItem({});
      
      // Set selected item for the warning dialog
      setSelectedItem({
        name: item.name,
        type: item.type,
        price: item.price,
        damage: item.damage,
        healing: item.healing,
        element: item.element,
        weaponClass: item.weaponClass
      });
      
      // Trigger sell warning message  
      setSellWarnMsg(`Do you wanna sell ${item.name}?`);
    }
  };
  // Handle mouse move for tooltips like Svelte version
  const handleMouseMove = (event: React.MouseEvent, item: ShopItem | CharacterItem) => {
    const extendedItem = item as ShopItem | (CharacterItem & { weaponClass?: string; manaCost?: number; quantity?: number });
    setDescription({
      name: item?.name || '',
      type: item?.type || '',
      damage: item?.damage || 0,
      healing: item?.healing || 0,
      mana: item?.mana || 0,
      armor: item?.armor || 0,
      element: item?.element || '',
      weaponClass: extendedItem?.weaponClass || '',
      manaCost: extendedItem?.manaCost || 0,
      price: item?.price || 0,
      amount: extendedItem?.quantity || 1,
      x: event.clientX + 10,
      y: event.clientY - 40,
      visible: true
    });
  };

  const handleMouseLeave = () => {
    clearDescription();
  };
  const getItemIcon = (item: ShopItem | CharacterItem) => {
    // Handle weapons with specific weapon class icons
    if (item.type === 'weapon') {
      const extendedItem = item as ShopItem | (CharacterItem & { weaponClass?: string });
      const weaponClass = extendedItem?.weaponClass || '';
      const weaponIcons: { [key: string]: string } = {
        sword: '/images/sword.svg',
        dagger: '/images/dagger.svg',
        bow: '/images/bow.svg',
        mace: '/images/mace.svg',
        spear: '/images/spear.svg',
        axe: '/images/axe.svg',
        flail: '/images/flail.svg'
      };
      return weaponIcons[weaponClass.toLowerCase()] || '/images/sword.svg';
    }
    
    // Handle spells with element-specific icons
    if (item.type === 'spell' && item.element) {
      const elementIcons: { [key: string]: string } = {
        fire: '/images/fire.svg',
        ice: '/images/ice.svg',
        lightning: '/images/lightning.svg',
        light: '/images/light.svg',
        dark: '/images/dark.svg',
        toxic: '/images/toxic.svg',
        arcane: '/images/arcane.svg'
      };
      return elementIcons[item.element.toLowerCase()] || '/images/arcane.svg';
    }
    
    // Handle potions
    if (item.type === 'potion') {
      return '/images/potion.svg';
    }
    
    // Handle general item types
    const typeIcons: { [key: string]: string } = {
      weapon: '/images/sword.svg',
      potion: '/images/potion.svg',
      spell: '/images/arcane.svg',
      armor: '/images/item.svg',
      misc: '/images/item.svg'
    };
    return typeIcons[item.type] || '/images/item.svg';
  };

  const getShopTitle = () => {
    const shopMode = gameData.event.shopMode;
    if (shopMode === 'weaponsmith') return "You're at a local Weaponsmith";
    if (shopMode === 'armorsmith') return "You're at a local Armorsmith";
    if (shopMode === 'spell shop') return "You're at a local Spell Shop";
    if (shopMode === 'potion shop') return "You're at a local Potion Shop";
    return "You're at a local Merchant";
  };

  if (!shopWindow) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <Card className="bg-slate-900/90 backdrop-blur-md border-gray-600 text-white w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Shop Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-600">
          <h2 className="text-2xl font-light text-center flex-1">
            {getShopTitle()}
            <span className="text-emerald-400 ml-2">Shop</span>
          </h2>
          <Button
            onClick={toggleShopWindow}
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            ✕
          </Button>
        </div>

        {/* Shop Tabs */}
        <div className="flex border-b border-gray-600">
          <Button
            onClick={() => setSelectedTab('buy')}
            variant={selectedTab === 'buy' ? 'default' : 'ghost'}
            className="flex-1 rounded-none"
          >
            Buy Items
          </Button>
          <Button
            onClick={() => setSelectedTab('sell')}
            variant={selectedTab === 'sell' ? 'default' : 'ghost'}
            className="flex-1 rounded-none"
          >
            Sell Items
          </Button>
        </div>

        {/* Shop Content */}
        <div className="flex-1 p-6 overflow-auto">
          {selectedTab === 'buy' && (
            <div>
              {shopItems.length > 0 ? (
                <div className="grid grid-cols-6 gap-4">
                  {shopItems.map((item) => (
                    <button
                      key={item.id}
                      className="bg-gray-500/30 border-none w-14 h-14 rounded-md flex items-center justify-center hover:bg-gray-500/50 transition-colors"
                      onClick={() => handleBuyClick(item)}
                      onMouseMove={(event) => handleMouseMove(event, item)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Image
                        src={getItemIcon(item)}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="w-8 h-8"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No items available for purchase
                </div>
              )}
            </div>
          )}

          {selectedTab === 'sell' && (
            <div>
              {character.inventory.length > 0 ? (
                <div className="grid grid-cols-6 gap-4">
                  {character.inventory.map((item, index) => (
                    <button
                      key={`${item.name}-${index}`}
                      className="bg-gray-500/30 border-none w-14 h-14 rounded-md flex items-center justify-center hover:bg-gray-500/50 transition-colors"
                      onClick={() => handleSellClick(item)}
                      onMouseMove={(event) => handleMouseMove(event, item)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Image
                        src={getItemIcon(item)}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="w-8 h-8"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No items to sell
                </div>
              )}
            </div>
          )}
        </div>

        {/* Shop Footer */}
        <div className="p-6 border-t border-gray-600 flex justify-between items-center">          <div className="text-yellow-400 text-lg">
            Gold: {gold}
          </div>
          <Button
            onClick={toggleInventoryWindow}
            variant="outline"
            className="text-white border-gray-600 hover:bg-gray-700"
          >
            View Inventory
          </Button>
        </div>
      </Card>
    </div>
  );
}
