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
import { MINION_TYPES, MISSIONS } from "@/lib/minions";
import { QUEST_SCHEMA } from "@/lib/quests";
import { BUILDINGS } from "@/lib/village";

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

  const SettingGroup = ({ title, items }) => (
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
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-10">
            <TabsTrigger value="enemies">Enemies</TabsTrigger>
            <TabsTrigger value="bosses">Bosses</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="recipes">Recipes</TabsTrigger>
            <TabsTrigger value="buffs">Buffs</TabsTrigger>
            <TabsTrigger value="minions">Minions</TabsTrigger>
            <TabsTrigger value="buildings">Buildings</TabsTrigger>
            <TabsTrigger value="quests">Quests</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          {/* Enemies Tab */}
          <TabsContent value="enemies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enemy Emojis</CardTitle>
                <CardDescription>Customize the appearance of each enemy type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <SettingGroup
                  title="Stage 0 - Forest"
                  items={[
                    { id: "enemy_forest_1", label: "Slime", defaultValue: "🟢" },
                    { id: "enemy_forest_2", label: "Goblin", defaultValue: "👹" },
                    { id: "enemy_forest_3", label: "Wolf", defaultValue: "🐺" },
                  ]}
                />
                <SettingGroup
                  title="Stage 1 - Cave"
                  items={[
                    { id: "enemy_cave_1", label: "Bat", defaultValue: "🦇" },
                    { id: "enemy_cave_2", label: "Spider", defaultValue: "🕷️" },
                    { id: "enemy_cave_3", label: "Troll", defaultValue: "👹" },
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
                      { id: `boss_${boss.id}_icon`, label: "Icon", defaultValue: boss.icon },
                      { id: `boss_${boss.id}_name`, label: "Name", defaultValue: boss.name },
                      { id: `boss_${boss.id}_mechanic`, label: "Mechanic Name", defaultValue: boss.mechanic.name },
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
                      { id: `ach_${ach.id}_icon`, label: "Icon", defaultValue: ach.icon },
                      { id: `ach_${ach.id}_name`, label: "Name", defaultValue: ach.name },
                      { id: `ach_${ach.id}_desc`, label: "Description", defaultValue: ach.description },
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
                      { id: `mat_${mat.id}_icon`, label: "Icon", defaultValue: mat.icon },
                      { id: `mat_${mat.id}_name`, label: "Name", defaultValue: mat.name },
                      { id: `mat_${mat.id}_desc`, label: "Description", defaultValue: mat.description },
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
                      { id: `recipe_${recipe.id}_icon`, label: "Icon", defaultValue: recipe.icon },
                      { id: `recipe_${recipe.id}_name`, label: "Name", defaultValue: recipe.name },
                      { id: `recipe_${recipe.id}_desc`, label: "Description", defaultValue: recipe.description },
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
                      { id: `buff_${buff.id}_icon`, label: "Icon", defaultValue: buff.icon },
                      { id: `buff_${buff.id}_name`, label: "Name", defaultValue: buff.name },
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
                      { id: `minion_${minion.id}_icon`, label: "Icon", defaultValue: minion.icon },
                      { id: `minion_${minion.id}_name`, label: "Name", defaultValue: minion.name },
                      { id: `minion_${minion.id}_desc`, label: "Description", defaultValue: minion.description },
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
                {BUILDINGS.map((building) => (
                  <SettingGroup
                    key={building.id}
                    title={building.name}
                    items={[
                      { id: `building_${building.id}_icon`, label: "Icon", defaultValue: building.icon },
                      { id: `building_${building.id}_name`, label: "Name", defaultValue: building.name },
                      { id: `building_${building.id}_desc`, label: "Description", defaultValue: building.description },
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
                {Object.entries(QUEST_SCHEMA).slice(0, 10).map(([qid, quest]) => (
                  <SettingGroup
                    key={qid}
                    title={quest.title}
                    items={[
                      { id: `quest_${qid}_title`, label: "Title", defaultValue: quest.title },
                      { id: `quest_${qid}_desc`, label: "Description", defaultValue: quest.description },
                    ]}
                  />
                ))}
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