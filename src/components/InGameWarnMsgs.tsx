'use client';

import { useUIStore, useCharacterStore, useSelectedItemStore, useGameStore } from '@/stores';
import { CharacterItem } from '@/stores/characterStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function InGameWarnMsgs() {
  const { 
    errorWarnMsg, 
    buyWarnMsg, 
    sellWarnMsg, 
    setErrorWarnMsg, 
    setBuyWarnMsg, 
    setSellWarnMsg 
  } = useUIStore();
    const { gold, addGold, subtractGold, addInventoryItem, removeInventoryItem, addSpell, removeSpell } = useCharacterStore();
  const { 
    clearSelectedItem, 
    name, 
    price, 
    type, 
    element, 
    damage, 
    healing, 
    manaCost, 
    weaponClass 
  } = useSelectedItemStore();
  const { gameData, setGameData } = useGameStore();

  const buyItem = (item: CharacterItem) => {
    clearSelectedItem();
    
    if (gold < (item.price || 0)) {
      setErrorWarnMsg('Not enough gold.');
      return;
    }

    subtractGold(item.price || 0);
    
    if (item.type === 'weapon' || item.type === 'potion') {
      addInventoryItem(item);
      
      // Remove item from shop
      const newShop = gameData.shop?.filter((shopItem: CharacterItem) => shopItem !== item) || [];
      setGameData({ ...gameData, shop: newShop });
    } else if (
      item.type === 'destruction spell' ||
      item.type === 'healing spell' ||
      item.type === 'unique spell'
    ) {
      addSpell(item);
      
      // Remove item from shop
      const newShop = gameData.shop?.filter((shopItem: CharacterItem) => shopItem !== item) || [];
      setGameData({ ...gameData, shop: newShop });
    }
  };

  const sellItem = (item: CharacterItem) => {
    clearSelectedItem();
    
    if (!gameData.event.shopMode) return;

    if (!item.price) {
      removeInventoryItem(item.name);
    }

    addGold(item.price || 0);

    if (!item.element) {
      removeInventoryItem(item.name);
    } else {
      removeSpell(item.name);
    }
  };

  // Create a proper CharacterItem from selected item properties
  const selectedItem: CharacterItem = {
    name: name || '',
    price: price || 0,
    type: type || '',
    element: element || '',
    damage: damage || 0,
    healing: healing || 0,
    manaCost: manaCost || 0,
    weaponClass: weaponClass || ''
  };

  return (
    <>
      {/* Error Warning Message */}
      {errorWarnMsg && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900/90 backdrop-blur-md border-gray-600 text-white p-6 rounded-lg shadow-2xl max-w-md w-full text-center">
            <p className="text-gray-200 mb-4 text-lg">
              {errorWarnMsg}
            </p>
            <Button
              onClick={() => setErrorWarnMsg('')}
              className="bg-green-700 hover:bg-green-600 border-2 border-green-600 hover:border-green-500 text-white px-6 py-2"
            >
              Got it
            </Button>
          </Card>
        </div>
      )}

      {/* Buy Confirmation Message */}
      {buyWarnMsg && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900/90 backdrop-blur-md border-gray-600 text-white p-6 rounded-lg shadow-2xl max-w-md w-full text-center">
            <p className="text-gray-200 mb-6 text-lg">
              {buyWarnMsg}
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => {
                  buyItem(selectedItem);
                  setBuyWarnMsg('');
                }}
                className="bg-green-700 hover:bg-green-600 border-2 border-green-600 hover:border-green-500 text-white px-6 py-2"
              >
                Yes
              </Button>
              <Button
                onClick={() => setBuyWarnMsg('')}
                className="bg-red-700 hover:bg-red-600 border-2 border-red-600 hover:border-red-500 text-white px-6 py-2"
              >
                No
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Sell Confirmation Message */}
      {sellWarnMsg && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-900/90 backdrop-blur-md border-gray-600 text-white p-6 rounded-lg shadow-2xl max-w-md w-full text-center">
            <p className="text-gray-200 mb-6 text-lg">
              {sellWarnMsg}
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => {
                  sellItem(selectedItem);
                  setSellWarnMsg('');
                }}
                className="bg-green-700 hover:bg-green-600 border-2 border-green-600 hover:border-green-500 text-white px-6 py-2"
              >
                Yes
              </Button>
              <Button
                onClick={() => setSellWarnMsg('')}
                className="bg-red-700 hover:bg-red-600 border-2 border-red-600 hover:border-red-500 text-white px-6 py-2"
              >
                No
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
