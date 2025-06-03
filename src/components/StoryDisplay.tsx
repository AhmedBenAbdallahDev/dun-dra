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
    <div className="story-display w-full flex-1 min-h-[200px] max-h-[400px] overflow-y-auto bg-black/30 backdrop-blur-sm rounded-lg p-4 md:p-6">
      {gameData.story && !loading ? (
        <div className="story-content">
          <p className="text-white text-base md:text-lg leading-relaxed whitespace-pre-wrap">
            {gameData.story}
          </p>
        </div>
      ) : (
        <div className="loading-content flex items-center justify-center h-full">
          <p className="text-slate-400 text-lg animate-pulse">
            {loading ? `Loading${dots}` : 'Your adventure awaits...'}
          </p>
        </div>
      )}
    </div>
  );
}
