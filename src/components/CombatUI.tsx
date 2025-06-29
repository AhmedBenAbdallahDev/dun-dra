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
        content: 'You need to choose a weapon or spell first.',
        type: 'system',
        timestamp: Date.now()
      });
      return;
    }

    // Generate dice number first - always generate a new one for this throw
    const isSpell = selectedManaCost && selectedManaCost > 0;
    const maxDice = isSpell ? 23 : 20;
    const newDiceNumber = Math.floor(Math.random() * maxDice) + 1;
    setDiceNumber(newDiceNumber);

    // Clear cooldown for the used spell (matches Svelte logic)
    if (cooldowns[selectedName]) {
      setCooldown(selectedName, 0);
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
    <div className="combat-banner fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-red-900/95 to-red-800/95 backdrop-blur-sm border-b-2 border-red-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Combat Status - Left Side */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-200 font-medium text-sm">COMBAT</span>
            </div>
            
            {enemy && (
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold">{enemy.enemyName}</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden"
                  >
                    <div 
                      className="h-full bg-red-500 transition-all duration-300"
                      style={{ width: `${enemyHpPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-red-200 text-sm">{enemy.enemyHp} HP</span>
                </div>
              </div>
            )}
          </div>

          {/* Combat Instructions - Center */}
          <div className="text-center text-white">
            {!selectedName ? (
              <span className="text-yellow-300 text-sm font-medium">
                👈 Choose a weapon or spell from your inventory, then press dice →
              </span>
            ) : (
              <span className="text-green-300 text-sm font-medium">
                ⚔️ {selectedName} selected! Press dice to attack →
              </span>
            )}
          </div>

          {/* Dice Button - Right Side */}
          <div className="flex items-center gap-3">
            {selectedName && selectedDamage && (
              <div className="text-right text-xs text-gray-300">
                <div>Damage: x{selectedDamage}</div>
                {selectedManaCost > 0 && <div>Mana: {selectedManaCost}</div>}
              </div>
            )}
            
            <button
              onClick={throwDice}
              className="combat-dice-btn relative bg-gray-800 hover:bg-gray-700 border-2 border-yellow-500 rounded-lg p-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedName || diceThrown}
              title={!selectedName ? "Select a weapon or spell first" : "Roll dice to attack"}
            >
              {!diceThrown ? (
                <Image 
                  src="/images/dice.webp" 
                  alt="Attack dice" 
                  width={32}
                  height={32}
                  className="w-8 h-8" 
                />
              ) : (
                <div className="w-8 h-8 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-yellow-400">{diceNumber}</span>
                  <span className="text-xs text-gray-400">/{selectedManaCost && selectedManaCost > 0 ? '23' : '20'}</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Debug Info - Remove after testing */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 text-xs text-yellow-300 bg-yellow-900/30 p-1 rounded">
            DEBUG: Selected: {selectedName || 'None'} | Enemy: {enemy?.enemyName || 'None'} | Dice: {diceNumber}
          </div>
        )}
      </div>
    </div>
  );
}
