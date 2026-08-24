/**
 * Speaking Timer & Stopwatch — Stopwatch Engine
 * High-precision millisecond stopwatch with lap tracking, analytics, and voice announcements.
 */

class SpeakingStopwatch {
  constructor() {
    this.status = 'idle'; // 'idle' | 'running' | 'paused'
    this.elapsedMs = 0;
    this.startTime = 0;
    this.pausedElapsed = 0;
    this.animFrameId = null;

    // Laps array: [{ id, lapNumber, splitMs, totalMs, isFastest, isSlowest }]
    this.laps = [];
    this.lastLapTotalMs = 0;

    // Interval voice settings
    this.intervalSpeakingEnabled = localStorage.getItem('sw_interval_enabled') !== 'false';
    this.intervalSec = parseInt(localStorage.getItem('sw_interval_sec') || '5', 10);
    this.lastSpokenInterval = null;

    this.speakLapTime = localStorage.getItem('sw_speak_lap') !== 'false';
    this.speakLapTotal = localStorage.getItem('sw_speak_total') === 'true';
    this.vibrateEnabled = localStorage.getItem('sw_vibrate_enabled') !== 'false';
    this.soundEnabled = localStorage.getItem('sw_sound_enabled') !== 'false';

    // Callbacks
    this.onTick = null;
    this.onStateChange = null;
    this.onLapAdded = null;
  }

  start() {
    if (this.status === 'running') return;

    this.status = 'running';
    const now = performance.now();
    this.startTime = now - this.pausedElapsed;

    if (window.soundEngine && window.soundEngine.speakEvents) {
      window.soundEngine.playDoubleBeep(true);
      if (this.pausedElapsed === 0) {
        window.soundEngine.speak('Stopwatch started');
      } else {
        window.soundEngine.speak('Resumed');
      }
    }

    this.notifyState();
    this.loop();
  }

  pause() {
    if (this.status !== 'running') return;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.status = 'paused';
    this.pausedElapsed = performance.now() - this.startTime;
    this.elapsedMs = this.pausedElapsed;

    if (window.soundEngine && window.soundEngine.speakEvents) {
      window.soundEngine.playDoubleBeep(false);
      window.soundEngine.speak('Paused');
    }

    this.notifyTick();
    this.notifyState();
  }

  reset() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.status = 'idle';
    this.elapsedMs = 0;
    this.startTime = 0;
    this.pausedElapsed = 0;
    this.laps = [];
    this.lastLapTotalMs = 0;
    this.lastSpokenInterval = null;

    if (window.soundEngine && window.soundEngine.speakEvents) {
      window.soundEngine.playBeep(440, 0.08);
    }

    this.notifyTick();
    this.notifyState();
    if (this.onLapAdded) this.onLapAdded(this.laps);
  }

  lap() {
    if (this.status !== 'running') return;

    const currentTotalMs = this.elapsedMs;
    const splitMs = currentTotalMs - this.lastLapTotalMs;
    this.lastLapTotalMs = currentTotalMs;

    const lapNumber = this.laps.length + 1;
    const lapItem = {
      id: 'lap_' + lapNumber,
      lapNumber,
      splitMs,
      totalMs: currentTotalMs,
      isFastest: false,
      isSlowest: false,
    };

    this.laps.unshift(lapItem); // Newest on top
    this.calculateLapHighlights();

    // Haptics & Audio
    if (this.vibrateEnabled && navigator.vibrate) {
      navigator.vibrate(80);
    }
    if (window.soundEngine) {
      if (this.soundEnabled) window.soundEngine.playBeep(1200, 0.08);

      let speechParts = [];
      if (this.speakLapTime) {
        const splitSec = (splitMs / 1000).toFixed(1);
        speechParts.push(`Lap ${lapNumber}, ${splitSec} seconds`);
      }
      if (this.speakLapTotal) {
        const totalSec = Math.round(currentTotalMs / 1000);
        speechParts.push(`Total time ${window.soundEngine.formatSecondsForSpeech(totalSec, false)}`);
      }
      if (speechParts.length > 0) {
        window.soundEngine.speak(speechParts.join('. '));
      }
    }

    if (this.onLapAdded) this.onLapAdded(this.laps);
  }

  calculateLapHighlights() {
    if (this.laps.length < 2) {
      this.laps.forEach(l => { l.isFastest = false; l.isSlowest = false; });
      return;
    }

    let minSplit = Infinity;
    let maxSplit = -Infinity;

    this.laps.forEach(l => {
      if (l.splitMs < minSplit) minSplit = l.splitMs;
      if (l.splitMs > maxSplit) maxSplit = l.splitMs;
    });

    this.laps.forEach(l => {
      l.isFastest = (l.splitMs === minSplit);
      l.isSlowest = (l.splitMs === maxSplit && minSplit !== maxSplit);
    });
  }

  loop() {
    if (this.status !== 'running') return;

    const now = performance.now();
    this.elapsedMs = now - this.startTime;

    const wholeSeconds = Math.floor(this.elapsedMs / 1000);

    // Interval Voice Trigger (e.g. every 5s, 10s, 30s)
    if (
      this.intervalSpeakingEnabled &&
      this.intervalSec > 0 &&
      wholeSeconds > 0 &&
      wholeSeconds % this.intervalSec === 0 &&
      this.lastSpokenInterval !== wholeSeconds
    ) {
      this.lastSpokenInterval = wholeSeconds;
      if (window.soundEngine) {
        if (this.soundEnabled) window.soundEngine.playBeep(750, 0.08);
        const speech = window.soundEngine.formatSecondsForSpeech(wholeSeconds, false);
        window.soundEngine.speak(speech);
      }
      if (this.vibrateEnabled && navigator.vibrate) {
        navigator.vibrate(100);
      }
    }

    this.notifyTick();
    this.animFrameId = requestAnimationFrame(() => this.loop());
  }

  getTimeComponents() {
    const totalMs = Math.floor(this.elapsedMs);
    const ms = Math.floor((totalMs % 1000) / 10); // 2-digit centiseconds (00-99)
    const totalSec = Math.floor(totalMs / 1000);
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return { hours, minutes, seconds, ms, totalMs };
  }

  formatMs(msValue) {
    const totalSec = Math.floor(msValue / 1000);
    const cs = Math.floor((msValue % 1000) / 10);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const h = Math.floor(totalSec / 3600);

    const pad = (n) => String(n).padStart(2, '0');
    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
    }
    return `${pad(m)}:${pad(s)}.${pad(cs)}`;
  }

  getShareSummary() {
    if (this.laps.length === 0) {
      return `⏱️ Stopwatch: ${this.formatMs(this.elapsedMs)}`;
    }
    let text = `⏱️ Stopwatch Workout Summary\nTotal Time: ${this.formatMs(this.elapsedMs)}\nTotal Laps: ${this.laps.length}\n\n`;
    // Laps in chronological order
    const ordered = [...this.laps].reverse();
    ordered.forEach(l => {
      const tag = l.isFastest ? ' 🏆 (Fastest)' : l.isSlowest ? ' 🐢 (Slowest)' : '';
      text += `Lap ${l.lapNumber}: ${this.formatMs(l.splitMs)} (Total: ${this.formatMs(l.totalMs)})${tag}\n`;
    });
    return text;
  }

  notifyTick() {
    if (this.onTick) this.onTick(this.getTimeComponents());
  }

  notifyState() {
    if (this.onStateChange) this.onStateChange(this.status);
  }
}

window.speakingStopwatch = new SpeakingStopwatch();
