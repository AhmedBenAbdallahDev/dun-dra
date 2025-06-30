'use client';

import { useEffect, useState } from 'react';
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
        setDots(prev => prev.length >= 3 ? '.' : prev + '.');
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
    <div className="story-display w-full h-full flex flex-col bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-gray-900/90 backdrop-blur-sm rounded-xl border border-amber-500/20 shadow-2xl overflow-hidden">
      {gameData.story && !loading ? (
        <div className="story-content flex flex-col h-full">
          {/* Story Header */}
          <div className="flex items-center gap-3 p-4 md:p-6 pb-3 border-b border-amber-500/20 bg-gradient-to-r from-amber-900/20 to-orange-900/20">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📜</span>
              <span className="text-amber-400 text-sm md:text-base font-semibold tracking-wide">Your Adventure</span>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-amber-400/50 via-orange-400/30 to-transparent"></div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-400 text-xs font-medium">LIVE</span>
            </div>
          </div>
          
          {/* Story Content - No scrolling, adaptive height */}
          <div className="flex-1 p-4 md:p-6 min-h-0">
            <div className="relative h-full">
              <p className="text-slate-100 text-sm md:text-base lg:text-lg leading-relaxed whitespace-pre-wrap h-full overflow-hidden">
                {gameData.story}
              </p>
              
              {/* Fantasy border decoration */}
              <div className="absolute -left-1 top-0 w-1 h-full bg-gradient-to-b from-amber-400 via-orange-500 to-red-600 rounded-full opacity-40"></div>
              <div className="absolute -right-1 top-0 w-1 h-full bg-gradient-to-b from-blue-400 via-cyan-500 to-teal-600 rounded-full opacity-40"></div>
            </div>
          </div>
          
          {/* Story Footer */}
          <div className="p-4 md:p-6 pt-3 border-t border-amber-500/20 bg-gradient-to-r from-slate-900/50 to-gray-900/50">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-amber-400">⚡</span>
                <span>Continue your quest below</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{gameData.story.length} words</span>
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
