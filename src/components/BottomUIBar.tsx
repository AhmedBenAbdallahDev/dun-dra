'use client';

import { useGameStore, useCharacterStore } from '@/stores';

export default function BottomUIBar() {
  const { gameData } = useGameStore();
  const { gold } = useCharacterStore();

  return (
    <div className="bottom-ui-bar w-full bg-slate-900/60 backdrop-blur-sm border border-amber-500/30 rounded-lg p-2 mt-2">
      <div className="flex items-center justify-between text-sm">
        {/* Gold Display */}
        <div className="flex items-center gap-2">
          <span className="text-amber-400">💰</span>
          <span className="text-amber-300 font-medium">{gold}</span>
          <span className="text-gray-400 text-xs">gold</span>
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
