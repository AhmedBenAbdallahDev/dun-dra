'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useGameStore, useAdventureStore, useCharacterStore } from '@/stores';
import { useUIStore } from '@/stores/uiStore';
import { useCooldownsStore } from '@/stores/selectedItemStore';
import { useMiscStore } from '@/stores/miscStore';
import { loadCharacterStarterData } from '@/lib/gameData';
import { toast } from 'sonner';
import GamePanel from '@/components/GamePanel';
import Choices from '@/components/Choices';
import UiButtons from '@/components/UiButtons';
import BackgroundImgs from '@/components/BackgroundImgs';
import CombatUI from '@/components/CombatUI';
import DescriptionWindow from '@/components/DescriptionWindow';
import MessageWindows from '@/components/MessageWindows';
import StoryDisplay from '@/components/StoryDisplay';
import ShopUI from '@/components/ShopUI';
import LootUI from '@/components/LootUI';
import SettingsUI from '@/components/SettingsUI';
import InGameWarnMsgs from '@/components/InGameWarnMsgs';
import DeathUI from '@/components/DeathUI';
import HomePage from '@/components/HomePage';
import type { GameData } from '@/stores/gameStore';

export default function Home() {
  const { gameData, setGameData } = useGameStore();
  const { getCurrentAdventure, currentAdventureId, updateAdventure } = useAdventureStore();
  const { setStats, setGold, setInventory, setSpells, stats, gold, inventory, spells } = useCharacterStore();
  const { decrementCooldowns } = useCooldownsStore();
  const { death, setDeath, settingsWindow, shopWindow } = useUIStore();
  const [showHomePage, setShowHomePage] = useState(true); // Always start with home page

  const currentAdventure = getCurrentAdventure();

  // Use a ref to track if we've already loaded this adventure
  const loadedAdventureId = useRef<string | null>(null);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [adventureManuallyStarted, setAdventureManuallyStarted] = useState(false); // Track if user manually started adventure
  const isLoadingAdventure = useRef(false); // Track if we're currently loading to prevent loops

  // Function to auto-start adventure with AI
  const autoStartAdventure = useCallback(async (retryCount = 0) => {
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
          model: 'openrouter/cypher-alpha:free',
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

🎁 CRITICAL LOOT SYSTEM RULES:
- After defeating enemies, ALWAYS offer loot-checking choices like "Search the fallen enemy" or "Check for loot"
- If player chooses to check loot: populate gameData.lootBox with 1-3 items AND set lootMode: true
- If gameData.lootBox has items: set lootMode to true ALWAYS!
- NPCs giving items: add to lootBox and set lootMode: true

📦 LOOT EXAMPLES:
- Weapon: {"name": "Iron Sword", "damage": 5, "price": 85, "type": "weapon", "weaponClass": "sword"}
- Spell: {"name": "Lightning Bolt", "damage": 7, "manaCost": 20, "type": "destruction spell", "element": "lightning", "cooldown": 3}
- Potion: {"name": "Health Potion", "healing": 50, "type": "potion"}
- Gold: {"name": "gold", "type": "currency", "amount": 50}

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
                 aiConfig.provider === 'groq' ? 'https://api.groq.com/openai/v1' :
                 aiConfig.provider === 'gemini' ? 'https://generativelanguage.googleapis.com/v1beta' :
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
            // Use functional updater to avoid stale closure and unnecessary dependencies
            const mergedGameData: Partial<GameData> = {
              ...gameDataRef.current,
              story: parsedData.gameData.story || gameDataRef.current.story,
              choices: parsedData.gameData.choices || [],
              event: parsedData.gameData.event || gameDataRef.current.event,
              enemy: parsedData.gameData.enemy || {},
              lootBox: parsedData.gameData.lootBox || [],
              placeAndTime: parsedData.gameData.placeAndTime || gameDataRef.current.placeAndTime
            };
            setGameData(mergedGameData);
            console.log('✅ Adventure auto-started successfully with AI response');
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const gameDataRef = useRef(gameData);
  useEffect(() => {
    gameDataRef.current = gameData;
  }, [gameData]);

  useEffect(() => {
    // Strict guard: only run if all required state is present and not already loading
    if (!currentAdventure || !currentAdventureId || showHomePage || !adventureManuallyStarted) {
      return;
    }
    if (currentAdventureId === loadedAdventureId.current) {
      return; // Already loaded this adventure
    }
    
    console.log('[EFFECT] Adventure loader (GUARDED)', {
      currentAdventure,
      currentAdventureId,
      loadedAdventureId: loadedAdventureId.current,
      showHomePage,
      adventureManuallyStarted,
      isLoading: isLoadingAdventure.current
    });
    
    if (isLoadingAdventure.current) {
      console.log('⏳ Already loading adventure, skipping...');
      return;
    }
    
    isLoadingAdventure.current = true;
    loadedAdventureId.current = currentAdventureId;
    
    console.log('🎯 Loading adventure data for ID:', currentAdventureId);
    
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

    // Batch all state updates together to prevent multiple re-renders
    const newGameData = {
      heroClass: currentAdventure.class,
      story: storyData,
      choices: choicesData,
      placeAndTime: {
        place: currentAdventure.place,
        time: currentAdventure.time
      }
    };

    const newStats = {
      hp: currentAdventure.hp,
      maxHp: currentAdventure.maxHp,
      mp: currentAdventure.mana,
      maxMp: currentAdventure.maxMana,
    };

    console.log('🎮 Setting new game data:', { story: storyData ? storyData.substring(0, 100) + '...' : 'NO STORY', choicesCount: choicesData.length });

    // Use a single batch of updates with timeout to prevent render loops
    setTimeout(() => {
      console.log('🎮 About to set game data:', { story: storyData ? storyData.substring(0, 100) + '...' : 'NO STORY', choicesCount: choicesData.length });
      setGameData(newGameData);
      console.log('✅ setGameData called');
      setStats(newStats);
      setGold(currentAdventure.gold);
      setInventory(currentAdventure.inventory);
      setSpells(currentAdventure.spells);
      
      console.log('✅ All data updated');
      
      // Auto-start the adventure if it has story but no choices, or has starter choices
      const hasStarterChoices = choicesData.length > 0 && choicesData.some(choice => 
        choice.includes('Approach the bartender') || choice.includes('bartender')
      );
      const needsChoices = storyData && choicesData.length === 0;
      
      if (hasStarterChoices || needsChoices) {
        console.log('🚀 Auto-starting adventure with AI...');
        console.log('🎮 Reason:', hasStarterChoices ? 'Has starter choices' : 'Needs choices for existing story');
        if (!hasAutoStarted) {
          setHasAutoStarted(true); // Set flag before calling API to prevent multiple calls
          autoStartAdventure().finally(() => {
            isLoadingAdventure.current = false; // Clear loading flag when done
          });
        } else {
          isLoadingAdventure.current = false; // Clear loading flag if not auto-starting
        }
      } else {
        isLoadingAdventure.current = false; // Clear loading flag if not auto-starting
      }
    }, 100);
  }, [currentAdventure, currentAdventureId, showHomePage, adventureManuallyStarted, hasAutoStarted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync adventure data when game state changes (with debouncing to prevent loops)
  useEffect(() => {
    console.log('[EFFECT] Sync adventure data', {
      currentAdventureId,
      currentAdventure,
      showHomePage,
      adventureManuallyStarted
    });
    if (!currentAdventureId || !currentAdventure || showHomePage || !adventureManuallyStarted) {
      return; // Don't sync if not in a valid game state
    }

    // Only update if there are actual changes to prevent infinite loops
    const hasChanges = 
      currentAdventure.hp !== stats.hp ||
      currentAdventure.maxHp !== stats.maxHp ||
      currentAdventure.mana !== stats.mp ||
      currentAdventure.maxMana !== stats.maxMp ||
      currentAdventure.gold !== gold;

    if (hasChanges) {
      console.log('🔄 Syncing adventure data due to state changes');
      // Debounce the update to prevent rapid state changes
      const timeoutId = setTimeout(() => {
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
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [stats.hp, stats.maxHp, stats.mp, stats.maxMp, gold, currentAdventureId, currentAdventure, showHomePage, adventureManuallyStarted, inventory, spells, gameData.story, gameData.placeAndTime, updateAdventure]);

  // Reset any persisted death state or dead character data on app start
  useEffect(() => {
    console.log('[EFFECT] App initializing - resetting states');
    // On initial load, ensure we're on home page and death state is cleared
    setDeath(false);
    setHasAutoStarted(false);
    setAdventureManuallyStarted(false);
    loadedAdventureId.current = null;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Death detection - trigger death UI when HP reaches 0 (only when game is actually running)
  useEffect(() => {
    console.log('[EFFECT] Death detection', {
      showHomePage,
      adventureManuallyStarted,
      stats,
      currentAdventure,
      death
    });
    // Only check for death when:
    // 1. Not on home page
    // 2. User manually started an adventure 
    // 3. Character data has been loaded (maxHp > 0 indicates proper character)
    // 4. Adventure is properly loaded
    if (!showHomePage && adventureManuallyStarted && stats.maxHp > 0 && currentAdventure) {
      if (stats.hp <= 0 && !death) {
        console.log('💀 Character has died, triggering death UI');
        setDeath(true);
      } else if (stats.hp > 0 && death) {
        // Resurrection or healing brought character back
        console.log('❤️ Character is alive again, hiding death UI');
        setDeath(false);
      }
    }
  }, [stats.hp, death, showHomePage, adventureManuallyStarted, stats.maxHp, currentAdventure]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartGame = useCallback(() => {
    console.log('🎮 Starting game manually');
    setShowHomePage(false);
    console.log('[setShowHomePage] false (handleStartGame)');
    setAdventureManuallyStarted(true); // Mark that user manually started
    // Reset death state when starting a new game session
    setDeath(false);
  }, [setDeath]);

  const handleBackToHome = useCallback(() => {
    console.log('🏠 Going back to home');
    setShowHomePage(true);
    console.log('[setShowHomePage] true (handleBackToHome)');
    setAdventureManuallyStarted(false); // Reset manual start flag
    setDeath(false); // Reset death state when going back to home
    loadedAdventureId.current = null; // Reset loaded adventure tracking
    setHasAutoStarted(false); // Reset auto-start flag
  }, [setDeath]);

  const handleChoiceSelection = useCallback(async (choice: string) => {
    console.log('🎯 Page: Choice selection initiated:', {
      choice: choice.substring(0, 50) + '...',
      choiceLength: choice.length,
      currentGameState: {
        hasStory: !!gameData.story,
        choicesCount: gameData.choices?.length || 0,
        inCombat: gameData.event?.inCombat,
        shopMode: gameData.event?.shopMode
      }
    });
    
    try {
      // Add user's choice to chat/story
      console.log('🎯 Page: User selected choice:', choice.substring(0, 100));
      
      // Check for inappropriate content
      if (choice.includes('sex') || choice.includes('kill')) {
        if (!choice.includes('skill')) {
          console.log('🎯 Page: Inappropriate content detected');
          toast.error("There's a flawed word in your answer.");
          return;
        }
      }
      
      console.log('🎯 Page: Processing valid choice, decrementing cooldowns');
      // Decrement all spell cooldowns when a choice is made
      decrementCooldowns();
      
      // Clear previous choices and shop data (but keep the story until new one arrives)
      const currentGameData = useGameStore.getState().gameData;
      console.log('🎯 Page: Clearing choices and updating game state');
      setGameData({
        ...currentGameData,
        choices: [],
        shop: []
        // Don't clear story here - keep it until new story arrives
      });
      
      // Set loading state
      const { setLoading } = useMiscStore.getState();
      setLoading(true);
      
      try {
        // Make AI request to continue the story
        const getAIConfig = () => {
          try {
            const savedConfig = localStorage.getItem('mythic-conjurer-ai-config');
            return savedConfig ? JSON.parse(savedConfig) : {
              provider: 'openrouter',
              apiKey: '',
              baseURL: 'https://openrouter.ai/api/v1',
              model: 'meta-llama/llama-3.1-8b-instruct:free'
            };
          } catch (error) {
            console.error('Failed to parse AI config:', error);
            return {
              provider: 'openrouter',
              apiKey: '',
              baseURL: 'https://openrouter.ai/api/v1',
              model: 'meta-llama/llama-3.1-8b-instruct:free'
            };
          }
        };
        
        const aiConfig = getAIConfig();
        
        if (!aiConfig.apiKey && aiConfig.provider !== 'local') {
          toast.error('Please configure your AI settings first');
          setLoading(false);
          return;
        }
        
        // Prepare the prompt for continuing the story using the comprehensive system
        const { getSystemPrompt } = await import('@/lib/aiPrompts');
        
        const messages = [
          {
            role: 'system',
            content: getSystemPrompt(gameData)
          },
          {
            role: 'user',
            content: choice
          }
        ];
        
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
            config: aiConfig
          }),
        });

        console.log('🎯 Page: API response received:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        if (!response.ok) {
          console.error('🎯 Page: API request failed:', {
            status: response.status,
            statusText: response.statusText
          });
          throw new Error(`AI request failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('🎯 Page: AI Response received successfully:', {
          hasContent: !!data.content,
          contentLength: data.content?.length || 0,
          contentPreview: data.content?.substring(0, 100) + '...'
        });
        
        // Parse the AI response
        const aiContent = data.content;
        let gameDataUpdate;
        
        try {
          // Try to parse JSON from the response
          console.log('🎯 Page: Attempting to parse AI response');
          const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
          console.log('🎯 Page: JSON extraction result:', {
            foundMatch: !!jsonMatch,
            matchLength: jsonMatch?.[0]?.length || 0
          });
          
          if (jsonMatch) {
            const parsedData = JSON.parse(jsonMatch[0]);
            console.log('🎯 Page: JSON parsed successfully:', {
              hasGameData: !!parsedData.gameData,
              hasDirectData: !!parsedData.story || !!parsedData.choices,
              keys: Object.keys(parsedData)
            });
            gameDataUpdate = parsedData.gameData || parsedData;
            console.log('🎯 Page: Game data update extracted:', {
              hasStory: !!gameDataUpdate.story,
              hasChoices: Array.isArray(gameDataUpdate.choices),
              choicesCount: gameDataUpdate.choices?.length || 0,
              hasEvent: !!gameDataUpdate.event
            });
          } else {
            console.warn('🎯 Page: No JSON found in AI response, using fallback');
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.error('🎯 Page: Failed to parse AI response:', {
            error: parseError instanceof Error ? parseError.message : String(parseError),
            contentPreview: aiContent?.substring(0, 200)
          });
          // Fallback: create a basic response
          console.log('🎯 Page: Creating fallback response');
          gameDataUpdate = {
            story: aiContent,
            choices: [
              "Continue your adventure",
              "Look around carefully",
              "Check your inventory"
            ],
            event: {
              inCombat: false,
              shopMode: null,
              lootMode: false
            }
          };
        }
        
        // Update the game state
        console.log('🎯 Page: Preparing to update game state');
        const currentGameData = useGameStore.getState().gameData;
        console.log('🎯 Page: Current game data before update:', {
          hasStory: !!currentGameData.story,
          hasChoices: !!currentGameData.choices?.length,
          heroClass: currentGameData.heroClass,
          inCombat: currentGameData.event?.inCombat,
          shopMode: currentGameData.event?.shopMode
        });
        
        const newGameData = {
          ...currentGameData,
          ...gameDataUpdate,
          // Ensure we don't lose important state
          heroClass: currentGameData.heroClass,
          placeAndTime: gameDataUpdate.placeAndTime || currentGameData.placeAndTime
        };
        
        console.log('🎯 Page: New game data prepared:', {
          hasNewStory: !!newGameData.story,
          hasNewChoices: !!newGameData.choices?.length,
          newChoicesCount: newGameData.choices?.length || 0,
          heroClassPreserved: newGameData.heroClass === currentGameData.heroClass,
          hasEvent: !!newGameData.event,
          inCombat: newGameData.event?.inCombat,
          shopMode: newGameData.event?.shopMode,
          lootMode: newGameData.event?.lootMode
        });
        
        setGameData(newGameData);
        console.log('🎯 Page: Game data updated successfully');
        
        // Verify the update took effect
        setTimeout(() => {
          const updatedGameData = useGameStore.getState().gameData;
          console.log('🎯 Page: Verification - Game data after update:', {
            storyUpdated: updatedGameData.story === newGameData.story,
            choicesUpdated: updatedGameData.choices?.length === newGameData.choices?.length,
            eventUpdated: JSON.stringify(updatedGameData.event) === JSON.stringify(newGameData.event)
          });
        }, 100);
        
        // Update adventure in store
        if (currentAdventure) {
          console.log('🎯 Page: Updating adventure in store:', currentAdventure.id);
          updateAdventure(currentAdventure.id, gameDataUpdate);
        }
        
        console.log('🎯 Page: Choice selection processing completed successfully');
        
      } catch (aiError) {
        console.error('🎯 Page: AI request failed:', {
          error: aiError instanceof Error ? aiError.message : String(aiError),
          stack: aiError instanceof Error ? aiError.stack : undefined
        });
        toast.error('Failed to process your choice. Please try again.');
      } finally {
        console.log('🎯 Page: Setting loading state to false');
        setLoading(false);
      }
      
    } catch (error) {
      console.error('🎯 Page: Critical error in choice selection:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error('Failed to process your choice');
    }
  }, [decrementCooldowns, setGameData, currentAdventure, updateAdventure, gameData]);

  const handleLootAnswer = useCallback(async (answer: string) => {
    try {
      console.log('Loot answer:', answer);
      // The LootUI component handles the loot logic internally
      // This handler is mainly for any additional post-loot actions
      
      // You could add AI continuation logic here if needed
      // For now, just log the action
      
    } catch (error) {
      console.error('Error handling loot answer:', error);
      toast.error('Failed to process loot action');
    }
  }, []);

  const handleMapTravel = async (destination: string) => {
    try {
      console.log('Map travel to:', destination);
      
      // Use the same AI interaction system as choice selection
      await handleChoiceSelection(destination);
      
    } catch (error) {
      console.error('Error handling map travel:', error);
      toast.error('Failed to travel to destination');
    }
  };

  // Determine if any major overlay is active (Combat UI should NOT hide main UI)
  const isOverlayActive = useMemo(() => {
    const overlayState = death || settingsWindow || shopWindow || gameData.event.lootMode || !!gameData.event.shopMode;
    console.log('Overlay state check:', {
      death,
      settingsWindow,
      shopWindow,
      lootMode: gameData.event.lootMode,
      inCombat: gameData.event.inCombat,
      shopMode: gameData.event.shopMode,
      isOverlayActive: overlayState
    });
    return overlayState;
  }, [death, settingsWindow, shopWindow, gameData.event]);

  // Show home page if no active adventure or user wants to go home
  if (showHomePage) {
    return <HomePage onStartGame={handleStartGame} />;
  }

  return (
    <div className="relative h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Combat Banner - Fixed at top */}
      {gameData.event.inCombat && <CombatUI />}
      
      {/* Background Images */}
      <BackgroundImgs />
      
      {/* Main Game UI - Tailwind Layout */}
      {!death && !isOverlayActive && (
        <div className={`flex flex-col items-center gap-4 h-screen w-full p-2 overflow-hidden ${gameData.event.inCombat ? 'pt-16' : ''} md:gap-6 md:p-4 max-w-6xl mx-auto`}>
          {/* Story Display Area */}
          <div className="w-full h-[45%] md:h-[35%] lg:h-[30%] bg-gradient-to-br from-slate-900/85 to-slate-800/75 backdrop-blur-2xl border border-amber-500/20 rounded-xl p-3 md:p-6 lg:p-8 shadow-2xl overflow-y-auto">
            <StoryDisplay />
          </div>

          {/* Game Controls - Mobile: Column, Desktop: Row */}
          <div className="flex flex-col md:flex-row w-full h-[50%] md:h-[60%] lg:h-[65%] gap-3 md:gap-6 overflow-hidden">
            {/* Inventory Panel - Mobile: Collapsed strip, Desktop: Side panel */}
            <div className="w-full md:w-60 lg:w-72 h-auto md:h-full min-h-[80px] md:min-h-0 bg-slate-900/80 border border-slate-600/30 rounded-xl p-2 md:p-4 backdrop-blur-lg shadow-lg overflow-hidden">
              <GamePanel title="Inventory" actions={inventory} />
            </div>
            
            {/* Choices - Mobile: Main area, Desktop: Center flex */}
            <div className="flex-1 min-w-0 h-full min-h-[200px] bg-slate-900/80 border-2 border-blue-500/30 rounded-xl p-4 md:p-6 backdrop-blur-lg shadow-2xl overflow-y-auto">
              <Choices onChoiceSelect={handleChoiceSelection} />
            </div>
            
            {/* Spells Panel - Mobile: Collapsed strip, Desktop: Side panel */}
            <div className="w-full md:w-60 lg:w-72 h-auto md:h-full min-h-[80px] md:min-h-0 bg-slate-900/80 border border-slate-600/30 rounded-xl p-2 md:p-4 backdrop-blur-lg shadow-lg overflow-hidden">
              <GamePanel title="Spells" actions={spells} />
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay UI Components */}
      <div className="ui-buttons-overlay">
        <UiButtons onMapTravel={handleMapTravel} onBackToHome={handleBackToHome} />
      </div>
      <DescriptionWindow />
      
      {/* Modal/Overlay Components - Render based on their specific states */}
      {(shopWindow || gameData.event.shopMode) && <ShopUI />}
      {gameData.event.lootMode && <LootUI onAnswer={handleLootAnswer} />}
      {settingsWindow && <SettingsUI />}
      <InGameWarnMsgs />
      <MessageWindows />
      {death && <DeathUI onRestart={handleBackToHome} />}
    </div>
  );
}
