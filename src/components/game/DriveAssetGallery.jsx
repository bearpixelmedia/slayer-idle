import React, { useState, useEffect } from "react";
import { loadGameSettings, GAME_SETTINGS_UPDATED_EVENT } from "@/lib/gameSettings";
import { ImageIcon, Music } from "lucide-react";

const STORAGE_KEY = "game_settings_config";

// All asset groups to display with their setting key and label
const ASSET_GROUPS = [
  {
    title: "🌄 Parallax Layers",
    folder: "parallax/",
    assets: [
      { key: "parallax_stars", label: "Stars / Night Sky" },
      { key: "parallax_sky", label: "Sky / Background" },
      { key: "parallax_clouds", label: "Clouds" },
      { key: "parallax_mountain_far", label: "Far Mountains" },
      { key: "parallax_mountain_mid", label: "Mid Mountains" },
      { key: "parallax_tree_very_far", label: "Very Far Trees" },
      { key: "parallax_tree_mid", label: "Mid Trees" },
      { key: "parallax_tree_front", label: "Front Trees" },
      { key: "parallax_shrub_back", label: "Back Shrubs" },
      { key: "parallax_shrub_front", label: "Front Shrubs" },
      { key: "parallax_ground", label: "Ground Strip" },
    ],
  },
  {
    title: "👾 Enemies",
    folder: "enemies/",
    assets: [
      { key: "enemy_goblin", label: "Goblin", emoji: "👺" },
      { key: "enemy_orc", label: "Orc", emoji: "🧌" },
      { key: "enemy_ogre", label: "Ogre", emoji: "👹" },
      { key: "enemy_skeleton", label: "Skeleton", emoji: "💀" },
      { key: "enemy_vampire", label: "Vampire", emoji: "🧛" },
      { key: "enemy_dragon", label: "Dragon", emoji: "🐉" },
      { key: "enemy_lich", label: "Lich", emoji: "☠️" },
      { key: "enemy_zombie", label: "Zombie", emoji: "🧟" },
      { key: "enemy_ghost", label: "Ghost", emoji: "👻" },
      { key: "enemy_spider", label: "Spider", emoji: "🕷️" },
    ],
  },
  {
    title: "🧙 Player",
    folder: "player/",
    assets: [
      { key: "player_sword", label: "Sword Mode", emoji: "⚔️" },
      { key: "player_bow", label: "Bow Mode", emoji: "🏹" },
    ],
  },
  {
    title: "👑 Bosses",
    folder: "bosses/",
    assets: [
      { key: "boss_shadow_king_icon", label: "Shadow King", emoji: "💀" },
      { key: "boss_storm_giant_icon", label: "Storm Giant", emoji: "⚡" },
      { key: "boss_void_dragon_icon", label: "Void Dragon", emoji: "🐉" },
    ],
  },
  {
    title: "🎵 Music",
    folder: "ui/",
    assets: [
      { key: "music_title", label: "Title Screen", isAudio: true },
      { key: "music_main", label: "Main Theme", isAudio: true },
      { key: "music_boss", label: "Boss Battle", isAudio: true },
    ],
  },
];

function AssetCard({ assetKey, label, emoji, isAudio, value }) {
  const hasAsset = !!value;
  const filename = `${assetKey}${isAudio ? ".mp3" : ".png"}`;

  return (
    <div className={`rounded-lg border ${hasAsset ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"} overflow-hidden`}>
      {/* Preview area */}
      <div className="aspect-square flex items-center justify-center bg-slate-100 relative overflow-hidden">
        {hasAsset && !isAudio ? (
          <img
            src={value}
            alt={label}
            className="w-full h-full object-contain p-1"
            style={{ imageRendering: "pixelated" }}
          />
        ) : hasAsset && isAudio ? (
          <div className="flex flex-col items-center gap-1 p-2 w-full">
            <Music className="w-6 h-6 text-green-500" />
            <audio src={value} controls className="w-full h-6 mt-1" style={{ minWidth: 0 }} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-40">
            {emoji ? (
              <span className="text-3xl">{emoji}</span>
            ) : (
              <ImageIcon className="w-8 h-8 text-slate-400" />
            )}
          </div>
        )}
        {hasAsset && (
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400" title="Synced from Drive" />
        )}
      </div>
      {/* Label */}
      <div className="px-2 py-1.5">
        <p className="text-[10px] font-medium text-slate-700 truncate">{label}</p>
        <p className="text-[9px] text-slate-400 truncate font-mono">{filename}</p>
      </div>
    </div>
  );
}

export default function DriveAssetGallery() {
  const [settings, setSettings] = useState(() => loadGameSettings());

  useEffect(() => {
    const reload = () => setSettings(loadGameSettings());
    window.addEventListener(GAME_SETTINGS_UPDATED_EVENT, reload);
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY || e.key === null) reload();
    });
    return () => {
      window.removeEventListener(GAME_SETTINGS_UPDATED_EVENT, reload);
    };
  }, []);

  return (
    <div className="space-y-8">
      {ASSET_GROUPS.map((group) => (
        <div key={group.title}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold text-sm text-slate-800">{group.title}</h3>
            <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
              Drive: {group.folder}
            </span>
            <span className="text-[10px] text-slate-400 ml-auto">
              {group.assets.filter(a => !!settings[a.key]).length}/{group.assets.length} synced
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {group.assets.map((asset) => (
              <AssetCard
                key={asset.key}
                assetKey={asset.key}
                label={asset.label}
                emoji={asset.emoji}
                isAudio={asset.isAudio}
                value={settings[asset.key]}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}