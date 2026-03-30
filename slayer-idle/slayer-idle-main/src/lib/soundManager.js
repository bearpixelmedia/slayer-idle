// Sound Manager - Uses royalty-free audio files via HTML Audio API

class SoundManager {
  constructor() {
    this.isMuted = false;
    this.volume = 0.3;
    this.initialized = false;
    this.audioCache = {}; // Cache audio elements
    
    // Royalty-free audio URLs (CC0 or CC-BY licensed from Freesound)
    this.sounds = {
      'tap': 'https://cdn.freesound.org/previews/320/320881_5120286-lq.mp3',
      'upgrade': 'https://cdn.freesound.org/previews/456/456965_7614161-lq.mp3',
      'ui-click': 'https://cdn.freesound.org/previews/446/446149_2847950-lq.mp3',
      'coin-collect': 'https://cdn.freesound.org/previews/415/415793_3356657-lq.mp3',
      'enemy-hit': 'https://cdn.freesound.org/previews/404/404743_10160280-lq.mp3',
      'boss-appear': 'https://cdn.freesound.org/previews/548/548180_9757543-lq.mp3',
      'achievement': 'https://cdn.freesound.org/previews/270/270314_3006885-lq.mp3',
      'prestige': 'https://cdn.freesound.org/previews/554/554155_2470127-lq.mp3',
    };
  }

  init() {
    this.initialized = true;
  }

  playSound(type) {
    if (!this.initialized) this.init();
    if (this.isMuted || !this.sounds[type]) return;

    try {
      const audio = new Audio(this.sounds[type]);
      audio.volume = this.volume;
      audio.play().catch(() => {
        // Silently fail if audio can't play (browser restrictions, network issues)
      });
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  play(type) {
    this.playSound(type);
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

export const soundManager = new SoundManager();