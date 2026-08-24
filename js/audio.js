/**
 * Speaking Timer & Stopwatch — Audio & Speech Synthesis Engine
 * Provides synthesized sound effects via Web Audio API (no external MP3 assets required)
 * and rich multi-language voice announcements via Web Speech API.
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.volume = 0.85;
    this.speechSynthesis = window.speechSynthesis;
    this.voices = [];
    this.selectedVoice = null;
    this._userPickedVoice = null; // Voice name explicitly chosen by the user
    this.speechRate = 1.0;
    this.speechPitch = 1.0;
    this.speechVolume = 1.0;
    this.speakEvents = true;

    // Restore preferences persisted between sessions:
    // voice/language (fixes voice resetting on Android), rate, pitch, events & mute.
    try {
      const vName = localStorage.getItem('sound_voice_name');
      const vLang = localStorage.getItem('sound_voice_lang');
      const rate   = localStorage.getItem('sound_rate');
      const pitch  = localStorage.getItem('sound_pitch');
      const events = localStorage.getItem('sound_speak_events');
      const mute   = localStorage.getItem('sound_muted');
      if (vName) this._userPickedVoice = vName;
      if (vLang) this._userPickedLang = vLang;
      if (rate)  this.speechRate = parseFloat(rate) || 1.0;
      if (pitch) this.speechPitch = parseFloat(pitch) || 1.0;
      if (events !== null) this.speakEvents = events === 'true';
      if (mute !== null) this.isMuted = mute === 'true';
    } catch (e) {
      console.warn('Failed to load speech settings', e);
    }

    this.initAudioContext = this.initAudioContext.bind(this);

    // Try immediately — works on Firefox & Safari
    this.loadVoices();

    if (this.speechSynthesis) {
      // onvoiceschanged works on Chrome desktop & iOS Chrome
      this.speechSynthesis.onvoiceschanged = () => this.loadVoices();

      // Android Chrome fallback: poll until voices appear (onvoiceschanged can silently never fire)
      if (this.voices.length === 0) {
        let attempts = 0;
        const poll = setInterval(() => {
          this.loadVoices();
          attempts++;
          if (this.voices.length > 0 || attempts > 40) clearInterval(poll);
        }, 250);
      }
    }

    // Unlock audio on first user gesture
    window.addEventListener('click', this.initAudioContext, { once: true });
    window.addEventListener('touchstart', this.initAudioContext, { once: true });
  }

  initAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  loadVoices() {
    if (!this.speechSynthesis) return;
    const fresh = this.speechSynthesis.getVoices();
    if (fresh.length === 0) return; // Not ready yet — polling fallback will retry
    this.voices = fresh;

    // Default to an English voice (only if no voice was explicitly chosen by the user)
    if (!this._userPickedVoice) {
      const preferred =
        this.voices.find(v => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en'))
        || this.voices.find(v => v.lang.startsWith('en'))
        || this.voices[0];
      this.selectedVoice = preferred;
    } else {
      // Re-resolve by name — voice objects are recreated on each getVoices() call on Android
      const match = this.voices.find(v => v.name === this._userPickedVoice);
      if (match) {
        this.selectedVoice = match;
        this._userPickedLang = match.lang; // Keep lang in sync
      } else if (this._userPickedLang) {
        // Name didn't match (e.g. device change), match by normalized language
        const normTarget = this._normLang(this._userPickedLang);
        const langMatch = this.voices.find(v => this._normLang(v.lang) === normTarget);
        this.selectedVoice = langMatch || this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
      } else {
        this.selectedVoice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
      }
    }

    // Notify the UI to refresh the dropdown (hook set by app.js after DOM ready)
    if (typeof this.onVoicesLoaded === 'function') this.onVoicesLoaded(this.voices);
  }

  setMute(mute) {
    this.isMuted = mute;
    if (mute && this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

  // --- Web Audio Synthesizer Effects ---

  /**
   * Referee Whistle with realistic dual-frequency modulation
   */
  playWhistle() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Dual frequencies for whistle resonance
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(2600, now);
    osc1.frequency.exponentialRampToValueAtTime(2950, now + 0.15);
    osc1.frequency.exponentialRampToValueAtTime(2600, now + 0.35);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2850, now);
    osc2.frequency.exponentialRampToValueAtTime(3200, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(2850, now + 0.35);

    // Whistle tremolo
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(30, now); // 30Hz flutter
    lfoGain.gain.setValueAtTime(150, now);
    lfo.connect(osc1.frequency);
    lfo.connect(osc2.frequency);

    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.4 * this.volume, now + 0.05);
    gainNode.gain.setValueAtTime(0.4 * this.volume, now + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    lfo.start(now);
    osc1.start(now);
    osc2.start(now);

    lfo.stop(now + 0.45);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  }

  /**
   * Boxing Ring Bell / Gong
   */
  playBell() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const frequencies = [800, 1100, 1600, 2400];
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3 / (i + 1) * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.8);
    });
  }

  /**
   * Digital Beep (for button taps, intervals, or countdowns)
   */
  playBeep(freq = 880, duration = 0.1, type = 'sine') {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * Double beep for start / pause
   */
  playDoubleBeep(high = true) {
    const f1 = high ? 880 : 660;
    const f2 = high ? 1320 : 440;
    this.playBeep(f1, 0.08);
    setTimeout(() => this.playBeep(f2, 0.12), 100);
  }

  /**
   * Radar Ping
   */
  playRadar() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.6);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  /**
   * Gentle Marimba Chime
   */
  playChime() {
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playBeep(freq, 0.25, 'sine');
      }, index * 90);
    });
  }

  /**
   * Metronome Click
   */
  playClick() {
    if (this.isMuted) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // A clearer click: higher back-edge (transient) shortens the attack,
    // plus a lower body so it's audible on typical phone speakers.
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1600, now);

    gain.gain.setValueAtTime(0.22 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  /**
   * Multi-beep Alarm on Expiration
   */
  playAlarmPattern() {
    if (this.isMuted) return;
    let count = 0;
    const interval = setInterval(() => {
      this.playBeep(960, 0.12, 'sawtooth');
      count++;
      if (count >= 6) {
        clearInterval(interval);
      }
    }, 180);
  }

  /**
   * Normalize a lang tag to BCP 47 hyphen format.
   * Android voices often report "en_AU" but utterance.lang must be "en-AU".
   */
  _normLang(lang) {
    if (!lang) return lang;
    return lang.replace(/_/g, '-');
  }

  /**
   * Speaks the provided text via Web Speech API.
   * Hardened for Android Chrome / Samsung quirks:
   *  - Always cancel + delay to un-stall Android TTS queue
   *  - Re-fetch voices live at speak-time (Android recreates objects each call)
   *  - Normalise lang codes underscore→hyphen (BCP 47 required)
   *  - Falls back to lang-only matching if voice object is rejected
   */
  speak(text, priority = false) {
    if (this.isMuted || !this.speechSynthesis || !text) return;

    // Android Chrome: synthesis queue stalls silently (especially after screen off).
    // Always cancel before queuing — safe on all browsers.
    this.speechSynthesis.cancel();

    // 150ms delay after cancel is required on Samsung Android to prevent dropped utterance.
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);

      // Re-fetch voices fresh at speak-time: Android recreates voice objects on each call.
      const liveVoices = this.speechSynthesis.getVoices();

      // Determine the target name and lang from user choice or current default
      const targetName = this._userPickedVoice || (this.selectedVoice && this.selectedVoice.name);
      const targetLang = this._userPickedLang || (this.selectedVoice && this.selectedVoice.lang);

      if (targetName && liveVoices.length > 0) {
        // Primary: match by exact name (works on desktop & iOS)
        const byName = liveVoices.find(v => v.name === targetName);
        if (byName) {
          utterance.voice = byName;
          utterance.lang = this._normLang(byName.lang);
        } else if (targetLang) {
          // Fallback: Android often ignores voice object — match by normalised lang instead
          const normTarget = this._normLang(targetLang);
          const byLang = liveVoices.find(v => this._normLang(v.lang) === normTarget);
          if (byLang) {
            utterance.voice = byLang;
          }
          // Always set lang so Android TTS engine routes to the right language
          utterance.lang = normTarget;
        }
      } else if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
        utterance.lang = this._normLang(this.selectedVoice.lang);
      }

      utterance.rate = this.speechRate;
      utterance.pitch = this.speechPitch;
      utterance.volume = this.speechVolume;

      try {
        this.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
      }
    }, 50);
  }

  /**
   * Formats seconds into natural speaking text (e.g. 90 -> "1 minute 30 seconds")
   */
  formatSecondsForSpeech(totalSeconds, isRemaining = true) {
    const s = Math.round(totalSeconds);
    if (s <= 0) return 'Time is up!';

    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;

    const parts = [];
    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
    }
    if (seconds > 0 || parts.length === 0) {
      parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);
    }

    const phrase = parts.join(' ');
    return isRemaining ? `${phrase} remaining` : `${phrase} elapsed`;
  }
}

// Global instance
window.soundEngine = new SoundEngine();
