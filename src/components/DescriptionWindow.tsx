'use client';

import { useDescriptionStore } from '@/stores/miscStore';
import { useUIStore } from '@/stores/uiStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const DescriptionWindow = () => {
  const { 
    name,
    damage,
    type,
    healing,
    mana,
    armor,
    element,
    weaponClass,
    manaCost,
    price,
    amount,
    point
  } = useDescriptionStore();
  
  const { showDescription, x, y } = useUIStore();

  // Only show if there's something to describe and showDescription is true
  if (!name || !showDescription) {
    return null;
  }

  const getElementIcon = (element?: string) => {
    if (!element) return null;
    
    const elementIcons: Record<string, string> = {
      fire: '🔥',
      ice: '❄️',
      lightning: '⚡',
      earth: '🌍',
      wind: '💨',
      water: '💧',
      dark: '🌑',
      light: '☀️',
      arcane: '✨',
      toxic: '☠️'
    };
    
    return elementIcons[element.toLowerCase()] || '✨';
  };

  const getTypeIcon = (type?: string) => {
    if (!type) return null;
    
    const typeIcons: Record<string, string> = {
      weapon: '⚔️',
      armor: '🛡️',
      potion: '🧪',
      spell: '📜',
      item: '📦',
      unique: '⭐',
      legendary: '👑'
    };
    
    return typeIcons[type.toLowerCase()] || '📦';
  };
  return (
    <div 
      className="fixed z-50 pointer-events-none"
      style={{
        left: Math.min(x + 15, window.innerWidth - 280), // Ensure tooltip stays in viewport
        top: Math.max(y - 10, 10), // Ensure tooltip doesn't go above viewport
        transform: y > window.innerHeight / 2 ? 'translateY(-100%)' : 'translateY(0)', // Flip position if in bottom half
      }}
    >
      <Card className="w-72 bg-slate-900/98 backdrop-blur-md border-2 border-purple-500/60 text-slate-100 shadow-2xl pointer-events-auto animate-in fade-in-0 zoom-in-95 duration-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            {getTypeIcon(type)}
            <span className={`text-base font-bold ${
              type === 'legendary' ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400' :
              type === 'epic' ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' :
              type === 'rare' ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400' :
              type === 'uncommon' ? 'text-green-400' :
              'text-slate-200'
            }`}>
              {name}
            </span>
          </CardTitle>
          {type && (
            <CardDescription className="text-slate-300 text-sm capitalize flex items-center gap-2">
              <span>{type}</span>
              {weaponClass && (
                <>
                  <span>•</span>
                  <span className="text-slate-400">{weaponClass}</span>
                </>
              )}
              {element && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {getElementIcon(element)}
                    <span className="capitalize">{element}</span>
                  </span>
                </>
              )}
            </CardDescription>
          )}
        </CardHeader>
          <CardContent className="pt-0 space-y-3">
          {/* Main Stats Section */}
          <div className="grid grid-cols-2 gap-2">
            {damage && (
              <div className="flex items-center justify-between bg-red-900/30 rounded-lg px-3 py-2">
                <span className="text-red-400 text-sm font-medium">⚔️ Damage</span>
                <span className="text-white font-bold">{damage}</span>
              </div>
            )}
            
            {healing && (
              <div className="flex items-center justify-between bg-green-900/30 rounded-lg px-3 py-2">
                <span className="text-green-400 text-sm font-medium">❤️ Healing</span>
                <span className="text-white font-bold">{healing}</span>
              </div>
            )}
            
            {mana && (
              <div className="flex items-center justify-between bg-blue-900/30 rounded-lg px-3 py-2">
                <span className="text-blue-400 text-sm font-medium">⚡ Mana</span>
                <span className="text-white font-bold">{mana}</span>
              </div>
            )}
            
            {manaCost && (
              <div className="flex items-center justify-between bg-purple-900/30 rounded-lg px-3 py-2">
                <span className="text-purple-400 text-sm font-medium">🔮 Cost</span>
                <span className="text-white font-bold">{manaCost}</span>
              </div>
            )}
            
            {armor && (
              <div className="flex items-center justify-between bg-gray-900/30 rounded-lg px-3 py-2">
                <span className="text-gray-400 text-sm font-medium">🛡️ Armor</span>
                <span className="text-white font-bold">{armor}</span>
              </div>
            )}
            
            {amount && (
              <div className="flex items-center justify-between bg-yellow-900/30 rounded-lg px-3 py-2">
                <span className="text-yellow-400 text-sm font-medium">📦 Amount</span>
                <span className="text-white font-bold">{amount}</span>
              </div>
            )}
            
            {point && (
              <div className="flex items-center justify-between bg-cyan-900/30 rounded-lg px-3 py-2">
                <span className="text-cyan-400 text-sm font-medium">⭐ Points</span>
                <span className="text-white font-bold">{point}</span>
              </div>
            )}
          </div>
          
          {/* Price Section */}
          {price && (
            <div className="border-t border-purple-500/30 pt-3">
              <div className="flex items-center justify-between bg-yellow-900/20 rounded-lg px-3 py-2 border border-yellow-500/30">
                <span className="text-yellow-300 font-medium flex items-center gap-2">
                  <span>💰</span>
                  <span>Price</span>
                </span>
                <span className="text-yellow-400 font-bold text-lg flex items-center gap-1">
                  <span>{price}</span>
                  <span className="text-sm">gold</span>
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DescriptionWindow;
