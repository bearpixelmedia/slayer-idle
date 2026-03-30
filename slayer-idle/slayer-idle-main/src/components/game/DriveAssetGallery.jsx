import React, { useEffect } from "react";
import { GAME_SETTINGS_UPDATED_EVENT } from "@/lib/gameSettings";
import { ImageIcon, Music } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BOSSES } from "@/lib/bosses";

// Asset groups — each asset can have optional textFields shown inline
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
      { key: "enemy_goblin", label: "Goblin", emoji: "👺", textFields: [{ id: "enemy_goblin_name", placeholder: "Goblin" }] },
      { key: "enemy_orc", label: "Orc", emoji: "🧌", textFields: [{ id: "enemy_orc_name", placeholder: "Orc" }] },
      { key: "enemy_ogre", label: "Ogre", emoji: "👹", textFields: [{ id: "enemy_ogre_name", placeholder: "Ogre" }] },
      { key: "enemy_skeleton", label: "Skeleton", emoji: "💀", textFields: [{ id: "enemy_skeleton_name", placeholder: "Skeleton" }] },
      { key: "enemy_vampire", label: "Vampire", emoji: "🧛", textFields: [{ id: "enemy_vampire_name", placeholder: "Vampire" }] },
      { key: "enemy_dragon", label: "Dragon", emoji: "🐉", textFields: [{ id: "enemy_dragon_name", placeholder: "Dragon" }] },
      { key: "enemy_lich", label: "Lich", emoji: "☠️", textFields: [{ id: "enemy_lich_name", placeholder: "Lich" }] },
      { key: "enemy_zombie", label: "Zombie", emoji: "🧟", textFields: [{ id: "enemy_zombie_name", placeholder: "Zombie" }] },
      { key: "enemy_ghost", label: "Ghost", emoji: "👻", textFields: [{ id: "enemy_ghost_name", placeholder: "Ghost" }] },
      { key: "enemy_spider", label: "Spider", emoji: "🕷️", textFields: [{ id: "enemy_spider_name", placeholder: "Spider" }] },
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
    assets: BOSSES.map((boss) => ({
      key: `boss_${boss.id}_icon`,
      label: `Stage ${boss.stage} Boss`,
      emoji: boss.icon,
      textFields: [
        { id: `boss_${boss.id}_name`, placeholder: boss.name, fieldLabel: "Name" },
        { id: `boss_${boss.id}_mechanic`, placeholder: boss.mechanic.name, fieldLabel: "Mechanic" },
      ],
    })),
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

function AssetCard({ asset, value, settings, onUpdate }) {
  const { key, label, emoji, isAudio, textFields } = asset;
  const hasAsset = !!value;
  const filename = `${key}${isAudio ? ".mp3" : ".png"}`;

  return (
    <div className={`rounded-lg border ${hasAsset ? "border-green-200 bg-green-50" : "border-slate-200 bg-white"} overflow-hidden flex flex-col`}>
      {/* Preview */}
      <div className="aspect-square flex items-center justify-center bg-slate-100 relative overflow-hidden flex-shrink-0">
        {hasAsset && !isAudio ? (
          <img src={value} alt={label} className="w-full h-full object-contain p-1" style={{ imageRendering: "pixelated" }} />
        ) : hasAsset && isAudio ? (
          <div className="flex flex-col items-center gap-1 p-2 w-full">
            <Music className="w-5 h-5 text-green-500" />
            <audio src={value} controls className="w-full mt-1" style={{ height: 24, minWidth: 0 }} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 opacity-40">
            {emoji ? <span className="text-3xl">{emoji}</span> : <ImageIcon className="w-8 h-8 text-slate-400" />}
          </div>
        )}
        {hasAsset && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-400" title="Synced from Drive" />}
      </div>

      {/* Label + filename */}
      <div className="px-2 pt-1.5 pb-1">
        <p className="text-[10px] font-semibold text-slate-700 truncate">{label}</p>
        <p className="text-[9px] text-slate-400 truncate font-mono">{filename}</p>
      </div>

      {/* Inline text settings */}
      {textFields && textFields.length > 0 && (
        <div className="px-2 pb-2 space-y-1 border-t border-slate-100 mt-1 pt-1">
          {textFields.map((field) => (
            <div key={field.id}>
              {field.fieldLabel && <p className="text-[9px] text-slate-400 mb-0.5">{field.fieldLabel}</p>}
              <Input
                value={settings[field.id] || ""}
                onChange={(e) => onUpdate(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="h-6 text-[10px] px-1.5"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DriveAssetGallery({ settings, onUpdate }) {
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {group.assets.map((asset) => (
              <AssetCard
                key={asset.key}
                asset={asset}
                value={settings[asset.key]}
                settings={settings}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}