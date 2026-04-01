import React from "react";

export default function AchievementToast({ achievement }) {
  if (!achievement) return null;
  return (
    <div className="bg-amber-900/90 border border-amber-500 rounded-lg px-4 py-2 text-center">
      <p className="font-pixel text-[9px] text-amber-300">🏆 {achievement.name}</p>
    </div>
  );
}