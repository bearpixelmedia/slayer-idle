import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function TitleScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-6xl font-bold mb-4 tracking-widest">SLAYER IDLE</h1>
      <p className="text-gray-400 mb-12 text-lg">An Incremental Adventure</p>
      <div className="flex flex-col gap-4 w-48">
        <Button onClick={() => navigate('/Game')} className="w-full text-lg py-6">
          Play
        </Button>
        <Button variant="outline" onClick={() => navigate('/GameSettings')} className="w-full text-lg py-6">
          Settings
        </Button>
      </div>
    </div>
  );
}