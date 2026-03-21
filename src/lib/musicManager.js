class MusicManager {
  constructor() {
    this.audioContext = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.currentMelody = null;
    this.scheduleTimer = null;
  }

  init() {
    if (this.audioContext) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.1;
    this.masterGain.connect(this.audioContext.destination);
  }

  playNote(frequency, duration, time, volume = 0.3, waveType = 'square') {
    if (!this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.frequency.value = frequency;
    osc.type = waveType;
    
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration * 0.8);
    
    osc.start(time);
    osc.stop(time + duration);
  }

  playMelody(notes, startTime = this.audioContext.currentTime) {
    let time = startTime;
    notes.forEach(({ freq, duration, harmony, bass }) => {
      // Main melody
      this.playNote(freq, duration, time, 0.25, 'square');
      
      // Harmony (third interval)
      if (harmony) {
        this.playNote(harmony, duration, time, 0.15, 'sine');
      }
      
      // Bass (one octave lower)
      if (bass) {
        this.playNote(bass, duration, time, 0.2, 'triangle');
      }
      
      time += duration;
    });
    return time - startTime;
  }

  getMelody(type = 'main') {
    const melodies = {
      main: [
        { freq: 330, duration: 0.3 },
        { freq: 330, duration: 0.3 },
        { freq: 330, duration: 0.3 },
        { freq: 262, duration: 0.3 },
        { freq: 330, duration: 0.3 },
        { freq: 392, duration: 0.6 },
        { freq: 196, duration: 0.3 },
        { freq: 196, duration: 0.3 },
        { freq: 196, duration: 0.3 },
        { freq: 165, duration: 0.3 },
        { freq: 196, duration: 0.3 },
        { freq: 247, duration: 0.6 },
      ],
      boss: [
        { freq: 262, duration: 0.2 },
        { freq: 294, duration: 0.2 },
        { freq: 330, duration: 0.2 },
        { freq: 392, duration: 0.4 },
        { freq: 330, duration: 0.2 },
        { freq: 392, duration: 0.2 },
        { freq: 494, duration: 0.8 },
      ],
    };
    return melodies[type] || melodies.main;
  }

  start(melodieType = 'main') {
    if (!this.audioContext) this.init();
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.currentMelody = melodieType;
    
    const playLoop = () => {
      if (!this.isPlaying) return;
      const melody = this.getMelody(melodieType);
      const duration = this.playMelody(melody);
      this.scheduleTimer = setTimeout(playLoop, duration * 1000 + 100);
    };
    
    playLoop();
  }

  stop() {
    this.isPlaying = false;
    if (this.scheduleTimer) {
      clearTimeout(this.scheduleTimer);
      this.scheduleTimer = null;
    }
  }

  setVolume(value) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, value));
    }
  }
}

export const musicManager = new MusicManager();