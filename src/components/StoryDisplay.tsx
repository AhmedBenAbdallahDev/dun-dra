'use client';

import { useGameStore } from '@/stores';
import { useMiscStore } from '@/stores/miscStore';
import { useEffect, useState } from 'react';

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
    <div className="story-display w-full flex-1 min-h-[200px] max-h-[400px] overflow-y-auto bg-black/30 backdrop-blur-sm rounded-lg p-4 md:p-6 border-2 border-transparent hover:border-yellow-500/30 transition-all duration-300">
      {gameData.story && !loading ? (
        <div className="story-content">
          {/* Story Header */}
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-600/30">
            <span className="text-yellow-400 text-sm font-medium">📖 Story</span>
            <div className="h-1 w-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
          
          {/* Story Content */}
          <div className="relative">
            <p className="text-white text-base md:text-lg leading-relaxed whitespace-pre-wrap">
              {gameData.story}
            </p>
            
            {/* Reading indicator */}
            <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-yellow-400 via-orange-500 to-red-500 rounded-full opacity-30"></div>
          </div>
          
          {/* Story Footer */}
          <div className="mt-4 pt-2 border-t border-gray-600/30 flex justify-between items-center text-xs text-gray-400">
            <span>✨ Continue reading below</span>
            <span>{gameData.story.length} characters</span>
          </div>
        </div>
      ) : (
        <div className="loading-content flex flex-col items-center justify-center h-full gap-4">
          {loading ? (
            <>
              <div className="relative">
                <div className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-yellow-400 text-2xl">📖</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-yellow-300 text-lg font-medium animate-pulse">
                  Generating story{dots}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  AI is crafting your adventure
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎮</div>
              <p className="text-slate-300 text-xl font-medium mb-2">
                Your adventure awaits...
              </p>
              <p className="text-gray-400 text-sm">
                💡 Tip: Make choices below to begin your story
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
