'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useCharacterStore, CharacterItem } from '@/stores/characterStore';
import { useUIStore } from '@/stores/uiStore';
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
  [key: string]: unknown; // Allow additional properties
}

export default function ShopUI() {  const { 
    shopWindow, 
    toggleShopWindow, 
    toggleInventoryWindow,
    addMessage 
  } = useUIStore();
  
  const { 
    currentShop, 
    gold, 
    spendGold, 
    addGold 
  } = useGameStore();
  
  const { 
    character, 
    addItemToInventory, 
    removeItemFromInventory,
    addSpell 
  } = useCharacterStore();
  
  const { setDescription, clearDescription } = useDescriptionStore();
  
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell'>('buy');
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);  useEffect(() => {
    if (currentShop && currentShop.items) {
      setShopItems(currentShop.items.map((item) => ({
        id: item.id || item.name,
        name: item.name,
        type: item.type as 'weapon' | 'potion' | 'spell' | 'armor' | 'misc',
        price: item.price || 0,
        description: item.description || '',
        element: item.element,
        damage: item.damage,
        healing: item.healing,
        mana: item.mana,
        armor: item.armor,
        effect: item.effect,
        rarity: item.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
        quantity: item.quantity || 1
      })));
    }
  }, [currentShop]);

  const handleBuyItem = (item: ShopItem) => {
    if (gold < item.price) {
      addMessage('error', "You don't have enough gold to purchase this item!");
      return;
    }

    spendGold(item.price);
      if (item.type === 'spell') {
      addSpell({
        id: item.id,
        name: item.name,
        type: item.type,
        description: item.description,
        manaCost: item.mana || 0,
        damage: item.damage || 0,
        healing: item.healing || 0,
        element: item.element || 'neutral',
        effect: item.effect
      });
    } else {
      addItemToInventory({
        id: item.id,
        name: item.name,
        type: item.type,
        description: item.description,
        price: Math.floor(item.price * 0.7), // Sell price is 70% of buy price
        element: item.element,
        damage: item.damage,
        healing: item.healing,
        mana: item.mana,
        armor: item.armor,
        effect: item.effect,
        rarity: item.rarity,
        quantity: 1
      });
    }
    
    // Remove item from shop if quantity is 1, otherwise decrease quantity
    if (item.quantity && item.quantity > 1) {
      setShopItems(prevItems => 
        prevItems.map(shopItem => 
          shopItem.id === item.id 
            ? { ...shopItem, quantity: (shopItem.quantity || 1) - 1 }
            : shopItem
        )
      );
    } else {
      setShopItems(prevItems => prevItems.filter(shopItem => shopItem.id !== item.id));
    }

    addMessage('buy', `Purchased ${item.name} for ${item.price} gold!`);
  };
  const handleSellItem = (item: CharacterItem) => {
    const sellPrice = Math.floor(item.price! * 0.7); // Sell for 70% of original price
    addGold(sellPrice);
    removeItemFromInventory(item.id || item.name);
    addMessage('sell', `Sold ${item.name} for ${sellPrice} gold!`);
  };  const getItemIcon = (item: ShopItem | CharacterItem) => {
    // Handle weapons with specific weapon class icons
    if (item.type === 'weapon') {
      const weaponClass = (item as { weaponClass?: string }).weaponClass || '';
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
    
    // Handle general item types
    const typeIcons: { [key: string]: string } = {
      weapon: '/images/sword.svg', // fallback for weapons without weaponClass
      potion: '/images/potion.svg',
      spell: '/images/arcane.svg', // fallback for spells without element
      armor: '/images/item.svg',
      misc: '/images/item.svg'
    };
    return typeIcons[item.type] || '/images/item.svg';
  };

  const getRarityColor = (rarity?: string) => {
    const colorMap: { [key: string]: string } = {
      common: 'text-gray-400',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-yellow-400'
    };
    return colorMap[rarity || 'common'] || 'text-gray-400';
  };  const handleItemHover = (item: ShopItem | CharacterItem, event: React.MouseEvent) => {
    const itemWithExtras = item as ShopItem & CharacterItem & { 
      manaCost?: number; 
      weaponClass?: string; 
    };
    
    setDescription({
      name: item.name,
      type: item.type,
      damage: item.damage,
      healing: item.healing,
      mana: item.mana,
      armor: item.armor,
      element: item.element,
      price: item.price,
      manaCost: itemWithExtras.manaCost,
      weaponClass: itemWithExtras.weaponClass,
      amount: item.quantity,
      x: event.clientX,
      y: event.clientY,
      visible: true
    });
  };

  if (!shopWindow) return null;

  return (    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[80vh] max-h-[600px] md:max-h-[80vh] bg-gray-900 border-2 border-yellow-500 text-white overflow-hidden">
        <div className="flex h-full">
          {/* Shop Header */}
          <div className="w-full flex flex-col">
            <div className="flex justify-between items-center p-3 md:p-4 border-b border-yellow-500">
              <div className="flex items-center gap-2 md:gap-4">
                <h2 className="text-lg md:text-2xl font-bold text-yellow-400">
                  {currentShop?.name || 'Merchant Shop'}
                </h2>
                <div className="flex items-center gap-2">
                  <Image src="/images/gold.svg" alt="Gold" width={16} height={16} className="md:w-5 md:h-5" />
                  <span className="text-yellow-300 font-semibold text-sm md:text-base">{gold}</span>
                </div>
              </div>
              <Button
                onClick={toggleShopWindow}
                variant="outline"
                size="sm"
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
              >
                <Image src="/images/close-button.svg" alt="Close" width={16} height={16} />
              </Button>
            </div>            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setSelectedTab('buy')}
                className={`flex-1 py-2 md:py-3 px-2 md:px-4 text-center font-semibold transition-colors text-sm md:text-base ${
                  selectedTab === 'buy'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Buy Items
              </button>
              <button
                onClick={() => setSelectedTab('sell')}
                className={`flex-1 py-2 md:py-3 px-2 md:px-4 text-center font-semibold transition-colors text-sm md:text-base ${
                  selectedTab === 'sell'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Sell Items
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4">
              {selectedTab === 'buy' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">{shopItems.map((item) => (
                    <Card
                      key={item.id}
                      className="bg-gray-800 border border-gray-600 hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20 transform hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
                      onMouseEnter={(e) => handleItemHover(item, e)}
                      onMouseLeave={clearDescription}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative">
                            <Image
                              src={getItemIcon(item)}
                              alt={item.name}
                              width={36}
                              height={36}
                              className="flex-shrink-0 group-hover:brightness-110 transition-all duration-200"
                            />
                            {item.rarity && item.rarity !== 'common' && (
                              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                                item.rarity === 'legendary' ? 'bg-yellow-400' :
                                item.rarity === 'epic' ? 'bg-purple-400' :
                                item.rarity === 'rare' ? 'bg-blue-400' : 'bg-green-400'
                              } ring-2 ring-gray-800`}></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-bold text-base ${getRarityColor(item.rarity)} group-hover:brightness-110 transition-all duration-200`}>
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <span className="capitalize">{item.type}</span>
                              {item.element && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize text-gray-300">{item.element}</span>
                                </>
                              )}
                            </div>
                            {/* Item stats preview */}
                            {(item.damage || item.healing || item.armor) && (
                              <div className="flex gap-2 mt-1 text-xs">
                                {item.damage && (
                                  <span className="text-red-400">⚔ {item.damage}</span>
                                )}
                                {item.healing && (
                                  <span className="text-green-400">❤ {item.healing}</span>
                                )}
                                {item.armor && (
                                  <span className="text-blue-400">🛡 {item.armor}</span>
                                )}
                              </div>
                            )}
                          </div>
                          {item.quantity && item.quantity > 1 && (
                            <span className="text-xs bg-gray-700 px-2 py-1 rounded-full border border-gray-600">
                              x{item.quantity}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                          <div className="flex items-center gap-2">
                            <Image src="/images/gold.svg" alt="Gold" width={18} height={18} />
                            <span className="text-yellow-300 font-bold text-lg">
                              {item.price}
                            </span>
                          </div>
                          <Button
                            onClick={() => handleBuyItem(item)}
                            disabled={gold < item.price}
                            size="sm"
                            className={`px-4 py-2 font-semibold transition-all duration-200 ${
                              gold >= item.price
                                ? 'bg-green-600 hover:bg-green-700 hover:scale-105 shadow-lg'
                                : 'bg-gray-600 cursor-not-allowed opacity-50'
                            }`}
                          >
                            {gold >= item.price ? 'Buy' : 'No Gold'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}                  {shopItems.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      <div className="mb-4">
                        <Image src="/images/item.svg" alt="No items" width={64} height={64} className="mx-auto opacity-40" />
                      </div>
                      <p className="text-lg font-semibold mb-2">Shop is Empty</p>
                      <p className="text-sm">No items available in this shop.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">                  {character.inventory.map((item) => (
                    <Card
                      key={item.id}
                      className="bg-gray-800 border border-gray-600 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/20 transform hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
                      onMouseEnter={(e) => handleItemHover(item, e)}
                      onMouseLeave={clearDescription}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative">
                            <Image
                              src={getItemIcon(item)}
                              alt={item.name}
                              width={36}
                              height={36}
                              className="flex-shrink-0 group-hover:brightness-110 transition-all duration-200"
                            />
                            {item.rarity && item.rarity !== 'common' && (
                              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                                item.rarity === 'legendary' ? 'bg-yellow-400' :
                                item.rarity === 'epic' ? 'bg-purple-400' :
                                item.rarity === 'rare' ? 'bg-blue-400' : 'bg-green-400'
                              } ring-2 ring-gray-800`}></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-bold text-base ${getRarityColor(item.rarity)} group-hover:brightness-110 transition-all duration-200`}>
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <span className="capitalize">{item.type}</span>
                              {item.element && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize text-gray-300">{item.element}</span>
                                </>
                              )}
                            </div>
                            {/* Item stats preview */}
                            {(item.damage || item.healing || item.armor) && (
                              <div className="flex gap-2 mt-1 text-xs">
                                {item.damage && (
                                  <span className="text-red-400">⚔ {item.damage}</span>
                                )}
                                {item.healing && (
                                  <span className="text-green-400">❤ {item.healing}</span>
                                )}
                                {item.armor && (
                                  <span className="text-blue-400">🛡 {item.armor}</span>
                                )}
                              </div>
                            )}
                          </div>
                          {item.quantity && item.quantity > 1 && (
                            <span className="text-xs bg-gray-700 px-2 py-1 rounded-full border border-gray-600">
                              x{item.quantity}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                          <div className="flex items-center gap-2">
                            <Image src="/images/gold.svg" alt="Gold" width={18} height={18} />
                            <span className="text-yellow-300 font-bold text-lg">
                              {Math.floor((item.price || 0) * 0.7)}
                            </span>
                            <span className="text-xs text-gray-500">(70% value)</span>
                          </div>
                          <Button
                            onClick={() => handleSellItem(item)}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 hover:scale-105 shadow-lg px-4 py-2 font-semibold transition-all duration-200"
                          >
                            Sell
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}                  {character.inventory.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      <div className="mb-4">
                        <Image src="/images/item.svg" alt="No items" width={64} height={64} className="mx-auto opacity-40" />
                      </div>
                      <p className="text-lg font-semibold mb-2">Inventory is Empty</p>
                      <p className="text-sm">You have no items to sell.</p>
                    </div>
                  )}
                </div>
              )}
            </div>            {/* Footer */}
            <div className="border-t border-gray-700 p-3 md:p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <div className="text-xs md:text-sm text-gray-400">
                  {currentShop?.description || 'A general merchant selling various goods.'}
                </div>
                <Button
                  onClick={toggleInventoryWindow}
                  variant="outline"
                  size="sm"
                  className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white text-xs md:text-sm"
                >
                  View Inventory
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
