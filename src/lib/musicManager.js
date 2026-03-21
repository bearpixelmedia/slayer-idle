class MusicManager {
  constructor() {
    this.audioContext = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.currentMelody = null;
    this.scheduleTimer = null;
    this.activeOscillators = [];
  }

  init() {
    if (this.audioContext) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.08;
    this.masterGain.connect(this.audioContext.destination);
  }

  // ADSR Envelope for realistic note attack/decay
  playNote(frequency, duration, time, options = {}) {
    if (!this.audioContext) return;

    const {
      volume = 0.25,
      waveType = 'sine',
      attack = 0.005,
      decay = 0.1,
      sustain = 0.7,
      release = 0.1,
    } = options;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.frequency.value = frequency;
    osc.type = waveType;

    const totalDuration = duration + release;
    const sustainStart = attack + decay;
    const sustainEnd = Math.max(sustainStart, duration - release);

    // ADSR envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + attack);
    gain.gain.linearRampToValueAtTime(volume * sustain, time + attack + decay);
    gain.gain.setValueAtTime(volume * sustain, time + sustainEnd);
    gain.gain.linearRampToValueAtTime(0, time + duration + release);

    osc.start(time);
    osc.stop(time + duration + release);
  }

  // Play a chord (multiple notes at once)
  playChord(frequencies, duration, time, volume = 0.2) {
    frequencies.forEach((freq, idx) => {
      this.playNote(freq, duration, time, {
        volume: volume / frequencies.length,
        waveType: idx === 0 ? 'sine' : 'sine',
        attack: 0.01,
        decay: 0.08,
        sustain: 0.6,
        release: 0.15,
      });
    });
  }

  // Generate chord from root note
  getChord(rootFreq, type = 'major') {
    const chords = {
      major: [0, 4, 7], // root, major third, perfect fifth (semitones)
      minor: [0, 3, 7],
      major7: [0, 4, 7, 11],
      dom7: [0, 4, 7, 10],
    };
    
    const intervals = chords[type] || chords.major;
    const semitoneRatio = Math.pow(2, 1/12);
    
    return intervals.map(semitones => rootFreq * Math.pow(semitoneRatio, semitones));
  }

  playMelody(notes, startTime = this.audioContext.currentTime) {
    let time = startTime;
    
    notes.forEach(({ freq, duration, harmony, bass, chord }) => {
      // Main melody
      this.playNote(freq, duration, time, {
        volume: 0.3,
        waveType: 'sine',
        attack: 0.008,
        decay: 0.1,
        sustain: 0.65,
        release: 0.12,
      });

      // Harmony layer
      if (harmony) {
        this.playNote(harmony, duration, time, {
          volume: 0.15,
          waveType: 'sine',
          attack: 0.01,
          decay: 0.12,
          sustain: 0.6,
          release: 0.15,
        });
      }

      // Bass layer
      if (bass) {
        this.playNote(bass, duration, time, {
          volume: 0.22,
          waveType: 'sine',
          attack: 0.012,
          decay: 0.15,
          sustain: 0.55,
          release: 0.18,
        });
      }

      // Chord progression (subtly in background)
      if (chord) {
        const chordFreqs = this.getChord(chord, 'major');
        this.playChord(chordFreqs, duration, time, 0.12);
      }

      time += duration;
    });

    return time - startTime;
  }

  getMelody(type = 'main') {
    const melodies = {
      main: [
        { freq: 440, duration: 0.4, harmony: 330, bass: 220, chord: 110 },
        { freq: 494, duration: 0.4, harmony: 370, bass: 247, chord: 110 },
        { freq: 523, duration: 0.4, harmony: 392, bass: 262, chord: 131 },
        { freq: 587, duration: 0.8, harmony: 440, bass: 294, chord: 147 },
        { freq: 523, duration: 0.4, harmony: 392, bass: 262, chord: 131 },
        { freq: 494, duration: 0.4, harmony: 370, bass: 247, chord: 110 },
        { freq: 440, duration: 0.8, harmony: 330, bass: 220, chord: 110 },
        { freq: 392, duration: 0.4, harmony: 294, bass: 196 },
        { freq: 349, duration: 0.4, harmony: 262, bass: 175 },
        { freq: 330, duration: 0.4, harmony: 247, bass: 165 },
        { freq: 294, duration: 0.8, harmony: 220, bass: 147 },
      ],
      boss: [
        { freq: 523, duration: 0.2, harmony: 392, bass: 262, chord: 131 },
        { freq: 587, duration: 0.2, harmony: 440, bass: 294, chord: 147 },
        { freq: 659, duration: 0.2, harmony: 494, bass: 330, chord: 165 },
        { freq: 784, duration: 0.4, harmony: 587, bass: 392, chord: 196 },
        { freq: 659, duration: 0.2, harmony: 494, bass: 330, chord: 165 },
        { freq: 587, duration: 0.2, harmony: 440, bass: 294, chord: 147 },
        { freq: 784, duration: 0.8, harmony: 587, bass: 392, chord: 196 },
      ],
    };
    return melodies[type] || melodies.main;
  }

  start(melodyType = 'main') {
    if (!this.audioContext) this.init();
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.currentMelody = melodyType;
    
    const playLoop = () => {
      if (!this.isPlaying) return;
      const melody = this.getMelody(melodyType);
      const duration = this.playMelody(melody);
      this.scheduleTimer = setTimeout(playLoop, duration * 1000 + 200);
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

  switchMelody(melodyType) {
    if (this.isPlaying) {
      this.stop();
      this.currentMelody = melodyType;
      this.start(melodyType);
    }
  }

  setVolume(value) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, value)) * 0.08;
    }
  }
}

export const musicManager = new MusicManager();