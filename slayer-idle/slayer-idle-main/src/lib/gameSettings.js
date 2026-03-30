const UPLOADED_FILES_KEY = "setting_uploaded_files";

/**
 * Resolve Aseprite JSON URL for a spritesheet (sessionStorage, then uploaded-files list).
 * Used so sprites can show immediately while JSON is still fetching.
 */
export function getAsepriteJsonUrlForSprite(spriteUrl) {
  if (!spriteUrl || typeof sessionStorage === "undefined") return null;
  let jsonUrl = sessionStorage.getItem(`aseprite_json_${spriteUrl}`);
  if (!jsonUrl) {
    try {
      const saved = localStorage.getItem(UPLOADED_FILES_KEY);
      const list = saved ? JSON.parse(saved) : [];
      const entry = list.find((f) => f.url === spriteUrl);
      if (entry?.jsonUrl) {
        jsonUrl = entry.jsonUrl;
        sessionStorage.setItem(`aseprite_json_${spriteUrl}`, jsonUrl);
      }
    } catch {
      /* ignore */
    }
  }
  return jsonUrl;
}

/** Fired after settings are saved in this tab (storage event only fires in other tabs). */
export const GAME_SETTINGS_UPDATED_EVENT = "game-settings-updated";

export function notifyGameSettingsUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(GAME_SETTINGS_UPDATED_EVENT));
}

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

  const jsonUrl = getAsepriteJsonUrlForSprite(spriteUrl);
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

  const jsonUrl = getAsepriteJsonUrlForSprite(spriteUrl);
  if (!jsonUrl) return null;

  try {
    const response = await fetch(jsonUrl);
    if (!response.ok) return null;

    const data = await response.json();
    return {
      spriteUrl,
      animationData: data,
    };
  } catch (error) {
    console.error(`Failed to load animation data for boss ${bossId}:`, error);
    return null;
  }
}