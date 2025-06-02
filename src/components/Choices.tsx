'use client';

import { useState } from 'react';
import { useGameStore, useMiscStore } from '@/stores';
import { useUIStore } from '@/stores/uiStore';
import { toast } from 'sonner';

interface ChoicesProps {
  choices: string[];
}

export default function Choices({ choices }: ChoicesProps) {
  const [customInput, setCustomInput] = useState('');
  const { clearChoices, addChatMessage } = useGameStore();
  const { loading, interactivePoints, setInteractivePoints } = useMiscStore();
  const handleChoiceClick = async (choice: string) => {
    if (loading) return;
    
    // Set loading state
    const { setLoading } = useMiscStore.getState();
    setLoading(true);
    
    // Add user's choice to chat
    addChatMessage({
      content: choice,
      type: 'user',
      timestamp: Date.now()
    });
    
    // Clear choices immediately
    clearChoices();
    
    // Make AI request
    await makeAIRequest(choice);
    
    setLoading(false);
  };

  const handleCustomAnswer = async () => {
    if (!customInput.trim() || loading) return;
    
    // Check for inappropriate content
    if (customInput.includes('sex') || customInput.includes('kill')) {
      alert("There's a flawed word in your answer.");
      return;
    }

    if (interactivePoints <= 0) {
      alert('0 interactive chat points left. You can gain it by buying it from merchants or winning battles.');
      return;
    }

    const { setLoading } = useMiscStore.getState();
    setLoading(true);
    setInteractivePoints(interactivePoints - 1);
    
    // Add user's custom choice to chat
    addChatMessage({
      content: customInput,
      type: 'user',
      timestamp: Date.now()
    });
    
    const currentInput = customInput;
    setCustomInput('');
    
    // Clear choices immediately
    clearChoices();
    
    // Make AI request
    await makeAIRequest(currentInput);
    
    setLoading(false);
  };
  const makeAIRequest = async (userInput: string, retryCount = 0) => {
    const { gameData, updateGameData, addChatMessage } = useGameStore.getState();
    
    const maxRetries = 3;
    
    try {
      // Load AI config from localStorage
      const getAIConfig = () => {
        try {
          const savedConfig = localStorage.getItem('mythic-conjurer-ai-config');
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

      // Prepare messages for AI
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
          content: userInput
        }
      ];

      // Get AI configuration
      const aiConfig = getAIConfig();
      
      // Prepare config object for API
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

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const { content } = await response.json();
      
      // Parse the AI response to extract gameData
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0]);
          if (parsedData.gameData) {
            updateGameData(parsedData.gameData);
            addChatMessage({
              content: parsedData.gameData.story,
              type: 'ai'
            });
          } else {
            throw new Error('No gameData found in response');
          }
        } else {
          throw new Error('No JSON found in response');
        }      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        
        if (retryCount < maxRetries) {
          console.log(`Retrying AI request (${retryCount + 1}/${maxRetries})`);
          toast.warning(`AI response failed, retrying... (${retryCount + 1}/${maxRetries})`);
          return await makeAIRequest(userInput, retryCount + 1);
        }
        
        toast.error('Failed to process AI response after multiple attempts');
        addChatMessage({
          content: 'Sorry, there was an error processing the AI response.',
          type: 'ai'
        });
      }
    } catch (error) {
      console.error('Error making AI request:', error);
      
      if (retryCount < maxRetries) {
        console.log(`Retrying AI request (${retryCount + 1}/${maxRetries})`);
        toast.warning(`AI request failed, retrying... (${retryCount + 1}/${maxRetries})`);
        return await makeAIRequest(userInput, retryCount + 1);
      }
        // After 3 failed attempts, show a helpful error message
      toast.error('AI requests failed repeatedly. Please check your AI configuration in Settings.', {
        duration: 8000,
        action: {
          label: 'Open Settings',
          onClick: () => {
            const { toggleSettingsWindow } = useUIStore.getState();
            toggleSettingsWindow();
          }
        }
      });
      
      addChatMessage({
        content: 'Unable to connect to AI after multiple attempts. Please check your AI configuration in the Settings.',
        type: 'ai'
      });
    }
  };
  return (
    <div className="choices-container h-full flex flex-col justify-between gap-1 w-full">
      {/* Regular Choices */}
      <div className="choices flex flex-col gap-1 flex-1">
        {choices.map((choice, index) => (
          <button
            key={index}
            disabled={loading}
            className={`choice bg-red-900/80 backdrop-blur-sm rounded-lg text-xl text-gray-300 py-2 px-3 border-none text-center transition-all duration-200 hover:bg-red-800/80 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-800/80'
            }`}
            onClick={() => handleChoiceClick(choice)}
          >
            {choice}
          </button>
        ))}
        
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-2 text-gray-400">AI is thinking...</span>
          </div>
        )}
      </div>

      {/* Custom Input Choice */}
      {choices.length >= 1 && (
        <div className="choice-input bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-between h-12 px-3">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder={`Write your own answer. (${interactivePoints} interactive chat points left)`}
            className="bg-transparent border-none w-4/5 h-full text-lg outline-none text-gray-300 placeholder-gray-500"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCustomAnswer();
              }
            }}
          />
          <button
            disabled={loading || !customInput.trim()}
            onClick={handleCustomAnswer}
            className={`border-none text-gray-200 rounded px-3 py-1 transition-colors duration-200 ${
              loading || !customInput.trim() 
                ? 'bg-purple-600/30 opacity-50 cursor-not-allowed' 
                : 'bg-purple-600/60 hover:bg-purple-500/70'
            }`}
          >
            {loading ? '...' : 'Answer'}
          </button>
        </div>
      )}
    </div>
  );
}
