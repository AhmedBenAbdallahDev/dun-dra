'use client';

import { useState } from 'react';
import { useGameStore, useCharacterStore, useSelectedItemStore, useUIStore, useCooldownsStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function CombatUI() {
  const { gameData, addChatMessage, setEnemy } = useGameStore();
  const { stats, takeDamage, spendMp, heal } = useCharacterStore();
  const { 
    name: selectedName, 
    damage: selectedDamage, 
    healing: selectedHealing, 
    manaCost: selectedManaCost, 
    combatScore: selectedCombatScore,
    prompt: selectedPrompt,
    other: selectedOther,
    clearSelectedItem 
  } = useSelectedItemStore();
  const { diceNumber, setDiceNumber, setDeath } = useUIStore();
  const { cooldowns, setCooldown } = useCooldownsStore();
    const [diceThrown, setDiceThrown] = useState(false);
  const { enemy, event } = gameData;

  // Don't render if not in combat
  if (!event.inCombat || !enemy?.enemyName) {
    return null;
  }

  const throwDice = async () => {
    if (!selectedName) {
      addChatMessage({
        content: 'You need to choose a weapon or spell.',
        type: 'system',
        timestamp: Date.now()
      });
      return;
    }

    // Clear cooldown for the used spell (matches Svelte logic)
    if (cooldowns[selectedName]) {
      setCooldown(selectedName, 0);
    }

    // Generate dice number first - this should already be done by GamePanel calculateCombatScore
    // But if not set, generate it here with correct range
    if (!diceNumber || diceNumber === 0) {
      const isSpell = selectedManaCost && selectedManaCost > 0;
      const maxDice = isSpell ? 23 : 20;
      const newDiceNumber = Math.floor(Math.random() * maxDice) + 1;
      setDiceNumber(newDiceNumber);
    }

    // Show dice animation first
    setDiceThrown(true);
    
    // Wait for animation exactly like Svelte (1000ms) 
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Apply damage effects exactly like Svelte AFTER animation
    if (selectedDamage) {
      // Player takes damage from enemy (matches Svelte calculation exactly)
      if (enemy?.enemyHp) {
        let damageToPlayer: number;
        if (selectedDamage !== 0 && !selectedOther) {
          if (diceNumber === 1) {
            damageToPlayer = Math.floor(enemy.enemyHp / 2);
          } else {
            damageToPlayer = Math.floor(enemy.enemyHp / diceNumber);
          }
        } else {
          damageToPlayer = 5; // Default damage when no weapon damage
        }
        takeDamage(damageToPlayer);
      }

      // Enemy takes damage from player using combatScore
      if (enemy?.enemyHp && selectedCombatScore) {
        const newEnemyHp = Math.max(0, enemy.enemyHp - selectedCombatScore);
        setEnemy({ ...enemy, enemyHp: newEnemyHp });
      }
    }

    // Check if player died after taking damage
    if (stats.hp <= 0) {
      addChatMessage({
        content: 'give a sad gameData.story, because player dies in the last combat event.',
        type: 'user',
        timestamp: Date.now()
      });
      setDeath(true);
      setDiceNumber(0);
      clearSelectedItem();
      setDiceThrown(false);
      return;
    }

    // Continue story with the pre-generated prompt from selectedItem
    if (selectedPrompt) {
      addChatMessage({
        content: selectedPrompt,
        type: 'user', 
        timestamp: Date.now()
      });
    }

    // Spend mana if applicable
    if (selectedManaCost) {
      spendMp(selectedManaCost);
    }

    // If heal skill used, heal player (matches Svelte logic)
    if (selectedHealing && selectedCombatScore) {
      heal(selectedCombatScore);
    }

    // Reset dice and clear selection exactly like Svelte
    setDiceNumber(0);
    clearSelectedItem();
    setDiceThrown(false);
  };
  const enemyHpPercentage = enemy.enemyHp && enemy.enemyMaxHp 
    ? (enemy.enemyHp / enemy.enemyMaxHp) * 100 
    : 100;

  return (
    <div className="combat-ui fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-slate-900/95 border-red-500/60 text-white max-w-2xl w-full shadow-2xl backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-center text-xl text-red-400">
            You are now in <span className="text-red-500">Combat</span> against:
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Enemy Status */}
          {enemy && (
            <div className="flex justify-between items-center">
              <div>                <h5 className="text-lg font-semibold text-gray-300 mb-2">
                  {enemy.enemyName}
                </h5>
                <div 
                  className="enemy-hp-bar w-32 h-8 rounded border flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(to right, #E1683C ${enemyHpPercentage}%, #1f1f1f ${enemyHpPercentage}%)`
                  }}
                >
                  <p className="text-sm relative z-10">
                    {enemy.enemyHp} <span className="text-xs opacity-80">HP</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Combat Info */}
          <div className="combat-info space-y-3">
            <ul className="space-y-2 text-gray-300">
              {!selectedName ? (
                <li className="flex items-center gap-2">
                  ⚔️ Choose a <span className="text-green-400">weapon</span> or a{' '}
                  <span className="text-green-400">spell.</span>
                </li>
              ) : selectedDamage ? (
                <li className="flex items-center gap-2">
                  ⚔️ You chose <span className="text-green-400">{selectedName}</span> with{' '}
                  <span className="text-green-400">x{selectedDamage}</span> damage!
                </li>
              ) : selectedHealing ? (
                <li className="flex items-center gap-2">
                  ⚔️ You chose <span className="text-green-400">{selectedName}</span> with{' '}
                  <span className="text-green-400">x{selectedHealing}</span> heal power!
                </li>
              ) : (
                <li className="flex items-center gap-2">
                  ⚔️ You chose <span className="text-green-400">{selectedName}</span> with{' '}
                  <span className="text-green-400">unique</span> power!
                </li>
              )}
              
              <li className="flex items-center gap-2">
                🎲 Then, press the <span className="text-green-400">dice</span> to learn your fate!
              </li>
              
              <li className="flex items-center gap-2 text-sm opacity-80">
                🔮 Success is related to <span className="text-green-400">damage</span> and the{' '}
                <span className="text-green-400">dice number.</span>
              </li>
            </ul>

            {/* Dice Button */}
            <div className="flex justify-center">
              <Button
                onClick={throwDice}
                className="combat-button w-18 h-18 p-2 bg-gray-900/80 hover:bg-gray-800 border border-gray-600 rounded-lg transition-transform hover:scale-105 relative"
                disabled={diceThrown}
              >
                {!diceThrown ? (
                  <Image 
                    src="/images/dice.webp" 
                    alt="throw dice button" 
                    width={56}
                    height={56}
                    className="w-14 h-14 transition-transform hover:rotate-12" 
                  />
                ) : (
                  <div className="dice-number-container">
                    <div className="dice-number text-2xl font-bold text-green-400 flex flex-col items-center animate-pulse">
                      <span className="animate-bounce">{diceNumber}</span>
                      <span className="text-xs text-gray-400">/{selectedManaCost && selectedManaCost > 0 ? '23' : '20'}</span>
                    </div>
                    {/* Animated particles around dice result */}
                    <div className="dice-particles">
                      <div className="particle particle-1"></div>
                      <div className="particle particle-2"></div>
                      <div className="particle particle-3"></div>
                      <div className="particle particle-4"></div>
                    </div>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Dice Animation Styles */}
      <style jsx>{`
        .dice-number-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .dice-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #3fcf8e;
          border-radius: 50%;
          animation: sparkle 1s ease-out infinite;
        }
        
        .particle-1 {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }
        
        .particle-2 {
          top: 10%;
          right: 10%;
          animation-delay: 0.25s;
        }
        
        .particle-3 {
          bottom: 10%;
          left: 10%;
          animation-delay: 0.5s;
        }
        
        .particle-4 {
          bottom: 10%;
          right: 10%;
          animation-delay: 0.75s;
        }
        
        @keyframes sparkle {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(0);
          }
          50% {
            opacity: 1;
            transform: scale(1) translateY(-10px);
          }
          100% {
            opacity: 0;
            transform: scale(0.5) translateY(-20px);
          }
        }
        
        .combat-button:hover {
          transform: scale(1.1);
          box-shadow: 0 0 20px rgba(63, 207, 142, 0.3);
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
