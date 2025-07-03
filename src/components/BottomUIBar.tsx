'use client';

import { useGameStore, useCharacterStore } from '@/stores';

export default function BottomUIBar() {
  const { gameData } = useGameStore();
  const { gold, level, experience } = useCharacterStore();
  
  // Calculate experience progress to next level
  const currentLevelExp = (level - 1) * 100;
  const expInCurrentLevel = experience - currentLevelExp;
  const expProgress = Math.max(0, Math.min(100, (expInCurrentLevel / 100) * 100));

  return (
    <div className="bottom-ui-bar w-full bg-slate-900/60 backdrop-blur-sm border border-amber-500/30 rounded-lg p-2 mt-2">
      <div className="flex items-center justify-between text-sm">
        {/* Character Level and Experience */}
        <div className="flex items-center gap-4">
          {/* Gold Display */}
          <div className="flex items-center gap-2">
            <span className="text-amber-400">💰</span>
            <span className="text-amber-300 font-medium">{gold}</span>
            <span className="text-gray-400 text-xs">gold</span>
          </div>
          
          {/* Level Display */}
          <div className="flex items-center gap-2">
            <span className="text-green-400">⭐</span>
            <span className="text-green-300 font-medium">Lvl {level}</span>
          </div>
          
          {/* Experience Bar */}
          <div className="flex items-center gap-2">
            <span className="text-purple-400">✨</span>
            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                style={{ width: `${expProgress}%` }}
              />
            </div>
            <span className="text-purple-300 text-xs">
              {expInCurrentLevel}/100 XP
            </span>
          </div>
        </div>
        
        {/* Location and Time */}
        <div className="flex items-center gap-4">
          {gameData.placeAndTime?.place && (
            <div className="flex items-center gap-1">
              <span className="text-blue-400">📍</span>
              <span className="text-blue-300 text-xs font-medium">
                {gameData.placeAndTime.place}
              </span>
            </div>
          )}
          
          {gameData.placeAndTime?.time && (
            <div className="flex items-center gap-1">
              <span className="text-purple-400">🕐</span>
              <span className="text-purple-300 text-xs font-medium">
                {gameData.placeAndTime.time}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
