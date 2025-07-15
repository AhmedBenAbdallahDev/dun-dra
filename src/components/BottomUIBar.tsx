'use client';

import { useGameStore, useCharacterStore } from '@/stores';

export default function BottomUIBar() {
  const { gameData, addChatMessage, setEvent, clearShop, clearLootBox, setEnemy } = useGameStore();
  const { gold, level, experience, takeDamage } = useCharacterStore();
  
  // Calculate experience progress to next level
  const currentLevelExp = (level - 1) * 100;
  const expInCurrentLevel = experience - currentLevelExp;
  const expProgress = Math.max(0, Math.min(100, (expInCurrentLevel / 100) * 100));

  // Retreat functionality exactly like Svelte
  const handleRetreat = () => {
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    
    if (diceRoll <= 3) {
      // Failed retreat - take damage
      takeDamage(20);
      addChatMessage({
        content: "Player tries to escape, but got hit while trying to escape, couldn't escape and lost 20 health. Combat goes on.",
        type: 'user',
        timestamp: Date.now()
      });
    } else {
      // Successful retreat - end combat
      addChatMessage({
        content: "Player tries to escape, and escapes from the combat area successfully!",
        type: 'user', 
        timestamp: Date.now()
      });
      setEvent({ inCombat: false, shopMode: null, lootMode: false });
      setEnemy(null);
    }
  };

  // Shop exit functionality like Svelte
  const handleShopExit = (leaveMessage: string) => {
    addChatMessage({
      content: leaveMessage,
      type: 'user',
      timestamp: Date.now()
    });
    setEvent({ inCombat: false, shopMode: null, lootMode: false });
    clearShop();
  };

  // Loot exit functionality like Svelte  
  const handleLootExit = () => {
    addChatMessage({
      content: "Leave the loot.",
      type: 'user',
      timestamp: Date.now()
    });
    setEvent({ inCombat: false, shopMode: null, lootMode: false });
    clearLootBox();
  };

  const { inCombat, shopMode, lootMode } = gameData.event || {};
  const hasChoices = gameData.choices && gameData.choices.length >= 2;
  const shouldShowBar = hasChoices || inCombat || shopMode || lootMode;

  if (!shouldShowBar) return null;

  return (
    <div className="bottom-ui-bar w-full bg-slate-900/60 backdrop-blur-sm border border-amber-500/30 rounded-lg p-2 mt-2">
      <div className="flex items-center justify-between text-sm">
        {/* Left Side - Character Stats & Gold */}
        <div className="flex items-center gap-4">
          {/* Gold Display */}
          <div className="flex items-center gap-2">
            <span className="text-amber-400">💰</span>
            <span className="text-amber-300 font-medium">{gold}</span>
          </div>
          
          {/* Enhanced: Level Display (not in Svelte - our improvement) */}
          <div className="flex items-center gap-2">
            <span className="text-green-400">⭐</span>
            <span className="text-green-300 font-medium">Lvl {level}</span>
          </div>
          
          {/* Enhanced: Experience Bar (not in Svelte - our improvement) */}
          <div className="flex items-center gap-2">
            <span className="text-purple-400">✨</span>
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                style={{ width: `${expProgress}%` }}
              />
            </div>
            <span className="text-purple-300 text-xs">
              {expInCurrentLevel}/100
            </span>
          </div>
        </div>
        
        {/* Center - Action Buttons (matching Svelte functionality) */}
        <div className="flex items-center gap-2">
          {/* Retreat Button - Combat Mode */}
          {inCombat && hasChoices && (
            <button
              onClick={handleRetreat}
              className="flex items-center gap-2 bg-red-700/60 hover:bg-red-600/70 border border-red-500/40 text-red-100 px-3 py-1 rounded text-xs transition-all duration-200"
              title="50% chance to escape, 50% chance to take 20 damage"
            >
              <span>🏃</span>
              <span>Try to <span className="text-red-300">Retreat</span></span>
            </button>
          )}
          
          {/* Shop Mode Buttons */}
          {shopMode && (
            <>
              <button
                onClick={() => handleShopExit("I won't buy anything. (shopMode must be null in the next response.)")}
                className="bg-gray-700/60 hover:bg-gray-600/70 border border-gray-500/40 text-gray-100 px-3 py-1 rounded text-xs transition-all duration-200"
              >
                Close Menu
              </button>
              <button
                onClick={() => handleShopExit("I'll leave the shop. (shopMode must be null in the next response, and player must be leaving the shop.)")}
                className="bg-gray-700/60 hover:bg-gray-600/70 border border-gray-500/40 text-gray-100 px-3 py-1 rounded text-xs transition-all duration-200"
              >
                Leave Shop
              </button>
            </>
          )}
          
          {/* Loot Mode Button */}
          {lootMode && gameData.lootBox && gameData.lootBox.length > 0 && (
            <button
              onClick={handleLootExit}
              className="bg-gray-700/60 hover:bg-gray-600/70 border border-gray-500/40 text-gray-100 px-3 py-1 rounded text-xs transition-all duration-200"
            >
              Leave it
            </button>
          )}
        </div>

        {/* Right Side - Time & Place */}
        <div className="flex items-center gap-4">
          {/* Enhanced: Place Display (not in Svelte - our improvement) */}
          {gameData.placeAndTime?.place && (
            <div className="flex items-center gap-1">
              <span className="text-blue-400">📍</span>
              <span className="text-blue-300 text-xs font-medium">
                {gameData.placeAndTime.place}
              </span>
            </div>
          )}
          
          {/* Time Display (matches Svelte) */}
          <div className="flex items-center gap-2">
            <span className="text-orange-400">🕐</span>
            <span className="text-orange-300 font-medium">
              {gameData.placeAndTime?.time || '00:00'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
