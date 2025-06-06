'use client';

import { useGameStore } from '@/stores';

export default function BackgroundImgs() {
  const { gameData } = useGameStore();

  // Determine background based on current place or use default
  const getBackgroundClass = () => {
    const place = gameData.placeAndTime?.place?.toLowerCase();
    
    if (place?.includes('tavern')) {
      return 'bg-gradient-to-br from-amber-900 via-orange-900 to-red-900';
    } else if (place?.includes('forest')) {
      return 'bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900';
    } else if (place?.includes('mountain')) {
      return 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-700';
    } else if (place?.includes('shop')) {
      return 'bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900';
    } else if (place?.includes('town')) {
      return 'bg-gradient-to-br from-stone-800 via-slate-700 to-gray-600';
    } else if (place?.includes('dock')) {
      return 'bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-800';
    } else {
      // Default mystical background
      return 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900';
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient background */}
      <div className={`absolute inset-0 ${getBackgroundClass()}`} />
      
      {/* Overlay pattern for texture */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Subtle animated overlay for magical effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-500/5 to-transparent animate-pulse" />
      
      {/* Time-based lighting effects */}
      {gameData.placeAndTime?.time && (
        <div className={`absolute inset-0 ${getTimeBasedOverlay(gameData.placeAndTime.time)}`} />
      )}
    </div>
  );
}

function getTimeBasedOverlay(time: string): string {
  const hour = parseInt(time.split(':')[0]) || 12;
  
  if (hour >= 6 && hour < 12) {
    // Morning - light golden overlay
    return 'bg-gradient-to-t from-transparent to-yellow-500/10';
  } else if (hour >= 12 && hour < 18) {
    // Afternoon - bright overlay
    return 'bg-gradient-to-t from-transparent to-orange-400/5';
  } else if (hour >= 18 && hour < 22) {
    // Evening - warm reddish overlay
    return 'bg-gradient-to-t from-transparent to-red-600/10';
  } else {
    // Night - darker blue overlay
    return 'bg-gradient-to-t from-black/20 to-blue-900/20';
  }
}
