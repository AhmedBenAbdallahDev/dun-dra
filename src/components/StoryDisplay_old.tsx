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
  }, [loading]);  console.log('StoryDisplay render:', { 
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
    <div className="story-display w-full h-full flex flex-col bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 md:rounded-lg border border-slate-600/30 shadow-2xl overflow-hidden">
      {gameData.story && !loading ? (
        <div className="story-content flex flex-col h-full">
          {/* Story Header - Compact */}
          <div className="flex items-center gap-2 p-2 md:p-3 border-b border-slate-600/30 bg-slate-800/50">
            <div className="flex items-center gap-2">
              <span className="text-lg">📜</span>
              <span className="text-slate-300 text-sm font-semibold">Adventure</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-600/50 to-transparent"></div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-xs">LIVE</span>
            </div>
          </div>
          
          {/* Story Content - FULL SCREEN on mobile */}
          <div className="flex-1 p-3 md:p-4 min-h-0 bg-slate-900/50">
            <div className="relative h-full">
              <div className="text-slate-100 text-base md:text-lg leading-relaxed whitespace-pre-wrap h-full overflow-y-auto p-2 md:p-4 bg-slate-800/30 rounded border border-slate-700/20 backdrop-blur-sm">
                {gameData.story}
              </div>
            </div>
          </div>
          
          <div className="hidden md:block p-3 border-t border-slate-600/30 bg-slate-800/30">
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
        <div className="loading-content flex flex-col items-center justify-center h-full p-6 md:p-8">
          {loading ? (
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl md:text-4xl">🎲</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-amber-300 text-lg md:text-xl font-semibold animate-pulse">
                  Weaving your tale{dots}
                </p>
                <p className="text-slate-400 text-sm md:text-base">
                  The Game Master is preparing your next chapter
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="text-6xl md:text-8xl animate-bounce">�</div>
              <div className="space-y-2">
                <p className="text-slate-200 text-xl md:text-2xl font-bold">
                  Your Epic Quest Awaits
                </p>
                <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto">
                  �️ Make your first choice below to begin your legendary adventure
                </p>
              </div>
              <div className="flex justify-center space-x-4 text-2xl">
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
