import React from "react";

export default function GameCanvas({
  state, enemyDying, floatingCoins, floatingSouls, floatingDamage,
  particles, slashEffects, onTap, attackTick, enemyHit, playerHit, weaponMode,
  tickWorldCoinCollection, onWorldCoinPickup, onJump,
}) {
  if (!state) return null;
  const pct = state.enemyMaxHP > 0 ? (state.enemyHP / state.enemyMaxHP) * 100 : 100;

  return (
    <div
      className="relative flex-1 flex flex-col items-center justify-center bg-slate-900 cursor-pointer select-none"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onTap?.(e.clientX - rect.left, e.clientY - rect.top);
      }}
    >
      <div className="text-center mb-4">
        <p className="font-pixel text-xs text-slate-400">Stage {state.stage}</p>
        <div className="w-48 h-3 bg-slate-700 rounded-full mt-1 overflow-hidden">
          <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="font-pixel text-[9px] text-slate-500 mt-1">{Math.floor(state.enemyHP)} / {state.enemyMaxHP}</p>
      </div>
      <div className="text-6xl select-none">👹</div>
      <p className="mt-6 font-pixel text-[9px] text-slate-500">TAP TO ATTACK</p>
      <div className="absolute bottom-4 left-4 right-4 flex justify-between">
        <p className="font-pixel text-[9px] text-amber-400">🪙 {Math.floor(state.coins)}</p>
        <p className="font-pixel text-[9px] text-purple-400">💀 {state.souls}</p>
      </div>
      {floatingDamage?.map(f => (
        <div key={f.id} className="absolute pointer-events-none font-pixel text-xs text-yellow-300 animate-bounce"
          style={{ left: f.x, top: f.y }}>-{Math.floor(f.value)}</div>
      ))}
    </div>
  );
}