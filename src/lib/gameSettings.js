// Load game settings from localStorage
export function loadGameSettings() {
  try {
    const saved = localStorage.getItem("game_settings_config");
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error("Failed to load game settings:", error);
    return {};
  }
}

// Get a setting value with fallback to default
export function getSetting(key, defaultValue = null) {
  const settings = loadGameSettings();
  return settings[key] !== undefined ? settings[key] : defaultValue;
}

// Get enemy sprite for a specific enemy
export async function getEnemySprite(enemyType) {
  const settings = loadGameSettings();
  const spriteUrl = settings[`enemy_${enemyType}`];
  
  if (!spriteUrl) return null;
  
  // Get the JSON metadata URL from sessionStorage
  const jsonUrl = sessionStorage.getItem(`aseprite_json_${spriteUrl}`);
  if (!jsonUrl) return null;
  
  try {
    const response = await fetch(jsonUrl);
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      spriteUrl,
      animationData: data
    };
  } catch (error) {
    console.error(`Failed to load animation data for ${enemyType}:`, error);
    return null;
  }
}

// Get boss sprite
export async function getBossSprite(bossId) {
  const settings = loadGameSettings();
  const spriteUrl = settings[`boss_${bossId}_icon`];
  
  if (!spriteUrl) return null;
  
  const jsonUrl = sessionStorage.getItem(`aseprite_json_${spriteUrl}`);
  if (!jsonUrl) return null;
  
  try {
    const response = await fetch(jsonUrl);
    if (!response.ok) return null;
    
    const data = await response.json();
    return {
      spriteUrl,
      animationData: data
    };
  } catch (error) {
    console.error(`Failed to load animation data for boss ${bossId}:`, error);
    return null;
  }
}