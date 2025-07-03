'use client';

import { useState } from 'react';
import { useGameStore, useCharacterStore, useSelectedItemStore, useUIStore, useCooldownsStore } from '@/stores';
import { generateCombatLoot } from '@/lib/lootSystem';
import Image from 'next/image';

export default function CombatUI() {
  const { gameData, addChatMessage, setEnemy, setEvent, setLootBox } = useGameStore();
  const { stats, takeDamage, spendMp, heal, addExperience } = useCharacterStore();
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

  // 🎯 Debug logging for selectedItem state
  console.log('🎲 CombatUI: Current selectedItem state:', {
    selectedName,
    selectedDamage, 
    selectedManaCost,
    selectedCombatScore,
    diceNumber,
    hasPrompt: !!selectedPrompt,
    diceButtonEnabled: !!selectedName && !diceThrown,
    combatState: {
      inCombat: event.inCombat,
      hasEnemy: !!enemy?.enemyName,
      enemyHp: enemy?.enemyHp
    }
  });

  // Don't render if not in combat
  if (!event.inCombat || !enemy?.enemyName) {
    return null;
  }

  const throwDice = async () => {
    console.log('🎲 CombatUI: Dice throw initiated:', {
      selectedItem: { name: selectedName, damage: selectedDamage, manaCost: selectedManaCost },
      enemy: { name: enemy?.enemyName, hp: enemy?.enemyHp },
      playerStats: { hp: stats.hp, mp: stats.mp },
      preDiceNumber: diceNumber // 🎯 Use pre-calculated dice from GamePanel
    });
    
    if (!selectedName) {
      console.log('🎲 CombatUI: No item selected, showing warning');
      addChatMessage({
        content: 'You need to choose a weapon or spell first.',
        type: 'system',
        timestamp: Date.now()
      });
      return;
    }

    console.log('🎲 CombatUI: Starting dice animation with pre-calculated dice:', diceNumber);

    // 🚨 MOBILE SAFETY: Ensure we have a valid dice number - fallback generation
    let currentDiceNumber = diceNumber;
    if (!currentDiceNumber || currentDiceNumber === 0 || isNaN(currentDiceNumber)) {
      const maxDice = (selectedManaCost && selectedManaCost > 0) ? 23 : 20;
      currentDiceNumber = Math.floor(Math.random() * maxDice) + 1;
      setDiceNumber(currentDiceNumber);
      console.log('🎲 CombatUI: Generated fallback dice number:', currentDiceNumber);
    }

    // 🎯 CRITICAL FIX: Don't generate new dice - use the pre-calculated one from GamePanel (like Svelte)
    // This matches the Svelte behavior where dice is calculated during item selection, not during throw
    
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
        console.log('🎲 CombatUI: Player taking damage:', damageToPlayer);
        takeDamage(damageToPlayer);
      }

      // 🎯 CRITICAL FIX: Use pre-calculated combatScore from selectedItem (like Svelte)
      if (enemy?.enemyHp && selectedCombatScore) {
        const newEnemyHp = Math.max(0, enemy.enemyHp - selectedCombatScore);
        console.log('🎲 CombatUI: Enemy taking damage:', {
          previousHp: enemy.enemyHp,
          combatScore: selectedCombatScore,
          newHp: newEnemyHp
        });
        setEnemy({ ...enemy, enemyHp: newEnemyHp });
        
        // 🏆 NEW FEATURE: Auto-end combat when enemy dies
        if (newEnemyHp <= 0) {
          console.log('🏆 CombatUI: Enemy defeated! Ending combat and generating victory rewards');
          
          // Calculate experience gained based on enemy max HP
          const baseExp = Math.floor((enemy.enemyMaxHp || enemy.enemyHp) * 0.5) + 10;
          const expGained = Math.max(10, baseExp + Math.floor(Math.random() * 15));
          
          // Generate loot based on enemy level
          const lootItems = generateCombatLoot(enemy.enemyName || 'enemy', enemy.enemyMaxHp || 20);
          
          // End combat and transition to victory
          setTimeout(() => {
            // Clear combat state
            setEvent({ inCombat: false, shopMode: null, lootMode: false });
            setEnemy(null);
            clearSelectedItem();
            setDiceNumber(0);
            setDiceThrown(false);
            
            // Add experience and handle level ups
            const levelResult = addExperience(expGained);
            
            let victoryMessage = `Victory! You defeated the ${enemy.enemyName}! You gained ${expGained} experience points.`;
            
            if (levelResult.leveledUp) {
              victoryMessage += ` 🎉 LEVEL UP! You are now level ${levelResult.newLevel}! Your stats have increased!`;
            }
            
            if (lootItems.length > 0) {
              victoryMessage += ' You found some loot!';
            }
            
            // Set loot if any
            if (lootItems.length > 0) {
              setLootBox(lootItems);
              setEvent({ inCombat: false, shopMode: null, lootMode: true });
            }
            
            // Add victory message
            addChatMessage({
              content: victoryMessage,
              type: 'system',
              timestamp: Date.now()
            });
          }, 1500); // Delay to show defeat animation
          
          return; // Skip the rest of combat logic
        }
      }
    }

    // Check if player died after taking damage
    if (stats.hp <= 0) {
      console.log('🎲 CombatUI: Player died, sending death prompt');
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

    // 🎯 CRITICAL FIX: Use pre-calculated prompt from selectedItem (like Svelte)
    if (selectedPrompt) {
      console.log('🎲 CombatUI: Sending pre-calculated combat prompt:', selectedPrompt);
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
  
  // 🚨 MOBILE EMERGENCY: Force exit combat function
  const emergencyExitCombat = () => {
    console.log('🚨 Emergency combat exit triggered');
    addChatMessage({
      content: 'Combat ended by player.',
      type: 'system',
      timestamp: Date.now()
    });
    setEnemy(null);
    clearSelectedItem();
    setDiceNumber(0);
    setDiceThrown(false);
  };

  const enemyHpPercentage = enemy.enemyHp && enemy.enemyMaxHp
    ? (enemy.enemyHp / enemy.enemyMaxHp) * 100 
    : 100;
  return (
    <div className="combat-banner fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-red-900/95 to-red-800/95 backdrop-blur-sm border-b-2 border-red-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-2 md:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Combat Status - Left Side */}
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-200 font-medium text-xs md:text-sm">COMBAT</span>
            </div>
            
            {enemy && (
              <div className="flex items-center gap-1 md:gap-3 min-w-0">
                <span className="text-white font-semibold text-xs md:text-sm truncate max-w-[80px] md:max-w-none">{enemy.enemyName}</span>
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-12 md:w-24 h-1.5 md:h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all duration-300"
                      style={{ width: `${enemyHpPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-red-200 text-xs md:text-sm">{enemy.enemyHp} HP</span>
                </div>
              </div>
            )}
          </div>

          {/* Combat Instructions - Center */}
          <div className="text-center text-white min-w-0 flex-1 px-4">
            {!selectedName ? (
              <div className="flex flex-col items-center gap-1">
                <span className="text-yellow-300 text-sm font-medium animate-pulse">
                  � Step 1: Choose a weapon or spell
                </span>
                <span className="text-gray-400 text-xs">
                  👈 Click any item in your inventory or spells panel
                </span>
              </div>
            ) : !diceThrown ? (
              <div className="flex flex-col items-center gap-1">
                <span className="text-green-300 text-sm font-medium">
                  ✅ {selectedName} selected!
                </span>
                <span className="text-yellow-300 text-xs animate-pulse">
                  📋 Step 2: Press dice to attack →
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span className="text-blue-300 text-sm font-medium">
                  🎲 Rolling dice...
                </span>
                <span className="text-gray-400 text-xs">
                  Combat resolving...
                </span>
              </div>
            )}
          </div>

          {/* Dice Button - Right Side */}
          <div className="flex items-center gap-3">
            {selectedName && selectedDamage && (
              <div className="text-right text-xs text-gray-300">
                <div>Damage: x{selectedDamage}</div>
                {selectedManaCost && selectedManaCost > 0 && <div>Mana: {selectedManaCost}</div>}
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

          {/* Mobile Emergency Exit - Only show on small screens */}
          <div className="sm:hidden">
            <button
              onClick={emergencyExitCombat}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded border border-red-400"
              title="Emergency exit combat"
            >
              🚨 Exit
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
