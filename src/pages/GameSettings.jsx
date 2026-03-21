import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, RotateCcw, Download, Upload } from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { BOSSES } from "@/lib/bosses";
import { BUFF_TYPES } from "@/lib/buffs";
import { MATERIAL_DEFS, CRAFT_RECIPES } from "@/lib/crafting";
import { MINION_TYPES, MISSION_DEFS } from "@/lib/minions";
import { QUESTS } from "@/lib/quests";
import { VILLAGE_BUILDINGS } from "@/lib/village";
import SettingImageUpload from "@/components/game/SettingImageUpload";

const STORAGE_KEY = "game_settings_config";

export default function GameSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setHasChanges(false);
    alert("Settings saved!");
  };

  const resetSettings = () => {
    if (window.confirm("Reset all settings to defaults?")) {
      localStorage.removeItem(STORAGE_KEY);
      setSettings({});
      setHasChanges(false);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "game-settings.json";
    link.click();
  };

  const importSettings = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result || "{}");
        setSettings(imported);
        setHasChanges(true);
      } catch (err) {
        alert("Invalid settings file");
      }
    };
    reader.readAsText(file);
  };

  const SettingInput = ({ label, value, onChange, placeholder = "" }) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
    </div>
  );

  const SettingImageInput = ({ label, value, onChange, defaultValue = "" }) => (
    <SettingImageUpload
      label={label}
      value={value}
      onChange={onChange}
      currentDefault={defaultValue}
    />
  );

  const SettingGroup = ({ title, items = [], imageItems = [] }) => (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm text-slate-800">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(({ id, label, defaultValue }) => (
          <SettingInput
            key={id}
            label={label}
            value={settings[id] || defaultValue}
            onChange={(val) => updateSetting(id, val)}
            placeholder={defaultValue}
          />
        ))}
        {imageItems.map(({ id, label, defaultValue }) => (
          <SettingImageInput
            key={id}
            label={label}
            value={settings[id]}
            onChange={(val) => updateSetting(id, val)}
            defaultValue={defaultValue}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/Game")}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Game Settings</h1>
              <p className="text-sm text-slate-600">Customize every emoji and value</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="w-4 h-4" />
                Import
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="hidden"
              />
            </label>
            <Button onClick={exportSettings} variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button onClick={resetSettings} variant="outline" size="sm" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button
              onClick={saveSettings}
              disabled={!hasChanges}
              className="gap-2"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="enemies" className="w-full">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11">
            <TabsTrigger value="enemies">Enemies</TabsTrigger>
            <TabsTrigger value="bosses">Bosses</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
            <TabsTrigger value="buffs">Buffs</TabsTrigger>
            <TabsTrigger value="minions">Minions</TabsTrigger>
            <TabsTrigger value="buildings">Buildings</TabsTrigger>
            <TabsTrigger value="quests">Quests</TabsTrigger>
            <TabsTrigger value="parallax">Parallax</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          {/* Enemies Tab */}
          <TabsContent value="enemies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enemy Types</CardTitle>
                <CardDescription>Customize the appearance of each enemy type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <SettingGroup
                  title="All Enemies"
                  imageItems={[
                    { id: "enemy_goblin", label: "Goblin", defaultValue: "👹" },
                    { id: "enemy_orc", label: "Orc", defaultValue: "🗡️" },
                    { id: "enemy_skeleton", label: "Skeleton", defaultValue: "💀" },
                    { id: "enemy_vampire", label: "Vampire", defaultValue: "🧛" },
                    { id: "enemy_dragon", label: "Dragon", defaultValue: "🐉" },
                    { id: "enemy_lich", label: "Lich", defaultValue: "👻" },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bosses Tab */}
          <TabsContent value="bosses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Boss Settings</CardTitle>
                <CardDescription>Customize boss names, emojis, and mechanics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {BOSSES.map((boss) => (
                  <SettingGroup
                    key={boss.id}
                    title={`Stage ${boss.stage} - ${boss.name}`}
                    items={[
                      { id: `boss_${boss.id}_name`, label: "Name", defaultValue: boss.name },
                      { id: `boss_${boss.id}_mechanic`, label: "Mechanic Name", defaultValue: boss.mechanic.name },
                    ]}
                    imageItems={[
                      { id: `boss_${boss.id}_icon`, label: "Icon", defaultValue: boss.icon },
                    ]}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievement Settings</CardTitle>
                <CardDescription>Customize achievement names and icons</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                {ACHIEVEMENTS.map((ach) => (
                  <SettingGroup
                    key={ach.id}
                    title={ach.name}
                    items={[
                      { id: `ach_${ach.id}_name`, label: "Name", defaultValue: ach.name },
                      { id: `ach_${ach.id}_desc`, label: "Description", defaultValue: ach.description },
                    ]}
                    imageItems={[
                      { id: `ach_${ach.id}_icon`, label: "Icon", defaultValue: ach.icon },
                    ]}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Crafting Materials</CardTitle>
                <CardDescription>Customize material names and icons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {MATERIAL_DEFS.map((mat) => (
                  <SettingGroup
                    key={mat.id}
                    title={mat.name}
                    items={[
                      { id: `mat_${mat.id}_name`, label: "Name", defaultValue: mat.name },
                      { id: `mat_${mat.id}_desc`, label: "Description", defaultValue: mat.description },
                    ]}
                    imageItems={[
                      { id: `mat_${mat.id}_icon`, label: "Icon", defaultValue: mat.icon },
                    ]}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recipes Tab */}
          <TabsContent value="recipes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Crafting Recipes</CardTitle>
                <CardDescription>Customize recipe names and icons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {CRAFT_RECIPES.map((recipe) => (
                  <SettingGroup
                    key={recipe.id}
                    title={recipe.name}
                    items={[
                      { id: `recipe_${recipe.id}_name`, label: "Name", defaultValue: recipe.name },
                      { id: `recipe_${recipe.id}_desc`, label: "Description", defaultValue: recipe.description },
                    ]}
                    imageItems={[
                      { id: `recipe_${recipe.id}_icon`, label: "Icon", defaultValue: recipe.icon },
                    ]}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buffs Tab */}
          <TabsContent value="buffs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buff Types</CardTitle>
                <CardDescription>Customize buff names and icons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.values(BUFF_TYPES).map((buff) => (
                  <SettingGroup
                    key={buff.id}
                    title={buff.name}
                    items={[
                      { id: `buff_${buff.id}_name`, label: "Name", defaultValue: buff.name },
                    ]}
                    imageItems={[
                      { id: `buff_${buff.id}_icon`, label: "Icon", defaultValue: buff.icon },
                    ]}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Minions Tab */}
          <TabsContent value="minions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Minion Types</CardTitle>
                <CardDescription>Customize minion names and icons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {MINION_TYPES.map((minion) => (
                  <SettingGroup
                    key={minion.id}
                    title={minion.name}
                    items={[
                      { id: `minion_${minion.id}_name`, label: "Name", defaultValue: minion.name },
                      { id: `minion_${minion.id}_desc`, label: "Description", defaultValue: minion.description },
                    ]}
                    imageItems={[
                      { id: `minion_${minion.id}_icon`, label: "Icon", defaultValue: minion.icon },
                    ]}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buildings Tab */}
          <TabsContent value="buildings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Village Buildings</CardTitle>
                <CardDescription>Customize building names and icons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {VILLAGE_BUILDINGS.map((building) => (
                  <SettingGroup
                    key={building.id}
                    title={building.name}
                    items={[
                      { id: `building_${building.id}_name`, label: "Name", defaultValue: building.name },
                      { id: `building_${building.id}_desc`, label: "Description", defaultValue: building.description },
                    ]}
                    imageItems={[
                      { id: `building_${building.id}_icon`, label: "Icon", defaultValue: building.icon },
                    ]}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quests Tab */}
          <TabsContent value="quests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quest Names</CardTitle>
                <CardDescription>Customize quest titles and descriptions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {QUESTS.slice(0, 10).map((quest) => (
                  <SettingGroup
                    key={quest.id}
                    title={quest.title}
                    items={[
                      { id: `quest_${quest.id}_title`, label: "Title", defaultValue: quest.title },
                      { id: `quest_${quest.id}_desc`, label: "Description", defaultValue: quest.description },
                    ]}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parallax Tab */}
          <TabsContent value="parallax" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Parallax Spritesheets</CardTitle>
                <CardDescription>Upload custom spritesheets for parallax layers. Upload a PNG + matching JSON (Aseprite export) together for animation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <SettingGroup
                  title="Tree Layers"
                  imageItems={[
                    { id: "parallax_tree_very_far", label: "Very Far Trees" },
                    { id: "parallax_tree_far", label: "Far Trees" },
                    { id: "parallax_tree_mid_back", label: "Mid-Back Trees" },
                    { id: "parallax_tree_mid", label: "Mid Trees" },
                    { id: "parallax_tree_mid_front", label: "Mid-Front Trees" },
                    { id: "parallax_tree_front", label: "Front Trees" },
                  ]}
                />
                <SettingGroup
                  title="Vegetation & Ground"
                  imageItems={[
                    { id: "parallax_shrub_back", label: "Back Shrubs" },
                    { id: "parallax_shrub_front", label: "Front Shrubs" },
                    { id: "parallax_mountain_far", label: "Far Mountains" },
                    { id: "parallax_mountain_mid", label: "Mid Mountains" },
                    { id: "parallax_ground", label: "Ground Strip" },
                  ]}
                />
                <SettingGroup
                  title="Background & Effects"
                  imageItems={[
                    { id: "parallax_sky", label: "Sky / Background" },
                    { id: "parallax_clouds", label: "Clouds" },
                    { id: "parallax_stars", label: "Stars / Night Sky" },
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Parallax Layer Speeds</CardTitle>
                <CardDescription>Customize parallax speeds and positions for each layer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <SettingGroup
                  title="Sky Layers"
                  items={[
                    { id: "parallax_stars_speed", label: "Stars Speed", defaultValue: "0.01" },
                    { id: "parallax_clouds_speed", label: "Distant Clouds Speed", defaultValue: "0.02" },
                    { id: "parallax_mist_speed", label: "Mist Speed", defaultValue: "0.18" },
                  ]}
                />
                <SettingGroup
                  title="Mountain Layers"
                  items={[
                    { id: "parallax_mountains_very_far_speed", label: "Very Far Mountains Speed", defaultValue: "0.04" },
                    { id: "parallax_mountains_far_speed", label: "Far Mountains Speed", defaultValue: "0.08" },
                    { id: "parallax_mountains_mid_speed", label: "Mid Mountains Speed", defaultValue: "0.12" },
                  ]}
                />
                <SettingGroup
                  title="Tree Layers"
                  items={[
                    { id: "parallax_trees_very_far_speed", label: "Very Far Trees Speed", defaultValue: "0.22" },
                    { id: "parallax_trees_distant_speed", label: "Distant Trees Speed", defaultValue: "0.28" },
                    { id: "parallax_trees_back_speed", label: "Back Treeline Speed", defaultValue: "0.35" },
                    { id: "parallax_trees_mid_back_speed", label: "Mid-Back Trees Speed", defaultValue: "0.43" },
                    { id: "parallax_trees_mid_speed", label: "Mid Trees Speed", defaultValue: "0.50" },
                    { id: "parallax_trees_mid_front_speed", label: "Mid-Front Trees Speed", defaultValue: "0.57" },
                    { id: "parallax_trees_front_speed", label: "Front Treeline Speed", defaultValue: "0.65" },
                  ]}
                />
                <SettingGroup
                  title="Vegetation Layers"
                  items={[
                    { id: "parallax_animals_far_speed", label: "Far Animals Speed", defaultValue: "0.25" },
                    { id: "parallax_animals_mid_speed", label: "Mid Animals Speed", defaultValue: "0.45" },
                    { id: "parallax_animals_close_speed", label: "Close Animals Speed", defaultValue: "0.75" },
                    { id: "parallax_shrubs_speed", label: "Shrubs Speed", defaultValue: "0.88" },
                    { id: "parallax_flowers_speed", label: "Flowers Speed", defaultValue: "0.84" },
                    { id: "parallax_ferns_mid_speed", label: "Mid Ferns Speed", defaultValue: "0.86" },
                    { id: "parallax_ferns_very_close_speed", label: "Very Close Ferns Speed", defaultValue: "0.95" },
                    { id: "parallax_ferns_ultra_close_speed", label: "Ultra Close Ferns Speed", defaultValue: "0.97" },
                    { id: "parallax_ferns_extreme_close_speed", label: "Extreme Close Ferns Speed", defaultValue: "0.99" },
                  ]}
                />
                <SettingGroup
                  title="Ground Layers"
                  items={[
                    { id: "parallax_tall_grass_speed", label: "Tall Grass Speed", defaultValue: "0.90" },
                    { id: "parallax_rocks_speed", label: "Rocks Speed", defaultValue: "0.93" },
                    { id: "parallax_grass_near_speed", label: "Grass Near Speed", defaultValue: "0.91" },
                    { id: "parallax_grass_very_close_speed", label: "Grass Very Close Speed", defaultValue: "0.95" },
                    { id: "parallax_grass_foreground_speed", label: "Grass Foreground Speed", defaultValue: "0.98" },
                  ]}
                />
                <SettingGroup
                  title="Camera Settings"
                  items={[
                    { id: "parallax_camera_lerp", label: "Camera Smoothing (0-1)", defaultValue: "0.12" },
                    { id: "parallax_target_increment", label: "Camera Movement Speed", defaultValue: "2" },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Tab */}
          <TabsContent value="other" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Game UI Text</CardTitle>
                <CardDescription>Customize labels and UI text</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SettingGroup
                  title="Main Labels"
                  items={[
                    { id: "label_coins", label: "Coins Label", defaultValue: "Coins" },
                    { id: "label_souls", label: "Souls Label", defaultValue: "Souls" },
                    { id: "label_damage", label: "Damage Label", defaultValue: "Damage" },
                    { id: "label_cps", label: "CPS Label", defaultValue: "Coins/sec" },
                    { id: "label_offline", label: "Offline Income", defaultValue: "Offline Income" },
                    { id: "label_prestige", label: "Prestige Label", defaultValue: "Prestige" },
                  ]}
                />
                <SettingGroup
                  title="Game Settings Text"
                  items={[
                    { id: "text_game_title", label: "Game Title", defaultValue: "Clicker Quest" },
                    { id: "text_stage_name", label: "Stage Label", defaultValue: "Stage" },
                    { id: "text_zone_name", label: "Zone Label", defaultValue: "Zone" },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between">
          <Button onClick={() => navigate("/Game")} variant="outline">
            Back to Game
          </Button>
          <Button
            onClick={saveSettings}
            disabled={!hasChanges}
            size="lg"
          >
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
}