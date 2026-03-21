// Sound Manager - Uses Freesound/Zapsplat high-quality audio URLs

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.isMuted = false;
    this.volume = 0.3;
    this.initialized = false;
    this.soundCache = {};
    
    // High-quality free sound URLs
    this.soundUrls = {
      'tap': 'https://cdn.freesound.org/previews/674/674857_13048-lq.mp3',
      'upgrade': 'https://cdn.freesound.org/previews/536/536115_10566098-lq.mp3',
      'ui-click': 'https://cdn.freesound.org/previews/522/522320_11802031-lq.mp3',
      'coin-collect': 'https://cdn.freesound.org/previews/344/344021_5121236-lq.mp3',
      'enemy-hit': 'https://cdn.freesound.org/previews/386/386450_2522800-lq.mp3',
      'boss-appear': 'https://cdn.freesound.org/previews/588/588623_11546677-lq.mp3',
      'achievement': 'https://cdn.freesound.org/previews/539/539301_5121236-lq.mp3',
      'prestige': 'https://cdn.freesound.org/previews/397/397952_7146708-lq.mp3',
    };
  }

  init() {
    if (this.initialized) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  async play(type) {
    if (!this.initialized) this.init();
    if (!this.audioContext || this.isMuted) return;

    const url = this.soundUrls[type];
    if (!url) return;

    try {
      let audioBuffer = this.soundCache[type];
      
      if (!audioBuffer) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.soundCache[type] = audioBuffer;
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = audioBuffer;
      gainNode.gain.value = this.volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start(0);
    } catch (e) {
      console.warn(`Error playing sound ${type}:`, e);
    }
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