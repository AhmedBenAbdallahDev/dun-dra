'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skull } from 'lucide-react';

interface DeathUIProps {
  onRestart?: () => void;
}

export default function DeathUI({ onRestart }: DeathUIProps) {
  const { loading, setDeath, setStarted } = useUIStore();

  const handleRestart = () => {
    setDeath(false);
    setStarted(false);
    if (onRestart) {
      onRestart();
    }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-900/95 border-red-900/50 text-white shadow-2xl backdrop-blur-sm max-w-md w-full mx-auto transform transition-all duration-2000 animate-in fade-in">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <Skull className="h-16 w-16 text-red-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl font-bold text-red-400 mb-2">You Died.</h2>
            <p className="text-slate-400 text-sm">
              Your adventure has come to an end, but legends never truly die...
            </p>
          </div>
          
          <Button
            onClick={handleRestart}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border border-green-500 text-white font-medium transition-all duration-200 transform hover:scale-95 active:scale-90"
          >
            Start a New Game!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
