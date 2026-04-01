import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { APP_VERSION } from "@/lib/appVersion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RotateCcw, Download, Upload, Check } from "lucide-react";
import { notifyGameSettingsUpdated } from "@/lib/gameSettings";

const SAVE_KEY = "idle_slayer_save";
const SETTINGS_KEY = "game_settings_config";

// ── Skin tone options ──────────────────────────────────────────────────────────
// Hands.png is 32×96: 3 rows of 32×32 stacked vertically
// Row 0 = light, Row 1 = medium, Row 2 = dark
const SKIN_TONES = [
  { row: 0, label: "Light",  color: "#f5cba7" },
  { row: 1, label: "Medium", color: "#c68642" },
  { row: 2, label: "Dark",   color: "#7b4f2e" },
];

// ── Weapon options ─────────────────────────────────────────────────────────────
// Each weapon maps to a 32×32 cell in its respective sheet.
// The cell is rendered via background-position CSS on the sheet image.
const WEAPONS = [
  {
    id: "none",
    label: "Fists",
    emoji: "👊",
    sheet: null,
  },
  {
    id: "bone_r0_c0",
    label: "Bone",
    sheet: "/sprites/weapons/bone.png",
    sheetW: 224,
    sheetH: 144,
    cellX: 0,
    cellY: 0,
    cellSize: 32,
  },
  {
    id: "bone_r0_c4",
    label: "Bone Axe",
    sheet: "/sprites/weapons/bone.png",
    sheetW: 224,
    sheetH: 144,
    cellX: 4,
    cellY: 0,
    cellSize: 32,
  },
  {
    id: "bone_r1_c0",
    label: "Bone Sword",
    sheet: "/sprites/weapons/bone.png",
    sheetW: 224,
    sheetH: 144,
    cellX: 0,
    cellY: 1,
    cellSize: 32,
  },
  {
    id: "wood_r0_c0",
    label: "Wood Club",
    sheet: "/sprites/weapons/wood.png",
    sheetW: 192,
    sheetH: 112,
    cellX: 0,
    cellY: 0,
    cellSize: 32,
  },
  {
    id: "wood_r0_c4",
    label: "Wood Staff",
    sheet: "/sprites/weapons/wood.png",
    sheetW: 192,
    sheetH: 112,
    cellX: 4,
    cellY: 0,
    cellSize: 32,
  },
  {
    id: "wood_r1_c0",
    label: "Wood Sword",
    sheet: "/sprites/weapons/wood.png",
    sheetW: 192,
    sheetH: 112,
    cellX: 0,
    cellY: 1,
    cellSize: 32,
  },
];

// ── Shield / off-hand options ─────────────────────────────────────────────────
// Three shields identified in the pack:
//   bone r0c4 = large bone shield
//   bone r1c4 = small bone shield
//   wood r1c4 = wood round shield
const SHIELDS = [
  {
    id: "auto",
    label: "Auto",
    emoji: "🔄",
    sheet: null,
    description: "Matches your weapon",
  },
  {
    id: "shield_bone_large",
    label: "Bone Shield",
    sheet: "/sprites/weapons/bone.png",
    sheetW: 224,
    sheetH: 144,
    cellX: 4,
    cellY: 0,
    cellSize: 32,
  },
  {
    id: "shield_bone_small",
    label: "Bone Guard",
    sheet: "/sprites/weapons/bone.png",
    sheetW: 224,
    sheetH: 144,
    cellX: 4,
    cellY: 1,
    cellSize: 32,
  },
  {
    id: "shield_wood",
    label: "Wood Shield",
    sheet: "/sprites/weapons/wood.png",
    sheetW: 192,
    sheetH: 112,
    cellX: 4,
    cellY: 1,
    cellSize: 32,
  },
];

// ── WeaponIcon ─────────────────────────────────────────────────────────────────
function WeaponIcon({ weapon, size = 48 }) {
  if (!weapon.sheet) {
    return (
      <div
        className="flex items-center justify-center text-2xl"
        style={{ width: size, height: size }}
      >
        {weapon.emoji}
      </div>
    );
  }
  const DISPLAY_SCALE = size / weapon.cellSize;
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${weapon.sheet})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${weapon.sheetW * DISPLAY_SCALE}px ${weapon.sheetH * DISPLAY_SCALE}px`,
        backgroundPosition: `-${weapon.cellX * weapon.cellSize * DISPLAY_SCALE}px -${weapon.cellY * weapon.cellSize * DISPLAY_SCALE}px`,
        imageRendering: "pixelated",
      }}
    />
  );
}

// ── HandsPreview ───────────────────────────────────────────────────────────────
// Shows the Hands.png row for the selected skin tone
function HandsPreview({ skinRow, size = 64 }) {
  const CELL = 32;
  const SCALE = size / CELL;
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundImage: `url(/sprites/weapons/hands.png)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${CELL * SCALE}px ${CELL * 3 * SCALE}px`,
        backgroundPosition: `0px -${skinRow * size}px`,
        imageRendering: "pixelated",
      }}
    />
  );
}

export default function GameSettings() {
  const navigate = useNavigate();
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);
  const [skinRow, setSkinRow] = useState(0);
  const [weaponId, setWeaponId] = useState("none");
  const [shieldId, setShieldId] = useState("auto");

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setMusicEnabled(data.musicEnabled !== false);
      setSfxEnabled(data.sfxEnabled !== false);
      if (data.player_skin_row !== undefined) setSkinRow(data.player_skin_row);
      if (data.player_weapon_id) setWeaponId(data.player_weapon_id);
      if (data.player_shield_id) setShieldId(data.player_shield_id);
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

  const pickSkin = (row) => {
    setSkinRow(row);
    saveSettings({ player_skin_row: row });
  };

  const pickWeapon = (id) => {
    setWeaponId(id);
    const weapon = WEAPONS.find(w => w.id === id);
    saveSettings({
      player_weapon_id: id,
      player_weapon_sheet: weapon?.sheet ?? null,
      player_weapon_cell_x: weapon?.cellX ?? 0,
      player_weapon_cell_y: weapon?.cellY ?? 0,
      player_weapon_cell_size: weapon?.cellSize ?? 32,
    });
  };

  const pickShield = (id) => {
    setShieldId(id);
    const shield = SHIELDS.find(s => s.id === id);
    saveSettings({
      player_shield_id: id,
      player_shield_sheet: shield?.sheet ?? null,
      player_shield_cell_x: shield?.cellX ?? 0,
      player_shield_cell_y: shield?.cellY ?? 0,
      player_shield_cell_size: shield?.cellSize ?? 32,
    });
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

        {/* ── Character Appearance ─────────────────────────────────── */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base">🧑 Character Appearance</CardTitle>
            <CardDescription className="text-slate-400">
              Skin tone and weapon style shown during attacks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Skin Tone */}
            <div>
              <p className="text-sm font-medium text-slate-200 mb-3">Skin Tone</p>
              <div className="flex gap-3">
                {SKIN_TONES.map((s) => (
                  <button
                    key={s.row}
                    onClick={() => pickSkin(s.row)}
                    className={`relative flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${
                      skinRow === s.row
                        ? "border-indigo-400 bg-indigo-900/30"
                        : "border-slate-600 hover:border-slate-400 bg-slate-700/30"
                    }`}
                  >
                    <HandsPreview skinRow={s.row} size={48} />
                    <span className="text-xs text-slate-300">{s.label}</span>
                    {skinRow === s.row && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-400 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Weapon */}
            <div>
              <p className="text-sm font-medium text-slate-200 mb-3">Weapon (attack animation)</p>
              <div className="grid grid-cols-4 gap-2">
                {WEAPONS.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => pickWeapon(w.id)}
                    className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                      weaponId === w.id
                        ? "border-indigo-400 bg-indigo-900/30"
                        : "border-slate-600 hover:border-slate-400 bg-slate-700/30"
                    }`}
                  >
                    <WeaponIcon weapon={w} size={40} />
                    <span className="text-[10px] text-slate-300 text-center leading-tight">
                      {w.label}
                    </span>
                    {weaponId === w.id && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-400 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Shield / Off-hand */}
            <div>
              <p className="text-sm font-medium text-slate-200 mb-3">Off-hand / Shield</p>
              <div className="grid grid-cols-4 gap-2">
                {SHIELDS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => pickShield(s.id)}
                    className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                      shieldId === s.id
                        ? "border-amber-400 bg-amber-900/30"
                        : "border-slate-600 hover:border-slate-400 bg-slate-700/30"
                    }`}
                  >
                    {s.sheet ? (
                      <WeaponIcon weapon={s} size={40} />
                    ) : (
                      <div className="flex items-center justify-center text-2xl" style={{ width: 40, height: 40 }}>
                        {s.emoji}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-300 text-center leading-tight">
                      {s.label}
                    </span>
                    {shieldId === s.id && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* ── Audio ────────────────────────────────────────────────── */}
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

        {/* ── Save Data ─────────────────────────────────────────────── */}
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

        {/* ── Danger Zone ───────────────────────────────────────────── */}
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
