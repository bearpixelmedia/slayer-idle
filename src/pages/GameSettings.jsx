import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function GameSettings() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>
      <p className="text-gray-400 mb-8">Game settings go here.</p>
      <Button variant="outline" onClick={() => navigate('/')}>
        Back to Title
      </Button>
    </div>
  );
}