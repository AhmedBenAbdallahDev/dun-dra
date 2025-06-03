'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useGameStore, useAdventureStore, useCharacterStore } from '@/stores';
import { useUIStore } from '@/stores/uiStore';
import { loadCharacterStarterData } from '@/lib/gameData';
import { toast } from 'sonner';
import GamePanel from '@/components/GamePanel';
import Choices from '@/components/Choices';
import UiButtons from '@/components/UiButtons';
import BackgroundImgs from '@/components/BackgroundImgs';
import CombatUI from '@/components/CombatUI';
import DescriptionWindow from '@/components/DescriptionWindow';
import MessageWindows from '@/components/MessageWindows';
import ShopUI from '@/components/ShopUI';
import SettingsUI from '@/components/SettingsUI';
import InGameWarnMsgs from '@/components/InGameWarnMsgs';
import HomePage from '@/components/HomePage';

export default function Home() {
  const { gameData, setGameData } = useGameStore();
  const { getCurrentAdventure, currentAdventureId, updateAdventure } = useAdventureStore();
  const { setStats, setGold, setInventory, setSpells, stats, gold, inventory, spells } = useCharacterStore();
  const [showHomePage, setShowHomePage] = useState(true);

  const currentAdventure = getCurrentAdventure();
  const hasActiveAdventure = currentAdventureId && currentAdventure;

  // Use a ref to track if we've already loaded this adventure
  const loadedAdventureId = useRef<string | null>(null);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  // Function to auto-start adventure with AI
  const autoStartAdventure = async (retryCount = 0) => {
    console.log('🎯 autoStartAdventure called, retryCount:', retryCount);
    const maxRetries = 3;
    
    try {
      // Get AI configuration
      const getAIConfig = () => {
        try {
          const savedConfig = localStorage.getItem('mythic-conjurer-ai-config');
          console.log('🔧 Loaded AI config:', savedConfig);
          if (savedConfig) {
            return JSON.parse(savedConfig);
          }
        } catch (error) {
          console.error('Failed to load AI config:', error);
        }
        
        return {
          provider: 'openrouter',
          apiKey: '',
          customEndpoint: '',
          model: 'anthropic/claude-3.5-sonnet',
          useCustomModel: false,
          customModelName: '',
          temperature: 0.7,
          maxTokens: 2000
        };
      };

      const aiConfig = getAIConfig();
      console.log('🔍 AI Config:', aiConfig);
      
      // Check if AI is configured
      if (!aiConfig.apiKey || aiConfig.apiKey.trim() === '') {
        console.log('❌ AI not configured - no API key');
        toast.error('AI not configured. Please set up your AI configuration in Settings to start your adventure.', {
          duration: 8000,
          action: {
            label: 'Open Settings',
            onClick: () => {
              const { toggleSettingsWindow } = useUIStore.getState();
              toggleSettingsWindow();
            }
          }
        });
        return;
      }

      console.log('✅ AI configured, making request...');

      // Prepare messages for AI to continue the starter story
      const messages = [
        {
          role: 'system',
          content: `This is a role-playing game where you'll be the 1st person character and storyteller. You'll describe the world from a 3rd person perspective but when it's time for a conversation, interact with the player from a 1st person npc perspective.

All of your responses MUST include a valid json object, with this exact properties:

"gameData": {
  "placeAndTime": {
    "place": "Location Name",
    "time": "HH:MM"
  },
  "story": "Your narrative content here",
  "event": {
    "inCombat": false,
    "shopMode": null,
    "lootMode": false
  },
  "choices": [
    "Choice 1",
    "Choice 2", 
    "Choice 3"
  ],
  "enemy": {},
  "lootBox": []
}

Important rules:
- Always provide at least 3 unique choices
- inCombat, shopMode, and lootMode must be null/false if not in use
- Use these races for enemies: bandit, golem, kobold, satyr, skritt, ghoul, goblin, wolf, ogre, harpy, gargoyle, gnoll, jinn, arachne, demon, giant, undead
- Use these weapon classes: sword, dagger, bow, mace, spear, axe, flail
- Use these spell elements: light, fire, dark, ice, lightning, toxic
- Maximum damage for weapons: 9
- Maximum gold in lootBox: 200
- Available potions: Health Potion, Mana Potion, Interactive Chat Potion

Current game state: ${JSON.stringify(gameData)}`
        },
        {
          role: 'user',
          content: 'Continue this adventure story and provide the player with meaningful choices to proceed.'
        }
      ];

      const config = {
        provider: aiConfig.provider,
        apiKey: aiConfig.apiKey,
        baseURL: aiConfig.provider === 'custom' ? aiConfig.customEndpoint : 
                 aiConfig.provider === 'openai' ? 'https://api.openai.com/v1' :
                 'https://openrouter.ai/api/v1',
        model: aiConfig.useCustomModel ? aiConfig.customModelName : aiConfig.model,
        useCustomModel: aiConfig.useCustomModel,
        customModelName: aiConfig.customModelName,
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.maxTokens
      };

      // Call AI API
      console.log('📡 Making API call to /api/ai with config:', config);
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          config
        }),
      });

      console.log('📡 Response status:', response.status, response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API response error:', errorText);
        throw new Error('Failed to get AI response');
      }

      const { content } = await response.json();
      
      // Parse the AI response to extract gameData
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0]);
          if (parsedData.gameData) {
            // Update game state with AI-generated content
            setGameData({
              ...gameData,
              ...parsedData.gameData
            });
            
            setHasAutoStarted(true);
            toast.success('Your adventure has begun!');
          } else {
            throw new Error('No gameData found in response');
          }
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        
        if (retryCount < maxRetries) {
          console.log(`Retrying auto-start (${retryCount + 1}/${maxRetries})`);
          toast.warning(`AI response failed, retrying... (${retryCount + 1}/${maxRetries})`);
          return await autoStartAdventure(retryCount + 1);
        }
        
        toast.error('Failed to start adventure after multiple attempts');
      }
    } catch (error) {
      console.error('Error auto-starting adventure:', error);
      
      if (retryCount < maxRetries) {
        console.log(`Retrying auto-start (${retryCount + 1}/${maxRetries})`);
        toast.warning(`AI request failed, retrying... (${retryCount + 1}/${maxRetries})`);
        return await autoStartAdventure(retryCount + 1);
      }
      
      // After 3 failed attempts, show a helpful error message
      toast.error('Failed to start adventure. Please check your AI configuration in Settings.', {
        duration: 8000,
        action: {
          label: 'Open Settings',
          onClick: () => {
            const { toggleSettingsWindow } = useUIStore.getState();
            toggleSettingsWindow();
          }
        }
      });
    }
  };

  useEffect(() => {
    // Prevent infinite loops by checking if we've already loaded this adventure
    if (currentAdventure && currentAdventureId !== loadedAdventureId.current) {
      loadedAdventureId.current = currentAdventureId;
      
      // If the adventure doesn't have a story yet, load starter data
      let storyData = currentAdventure.story;
      let choicesData: string[] = [];
      
      console.log('🏠 Current adventure story:', storyData);
      
      if (!storyData || storyData.trim() === '') {
        console.log('📚 Loading starter data for class:', currentAdventure.class.toLowerCase());
        const starterData = loadCharacterStarterData(currentAdventure.class.toLowerCase());
        console.log('📚 Starter data loaded:', starterData);
        storyData = starterData.story;
        choicesData = starterData.choices;
      } else {
        // Adventure already has story, but we need to check if it has choices
        // For new adventures, gameData.choices will be empty, so we need to start AI
        console.log('🎮 Adventure has story, checking if we need to generate choices...');
        choicesData = []; // Start with empty choices to trigger AI
      }

      setGameData({
        heroClass: currentAdventure.class,
        story: storyData,
        choices: choicesData,
        placeAndTime: {
          place: currentAdventure.place,
          time: currentAdventure.time
        }
      });
      
      // Set character data
      setStats({
        hp: currentAdventure.hp,
        maxHp: currentAdventure.maxHp,
        mp: currentAdventure.mana,
        maxMp: currentAdventure.maxMana,
      });
      
      setGold(currentAdventure.gold);
      setInventory(currentAdventure.inventory);
      setSpells(currentAdventure.spells);

      setShowHomePage(false);
      
      // Auto-start the adventure if it has story but no choices, or has starter choices
      console.log('🔍 Auto-start check - story:', !!storyData, 'choices:', choicesData);
      
      const hasStarterChoices = choicesData.length > 0 && choicesData.includes('Approach the bartender for information');
      const needsChoices = storyData && choicesData.length === 0;
      
      if (hasStarterChoices || needsChoices) {
        console.log('🚀 Auto-starting adventure with AI...');
        console.log('🎮 Reason:', hasStarterChoices ? 'Has starter choices' : 'Needs choices for existing story');
        console.log('🎮 Game data before auto-start:', { storyData, choicesData });
        setHasAutoStarted(false); // Reset flag
        setTimeout(() => {
          console.log('⏰ Auto-start timeout triggered, hasAutoStarted:', hasAutoStarted);
          if (!hasAutoStarted) {
            console.log('🤖 Calling autoStartAdventure...');
            autoStartAdventure();
          }
        }, 1000); // Small delay to ensure UI is ready
      } else {
        console.log('❌ Auto-start skipped - story:', !!storyData, 'choices:', choicesData.length);
      }
    } else if (!currentAdventure) {
      loadedAdventureId.current = null;
      setShowHomePage(true);
      setHasAutoStarted(false);
    }
  }, [currentAdventure, currentAdventureId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync adventure data when game state changes
  useEffect(() => {
    if (currentAdventureId && currentAdventure && !showHomePage) {
      // Only update if there are actual changes to prevent infinite loops
      const hasChanges = 
        currentAdventure.hp !== stats.hp ||
        currentAdventure.maxHp !== stats.maxHp ||
        currentAdventure.mana !== stats.mp ||
        currentAdventure.maxMana !== stats.maxMp ||
        currentAdventure.gold !== gold;

      if (hasChanges) {
        updateAdventure(currentAdventureId, {
          hp: stats.hp,
          maxHp: stats.maxHp,
          mana: stats.mp,
          maxMana: stats.maxMp,
          gold: gold,
          inventory: inventory,
          spells: spells,
          story: gameData.story || currentAdventure.story || '',
          place: gameData.placeAndTime?.place || currentAdventure.place,
          time: gameData.placeAndTime?.time || currentAdventure.time
        });
      }
    }
  }, [stats.hp, stats.maxHp, stats.mp, stats.maxMp, gold, currentAdventureId, showHomePage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartGame = () => {
    setShowHomePage(false);
  };

  const handleBackToHome = () => {
    setShowHomePage(true);
  };

  const handleChoiceSelection = async (choice: string) => {
    try {
      // Add user's choice to chat/story
      console.log('User selected choice:', choice);
      
      // Here you would make an AI call to continue the story based on the choice
      // For now, let's just log it
      toast.info(`You selected: ${choice}`);
      
      // TODO: Implement AI continuation logic similar to autoStartAdventure
      
    } catch (error) {
      console.error('Error handling choice selection:', error);
      toast.error('Failed to process your choice');
    }
  };

  // Memoize story message to prevent recreation on every render
  const storyMessage = useMemo(() => {
    return gameData.story ? { content: gameData.story } : null;
  }, [gameData.story]);

  // Show home page if no active adventure or user wants to go home
  if (showHomePage) {
    return <HomePage onStartGame={handleStartGame} />;
  }

  // If we have an adventure but no game started, start the adventure
  if (hasActiveAdventure && !gameData.story) {
    // Initialize the adventure story
    // You can add initial story setup here
  }

  return (
    <div className="relative h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Background Images */}
      <BackgroundImgs />
      
      {/* Main Game UI - Enhanced Mobile Responsive Layout */}
      <div className="main-game flex flex-col justify-center gap-6 md:gap-12 h-full relative z-10 px-4 pb-20 md:pb-20">
        
        {/* Story Area - Game Master */}
        <div className="game-master w-full md:w-[70%] h-[20%] md:h-[25%] leading-relaxed bg-black/80 backdrop-blur-2xl mx-auto px-3 md:px-4 py-2 md:py-2 rounded-xl md:rounded-2xl text-base md:text-xl text-gray-200 overflow-auto">
          {storyMessage ? (
            <p className="text-sm md:text-base leading-relaxed">{storyMessage.content}</p>
          ) : (
            <p className="text-sm md:text-base">Welcome to your adventure...</p>
          )}
        </div>

        {/* Game Controls - Responsive Three Column Layout */}
        <div className="game-controls flex flex-col md:flex-row w-full md:w-[70%] mx-auto items-stretch justify-between gap-3 md:gap-8 h-auto md:h-[30%]">
          
          {/* Mobile: Choices First (Most Important) */}
          <div className="choices-panel w-full md:flex-1 h-48 md:h-full order-1 md:order-2">
            {gameData.choices && gameData.choices.length > 0 ? (
              <Choices onChoiceSelect={handleChoiceSelection} />
            ) : (
              <div className="h-full bg-black/60 backdrop-blur-lg rounded-lg md:rounded-xl border border-gray-700/50 flex items-center justify-center">
                <p className="text-gray-400 text-center text-sm md:text-base">Waiting for your adventure to begin...</p>
              </div>
            )}
          </div>

          {/* Mobile: Side Panels in Row */}
          <div className="side-panels flex gap-3 md:contents order-2 md:order-none">
            {/* Left: Inventory */}
            <div className="inventory-panel flex-1 md:flex-1 h-32 md:h-full order-1">
              <GamePanel title="Inventory" actions={inventory} />
            </div>

            {/* Right: Spells */}
            <div className="spells-panel flex-1 md:flex-1 h-32 md:h-full order-3">
              <GamePanel title="Spells" actions={spells} />
            </div>
          </div>

        </div>
      </div>

      {/* UI Buttons - Overlay */}
      <UiButtons onBackToHome={handleBackToHome} />
      
      {/* Modal/Overlay Components */}
      <CombatUI />
      <ShopUI />
      <SettingsUI />
      <DescriptionWindow />
      <MessageWindows />
      <InGameWarnMsgs />
    </div>
  );
}
