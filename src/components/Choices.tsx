'use client';

import { useState } from 'react';
import { useGameStore, useMiscStore } from '@/stores';
import { useUIStore } from '@/stores/uiStore';

interface ChoicesProps {
  onChoiceSelect?: (choice: string) => void;
}

export default function Choices({ onChoiceSelect }: ChoicesProps) {
  const [customInput, setCustomInput] = useState('');
  
  const { gameData } = useGameStore();
  const { loading, interactivePoints, setInteractivePoints } = useMiscStore();
  const { setErrorWarnMsg } = useUIStore();

  const choices = gameData.choices || [];
    console.log('Choices render:', {
    choicesLength: choices.length,
    choices: choices.slice(0, 2), // Show first 2 choices
    hasStory: !!gameData.story,
    loading
  });

  const handleChoiceClick = async (choice: string) => {
    if (loading || !choice) return;
    
    // Pass choice to parent component
    if (onChoiceSelect) {
      onChoiceSelect(choice);
    }
  };

  const handleCustomAnswer = async () => {
    if (!customInput.trim() || loading) return;
    
    // Check for inappropriate content
    if (customInput.includes('sex') || customInput.includes('kill')) {
      if (!customInput.includes('skill')) {
        setErrorWarnMsg("There's a flawed word in your answer.");
        return;
      }
    }

    if (interactivePoints <= 0) {
      setErrorWarnMsg('0 interactive chat points left. You can gain it by buying it from merchants or winning battles.');
      return;
    }

    setInteractivePoints(interactivePoints - 1);
    
    const currentInput = customInput;
    setCustomInput('');
    
    // Pass custom answer to parent component
    if (onChoiceSelect) {
      onChoiceSelect(currentInput);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomAnswer();
    }
  };

  if (!choices.length) {
    return null;
  }

  return (
    <div className="choices w-full space-y-2">
      {/* Choice buttons */}
      {choices.map((choice, index) => {
        const calculatedDelay = index * 150; // Simple stagger based on index
        return (
          <button
            key={index}
            disabled={loading}
            className="choice-button w-full bg-black/60 backdrop-blur-sm hover:bg-black/70 
                     border border-gray-600/50 rounded-lg p-3 text-left text-gray-200 
                     hover:text-white transition-all duration-200 hover:border-amber-500/50
                     disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            onClick={() => handleChoiceClick(choice)}
            style={{
              animationDelay: `${calculatedDelay}ms`, // Use calculated delay
              opacity: loading ? 0.5 : 1
            }}
          >
            {choice}
          </button>
        );
      })}
      
      {/* Custom input */}
      {choices.length >= 1 && (
        <div className="choice-input bg-black/50 backdrop-blur-sm border border-gray-600/50 
                        rounded-lg p-3 flex items-center gap-2"
             style={{
               animationDelay: `${choices.length * 150}ms` // Delay after all choices
             }}>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Write your own answer. (${interactivePoints} interactive chat points left)`}
            className="flex-1 bg-transparent border-none outline-none text-gray-200 
                       placeholder-gray-400 text-sm md:text-base"
            disabled={loading}
          />
          <button
            onClick={handleCustomAnswer}
            disabled={loading || !customInput.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded 
                       text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Answer
          </button>
        </div>
      )}
    </div>
  );
}