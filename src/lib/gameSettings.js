const SETTINGS_EVENT = "gameSettingsUpdated";

export function notifyGameSettingsUpdated() {
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

export function onGameSettingsUpdated(callback) {
  window.addEventListener(SETTINGS_EVENT, callback);
  return () => window.removeEventListener(SETTINGS_EVENT, callback);
}

const SETTINGS_KEY = "game_settings_config";

export function getGameSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (!saved) return {};
  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}