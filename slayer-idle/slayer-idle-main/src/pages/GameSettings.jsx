import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { APP_VERSION } from "@/lib/appVersion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Download, Upload, Volume2, VolumeX } from "lucide-react";
import { notifyGameSettingsUpdated } from "@/lib/gameSettings";

const SAVE_KEY = "idle_slayer_save";
const SETTINGS_KEY = "game_settings_config";

export default function GameSettings() {
  const navigate = useNavigate();
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setMusicEnabled(data.musicEnabled !== false);
      setSfxEnabled(data.sfxEnabled !== false);
    }
  }, []);

  const saveSettings = (updates) => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    const existing = saved ? JSON.parse(saved) : {};
    const next = { ...existing, ...updates };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    notifyGameSettingsUpdated();
  };

  const toggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    saveSettings({ musicEnabled: next });
  };

  const toggleSfx = () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    saveSettings({ sfxEnabled: next });
  };

  const exportSave = () => {
    const save = localStorage.getItem(SAVE_KEY);
    if (!save) { alert("No save data found."); return; }
    const blob = new Blob([save], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `slayer-idle-save-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSave = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result || "{}");
        if (!data.coins && !data.stage && !data.killCount) {
          alert("This doesn't look like a valid save file.");
          return;
        }
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
        alert("Save imported! Returning to game...");
        navigate("/Game");
      } catch {
        alert("Invalid save file.");
      }
    };
    reader.readAsText(file);
  };

  const resetSave = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 5000);
      return;
    }
    localStorage.removeItem(SAVE_KEY);
    setConfirmReset(false);
    alert("Save deleted. Starting fresh!");
    navigate("/Game");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-800 border-b border-slate-700">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/Game")}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Settings</h1>
            <p className="text-xs text-slate-400">{APP_VERSION}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Audio */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">🔊 Audio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Music</p>
                <p className="text-xs text-slate-400">Background music during gameplay</p>
              </div>
              <button
                onClick={toggleMusic}
                className={`w-12 h-6 rounded-full transition-colors ${
                  musicEnabled ? "bg-indigo-500" : "bg-slate-600"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                  musicEnabled ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Sound Effects</p>
                <p className="text-xs text-slate-400">Hit sounds, coin pickups, UI clicks</p>
              </div>
              <button
                onClick={toggleSfx}
                className={`w-12 h-6 rounded-full transition-colors ${
                  sfxEnabled ? "bg-indigo-500" : "bg-slate-600"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                  sfxEnabled ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Save Data */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">💾 Save Data</CardTitle>
            <CardDescription className="text-slate-400">Export a backup or import a previous save</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={exportSave}
              variant="outline"
              className="w-full border-slate-600 text-slate-200 hover:bg-slate-700 gap-2"
            >
              <Download className="w-4 h-4" /> Export Save
            </Button>
            <label className="block cursor-pointer">
              <Button
                variant="outline"
                className="w-full border-slate-600 text-slate-200 hover:bg-slate-700 gap-2"
                asChild
              >
                <span><Upload className="w-4 h-4" /> Import Save</span>
              </Button>
              <input type="file" accept=".json" onChange={importSave} className="hidden" />
            </label>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-slate-800 border-red-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-400 text-base">⚠️ Danger Zone</CardTitle>
            <CardDescription className="text-slate-400">These actions cannot be undone</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={resetSave}
              variant="outline"
              className={`w-full gap-2 transition-colors ${
                confirmReset
                  ? "border-red-500 text-red-400 bg-red-900/20 hover:bg-red-900/40"
                  : "border-slate-600 text-slate-200 hover:bg-slate-700"
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              {confirmReset ? "⚠️ Tap again to confirm reset" : "Reset Save Data"}
            </Button>
            {confirmReset && (
              <p className="text-xs text-red-400 mt-2 text-center">
                This will permanently delete all your progress
              </p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
