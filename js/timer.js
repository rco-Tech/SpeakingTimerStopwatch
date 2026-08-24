/**
 * Speaking Timer & Stopwatch — Timer Engine
 * High-precision countdown timer with voice announcements, interval triggers, and presets.
 */

class SpeakingTimer {
  constructor() {
    this.totalDurationMs = 60000; // Default 1 minute
    this.remainingMs = 60000;
    this.status = 'idle'; // 'idle' | 'precount' | 'running' | 'paused' | 'completed'

    this.preCountdownSec = parseInt(localStorage.getItem('timer_precount_sec') || '0', 10); // 0, 3, 5, 10
    this.currentPreCount = 0;

    this.intervalSpeakingEnabled = localStorage.getItem('timer_interval_enabled') !== 'false';
    this.intervalSec = parseInt(localStorage.getItem('timer_interval_sec') || '10', 10); // e.g. 10 seconds
    this.lastSpokenInterval = null;

    this.finalCountdownEnabled = localStorage.getItem('timer_countdown_enabled') !== 'false'; // 5, 4, 3, 2, 1
    this.lastSpokenCountdown = null;

    this.vibrateEnabled = localStorage.getItem('timer_vibrate_enabled') !== 'false';
    this.soundEnabled = localStorage.getItem('timer_sound_enabled') !== 'false';
    // Metronome on by default; persists across sessions (localStorage)
    this.metronomeTick = localStorage.getItem('timer_metronome') !== 'false';
    this.expirySound = localStorage.getItem('timer_expiry_sound') || 'whistle'; // 'whistle' | 'bell' | 'alarm' | 'chime' | 'none'
    this.expirySpeechText = localStorage.getItem('timer_expiry_text') || 'Timer has expired!';

    this.startTime = null;
    this.expectedEndTime = null;
    this.pauseRemaining = null;
    this.animFrameId = null;

    // Presets
    this.presets = this.loadPresets();

    // Callbacks for UI updates
    this.onTick = null;
    this.onStateChange = null;
    this.onPreCountTick = null;
    this.onComplete = null;
  }

  loadPresets() {
    const saved = localStorage.getItem('speaking_timer_presets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse presets', e);
      }
    }
    return [
      { id: 'p1', name: '⚡ HIIT Work', durationSec: 30, intervalSec: 10, color: '#00e5ff' },
      { id: 'p2', name: '🧘 Rest Interval', durationSec: 15, intervalSec: 5, color: '#39ff14' },
      { id: 'p3', name: '💪 Core Plank', durationSec: 60, intervalSec: 15, color: '#ffb703' },
      { id: 'p4', name: '🥊 Boxing Round', durationSec: 180, intervalSec: 30, color: '#ff0055' },
      { id: 'p5', name: '☕ Coffee / Tea', durationSec: 240, intervalSec: 60, color: '#ff6b00' },
      { id: 'p6', name: '🍅 Pomodoro Focus', durationSec: 1500, intervalSec: 300, color: '#d946ef' },
    ];
  }

  savePresets() {
    localStorage.setItem('speaking_timer_presets', JSON.stringify(this.presets));
  }

  addPreset(name, durationSec, intervalSec = 10) {
    const newPreset = {
      id: 'p_' + Date.now(),
      name,
      durationSec,
      intervalSec,
      color: 'var(--primary)'
    };
    this.presets.push(newPreset);
    this.savePresets();
    return newPreset;
  }

  deletePreset(id) {
    this.presets = this.presets.filter(p => p.id !== id);
    this.savePresets();
  }

  setTime(hours, minutes, seconds) {
    if (this.status === 'running' || this.status === 'precount') return;
    const totalSec = (hours * 3600) + (minutes * 60) + seconds;
    this.totalDurationMs = Math.max(1000, totalSec * 1000);
    this.remainingMs = this.totalDurationMs;
    this.status = 'idle';
    this.lastSpokenInterval = null;
    this.lastSpokenCountdown = null;
    this.notifyTick();
    this.notifyState();
  }

  addTime(secondsDelta) {
    if (this.status === 'running' || this.status === 'precount') {
      // Adjust ongoing timer
      this.remainingMs = Math.max(1000, this.remainingMs + (secondsDelta * 1000));
      this.totalDurationMs = Math.max(this.totalDurationMs, this.remainingMs);
      this.expectedEndTime += (secondsDelta * 1000);
    } else {
      const currentSec = Math.floor(this.totalDurationMs / 1000);
      const newSec = Math.max(5, currentSec + secondsDelta);
      this.totalDurationMs = newSec * 1000;
      this.remainingMs = this.totalDurationMs;
    }
    this.notifyTick();
  }

  start() {
    if (this.status === 'running' || this.status === 'precount') return;

    if (this.preCountdownSec > 0 && this.status === 'idle') {
      this.startPreCountdown();
      return;
    }

    this.runTimer();
  }

  startPreCountdown() {
    this.status = 'precount';
    this.currentPreCount = this.preCountdownSec;
    this.notifyState();

    const doStep = () => {
      if (this.status !== 'precount') return;

      if (this.currentPreCount > 0) {
        if (this.onPreCountTick) this.onPreCountTick(this.currentPreCount);

        // Audio & Speech
        if (window.soundEngine) {
          window.soundEngine.playBeep(700, 0.1);
          window.soundEngine.speak(String(this.currentPreCount), true);
        }
        if (this.vibrateEnabled && navigator.vibrate) {
          navigator.vibrate(80);
        }

        this.currentPreCount--;
        setTimeout(doStep, 1000);
      } else {
        // Pre-countdown finished -> GO!
        if (this.onPreCountTick) this.onPreCountTick('GO!');
        if (window.soundEngine) {
          window.soundEngine.playWhistle();
          window.soundEngine.speak('Go!', true);
        }
        if (this.vibrateEnabled && navigator.vibrate) {
          navigator.vibrate([150, 50, 150]);
        }
        setTimeout(() => {
          if (this.status === 'precount') {
            this.runTimer();
          }
        }, 500);
      }
    };

    doStep();
  }

  runTimer() {
    this.status = 'running';
    const now = performance.now();
    this.startTime = now;
    this.expectedEndTime = now + this.remainingMs;
    this.lastSpokenInterval = null;
    this.lastSpokenCountdown = null;

    if (window.soundEngine && window.soundEngine.speakEvents && this.preCountdownSec === 0) {
      window.soundEngine.playDoubleBeep(true);
    }

    this.notifyState();
    this.loop();
  }

  pause() {
    if (this.status !== 'running' && this.status !== 'precount') return;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.status === 'precount') {
      this.status = 'idle';
      this.notifyState();
      return;
    }

    this.status = 'paused';
    const now = performance.now();
    this.remainingMs = Math.max(0, this.expectedEndTime - now);

    if (window.soundEngine && window.soundEngine.speakEvents) {
      window.soundEngine.playDoubleBeep(false);
      window.soundEngine.speak('Timer paused');
    }

    this.notifyTick();
    this.notifyState();
  }

  resume() {
    if (this.status !== 'paused') return;
    this.runTimer();
  }

  reset() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.status = 'idle';
    this.remainingMs = this.totalDurationMs;
    this.lastSpokenInterval = null;
    this.lastSpokenCountdown = null;

    if (window.soundEngine && window.soundEngine.speakEvents) {
      window.soundEngine.playBeep(440, 0.08);
    }

    this.notifyTick();
    this.notifyState();
  }

  loop() {
    if (this.status !== 'running') return;

    const now = performance.now();
    this.remainingMs = Math.max(0, this.expectedEndTime - now);
    const remainingSeconds = Math.ceil(this.remainingMs / 1000);

    // 1. Final 5 seconds countdown trigger (5, 4, 3, 2, 1)
    if (this.finalCountdownEnabled && remainingSeconds <= 5 && remainingSeconds >= 1) {
      if (this.lastSpokenCountdown !== remainingSeconds) {
        this.lastSpokenCountdown = remainingSeconds;
        if (window.soundEngine) {
          window.soundEngine.playBeep(880, 0.08);
          window.soundEngine.speak(String(remainingSeconds), true);
        }
        if (this.vibrateEnabled && navigator.vibrate) {
          navigator.vibrate(100);
        }
      }
    }

    // 2. Interval announcements (e.g. every 10s, 30s, 1m)
    if (
      this.intervalSpeakingEnabled &&
      remainingSeconds > 5 &&
      this.intervalSec > 0 &&
      remainingSeconds % this.intervalSec === 0 &&
      this.lastSpokenInterval !== remainingSeconds
    ) {
      this.lastSpokenInterval = remainingSeconds;
      if (window.soundEngine) {
        if (this.soundEnabled) window.soundEngine.playBeep(600, 0.1);
        const speech = window.soundEngine.formatSecondsForSpeech(remainingSeconds, true);
        window.soundEngine.speak(speech);
      }
      if (this.vibrateEnabled && navigator.vibrate) {
        navigator.vibrate(120);
      }
    }

    // 3. Optional Metronome Click
    // Ticks every whole second for the whole run, so a metronome feel is maintained to the very end.
    if (this.metronomeTick && remainingSeconds >= 1) {
      const wholeSec = Math.floor(remainingSeconds);
      if (this.lastTickSec !== wholeSec) {
        this.lastTickSec = wholeSec;
        if (window.soundEngine) window.soundEngine.playClick();
      }
    }

    // 4. Expiration check
    if (this.remainingMs <= 0) {
      this.complete();
      return;
    }

    this.notifyTick();
    this.animFrameId = requestAnimationFrame(() => this.loop());
  }

  complete() {
    this.status = 'completed';
    this.remainingMs = 0;
    this.notifyTick();
    this.notifyState();

    // Play Expiry Sound
    if (window.soundEngine) {
      if (this.expirySound === 'whistle') {
        window.soundEngine.playWhistle();
      } else if (this.expirySound === 'bell') {
        window.soundEngine.playBell();
      } else if (this.expirySound === 'alarm') {
        window.soundEngine.playAlarmPattern();
      } else if (this.expirySound === 'chime') {
        window.soundEngine.playChime();
      }

      // Voice Announcement
      if (this.expirySpeechText) {
        setTimeout(() => {
          window.soundEngine.speak(this.expirySpeechText, true);
        }, 400);
      }
    }

    // Vibration
    if (this.vibrateEnabled && navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 500]);
    }

    if (this.onComplete) {
      this.onComplete();
    }
  }

  getProgress() {
    if (this.totalDurationMs <= 0) return 0;
    return Math.min(1, Math.max(0, 1 - (this.remainingMs / this.totalDurationMs)));
  }

  getTimeComponents() {
    const totalSec = Math.ceil(this.remainingMs / 1000);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return { hours, minutes, seconds, totalSec };
  }

  notifyTick() {
    if (this.onTick) this.onTick(this.getTimeComponents(), this.getProgress());
  }

  notifyState() {
    if (this.onStateChange) this.onStateChange(this.status);
  }
}

window.speakingTimer = new SpeakingTimer();
