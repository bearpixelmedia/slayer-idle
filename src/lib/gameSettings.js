const SETTINGS_EVENT = "gameSettingsUpdated";
export const GAME_SETTINGS_UPDATED_EVENT = SETTINGS_EVENT;

export function notifyGameSettingsUpdated() {
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

export function onGameSettingsUpdated(callback) {
  window.addEventListener(SETTINGS_EVENT, callback);
  return () => window.removeEventListener(SETTINGS_EVENT, callback);
}

const SETTINGS_KEY = "game_settings_config";

/**
 * Given a sprite URL like "https://…/enemy_spider.png",
 * returns the companion Aseprite JSON URL "https://…/enemy_spider.json",
 * or null if the URL doesn't look like a PNG sprite.
 */
export function getAsepriteJsonUrlForSprite(spriteUrl) {
  if (!spriteUrl || typeof spriteUrl !== "string") return null;
  if (!spriteUrl.endsWith(".png")) return null;
  return spriteUrl.replace(/\.png$/, ".json");
}

export function loadGameSettings() {
  return getGameSettings();
}

export function getSetting(key, defaultValue) {
  const settings = getGameSettings();
  return settings[key] !== undefined ? settings[key] : defaultValue;
}

export function getGameSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (!saved) return {};
  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}