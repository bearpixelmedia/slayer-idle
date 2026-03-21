// Sound Manager - Web Audio API synthesis for high-quality game sounds

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.isMuted = false;
    this.volume = 0.3;
    this.initialized = false;
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

  play(type) {
    if (!this.initialized) this.init();
    if (!this.audioContext || this.isMuted) return;

    try {
      switch (type) {
        case 'tap': this.playTap(); break;
        case 'upgrade': this.playUpgrade(); break;
        case 'ui-click': this.playUIClick(); break;
        case 'coin-collect': this.playCoinCollect(); break;
        case 'enemy-hit': this.playEnemyHit(); break;
        case 'boss-appear': this.playBossAppear(); break;
        case 'achievement': this.playAchievement(); break;
        case 'prestige': this.playPrestige(); break;
      }
    } catch (e) {
      console.warn('Sound playback error:', e);
    }
  }

  // Create a rich, non-chiptune sound with harmonics
  playTap() {
    const now = this.audioContext.currentTime;
    const duration = 0.15;
    
    // Main note with harmonics
    this.playOscillator(450, now, duration, this.volume * 0.4, 'sine', 0.05, 0.1);
    this.playOscillator(900, now, duration, this.volume * 0.2, 'sine', 0.05, 0.1);
    this.playOscillator(1350, now, duration, this.volume * 0.15, 'sine', 0.05, 0.1);
  }

  playUpgrade() {
    const now = this.audioContext.currentTime;
    const duration = 0.4;
    
    // Ascending pitch with harmonics
    this.playFrequencySweep(300, 800, now, duration, this.volume * 0.35, 0.1, 0.15);
    this.playFrequencySweep(600, 1600, now, duration, this.volume * 0.2, 0.1, 0.15);
  }

  playUIClick() {
    const now = this.audioContext.currentTime;
    const duration = 0.1;
    
    this.playOscillator(1000, now, duration, this.volume * 0.25, 'sine', 0.02, 0.08);
    this.playOscillator(1500, now + 0.05, duration * 0.5, this.volume * 0.15, 'sine', 0.02, 0.05);
  }

  playCoinCollect() {
    const now = this.audioContext.currentTime;
    const frequencies = [523, 659, 784, 988];
    
    frequencies.forEach((freq, i) => {
      this.playOscillator(freq, now + i * 0.08, 0.2, this.volume * 0.3, 'sine', 0.03, 0.1);
      this.playOscillator(freq * 2, now + i * 0.08, 0.2, this.volume * 0.15, 'sine', 0.03, 0.1);
    });
  }

  playEnemyHit() {
    const now = this.audioContext.currentTime;
    
    // Low frequency hit
    this.playOscillator(150, now, 0.2, this.volume * 0.4, 'sine', 0.01, 0.15);
    this.playOscillator(300, now, 0.2, this.volume * 0.2, 'sine', 0.01, 0.15);
  }

  playBossAppear() {
    const now = this.audioContext.currentTime;
    
    // Deep, menacing sound
    this.playFrequencySweep(100, 300, now, 0.5, this.volume * 0.45, 0.1, 0.2);
    this.playFrequencySweep(200, 600, now, 0.5, this.volume * 0.25, 0.1, 0.2);
  }

  playAchievement() {
    const now = this.audioContext.currentTime;
    const sequence = [523, 659, 784, 988, 1047];
    
    sequence.forEach((freq, i) => {
      this.playOscillator(freq, now + i * 0.1, 0.25, this.volume * 0.3, 'sine', 0.04, 0.12);
      this.playOscillator(freq * 1.5, now + i * 0.1, 0.25, this.volume * 0.15, 'sine', 0.04, 0.12);
    });
  }

  playPrestige() {
    const now = this.audioContext.currentTime;
    
    // Epic ascending sweep
    this.playFrequencySweep(200, 1200, now, 0.6, this.volume * 0.4, 0.1, 0.25);
    this.playFrequencySweep(400, 2400, now, 0.6, this.volume * 0.2, 0.1, 0.25);
  }

  // Helper: Play a basic oscillator
  playOscillator(frequency, startTime, duration, amplitude, type = 'sine', attackTime = 0.01, releaseTime = 0.1) {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = type;
    osc.frequency.value = frequency;
    
    // Envelope
    const now = this.audioContext.currentTime;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(amplitude, startTime + attackTime);
    gain.gain.setValueAtTime(amplitude, startTime + duration - releaseTime);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // Helper: Play frequency sweep
  playFrequencySweep(freqStart, freqEnd, startTime, duration, amplitude, attackTime = 0.01, releaseTime = 0.1) {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freqStart, startTime);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);
    
    // Envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(amplitude, startTime + attackTime);
    gain.gain.setValueAtTime(amplitude, startTime + duration - releaseTime);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
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