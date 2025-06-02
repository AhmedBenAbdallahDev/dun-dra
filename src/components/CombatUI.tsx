'use client';

import { useState } from 'react';
import { useGameStore, useCharacterStore } from '@/stores';
import { CharacterItem } from '@/stores/characterStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sword, Shield, Sparkles, Heart, Zap, Play, Skull } from 'lucide-react';

export default function CombatUI() {
  const { gameData, setEvent, addChatMessage } = useGameStore();
  const { stats, spells, inventory, takeDamage, spendMp, updateHp } = useCharacterStore();
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [combatResult, setCombatResult] = useState<'hit' | 'critical' | 'miss' | null>(null);

  const { enemy, event } = gameData;

  // Don't render if not in combat
  if (!event.inCombat || !enemy.enemyName) {
    return null;
  }
  const handleAttack = () => {
    setIsAnimating(true);
    const isCritical = Math.random() > 0.8; // 20% chance for critical
    const baseDamage = Math.floor(Math.random() * 15) + 10; // 10-25 damage
    const damage = isCritical ? Math.floor(baseDamage * 1.5) : baseDamage;
    const newEnemyHp = Math.max(0, (enemy.enemyHp || 0) - damage);
    
    // Set animation result
    setCombatResult(isCritical ? 'critical' : 'hit');
    
    // Update enemy HP
    setEvent({ inCombat: newEnemyHp > 0 });
    gameData.enemy.enemyHp = newEnemyHp;
    
    const criticalText = isCritical ? " (Critical Hit!)" : "";
    addChatMessage({
      content: `You attack ${enemy.enemyName} for ${damage} damage${criticalText}! ${enemy.enemyName} has ${newEnemyHp} HP remaining.`,
      type: 'system',
      timestamp: Date.now()
    });

    // Reset animation after delay
    setTimeout(() => {
      setIsAnimating(false);
      setCombatResult(null);
    }, 1000);

    if (newEnemyHp <= 0) {
      addChatMessage({
        content: `You have defeated ${enemy.enemyName}!`,
        type: 'system',
        timestamp: Date.now()
      });
      setEvent({ inCombat: false });
    } else {
      setIsPlayerTurn(false);
      // Enemy turn after a delay
      setTimeout(handleEnemyTurn, 1500);
    }
  };
  const handleCastSpell = (spell: CharacterItem) => {
    if (!spell.manaCost || stats.mp < spell.manaCost) {
      addChatMessage({
        content: `Not enough mana to cast ${spell.name}!`,
        type: 'system',
        timestamp: Date.now()
      });
      return;
    }

    setIsAnimating(true);
    spendMp(spell.manaCost);
    
    const isCritical = Math.random() > 0.7; // 30% chance for spell critical
    const damage = (spell.damage || 0) + Math.floor(Math.random() * 10);
    const finalDamage = isCritical ? Math.floor(damage * 1.5) : damage;
    const newEnemyHp = Math.max(0, (enemy.enemyHp || 0) - finalDamage);
    
    setCombatResult(isCritical ? 'critical' : 'hit');
    gameData.enemy.enemyHp = newEnemyHp;
    
    const criticalText = isCritical ? " (Critical Cast!)" : "";
    addChatMessage({
      content: `You cast ${spell.name} for ${finalDamage} damage${criticalText}! ${enemy.enemyName} has ${newEnemyHp} HP remaining.`,
      type: 'system',
      timestamp: Date.now()
    });

    // Reset animation after delay
    setTimeout(() => {
      setIsAnimating(false);
      setCombatResult(null);
    }, 1000);

    if (newEnemyHp <= 0) {
      addChatMessage({
        content: `You have defeated ${enemy.enemyName}!`,
        type: 'system',
        timestamp: Date.now()
      });
      setEvent({ inCombat: false });
    } else {
      setIsPlayerTurn(false);
      setTimeout(handleEnemyTurn, 1500);
    }
  };

  const handleUseItem = (item: CharacterItem) => {
    if (item.healing) {
      updateHp(stats.hp + item.healing);
      addChatMessage({
        content: `You use ${item.name} and recover ${item.healing} HP!`,
        type: 'system',
        timestamp: Date.now()
      });
    }
    
    setIsPlayerTurn(false);
    setTimeout(handleEnemyTurn, 1000);
  };

  const handleEnemyTurn = () => {
    const enemyDamage = Math.floor(Math.random() * 12) + 5; // 5-17 damage
    takeDamage(enemyDamage);
    
    addChatMessage({
      content: `${enemy.enemyName} attacks you for ${enemyDamage} damage!`,
      type: 'system',
      timestamp: Date.now()
    });

    if (stats.hp <= enemyDamage) {
      addChatMessage({
        content: `You have been defeated by ${enemy.enemyName}!`,
        type: 'system',
        timestamp: Date.now()
      });
      setEvent({ inCombat: false });
    }
    
    setIsPlayerTurn(true);
  };

  const handleFlee = () => {
    if (Math.random() > 0.3) { // 70% chance to flee
      addChatMessage({
        content: `You successfully flee from ${enemy.enemyName}!`,
        type: 'system',
        timestamp: Date.now()
      });
      setEvent({ inCombat: false });
    } else {
      addChatMessage({
        content: `You failed to flee from ${enemy.enemyName}!`,
        type: 'system',
        timestamp: Date.now()
      });
      setIsPlayerTurn(false);
      setTimeout(handleEnemyTurn, 1000);
    }
  };

  const enemyHpPercentage = enemy.enemyHp && enemy.enemyMaxHp 
    ? (enemy.enemyHp / enemy.enemyMaxHp) * 100 
    : 0;  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4">
      <Card className="bg-slate-900/95 border-red-500/60 text-white max-w-4xl w-full shadow-2xl backdrop-blur-sm max-h-[95vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 text-center text-2xl md:text-3xl flex items-center justify-center gap-3">
            <Skull className="w-6 h-6 md:w-8 md:h-8 text-red-400" />
            Combat: {enemy.enemyName}
            <Skull className="w-6 h-6 md:w-8 md:h-8 text-red-400" />
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 md:space-y-6">
          {/* Combat Result Animation */}
          {combatResult && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-60">
              <div className={`text-6xl md:text-8xl font-bold animate-bounce ${
                combatResult === 'critical' 
                  ? 'text-yellow-400 drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]' 
                  : 'text-red-400 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]'
              }`}>
                {combatResult === 'critical' ? 'CRITICAL!' : 'HIT!'}
              </div>
            </div>
          )}

          {/* Enemy Status */}
          <div className={`bg-slate-800/80 backdrop-blur-sm border border-red-500/30 p-4 md:p-5 rounded-xl transition-all duration-300 ${
            isAnimating ? 'animate-pulse border-red-400/60 shadow-lg shadow-red-500/20' : ''
          }`}>
            <h3 className="text-lg md:text-xl font-bold mb-3 text-red-400 flex items-center gap-2">
              <Skull className="w-4 h-4 md:w-5 md:h-5" />
              {enemy.enemyName}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">HP:</span>
                <span className="text-white font-semibold">{enemy.enemyHp}/{enemy.enemyMaxHp}</span>
              </div>
              <Progress 
                value={enemyHpPercentage} 
                className="h-3 md:h-4 bg-slate-700 transition-all duration-500"
              />
            </div>
          </div>          {/* Player Status */}
          <div className="bg-slate-800/80 backdrop-blur-sm border border-purple-500/30 p-4 md:p-5 rounded-xl">
            <h3 className="text-lg md:text-xl font-bold mb-3 text-purple-400 flex items-center gap-2">
              <Shield className="w-4 h-4 md:w-5 md:h-5" />
              Your Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm items-center gap-2">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-400" />
                    HP:
                  </span>
                  <span className="text-white font-semibold">{stats.hp}/{stats.maxHp}</span>
                </div>
                <Progress 
                  value={(stats.hp / stats.maxHp) * 100} 
                  className="h-2 md:h-3 bg-slate-700 mt-1 transition-all duration-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm items-center gap-2">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Zap className="w-4 h-4 text-blue-400" />
                    MP:
                  </span>
                  <span className="text-white font-semibold">{stats.mp}/{stats.maxMp}</span>
                </div>
                <Progress 
                  value={(stats.mp / stats.maxMp) * 100} 
                  className="h-2 md:h-3 bg-slate-700 mt-1 transition-all duration-500"
                />
              </div>
            </div>
          </div>          {/* Combat Actions */}
          {isPlayerTurn && (
            <div className="space-y-4">
              <h3 className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">⚔️ Choose your action:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Attack */}
                <Button 
                  onClick={handleAttack}
                  disabled={isAnimating}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 p-3 md:p-4 h-auto border-none shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  <div className="text-center">
                    <div className="font-bold flex items-center justify-center gap-2">
                      <Sword className={`w-4 h-4 md:w-5 md:h-5 ${isAnimating ? 'animate-spin' : ''}`} />
                      Attack
                    </div>
                    <div className="text-xs md:text-sm opacity-80">Basic attack</div>
                  </div>
                </Button>

                {/* Flee */}
                <Button 
                  onClick={handleFlee}
                  disabled={isAnimating}
                  className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 disabled:opacity-50 p-3 md:p-4 h-auto border-none shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  <div className="text-center">
                    <div className="font-bold flex items-center justify-center gap-2">
                      <Play className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
                      Flee
                    </div>
                    <div className="text-xs md:text-sm opacity-80">Attempt to escape</div>
                  </div>
                </Button>
              </div>              {/* Spells */}
              {spells.length > 0 && (
                <div>
                  <h4 className="font-bold mb-3 text-purple-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Spells:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    {spells.map((spell, index) => (
                      <Button
                        key={index}
                        onClick={() => handleCastSpell(spell)}
                        disabled={!spell.manaCost || stats.mp < spell.manaCost || isAnimating}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed p-2 md:p-3 h-auto text-left border-none shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                      >
                        <div>
                          <div className="font-bold flex items-center gap-2 text-sm md:text-base">
                            <Sparkles className={`w-3 h-3 md:w-4 md:h-4 ${isAnimating ? 'animate-pulse' : ''}`} />
                            {spell.name}
                          </div>
                          <div className="text-xs opacity-80">
                            Damage: {spell.damage || 0} | MP: {spell.manaCost || 0}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Items */}
              {inventory.filter(item => item.healing).length > 0 && (
                <div>
                  <h4 className="font-bold mb-3 text-green-400 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Items:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    {inventory.filter(item => item.healing).map((item, index) => (
                      <Button
                        key={index}
                        onClick={() => handleUseItem(item)}
                        disabled={isAnimating}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 p-2 md:p-3 h-auto text-left border-none shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                      >
                        <div>
                          <div className="font-bold flex items-center gap-2 text-sm md:text-base">
                            <Heart className="w-3 h-3 md:w-4 md:h-4" />
                            {item.name}
                          </div>
                          <div className="text-xs opacity-80">
                            Healing: {item.healing || 0}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}          {!isPlayerTurn && (
            <div className="text-center py-6">
              <div className="text-red-400 text-lg md:text-xl font-bold animate-pulse flex items-center justify-center gap-3">
                <Skull className="w-5 h-5 md:w-6 md:h-6 animate-bounce" />
                Enemy is attacking...
                <Skull className="w-5 h-5 md:w-6 md:h-6 animate-bounce" />
              </div>
              <div className="mt-2 text-slate-400 text-sm">Prepare for incoming damage!</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
