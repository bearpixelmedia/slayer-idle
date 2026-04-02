import React from "react";

export default function DeathModal({ isDead, souls, onRevive, onPrestige, canRevive }) {
  if (!isDead) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-slate-800 border border-red-800 rounded-xl p-6 text-center max-w-xs mx-4">
        <p className="font-pixel text-sm text-red-400 mb-2">You Died</p>
        <p className="font-pixel text-[9px] text-slate-400 mb-4">Souls: {souls}</p>
        <div className="flex gap-3 justify-center">
          {canRevive && (
            <button onClick={onRevive} className="font-pixel text-[9px] bg-blue-700 text-white px-3 py-2 rounded">
              Revive (10 souls)
            </button>
          )}
          <button onClick={onPrestige} className="font-pixel text-[9px] bg-purple-700 text-white px-3 py-2 rounded">
            Prestige
          </button>
        </div>
      </div>
    </div>
  );
}