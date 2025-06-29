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

    // Generate dice number first (1-20, exactly matching Svelte)
    const newDiceNumber = Math.floor(Math.random() * 20) + 1;
    setDiceNumber(newDiceNumber);
    
    // Show dice animation first
    setDiceThrown(true);
    
    // Wait for animation (matches Svelte timing)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if player died before continuing
    if (stats.hp <= 0) {
      addChatMessage({
        content: 'give a sad gameData.story, because player dies in the last combat event.',
        type: 'user',
        timestamp: Date.now()
      });
      setDeath(true);
      return;
    }

    // Calculate combat effects
    if (selectedDamage) {
      // Player takes damage from enemy (matches Svelte calculation)
      if (enemy?.enemyHp) {
        if (selectedDamage !== 0) {
          let damageToPlayer: number;
          if (newDiceNumber === 1) {
            damageToPlayer = Math.floor(enemy.enemyHp / 2);
          } else {
            damageToPlayer = Math.floor(enemy.enemyHp / newDiceNumber);
          }
          takeDamage(damageToPlayer);
        } else {
          takeDamage(5); // Default damage
        }
      }

      // Enemy takes damage from player
      if (enemy?.enemyHp && selectedCombatScore) {
        const newEnemyHp = Math.max(0, enemy.enemyHp - selectedCombatScore);
        setEnemy({ ...enemy, enemyHp: newEnemyHp });
      }
    }

    // Use the sophisticated prompt from selected item (generated in GamePanel useItem)
    const finalPrompt = selectedPrompt || (selectedName ? 
      `I used ${selectedName} in combat. Continue the battle based on the dice roll (${newDiceNumber}) and combat effectiveness.` :
      'Continue combat without action');
      
    addChatMessage({
      content: finalPrompt,
      type: 'user', 
      timestamp: Date.now()
    });

    // Spend mana if applicable
    if (selectedManaCost) {
      spendMp(selectedManaCost);
    }

    // If heal skill used, heal player (matches Svelte logic)
    if (selectedHealing && selectedCombatScore) {
      heal(selectedCombatScore);
    }

    // Reset dice and clear selection
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
                className="combat-button w-18 h-18 p-2 bg-gray-900/80 hover:bg-gray-800 border border-gray-600 rounded-lg transition-transform hover:scale-105"
                disabled={diceThrown}
              >                {!diceThrown ? (
                  <Image 
                    src="/images/dice.webp" 
                    alt="throw dice button" 
                    width={56}
                    height={56}
                    className="w-14 h-14" 
                  />
                ) : (
                  <div className="dice-number text-2xl font-bold text-green-400 flex flex-col items-center">
                    <span>{diceNumber}</span>
                    <span className="text-xs text-gray-400">/23</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
