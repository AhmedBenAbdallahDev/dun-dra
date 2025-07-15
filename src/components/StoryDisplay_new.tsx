'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/stores';
import { useMiscStore } from '@/stores/miscStore';

export default function StoryDisplay() {
  const { gameData } = useGameStore();
  const { loading } = useMiscStore();
  const [dots, setDots] = useState('.');

  // Animate loading dots
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setDots((prev: string) => prev.length >= 3 ? '.' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  console.log('StoryDisplay render:', { 
    hasStory: !!gameData.story, 
    storyLength: gameData.story?.length,
    loading,
    story: gameData.story ? gameData.story.substring(0, 100) + '...' : 'NO STORY',
    choices: gameData.choices?.length || 0,
    gameDataKeys: Object.keys(gameData)
  });

  // Also log when story changes
  useEffect(() => {
    console.log('📖 Story changed in StoryDisplay:', {
      story: gameData.story ? gameData.story.substring(0, 50) + '...' : 'NO STORY',
      length: gameData.story?.length
    });
  }, [gameData.story]);

  return (
    <div className="story-display w-full h-full flex flex-col bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 md:rounded-lg border border-slate-600/20 shadow-2xl overflow-hidden">
      {gameData.story && !loading ? (
        <div className="story-content flex flex-col h-full">
          {/* Story Header - Ultra minimal on mobile */}
          <div className="flex items-center gap-2 p-2 md:p-3 border-b border-slate-600/20 bg-slate-800/40 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="text-base md:text-lg">📜</span>
              <span className="text-slate-300 text-sm md:text-base font-semibold">Adventure</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-600/40 to-transparent"></div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-xs">LIVE</span>
            </div>
          </div>
          
          {/* Story Content - MAXIMIZED for mobile readability */}
          <div className="flex-1 p-2 md:p-4 min-h-0 bg-slate-900/30">
            <div className="relative h-full">
              <div className="text-slate-100 text-sm md:text-lg leading-relaxed md:leading-normal whitespace-pre-wrap h-full overflow-y-auto p-3 md:p-4 bg-slate-800/20 rounded border border-slate-700/10 backdrop-blur-sm font-medium tracking-wide selection:bg-slate-600 selection:text-white">
                {gameData.story}
              </div>
              
              {/* Subtle reading progress indicator */}
              <div className="absolute right-1 top-1 w-1 h-8 bg-gradient-to-b from-slate-600/30 to-slate-700/50 rounded-full opacity-40"></div>
            </div>
          </div>

          {/* Story Footer - Hidden on mobile for maximum space */}
          <div className="hidden md:block p-2 border-t border-slate-600/20 bg-slate-800/20">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">⚡</span>
                <span>Continue your quest below</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{gameData.story.length} chars</span>
                <span className="text-emerald-400">●</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="loading-content flex flex-col items-center justify-center h-full p-4 md:p-6">
          {loading ? (
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-10 h-10 md:w-16 md:h-16 border-3 md:border-4 border-slate-600/30 border-t-slate-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg md:text-3xl">🎲</span>
                </div>
              </div>
              <div className="space-y-1 md:space-y-2">
                <p className="text-slate-300 text-sm md:text-lg font-semibold animate-pulse">
                  Weaving your tale{dots}
                </p>
                <p className="text-slate-400 text-xs md:text-sm">
                  AI is crafting your next chapter
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3 md:space-y-6">
              <div className="text-3xl md:text-6xl animate-bounce">🗡️</div>
              <div className="space-y-1 md:space-y-2">
                <p className="text-slate-200 text-base md:text-xl font-bold">
                  Your Epic Quest Awaits
                </p>
                <p className="text-slate-400 text-xs md:text-sm max-w-xs md:max-w-sm mx-auto">
                  🎯 Make your first choice below to begin
                </p>
              </div>
              <div className="flex justify-center space-x-2 md:space-x-3 text-lg md:text-xl">
                <span className="animate-bounce" style={{animationDelay: '0ms'}}>⚔️</span>
                <span className="animate-bounce" style={{animationDelay: '200ms'}}>🛡️</span>
                <span className="animate-bounce" style={{animationDelay: '400ms'}}>🏹</span>
                <span className="animate-bounce" style={{animationDelay: '600ms'}}>✨</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
