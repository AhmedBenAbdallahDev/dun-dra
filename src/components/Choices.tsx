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
    <div className="choices w-full h-full flex flex-col gap-4 relative" data-combat={gameData?.event?.inCombat ? "true" : "false"}>
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
          {/* Floating hint - no layout space */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-10 pointer-events-none">
            <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600/50 rounded-lg px-3 py-1.5 text-xs text-slate-300 shadow-lg">
              💡 Choose an option to continue
            </div>
          </div>

          {/* Interactive Points - Compact */}
          {interactivePoints > 0 && (
            <div className="absolute top-2 right-2 z-10">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/20 border border-blue-500/40 rounded-md text-xs text-blue-300">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                Points: {interactivePoints}
              </div>
            </div>
          )}

          {/* Choices - Mobile Fixed Layout vs Desktop Scrollable */}
          <div className="flex-1">
            {choices.length > 0 ? (
              <>
                {/* Mobile: Fixed 4-Button Layout (No Scrolling) - Compact */}
                <div className="md:hidden h-full flex flex-col gap-2 pt-8">
                  {/* Always show 4 buttons: 3 story choices + 1 custom input */}
                  {choices.slice(0, 3).map((choice: string, index: number) => {
                    const isSelected = selectedChoice === index;
                    const isDisabled = loading || isProcessing;
                    
                    return (
                      <button
                        key={index}
                        disabled={isDisabled}
                        onClick={() => handleChoiceClick(choice, index)}
                        className={`
                          flex-1 min-h-[48px] p-2.5 text-left text-sm leading-tight
                          rounded-lg transition-all duration-200 relative overflow-hidden
                          flex items-center group border
                          ${isSelected 
                            ? 'bg-blue-600/30 border-blue-400/80 scale-[0.98] shadow-md shadow-blue-500/20' 
                            : isDisabled 
                              ? 'bg-slate-800/50 border-slate-600/30 text-slate-400 opacity-50 cursor-not-allowed'
                              : 'bg-slate-800/80 hover:bg-blue-600/20 border-slate-600/40 hover:border-blue-500/70 cursor-pointer hover:scale-[1.01] hover:shadow-md hover:shadow-blue-500/20 active:scale-95'
                          }
                        `}
                      >
                        {/* Choice number indicator - smaller */}
                        <div className={`
                          absolute left-2 top-2 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold
                          ${isSelected 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-slate-700 text-slate-300 group-hover:bg-slate-500 group-hover:text-white'
                          }
                        `}>
                          {index + 1}
                        </div>
                        
                        {/* Choice text - more compact */}
                        <div className="ml-7 pr-6 flex-1 text-slate-100 word-wrap break-words">
                          {choice}
                        </div>
                        
                        {/* Loading indicator for selected choice */}
                        {isSelected && isProcessing && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="w-3 h-3 border-2 border-blue-400 rounded-full animate-spin border-t-transparent"></div>
                          </div>
                        )}
                        
                        {/* Hover arrow indicator */}
                        {!isSelected && !isDisabled && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-blue-400 text-sm">→</span>
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {/* Custom Input as 4th Button on Mobile - Compact */}
                  <div className={`
                    flex-1 min-h-[48px] p-2.5 rounded-lg border transition-all duration-200
                    ${customInput.trim() 
                      ? 'bg-purple-600/20 border-purple-500/60' 
                      : 'bg-slate-800/80 border-slate-600/40'
                    }
                  `}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white">
                        4
                      </div>
                      <span className="text-purple-400 text-xs font-medium">Custom</span>
                      <span className="text-slate-500 text-xs ml-auto">({interactivePoints})</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Write your action..."
                        disabled={loading || isProcessing}
                        className="flex-1 px-2 py-1.5 bg-slate-900/60 border border-slate-600/50 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 disabled:opacity-50 text-xs"
                      />
                      <button
                        onClick={handleCustomAnswer}
                        disabled={loading || isProcessing || !customInput.trim() || interactivePoints <= 0}
                        className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-md transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 active:scale-95 text-xs"
                      >
                        {isProcessing ? (
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <span>✨</span>
                        )}
                        Send
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop: Scrollable Layout - Compact */}
                <div className="hidden md:flex flex-col h-full pt-8">
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {choices.map((choice: string, index: number) => {
                      const isSelected = selectedChoice === index;
                      const isDisabled = loading || isProcessing;
                      
                      return (
                        <button
                          key={index}
                          disabled={isDisabled}
                          onClick={() => handleChoiceClick(choice, index)}
                          className={`
                            w-full min-h-[56px] lg:min-h-[60px] p-3 lg:p-4
                            text-left text-sm lg:text-base leading-relaxed
                            rounded-lg transition-all duration-200 relative overflow-hidden
                            flex items-center group border
                            ${isSelected 
                              ? 'bg-blue-600/30 border-blue-400/80 scale-[0.98] shadow-md shadow-blue-500/20' 
                              : isDisabled 
                                ? 'bg-slate-800/50 border-slate-600/30 text-slate-400 opacity-50 cursor-not-allowed'
                                : 'bg-slate-800/80 hover:bg-blue-600/20 border-slate-600/40 hover:border-blue-500/70 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95'
                            }
                          `}
                        >
                          {/* Choice number indicator - smaller */}
                          <div className={`
                            absolute left-3 top-3 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                            ${isSelected 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-slate-700 text-slate-300 group-hover:bg-slate-500 group-hover:text-white'
                            }
                          `}>
                            {index + 1}
                          </div>
                          
                          {/* Choice text - more compact */}
                          <div className="ml-9 pr-10 flex-1 text-slate-100 word-wrap break-words">
                            {choice}
                          </div>
                          
                          {/* Loading indicator for selected choice */}
                          {isSelected && isProcessing && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-5 h-5 border-2 border-blue-400 rounded-full animate-spin border-t-transparent"></div>
                            </div>
                          )}
                          
                          {/* Hover arrow indicator */}
                          {!isSelected && !isDisabled && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-blue-400 text-base">→</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-center text-slate-400">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">⏳</span>
                  <span className="text-sm">Waiting for story choices...</span>
                </div>
              </div>
            )}
          </div>

          {/* Custom Input Section - Desktop Only (Mobile has it integrated above) - Compact */}
          {choices.length >= 1 && (
            <div className="hidden md:block border-t border-slate-600/50 pt-3">
              <div className="bg-slate-900/50 border border-purple-500/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-purple-400 text-sm font-medium">💭 Custom Action:</span>
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
                    className="flex-1 px-3 py-2.5 bg-slate-800/60 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 disabled:opacity-50 text-sm"
                  />
                  <button
                    onClick={handleCustomAnswer}
                    disabled={loading || isProcessing || !customInput.trim() || interactivePoints <= 0}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95 text-sm"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <span>✨</span>
                    )}
                    Send
                  </button>
                </div>
                
                <div className="text-xs text-slate-500 mt-1.5">
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