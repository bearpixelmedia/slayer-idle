import React from "react";
import { UPGRADES, getUpgradeCost } from "@/lib/gameData";

export default function MenuPanel({
  state, onBuyUpgrade, onClose,
}) {
  if (!state) return null;
  return (
    <div className="bg-slate-800 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <p className="font-pixel text-[10px] text-slate-200">UPGRADES</p>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">×</button>
      </div>
      <div className="overflow-y-auto flex-1 p-3 space-y-2">
        {UPGRADES.map(u => {
          const level = state.upgradeLevels?.[u.id] || 0;
          const cost = getUpgradeCost(u, level);
          const canAfford = (state.coins || 0) >= cost;
          return (
            <div key={u.id} className="flex items-center justify-between bg-slate-700/50 rounded-lg px-3 py-2">
              <div>
                <p className="font-pixel text-[9px] text-slate-200">{u.name} <span className="text-slate-500">Lv{level}</span></p>
                <p className="text-[8px] text-slate-400">{u.description}</p>
              </div>
              <button
                onClick={() => onBuyUpgrade(u.id)}
                disabled={!canAfford}
                className={`font-pixel text-[8px] px-2 py-1 rounded ${canAfford ? "bg-amber-600 text-white" : "bg-slate-600 text-slate-400 opacity-50"}`}
              >
                🪙{cost}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}