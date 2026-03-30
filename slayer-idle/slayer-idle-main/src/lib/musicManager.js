// Music Manager - Plays royalty-free background music loops

class MusicManager {
  constructor() {
    this.currentAudio = null;
    this.isPlaying = false;
    this.volume = 0.08;
    this.isMuted = false;
    
    // Royalty-free background music URLs (CC0/CC-BY from Freesound)
    this.melodies = {
      'main': 'https://cdn.freesound.org/previews/519/519376_10067029-lq.mp3',
      'boss': 'https://cdn.freesound.org/previews/548/548175_9757543-lq.mp3',
    };
  }

  init() {
    // No special initialization needed for HTML Audio
  }

  start(melodyType = 'main') {
    if (this.isPlaying) return;
    
    const url = this.melodies[melodyType] || this.melodies['main'];
    
    try {
      this.currentAudio = new Audio(url);
      this.currentAudio.loop = true;
      this.currentAudio.volume = this.volume;
      this.currentAudio.play().catch(() => {
        // Silently fail if music can't play
      });
      this.isPlaying = true;
    } catch (e) {
      console.warn('Music playback error:', e);
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
    this.isPlaying = false;
  }

  switchMelody(melodyType) {
    if (this.isPlaying) {
      this.stop();
      this.start(melodyType);
    }
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value)) * 0.08;
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.currentAudio) {
      this.currentAudio.muted = this.isMuted;
    }
    return this.isMuted;
  }
}

export const musicManager = new MusicManager();