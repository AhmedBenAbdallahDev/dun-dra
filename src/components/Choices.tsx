'use client';

import React, { useState, useEffect, useMemo } from 'react';
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

  const choices = useMemo(() => gameData.choices || [], [gameData.choices]);
  
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
      <div className="choices w-full p-4 text-center text-slate-400 bg-slate-900/60 rounded-xl border border-amber-500/20 backdrop-blur-sm">
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
          <div className="w-8 h-8 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
          <span className="text-amber-300 text-sm font-medium">✨ AI is crafting your story...</span>
          <span className="text-slate-500 text-xs">This may take a few moments</span>
        </div>
      </div>
    );
  }

  return (
    <div className="choices w-full space-y-2">
      {/* Instruction hint for new players - Compact */}
      <div className="text-center text-slate-400 text-xs bg-slate-900/40 rounded-lg p-2 border border-amber-500/20">
        💡 <span className="text-amber-400">Choose an option</span> to continue
      </div>

      {/* Choice buttons - Compact mobile design */}
      {choices.map((choice, index) => {
        const isSelected = selectedChoice === index;
        const isDisabled = loading || isProcessing;
        
        return (
          <button
            key={index}
            disabled={isDisabled}
            className={`choice-button w-full bg-slate-900/60 hover:bg-slate-800/70 
                       border rounded-lg p-3 md:p-4 text-left transition-all duration-300
                       disabled:cursor-not-allowed text-sm group relative overflow-hidden min-h-[44px]
                       ${isSelected 
                         ? 'border-emerald-500 bg-emerald-900/30 text-emerald-200 transform scale-[1.02] shadow-lg' 
                         : isDisabled 
                           ? 'border-slate-600/30 text-slate-400 opacity-50'
                           : 'border-slate-600/50 text-slate-200 hover:text-white hover:border-amber-500/70 hover:bg-amber-900/20'
                       }`}
            onClick={() => handleChoiceClick(choice, index)}
          >
            {/* Choice number indicator - Smaller */}
            <div className={`absolute left-2 top-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                           ${isSelected 
                             ? 'bg-emerald-500 text-white' 
                             : 'bg-slate-700 text-slate-300 group-hover:bg-amber-500 group-hover:text-white'
                           }`}>
              {index + 1}
            </div>
            
            {/* Choice text - More compact */}
            <div className="ml-7 pr-2 leading-tight">
              {choice}
            </div>
            
            {/* Loading indicator for selected choice */}
            {isSelected && isProcessing && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="w-3 h-3 border-2 border-emerald-300/30 border-t-emerald-300 rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Hover arrow indicator */}
            {!isSelected && !isDisabled && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-amber-400 text-sm">→</span>
              </div>
            )}
          </button>
        );
      })}
      
      {/* Custom input - Compact */}
      {choices.length >= 1 && (
        <div className="choice-input bg-slate-900/50 border border-blue-500/30 rounded-lg p-2 md:p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-400 text-xs font-medium">💭 Custom:</span>
            <span className="text-slate-500 text-xs">({interactivePoints} left)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Write your own answer..."
              className="flex-1 bg-slate-800/50 border border-slate-600/30 rounded-lg px-3 py-2 outline-none text-slate-200 placeholder-slate-400 text-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-all min-h-[40px]"
              disabled={loading || isProcessing}
            />
            <button
              onClick={handleCustomAnswer}
              disabled={loading || isProcessing || !customInput.trim() || interactivePoints <= 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center gap-1 min-h-[40px]"
            >
              {isProcessing ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>✨</span>
              )}
              Send
            </button>
          </div>
          
          <div className="text-xs text-slate-500 mt-1">
            💡 Creative answers cost 1 point
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