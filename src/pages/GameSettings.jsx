import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { APP_VERSION } from "@/lib/appVersion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, RotateCcw, Download, Upload, MapPin } from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { BOSSES } from "@/lib/bosses";
import { BUFF_TYPES } from "@/lib/buffs";
import { MATERIAL_DEFS, CRAFT_RECIPES } from "@/lib/crafting";
import { MINION_TYPES } from "@/lib/minions";
import { QUESTS } from "@/lib/quests";
import { VILLAGE_BUILDINGS } from "@/lib/village";
import SettingImageUpload from "@/components/game/SettingImageUpload";
import WeaponAtlasUpload from "@/components/game/WeaponAtlasUpload";
import DriveAssetSync from "@/components/game/DriveAssetSync";
import DriveAssetGallery from "@/components/game/DriveAssetGallery";
import ZipAssetUpload from "@/components/game/ZipAssetUpload";
import { notifyGameSettingsUpdated } from "@/lib/gameSettings";

const STORAGE_KEY = "game_settings_config";

export default function GameSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [version, setVersion] = useState(1);
  const [skyGeoStatus, setSkyGeoStatus] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setSettings(data);
      setVersion(data._version || 1);
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    const newVersion = version + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...settings, _version: newVersion }));
    setVersion(newVersion);
    setHasChanges(false);
    notifyGameSettingsUpdated();
    alert(`Settings saved! (v${newVersion})`);
  };

  const resetSettings = () => {
    if (window.confirm("Reset all settings to defaults?")) {
      localStorage.removeItem(STORAGE_KEY);
      setSettings({});
      setVersion(1);
      setHasChanges(false);
      notifyGameSettingsUpdated();
    }
  };

  const useSkyLocation = () => {
    if (!navigator.geolocation) { setSkyGeoStatus("Geolocation not supported."); return; }
    setSkyGeoStatus("Locating…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateSetting("sky_latitude", String(pos.coords.latitude));
        updateSetting("sky_longitude", String(pos.coords.longitude));
        setSkyGeoStatus(`Set to ${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}° — save to apply.`);
      },
      (err) => setSkyGeoStatus(err.message || "Could not read location."),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60_000 }
    );
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "game-settings.json"; a.click();
  };

  const importSettings = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result || "{}");
        setSettings(imported);
        setVersion((imported._version || 0) + 1);
        setHasChanges(true);
      } catch { alert("Invalid settings file"); }
    };
    reader.readAsText(file);
  };

  const SettingInput = ({ label, settingId, placeholder = "" }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <Input
        value={settings[settingId] || ""}
        onChange={(e) => updateSetting(settingId, e.target.value)}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
    </div>
  );

  const TextGrid = ({ items }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map(({ id, label, defaultValue }) => (
        <SettingInput key={id} label={label} settingId={id} placeholder={defaultValue} />
      ))}
    </div>
  );

  const ImageGrid = ({ items }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {items.map(({ id, label, defaultValue }) => (
        <div key={id}>
          <SettingImageUpload
            label={label}
            value={settings[id]}
            onChange={(val) => updateSetting(id, val)}
            currentDefault={defaultValue}
          />
        </div>
      ))}
    </div>
  );

  const Section = ({ title, children }) => (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-slate-700 border-b border-slate-200 pb-1">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/Game")} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Game Settings</h1>
              <p className="text-xs text-slate-500">{APP_VERSION}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" className="gap-1" asChild>
                <span><Upload className="w-3.5 h-3.5" /> Import</span>
              </Button>
              <input type="file" accept=".json" onChange={importSettings} className="hidden" />
            </label>
            <Button onClick={exportSettings} variant="outline" size="sm" className="gap-1">
              <Download className="w-3.5 h-3.5" /> Export
            </Button>
            <Button onClick={resetSettings} variant="outline" size="sm" className="gap-1">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
            <Button onClick={saveSettings} disabled={!hasChanges} size="sm">
              {hasChanges ? "Save Changes" : "Saved"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="assets" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assets">🖼️ Assets</TabsTrigger>
            <TabsTrigger value="text">📝 Text & Names</TabsTrigger>
            <TabsTrigger value="parallax">🌄 Parallax</TabsTrigger>
            <TabsTrigger value="weapons">⚔️ Weapons</TabsTrigger>
          </TabsList>

          {/* ASSETS TAB */}
          <TabsContent value="assets" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>ZIP Import</CardTitle>
                <CardDescription>Upload a ZIP of your assets — files are matched by filename to game slots automatically.</CardDescription>
              </CardHeader>
              <CardContent>
                <ZipAssetUpload onUpdate={updateSetting} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Google Drive Sync</CardTitle>
                <CardDescription>Auto-create a folder structure in Drive, then replace any placeholder with your real asset — syncs automatically.</CardDescription>
              </CardHeader>
              <CardContent>
                <DriveAssetSync />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Asset Gallery</CardTitle>
                <CardDescription>Green dot = synced from Drive. Name fields save with the normal Save button.</CardDescription>
              </CardHeader>
              <CardContent>
                <DriveAssetGallery settings={settings} onUpdate={updateSetting} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Additional Enemy Variants</CardTitle>
                <CardDescription>Extra fantasy enemies not covered by the Drive gallery</CardDescription>
              </CardHeader>
              <CardContent>
                <ImageGrid items={[
                  { id: "enemy_genie", label: "Genie", defaultValue: "🧞" },
                  { id: "enemy_princess", label: "Princess", defaultValue: "👸" },
                  { id: "enemy_prince", label: "Prince", defaultValue: "🫅" },
                  { id: "enemy_merchant", label: "Merchant", defaultValue: "👲" },
                  { id: "enemy_sorceress", label: "Sorceress", defaultValue: "🧙‍♀️" },
                  { id: "enemy_mage", label: "Mage", defaultValue: "🧙" },
                  { id: "enemy_pixie", label: "Pixie", defaultValue: "🧚‍♀️" },
                  { id: "enemy_fairy", label: "Fairy", defaultValue: "🧚" },
                  { id: "enemy_mermaid", label: "Mermaid", defaultValue: "🧜‍♀️" },
                  { id: "enemy_elf", label: "Elf", defaultValue: "🧝" },
                ]} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Buffs & Music</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Section title="Buff Icons">
                  <ImageGrid items={Object.values(BUFF_TYPES).map(b => ({ id: `buff_${b.id}_icon`, label: b.name, defaultValue: b.icon }))} />
                </Section>
                <Section title="Zone Music">
                  <ImageGrid items={[
                    { id: "music_zone_light", label: "Realm of Light" },
                    { id: "music_zone_woods", label: "Whispering Woods" },
                    { id: "music_zone_citadel", label: "Shadowfell Citadel" },
                  ]} />
                </Section>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TEXT & NAMES TAB */}
          <TabsContent value="text" className="space-y-6 mt-4">
            <Card>
              <CardContent className="pt-6 space-y-8">
                <Section title="👾 Enemy Names">
                  <TextGrid items={[
                    { id: "enemy_goblin_name", label: "Goblin", defaultValue: "Goblin" },
                    { id: "enemy_orc_name", label: "Orc", defaultValue: "Orc" },
                    { id: "enemy_ogre_name", label: "Ogre", defaultValue: "Ogre" },
                    { id: "enemy_skeleton_name", label: "Skeleton", defaultValue: "Skeleton" },
                    { id: "enemy_vampire_name", label: "Vampire", defaultValue: "Vampire" },
                    { id: "enemy_dragon_name", label: "Dragon", defaultValue: "Dragon" },
                    { id: "enemy_lich_name", label: "Lich", defaultValue: "Lich" },
                    { id: "enemy_zombie_name", label: "Zombie", defaultValue: "Zombie" },
                    { id: "enemy_ghost_name", label: "Ghost", defaultValue: "Ghost" },
                    { id: "enemy_spider_name", label: "Spider", defaultValue: "Spider" },
                  ]} />
                </Section>

                <Section title="👑 Boss Names & Mechanics">
                  <TextGrid items={BOSSES.flatMap(b => [
                    { id: `boss_${b.id}_name`, label: `Stage ${b.stage} Name`, defaultValue: b.name },
                    { id: `boss_${b.id}_mechanic`, label: `Stage ${b.stage} Mechanic`, defaultValue: b.mechanic.name },
                  ])} />
                </Section>

                <Section title="🏆 Achievement Names">
                  <TextGrid items={ACHIEVEMENTS.map(a => ({ id: `ach_${a.id}_name`, label: a.name, defaultValue: a.name }))} />
                </Section>

                <Section title="🧪 Material Names">
                  <TextGrid items={MATERIAL_DEFS.map(m => ({ id: `mat_${m.id}_name`, label: m.name, defaultValue: m.name }))} />
                </Section>

                <Section title="📜 Recipe Names">
                  <TextGrid items={CRAFT_RECIPES.map(r => ({ id: `recipe_${r.id}_name`, label: r.name, defaultValue: r.name }))} />
                </Section>

                <Section title="⚡ Buff Names">
                  <TextGrid items={Object.values(BUFF_TYPES).map(b => ({ id: `buff_${b.id}_name`, label: b.name, defaultValue: b.name }))} />
                </Section>

                <Section title="🤝 Minion Names">
                  <TextGrid items={MINION_TYPES.map(m => ({ id: `minion_${m.id}_name`, label: m.name, defaultValue: m.name }))} />
                </Section>

                <Section title="🏘️ Building Names">
                  <TextGrid items={VILLAGE_BUILDINGS.map(b => ({ id: `building_${b.id}_name`, label: b.name, defaultValue: b.name }))} />
                </Section>

                <Section title="📋 Quest Titles">
                  <TextGrid items={QUESTS.slice(0, 15).map(q => ({ id: `quest_${q.id}_title`, label: q.title, defaultValue: q.title }))} />
                </Section>

                <Section title="🏷️ UI Labels">
                  <TextGrid items={[
                    { id: "text_game_title", label: "Game Title", defaultValue: "Clicker Quest" },
                    { id: "label_coins", label: "Coins Label", defaultValue: "Coins" },
                    { id: "label_souls", label: "Souls Label", defaultValue: "Souls" },
                    { id: "label_damage", label: "Damage Label", defaultValue: "Damage" },
                    { id: "label_cps", label: "CPS Label", defaultValue: "Coins/sec" },
                    { id: "label_prestige", label: "Prestige Label", defaultValue: "Prestige" },
                    { id: "text_stage_name", label: "Stage Label", defaultValue: "Stage" },
                    { id: "text_zone_name", label: "Zone Label", defaultValue: "Zone" },
                  ]} />
                </Section>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PARALLAX TAB */}
          <TabsContent value="parallax" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Sky (Sun & Moon)</CardTitle>
                <CardDescription>Optional lat/lng for real sunrise/sunset via SunCalc. Leave empty for clock-based sky.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1 flex-1 min-w-[140px]">
                    <label className="text-xs font-medium text-slate-600">Latitude (°)</label>
                    <Input value={settings.sky_latitude ?? ""} onChange={(e) => updateSetting("sky_latitude", e.target.value)} placeholder="e.g. 51.5074" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-[140px]">
                    <label className="text-xs font-medium text-slate-600">Longitude (°)</label>
                    <Input value={settings.sky_longitude ?? ""} onChange={(e) => updateSetting("sky_longitude", e.target.value)} placeholder="e.g. -0.1278" className="h-8 text-sm" />
                  </div>
                  <Button type="button" variant="outline" size="sm" className="gap-2 shrink-0" onClick={useSkyLocation}>
                    <MapPin className="w-4 h-4" /> Use my location
                  </Button>
                </div>
                {skyGeoStatus && <p className="text-xs text-slate-600">{skyGeoStatus}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parallax Sprites</CardTitle>
                <CardDescription>Upload custom spritesheets for each parallax layer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Section title="Sky & Atmosphere">
                  <ImageGrid items={[
                    { id: "parallax_stars", label: "Stars" },
                    { id: "parallax_sky", label: "Sky" },
                    { id: "parallax_clouds", label: "Clouds" },
                  ]} />
                </Section>
                <Section title="Mountains">
                  <ImageGrid items={[
                    { id: "parallax_mountain_far", label: "Far Mountains" },
                    { id: "parallax_mountain_mid", label: "Mid Mountains" },
                  ]} />
                </Section>
                <Section title="Trees">
                  <ImageGrid items={[
                    { id: "parallax_tree_very_far", label: "Very Far Trees" },
                    { id: "parallax_tree_far", label: "Far Trees" },
                    { id: "parallax_tree_mid", label: "Mid Trees" },
                    { id: "parallax_tree_front", label: "Front Trees" },
                  ]} />
                </Section>
                <Section title="Vegetation & Ground">
                  <ImageGrid items={[
                    { id: "parallax_shrub_back", label: "Back Shrubs" },
                    { id: "parallax_shrub_front", label: "Front Shrubs" },
                    { id: "parallax_ground", label: "Ground Strip" },
                  ]} />
                </Section>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Layer Speeds</CardTitle>
                <CardDescription>Tweak scroll speed for each parallax layer (lower = slower)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Section title="Sky">
                  <TextGrid items={[
                    { id: "parallax_stars_speed", label: "Stars Speed", defaultValue: "0.01" },
                    { id: "parallax_clouds_speed", label: "Clouds Speed", defaultValue: "0.02" },
                    { id: "parallax_mist_speed", label: "Mist Speed", defaultValue: "0.18" },
                  ]} />
                </Section>
                <Section title="Mountains">
                  <TextGrid items={[
                    { id: "parallax_mountains_far_speed", label: "Far Mountains", defaultValue: "0.04" },
                    { id: "parallax_mountains_mid_speed", label: "Mid Mountains", defaultValue: "0.08" },
                  ]} />
                </Section>
                <Section title="Trees">
                  <TextGrid items={[
                    { id: "parallax_trees_very_far_speed", label: "Very Far Trees", defaultValue: "0.22" },
                    { id: "parallax_trees_back_speed", label: "Back Trees", defaultValue: "0.35" },
                    { id: "parallax_trees_mid_speed", label: "Mid Trees", defaultValue: "0.50" },
                    { id: "parallax_trees_front_speed", label: "Front Trees", defaultValue: "0.65" },
                  ]} />
                </Section>
                <Section title="Ground">
                  <TextGrid items={[
                    { id: "parallax_shrubs_speed", label: "Shrubs Speed", defaultValue: "0.88" },
                    { id: "parallax_rocks_speed", label: "Rocks Speed", defaultValue: "0.93" },
                    { id: "parallax_grass_near_speed", label: "Grass Near", defaultValue: "0.91" },
                    { id: "parallax_tall_grass_speed", label: "Tall Grass", defaultValue: "0.90" },
                  ]} />
                </Section>
                <Section title="Camera">
                  <TextGrid items={[
                    { id: "parallax_camera_lerp", label: "Camera Smoothing (0–1)", defaultValue: "0.12" },
                    { id: "parallax_target_increment", label: "Movement Speed", defaultValue: "2" },
                  ]} />
                </Section>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WEAPONS TAB */}
          <TabsContent value="weapons" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Weapon Spritesheet Atlas</CardTitle>
                <CardDescription>Upload your weapon spritesheet (PNG + Aseprite JSON), then assign each frame to a weapon slot.</CardDescription>
              </CardHeader>
              <CardContent>
                <WeaponAtlasUpload settings={settings} onUpdateSetting={updateSetting} />
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between">
          <Button onClick={() => navigate("/Game")} variant="outline">Back to Game</Button>
          <Button onClick={saveSettings} disabled={!hasChanges} size="lg">Save All Changes</Button>
        </div>
      </div>
    </div>
  );
}