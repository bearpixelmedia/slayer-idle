import React from "react";

export default function RunnerCanvas({ playerY, obstacles, score, isGameOver, gameStarted, onTap }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-800 cursor-pointer" onClick={onTap}>
      <p className="font-pixel text-xs text-slate-300 mb-4">Score: {score}</p>
      {!gameStarted && <p className="font-pixel text-[9px] text-slate-400">TAP TO START</p>}
      {isGameOver && <p className="font-pixel text-[9px] text-red-400">GAME OVER — TAP TO RETRY</p>}
    </div>
  );
}