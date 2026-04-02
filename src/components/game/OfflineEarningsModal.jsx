import React from "react";

export default function OfflineEarningsModal({ earnings, onClose }) {
  if (!earnings) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 text-center max-w-xs mx-4">
        <p className="font-pixel text-sm text-amber-300 mb-2">Welcome back!</p>
        <p className="font-pixel text-[9px] text-slate-300 mb-4">You earned {Math.floor(earnings.coins)} coins while away.</p>
        <button onClick={onClose} className="font-pixel text-[9px] bg-primary text-primary-foreground px-4 py-2 rounded">Collect</button>
      </div>
    </div>
  );
}