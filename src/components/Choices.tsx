'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGameStore, useMiscStore } from '@/stores';
import { useUIStore } from '@/stores/uiStore';
import { useSelectedItemStore } from '@/stores/selectedItemStore';

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
  const { name: selectedName } = useSelectedItemStore();

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
      <div className="w-full p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
          <span className="text-amber-300 text-sm font-medium">✨ AI is crafting your story...</span>
          <span className="text-slate-500 text-xs">This may take a few moments</span>
        </div>
      </div>
    );
  }

  return (
    <div className="choices w-full h-full flex flex-col gap-4" data-combat={gameData?.event?.inCombat ? "true" : "false"}>
      {/* Combat Mode - Show instructions instead of choices */}
      {gameData?.event?.inCombat ? (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 md:p-6 text-center">
          <h3 className="text-red-400 font-semibold text-base md:text-lg mb-3 md:mb-4 flex items-center justify-center gap-2">
            ⚔️ Combat Mode
          </h3>
          <div className="space-y-2 md:space-y-3 text-xs md:text-sm text-red-200">
            <p className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 md:w-6 md:h-6 bg-red-500/20 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span className="text-left">Select a weapon or spell from panels above</span>
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 md:w-6 md:h-6 bg-red-500/20 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span className="text-left">Roll the dice in the red banner</span>
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 md:w-6 md:h-6 bg-red-500/20 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span className="text-left">Read the story to see your combat result</span>
            </p>
          </div>
          {selectedName && (
            <div className="mt-3 md:mt-4 bg-green-900/30 border border-green-500/30 rounded-lg p-2 md:p-3">
              <span className="text-green-400 text-sm">✅ Selected: <strong>{selectedName}</strong></span>
              <div className="text-xs text-green-300 mt-1">Now click the dice button in the red banner above!</div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-blue-400 mb-2">
              ⚔️ Choose Your Action
            </h2>
            <div className="text-slate-400 text-sm bg-slate-900/40 rounded-lg p-2 border border-slate-600/30">
              💡 <span className="text-slate-300">Choose an option</span> to continue
            </div>
            {interactivePoints > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 bg-blue-500/20 border border-blue-500/40 rounded-lg text-sm text-blue-300">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                Interactive Points: {interactivePoints}
              </div>
            )}
          </div>

          {/* Choices - Mobile-optimized vertical layout */}
          <div className="flex-1 overflow-y-auto">
            {choices.length > 0 ? (
              <div className="flex flex-col gap-3">
                {choices.map((choice: string, index: number) => {
                  const isSelected = selectedChoice === index;
                  const isDisabled = loading || isProcessing;
                  
                  return (
                    <button
                      key={index}
                      disabled={isDisabled}
                      onClick={() => handleChoiceClick(choice, index)}
                      className={`
                        w-full min-h-[56px] md:min-h-[70px] lg:min-h-[80px] p-3 md:p-4 lg:p-5
                        text-left text-sm md:text-base leading-relaxed
                        rounded-xl transition-all duration-200 relative overflow-hidden
                        flex items-center group
                        ${isSelected 
                          ? 'bg-blue-600/30 border-2 border-blue-400/80 scale-[0.98] shadow-lg shadow-blue-500/20' 
                          : isDisabled 
                            ? 'bg-slate-800/50 border-2 border-slate-600/30 text-slate-400 opacity-50 cursor-not-allowed'
                            : 'bg-slate-800/80 hover:bg-blue-600/20 border-2 border-slate-600/40 hover:border-blue-500/70 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/20 active:scale-95'
                        }
                      `}
                    >
                      {/* Choice number indicator */}
                      <div className={`
                        absolute left-3 top-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${isSelected 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-slate-700 text-slate-300 group-hover:bg-slate-500 group-hover:text-white'
                        }
                      `}>
                        {index + 1}
                      </div>
                      
                      {/* Choice text */}
                      <div className="ml-10 pr-12 flex-1 text-slate-100 word-wrap break-words">
                        {choice}
                      </div>
                      
                      {/* Loading indicator for selected choice */}
                      {isSelected && isProcessing && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-6 h-6 border-2 border-blue-400 rounded-full animate-spin border-t-transparent"></div>
                        </div>
                      )}
                      
                      {/* Hover arrow indicator */}
                      {!isSelected && !isDisabled && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-blue-400 text-lg">→</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-slate-400">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">⏳</span>
                  <span className="text-sm">Waiting for story choices...</span>
                </div>
              </div>
            )}
          </div>

          {/* Custom Input Section */}
          {choices.length >= 1 && (
            <div className="border-t border-slate-600/50 pt-4">
              <div className="bg-slate-900/50 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-blue-400 text-sm font-medium">💭 Custom Action:</span>
                  <span className="text-slate-500 text-xs">({interactivePoints} points left)</span>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Write your own action..."
                    disabled={loading || isProcessing}
                    className="flex-1 px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50 text-base"
                  />
                  <button
                    onClick={handleCustomAnswer}
                    disabled={loading || isProcessing || !customInput.trim() || interactivePoints <= 0}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <span>✨</span>
                    )}
                    Send
                  </button>
                </div>
                
                <div className="text-xs text-slate-500 mt-2">
                  💡 Creative answers cost 1 point
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}