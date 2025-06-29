'use client';

import { useState, useEffect } from 'react';
import { useGameStore, useMiscStore } from '@/stores';
import { useUIStore } from '@/stores/uiStore';

interface ChoicesProps {
  onChoiceSelect?: (choice: string) => void;
}

export default function Choices({ onChoiceSelect }: ChoicesProps) {
  const [customInput, setCustomInput] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { gameData } = useGameStore();
  const { loading, interactivePoints, setInteractivePoints } = useMiscStore();
  const { setErrorWarnMsg } = useUIStore();

  const choices = gameData.choices || [];
  
  // 🎯 CRITICAL: Hide choices during combat like Svelte version
  const inCombat = gameData.event?.inCombat;
  const hasEnemy = gameData.enemy?.enemyName;
  
  // Debug logging for choices
  useEffect(() => {
    console.log('🎯 Choices component state:', {
      choicesCount: choices.length,
      hasStory: !!gameData.story,
      loading: loading,
      isProcessing: isProcessing,
      interactivePoints: interactivePoints,
      inCombat: inCombat,
      hasEnemy: hasEnemy,
      shouldShowChoices: !inCombat || !hasEnemy
    });
  }, [choices, gameData.story, loading, isProcessing, interactivePoints, inCombat, hasEnemy]);

  // 🎯 CRITICAL FIX: Don't render choices during combat (matches Svelte behavior)
  if (inCombat && hasEnemy) {
    console.log('🎯 Choices hidden - in combat with enemy');
    return null;
  }

  const handleChoiceClick = async (choice: string, index: number) => {
    if (loading || isProcessing || !choice) {
      console.log('🎯 Choice click blocked:', { loading, isProcessing, choice });
      return;
    }
    
    console.log('🎯 Choice selected:', { choice, index });
    setSelectedChoice(index);
    setIsProcessing(true);
    
    // Visual feedback delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Pass choice to parent component
    if (onChoiceSelect) {
      console.log('🎯 Sending choice to parent:', choice);
      onChoiceSelect(choice);
    }
    
    // Reset after a delay
    setTimeout(() => {
      setSelectedChoice(null);
      setIsProcessing(false);
    }, 1000);
  };

  const handleCustomAnswer = async () => {
    if (!customInput.trim() || loading || isProcessing) {
      console.log('🎯 Custom answer blocked:', { customInput: customInput.trim(), loading, isProcessing });
      return;
    }
    
    console.log('🎯 Custom answer submitted:', customInput);
    
    // Check for inappropriate content
    if (customInput.includes('sex') || customInput.includes('kill')) {
      if (!customInput.includes('skill')) {
        console.log('🎯 Inappropriate content detected:', customInput);
        setErrorWarnMsg("There's a flawed word in your answer.");
        return;
      }
    }

    if (interactivePoints <= 0) {
      console.log('🎯 No interactive points left');
      setErrorWarnMsg('0 interactive chat points left. You can gain it by buying it from merchants or winning battles.');
      return;
    }

    setIsProcessing(true);
    setInteractivePoints(interactivePoints - 1);
    
    const currentInput = customInput;
    setCustomInput('');
    
    // Visual feedback delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Pass custom answer to parent component
    if (onChoiceSelect) {
      console.log('🎯 Sending custom answer to parent:', currentInput);
      onChoiceSelect(currentInput);
    }
    
    // Reset after a delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomAnswer();
    }
  };

  if (!choices.length && !loading) {
    return (
      <div className="choices w-full p-4 text-center text-gray-400 bg-black/30 rounded-lg border border-gray-600/30">
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">⏳</span>
          <span className="text-sm">Waiting for story choices...</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="choices w-full p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-blue-400 text-sm font-medium">✨ AI is crafting your story...</span>
          <span className="text-gray-500 text-xs">This may take a few moments</span>
        </div>
      </div>
    );
  }

  return (
    <div className="choices w-full space-y-3">
      {/* Instruction hint for new players */}
      <div className="text-center text-gray-400 text-xs mb-2 bg-black/20 rounded p-2 border border-gray-600/20">
        💡 <span className="text-yellow-400">Choose an option below</span> to continue your adventure
      </div>

      {/* Choice buttons */}
      {choices.map((choice, index) => {
        const isSelected = selectedChoice === index;
        const isDisabled = loading || isProcessing;
        
        return (
          <button
            key={index}
            disabled={isDisabled}
            className={`choice-button w-full bg-black/60 backdrop-blur-sm hover:bg-black/70 
                       border rounded-lg p-4 text-left transition-all duration-300
                       disabled:cursor-not-allowed text-sm md:text-base
                       group relative overflow-hidden
                       ${isSelected 
                         ? 'border-green-500 bg-green-900/30 text-green-200 transform scale-[1.02]' 
                         : isDisabled 
                           ? 'border-gray-600/30 text-gray-400 opacity-50'
                           : 'border-gray-600/50 text-gray-200 hover:text-white hover:border-amber-500/70 hover:bg-amber-900/20'
                       }`}
            onClick={() => handleChoiceClick(choice, index)}
            style={{
              animationDelay: `${index * 100}ms`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            {/* Choice number indicator */}
            <div className={`absolute left-2 top-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                           ${isSelected 
                             ? 'bg-green-500 text-white' 
                             : 'bg-gray-700 text-gray-300 group-hover:bg-amber-500 group-hover:text-white'
                           }`}>
              {index + 1}
            </div>
            
            {/* Choice text */}
            <div className="ml-8 pr-2">
              {choice}
            </div>
            
            {/* Loading indicator for selected choice */}
            {isSelected && isProcessing && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-green-300/30 border-t-green-300 rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Hover arrow indicator */}
            {!isSelected && !isDisabled && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-amber-400">→</span>
              </div>
            )}
          </button>
        );
      })}
      
      {/* Custom input */}
      {choices.length >= 1 && (
        <div className="choice-input bg-black/50 backdrop-blur-sm border border-purple-500/30 
                        rounded-lg p-3 transition-all duration-300"
             style={{
               animationDelay: `${choices.length * 100}ms`,
               animation: 'fadeInUp 0.6s ease-out forwards'
             }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-purple-400 text-xs font-medium">💭 Custom Response:</span>
            <span className="text-gray-500 text-xs">({interactivePoints} points left)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Write your own creative answer..."
              className="flex-1 bg-transparent border border-gray-600/30 rounded px-3 py-2 outline-none 
                         text-gray-200 placeholder-gray-400 text-sm md:text-base
                         focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 transition-all"
              disabled={loading || isProcessing}
            />
            <button
              onClick={handleCustomAnswer}
              disabled={loading || isProcessing || !customInput.trim() || interactivePoints <= 0}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded 
                         text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed
                         hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              {isProcessing ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>✨</span>
              )}
              Send
            </button>
          </div>
          
          <div className="text-xs text-gray-500 mt-1">
            💡 Creative answers cost 1 interactive point
          </div>
        </div>
      )}
      
      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}