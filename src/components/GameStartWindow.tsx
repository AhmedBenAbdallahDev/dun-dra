'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores';
import { useCharacterStore } from '@/stores';
import { useUIStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { loadCharacterStarterData } from '@/lib/gameData';
import { Sword, Wand2, Heart, Zap, Shield, Coins, Sparkles } from 'lucide-react';

interface CharacterClass {
  id: string;
  name: string;
  description: string;
  stats: {
    hp: number;
    mana: number;
    damage: number;
    defense: number;
  };
  startingGold: number;
}

const characterClasses: CharacterClass[] = [
  {
    id: 'mage',
    name: '🧙‍♂️ Mage',
    description: 'A wielder of arcane magic, with high mana and spell power but lower physical defense.',
    stats: {
      hp: 80,
      mana: 110,
      damage: 15,
      defense: 8
    },
    startingGold: 30
  },
  {
    id: 'warrior',
    name: '⚔️ Warrior',
    description: 'A skilled fighter with high health and defense, but limited magical abilities.',
    stats: {
      hp: 110,
      mana: 80,
      damage: 25,
      defense: 15
    },
    startingGold: 30
  }
];

export default function GameStartWindow() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const { updateGameData, addChatMessage } = useGameStore();
  const { setStats, setInventory, setSpells, setGold } = useCharacterStore();
  const { setLoading } = useUIStore();
  const handleStartGame = () => {
    if (!selectedClass) return;

    const characterClass = characterClasses.find(c => c.id === selectedClass);
    if (!characterClass) return;

    // Set character stats
    setStats({
      hp: characterClass.stats.hp,
      maxHp: characterClass.stats.hp,
      mp: characterClass.stats.mana,
      maxMp: characterClass.stats.mana
    });

    // Set starting gold
    setGold(characterClass.startingGold);

    // Load character starter data
    const starterData = loadCharacterStarterData(selectedClass);
    setInventory(starterData.inventory);
    setSpells(starterData.spells);

    // Initialize game data
    updateGameData({
      heroClass: selectedClass,
      placeAndTime: { place: 'Tavern', time: '20:00' },
      story: starterData.story,
      choices: starterData.choices,
      event: { inCombat: false, shopMode: null, lootMode: false }
    });

    // Add welcome message
    addChatMessage({
      content: `You have chosen the path of the ${characterClass.name}. ${characterClass.description}`,
      type: 'system',
      timestamp: Date.now()
    });

    // Close the game start window
    setLoading(false);
  };
  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-2xl bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-md text-white border-amber-500/40 shadow-2xl rounded-2xl">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏰</span>
              </div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500">
                Mythic Conjurer
              </h1>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-300 text-lg">Choose your character class to begin your adventure</p>
          </div>

          <div className="grid gap-4">
            {characterClasses.map((charClass) => (
              <Card 
                key={charClass.id}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-[1.02] rounded-xl ${
                  selectedClass === charClass.id 
                    ? 'bg-gradient-to-r from-amber-600/80 to-orange-600/80 border-amber-400 shadow-2xl scale-[1.02]' 
                    : 'bg-slate-800/60 border-slate-600/60 hover:bg-slate-700/80 hover:border-amber-500/60 shadow-lg hover:shadow-xl'
                }`}
                onClick={() => setSelectedClass(charClass.id)}
              >
                <CardHeader>
                  <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    {charClass.id === 'mage' ? <Wand2 className="inline w-6 h-6 mr-2 text-purple-400" /> : <Sword className="inline w-6 h-6 mr-2 text-orange-400" />}
                    {charClass.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 mb-4 leading-relaxed">{charClass.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-400" />
                        <span className="text-red-400">HP:</span> 
                        <span className="text-white font-semibold">{charClass.stats.hp}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-blue-400">Mana:</span> 
                        <span className="text-white font-semibold">{charClass.stats.mana}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Sword className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400">Damage:</span> 
                        <span className="text-white font-semibold">{charClass.stats.damage}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-400" />
                        <span className="text-green-400">Defense:</span> 
                        <span className="text-white font-semibold">{charClass.stats.defense}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400">Starting Gold:</span> 
                    <span className="text-white font-semibold">{charClass.startingGold}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              onClick={handleStartGame}
              disabled={!selectedClass}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-none rounded-xl"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Adventure
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
