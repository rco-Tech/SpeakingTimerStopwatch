/**
 * Speaking Timer & Stopwatch — Main Application Controller
 * Handles UI interactions, Screen Wake Lock API, Theme/Font switching,
 * Modal dialogues, QR generation, and PWA registration.
 */

document.addEventListener('DOMContentLoaded', () => {
  const timer = window.speakingTimer;
  const stopwatch = window.speakingStopwatch;
  const sound = window.soundEngine;

  // Translation helper (i18n.js) — safe no-op fallback if not loaded
  const t = (key, params) => (window.AppI18N ? AppI18N.t(key, params) : key);

  // App State
  const state = {
    activeTab: 'timer', // 'timer' | 'stopwatch'
    theme: localStorage.getItem('app_theme') || 'cyan',
    font: localStorage.getItem('app_font') || 'stencil',
    keepScreenOn: JSON.parse(localStorage.getItem('app_wakelock') ?? 'true'),
    wakeLockSentinel: null,
  };

  // Direct Crisp SVG Templates for instant, bug-free icon updates
  const SVG_ICONS = {
    play: `<svg class="w-8 h-8 fill-current translate-x-0.5" viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>`,
    pause: `<svg class="w-8 h-8 fill-current" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1.5"></rect><rect x="14" y="4" width="4" height="16" rx="1.5"></rect></svg>`,
    stop: `<svg class="w-8 h-8 fill-current" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2"></rect></svg>`,
    restart: `<svg class="w-8 h-8 fill-none stroke-current stroke-[2.5]" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>`
  };

  // --- Theme & Font Setup ---
  function applyTheme(themeName) {
    state.theme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('app_theme', themeName);

    // Update meta theme-color for mobile status bar
    const metaThemeColor = document.getElementById('meta-theme-color');
    const colorMap = {
      cyan: '#00e5ff',
      amber: '#ffb703',
      lime: '#39ff14',
      purple: '#d946ef',
      crimson: '#ff0055',
      orange: '#ff6b00',
      pink: '#ff2a8d',
      white: '#f8fafc'
    };
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', colorMap[themeName] || '#08090d');
    }

    // Update checkmark in theme modal
    document.querySelectorAll('.theme-option').forEach(opt => {
      const isSelected = opt.dataset.theme === themeName;
      opt.classList.toggle('ring-2', isSelected);
      opt.classList.toggle('ring-white', isSelected);
      const check = opt.querySelector('.theme-check');
      if (check) check.classList.toggle('hidden', !isSelected);
    });
  }

  function applyFont(fontName) {
    state.font = fontName;
    const fontClass = `font-${fontName}`;
    localStorage.setItem('app_font', fontName);

    const digitDisplays = document.querySelectorAll('.digit-display, .font-target');
    const fontClasses = ['font-orbitron', 'font-segment', 'font-pixel', 'font-stencil', 'font-sport', 'font-marker', 'font-bebas', 'font-modern'];

    digitDisplays.forEach(el => {
      fontClasses.forEach(cls => el.classList.remove(cls));
      el.classList.add(fontClass);
    });

    // Update checkmark in font modal
    document.querySelectorAll('.font-option').forEach(opt => {
      const isSelected = opt.dataset.font === fontName;
      opt.classList.toggle('border-theme', isSelected);
      opt.classList.toggle('bg-white/10', isSelected);
      const check = opt.querySelector('.font-check');
      if (check) check.classList.toggle('hidden', !isSelected);
    });
  }

  applyTheme(state.theme);
  applyFont(state.font);

  // --- Screen Wake Lock API ---
  async function requestWakeLock() {
    if (!state.keepScreenOn || !('wakeLock' in navigator)) return;
    try {
      if (!state.wakeLockSentinel) {
        state.wakeLockSentinel = await navigator.wakeLock.request('screen');
        state.wakeLockSentinel.addEventListener('release', () => {
          state.wakeLockSentinel = null;
        });
      }
    } catch (err) {
      console.warn('Wake Lock request error:', err);
    }
  }

  function releaseWakeLock() {
    if (state.wakeLockSentinel) {
      state.wakeLockSentinel.release().catch(() => {});
      state.wakeLockSentinel = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (timer.status === 'running' || stopwatch.status === 'running') {
        requestWakeLock();
      }
    }
  });

  // --- Tab Navigation (Timer vs Stopwatch) ---
  const tabTimerBtn = document.getElementById('tab-timer-btn');
  const tabStopwatchBtn = document.getElementById('tab-stopwatch-btn');
  const tabIndicator = document.getElementById('tab-indicator');
  const timerSection = document.getElementById('timer-section');
  const stopwatchSection = document.getElementById('stopwatch-section');

  function switchTab(tab) {
    state.activeTab = tab;
    if (tab === 'timer') {
      timerSection.classList.remove('hidden');
      stopwatchSection.classList.add('hidden');
      tabIndicator.style.transform = 'translateX(0%)';
      tabTimerBtn.classList.add('text-theme', 'font-bold');
      tabTimerBtn.classList.remove('text-gray-400');
      tabStopwatchBtn.classList.remove('text-theme', 'font-bold');
      tabStopwatchBtn.classList.add('text-gray-400');
    } else {
      timerSection.classList.add('hidden');
      stopwatchSection.classList.remove('hidden');
      tabIndicator.style.transform = 'translateX(100%)';
      tabStopwatchBtn.classList.add('text-theme', 'font-bold');
      tabStopwatchBtn.classList.remove('text-gray-400');
      tabTimerBtn.classList.remove('text-theme', 'font-bold');
      tabTimerBtn.classList.add('text-gray-400');
    }
  }

  tabTimerBtn.addEventListener('click', () => switchTab('timer'));
  tabStopwatchBtn.addEventListener('click', () => switchTab('stopwatch'));

  // --- Timer UI Bindings ---
  const timerHoursEl = document.getElementById('timer-hours');
  const timerMinutesEl = document.getElementById('timer-minutes');
  const timerSecondsEl = document.getElementById('timer-seconds');
  const timerProgressBar = document.getElementById('timer-progress-bar');
  const timerPlayBtn = document.getElementById('timer-play-btn');
  const timerPlayIcon = document.getElementById('timer-play-icon');
  const timerResetBtn = document.getElementById('timer-reset-btn');
  const presetsContainer = document.getElementById('presets-container');

  // Quick settings toggles for timer
  const timerIntervalToggle = document.getElementById('timer-interval-toggle');
  const timerIntervalSelect = document.getElementById('timer-interval-select');
  const timerSpeakingToggle = document.getElementById('timer-speaking-toggle');
  const timerCountdownToggle = document.getElementById('timer-countdown-toggle');
  const timerSoundToggle = document.getElementById('timer-sound-toggle');
  const timerVibrateToggle = document.getElementById('timer-vibrate-toggle');
  const timerPrecountSelect = document.getElementById('timer-precount-select');

  function updateTimerDisplay(components, progress = 0) {
    const pad = (n) => String(n).padStart(2, '0');
    timerHoursEl.textContent = pad(components.hours);
    timerMinutesEl.textContent = pad(components.minutes);
    timerSecondsEl.textContent = pad(components.seconds);

    if (timerProgressBar) {
      timerProgressBar.style.width = `${Math.min(100, Math.max(0, (1 - progress) * 100))}%`;
    }
  }

  // Timer Status Badge Elements
  const timerStatusBadge = document.getElementById('timer-status-badge');
  const timerStatusDot = document.getElementById('timer-status-dot');
  const timerStatusText = document.getElementById('timer-status-text');

  function updateTimerStateUI(status) {
    // Reset any state classes
    timerPlayBtn.classList.remove('btn-running', 'btn-paused', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-500', 'bg-theme', 'text-black', 'text-white');

    if (status === 'running') {
      timerPlayBtn.classList.add('btn-running', 'bg-emerald-400', 'text-black');
      timerPlayBtn.innerHTML = SVG_ICONS.pause;

      if (timerStatusBadge) {
        timerStatusBadge.className = 'mb-2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]';
        timerStatusDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot';
        timerStatusText.textContent = t('st.running');
      }
      requestWakeLock();
    } else if (status === 'paused') {
      timerPlayBtn.classList.add('btn-paused', 'bg-amber-400', 'text-black');
      timerPlayBtn.innerHTML = SVG_ICONS.pause; // Show pause symbol when paused

      if (timerStatusBadge) {
        timerStatusBadge.className = 'mb-2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]';
        timerStatusDot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse-dot';
        timerStatusText.textContent = t('st.paused');
      }
      releaseWakeLock();
    } else if (status === 'completed') {
      timerPlayBtn.classList.add('bg-rose-500', 'text-white');
      timerPlayBtn.innerHTML = SVG_ICONS.stop; // Stop symbol when timer completed

      if (timerStatusBadge) {
        timerStatusBadge.className = 'mb-2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]';
        timerStatusDot.className = 'w-2 h-2 rounded-full bg-rose-400';
        timerStatusText.textContent = t('st.timesup');
      }
      releaseWakeLock();
    } else if (status === 'precount') {
      timerPlayBtn.classList.add('btn-running', 'bg-amber-400', 'text-black');
      timerPlayBtn.innerHTML = SVG_ICONS.pause;

      if (timerStatusBadge) {
        timerStatusBadge.className = 'mb-2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-400';
        timerStatusDot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse-dot';
        timerStatusText.textContent = t('st.getready');
      }
    } else {
      // Idle / Stopped / Reset
      timerPlayBtn.classList.add('bg-theme', 'text-black');
      timerPlayBtn.innerHTML = SVG_ICONS.play;

      if (timerStatusBadge) {
        timerStatusBadge.className = 'mb-2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-400';
        timerStatusDot.className = 'w-1.5 h-1.5 rounded-full bg-gray-400';
        timerStatusText.textContent = t('st.ready');
      }
      releaseWakeLock();
    }
  }

  timer.onTick = (components, progress) => updateTimerDisplay(components, progress);
  timer.onStateChange = (status) => updateTimerStateUI(status);

  // Pre-start countdown overlay
  const precountOverlay = document.getElementById('precount-overlay');
  const precountNumber = document.getElementById('precount-number');

  const handlePreCountTick = (value) => {
    precountOverlay.classList.remove('hidden');
    precountNumber.textContent = value;
    precountNumber.classList.remove('animate-count-pop');
    void precountNumber.offsetWidth; // Force reflow
    precountNumber.classList.add('animate-count-pop');

    if (value === 'GO!') {
      setTimeout(() => {
        precountOverlay.classList.add('hidden');
      }, 700);
    }
  };

  timer.onPreCountTick = handlePreCountTick;
  stopwatch.onPreCountTick = handlePreCountTick;

  // Initial timer display
  updateTimerDisplay(timer.getTimeComponents(), 0);

  // Play / Pause click
  timerPlayBtn.addEventListener('click', () => {
    sound.initAudioContext();
    if (timer.status === 'running') {
      timer.pause();
    } else if (timer.status === 'paused') {
      timer.resume();
    } else if (timer.status === 'completed') {
      timer.reset();
      timer.start();
    } else {
      timer.start();
    }
  });

  timerResetBtn.addEventListener('click', () => {
    timer.reset();
  });

  // Quick Add Time Buttons
  const localizeQuickAddButtons = () => {
    document.querySelectorAll('[data-add-time]').forEach(btn => {
      const delta = parseInt(btn.dataset.addTime, 10);
      // Localized label: "+10s" / "+1m" (+10秒, +10 с, ...)
      const isSeconds = delta < 60;
      btn.textContent = isSeconds ? `+${delta}${t('digits.s')}` : `+${delta / 60}${t('digits.m')}`;
    });
  };
  localizeQuickAddButtons();

  document.querySelectorAll('[data-add-time]').forEach(btn => {
    btn.addEventListener('click', () => {
      const delta = parseInt(btn.dataset.addTime, 10);
      timer.addTime(delta);
      if (sound.soundEnabled) sound.playBeep(900, 0.05);
      if (navigator.vibrate) navigator.vibrate(30);
    });
  });

  document.getElementById('timer-clear-btn')?.addEventListener('click', () => {
    timer.setTime(0, 0, 0);
  });

  // Timer Quick Options sync
  if (timerIntervalToggle) {
    timerIntervalToggle.checked = timer.intervalSpeakingEnabled;
    timerIntervalToggle.addEventListener('change', (e) => {
      timer.intervalSpeakingEnabled = e.target.checked;
      localStorage.setItem('timer_interval_enabled', String(e.target.checked));
    });
  }

  if (timerIntervalSelect) {
    timerIntervalSelect.value = String(timer.intervalSec);
    timerIntervalSelect.addEventListener('change', (e) => {
      timer.intervalSec = parseInt(e.target.value, 10);
      localStorage.setItem('timer_interval_sec', String(timer.intervalSec));
    });
  }

  if (timerSpeakingToggle) {
    timerSpeakingToggle.checked = !sound.isMuted;
    timerSpeakingToggle.addEventListener('change', (e) => {
      sound.setMute(!e.target.checked);
      localStorage.setItem('sound_muted', String(sound.isMuted));
      updateMuteButtonUI();
      if (swSpeakingToggle) swSpeakingToggle.checked = e.target.checked;
    });
  }

  if (timerCountdownToggle) {
    timerCountdownToggle.checked = timer.finalCountdownEnabled;
    timerCountdownToggle.addEventListener('change', (e) => {
      timer.finalCountdownEnabled = e.target.checked;
      localStorage.setItem('timer_countdown_enabled', String(e.target.checked));
    });
  }

  if (timerSoundToggle) {
    timerSoundToggle.checked = timer.soundEnabled;
    timerSoundToggle.addEventListener('change', (e) => {
      timer.soundEnabled = e.target.checked;
      localStorage.setItem('timer_sound_enabled', String(e.target.checked));
    });
  }

  if (timerVibrateToggle) {
    timerVibrateToggle.checked = timer.vibrateEnabled;
    timerVibrateToggle.addEventListener('change', (e) => {
      timer.vibrateEnabled = e.target.checked;
      localStorage.setItem('timer_vibrate_enabled', String(e.target.checked));
    });
  }

  if (timerPrecountSelect) {
    timerPrecountSelect.value = String(timer.preCountdownSec);
    timerPrecountSelect.addEventListener('change', (e) => {
      timer.preCountdownSec = parseInt(e.target.value, 10);
      localStorage.setItem('timer_precount_sec', String(timer.preCountdownSec));
    });
  }

  function getPresetDisplayName(p) {
    if (!p) return '';
    // If it has a known built-in id (p1 - p6), translate it
    if (p.id && (p.id === 'p1' || p.id === 'p2' || p.id === 'p3' || p.id === 'p4' || p.id === 'p5' || p.id === 'p6')) {
      const tr = t(p.id);
      if (tr && tr !== p.id) return tr;
    }
    // Match by standard duration in case older localStorage saved custom objects without id or with legacy text:
    if (p.durationSec === 30 && (p.intervalSec === 10 || !p.intervalSec)) return t('p1');
    if (p.durationSec === 15 && (p.intervalSec === 5 || !p.intervalSec)) return t('p2');
    if (p.durationSec === 60 && (p.intervalSec === 15 || !p.intervalSec)) return t('p3');
    if (p.durationSec === 180 && (p.intervalSec === 30 || !p.intervalSec)) return t('p4');
    if (p.durationSec === 240 && (p.intervalSec === 60 || !p.intervalSec)) return t('p5');
    if (p.durationSec === 1500 && (p.intervalSec === 300 || !p.intervalSec)) return t('p6');

    return p.name || '';
  }

  // Presets Rendering (2 buttons per row, full text visibility)
  function renderPresets() {
    if (!presetsContainer) return;
    presetsContainer.innerHTML = '';

    timer.presets.forEach(p => {
      const chip = document.createElement('button');
      chip.className = 'group relative flex items-center justify-between p-3 sm:py-3.5 sm:px-3.5 rounded-2xl glass-panel hover:border-theme transition active:scale-95 text-left border border-white/10 shadow-md';
      const colorVal = p.color || 'var(--primary)';
      const displayName = getPresetDisplayName(p);
      chip.innerHTML = `
        <div class="flex items-center gap-2.5 min-w-0 flex-1 mr-1.5">
          <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background: ${colorVal}; box-shadow: 0 0 8px ${colorVal}"></span>
          <span class="font-semibold text-gray-100 text-xs sm:text-sm leading-tight">${displayName}</span>
        </div>
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <span class="text-xs font-mono font-bold text-gray-200 bg-black/50 border border-white/10 px-2 py-1 rounded-lg">${formatSecShort(p.durationSec)}</span>
          <span class="delete-preset-btn text-gray-500 hover:text-rose-400 hover:bg-white/10 px-2 py-1 rounded-lg text-sm font-bold leading-none transition" data-preset-id="${p.id}" title="Delete preset">&times;</span>
        </div>
      `;

      chip.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-preset-btn')) {
          e.stopPropagation();
          const confirmed = confirm(t('confirm.deletePreset', { name: displayName }));
          if (confirmed) {
            timer.deletePreset(p.id);
            renderPresets();
          }
          return;
        }
        const hours = Math.floor(p.durationSec / 3600);
        const minutes = Math.floor((p.durationSec % 3600) / 60);
        const seconds = p.durationSec % 60;
        timer.setTime(hours, minutes, seconds);
        if (p.intervalSec) {
          timer.intervalSec = p.intervalSec;
          if (timerIntervalSelect) timerIntervalSelect.value = String(p.intervalSec);
        }
        if (sound.soundEnabled) sound.playBeep(1100, 0.06);
      });

      presetsContainer.appendChild(chip);
    });
  }

  function formatSecShort(s) {
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
  }

  renderPresets();

  // Add Custom Preset Button
  document.getElementById('add-preset-btn')?.addEventListener('click', () => {
    const comp = timer.getTimeComponents();
    const duration = comp.totalSec;
    if (duration <= 0) {
      alert(t('alert.needDuration'));
      return;
    }
    const name = prompt(t('prompt.presetName'), `${t('prompt.presetDefault')} (${formatSecShort(duration)})`);
    if (name && name.trim()) {
      timer.addPreset(name.trim(), duration, timer.intervalSec);
      renderPresets();
    }
  });

  // --- Stopwatch UI Bindings ---
  const swTimeEl = document.getElementById('sw-time');
  const swMsEl = document.getElementById('sw-ms');
  const swPlayBtn = document.getElementById('sw-play-btn');
  const swPlayIcon = document.getElementById('sw-play-icon');
  const swResetBtn = document.getElementById('sw-reset-btn');
  const swLapBtn = document.getElementById('sw-lap-btn');
  const swLapsContainer = document.getElementById('sw-laps-container');
  const swLapsEmpty = document.getElementById('sw-laps-empty');
  const swLapStats = document.getElementById('sw-lap-stats');
  const swFastestLapEl = document.getElementById('sw-fastest-lap');
  const swSlowestLapEl = document.getElementById('sw-slowest-lap');
  const swTotalLapsEl = document.getElementById('sw-total-laps');

  // Quick toggles for stopwatch
  const swIntervalToggle = document.getElementById('sw-interval-toggle');
  const swIntervalSelect = document.getElementById('sw-interval-select');
  const swSpeakingToggle = document.getElementById('sw-speaking-toggle');
  const swSpeakLapToggle = document.getElementById('sw-speak-lap-toggle');
  const swSpeakTotalToggle = document.getElementById('sw-speak-total-toggle');
  const swVibrateToggle = document.getElementById('sw-vibrate-toggle');

  function updateStopwatchDisplay(comp) {
    const pad = (n) => String(n).padStart(2, '0');
    if (comp.hours > 0) {
      swTimeEl.textContent = `${pad(comp.hours)}:${pad(comp.minutes)}:${pad(comp.seconds)}`;
    } else {
      swTimeEl.textContent = `${pad(comp.minutes)}:${pad(comp.seconds)}`;
    }
    swMsEl.textContent = `.${pad(comp.ms)}`;
  }

  // Stopwatch Status Badge Elements
  const swStatusBadge = document.getElementById('sw-status-badge');
  const swStatusDot = document.getElementById('sw-status-dot');
  const swStatusText = document.getElementById('sw-status-text');

  function updateStopwatchStateUI(status) {
    swPlayBtn.classList.remove('btn-running', 'btn-paused', 'bg-emerald-400', 'bg-amber-400', 'bg-theme', 'text-black', 'text-white');

    if (status === 'running') {
      swPlayBtn.classList.add('btn-running', 'bg-emerald-400', 'text-black');
      swPlayBtn.innerHTML = SVG_ICONS.pause;
      swLapBtn.disabled = false;
      swLapBtn.classList.remove('opacity-50', 'cursor-not-allowed');

      if (swStatusBadge) {
        swStatusBadge.className = 'mb-2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]';
        swStatusDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot';
        swStatusText.textContent = t('st.running');
      }
      requestWakeLock();
    } else if (status === 'paused') {
      swPlayBtn.classList.add('btn-paused', 'bg-amber-400', 'text-black');
      swPlayBtn.innerHTML = SVG_ICONS.pause; // Show pause symbol when paused
      swLapBtn.disabled = true;
      swLapBtn.classList.add('opacity-50', 'cursor-not-allowed');

      if (swStatusBadge) {
        swStatusBadge.className = 'mb-2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]';
        swStatusDot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse-dot';
        swStatusText.textContent = t('st.paused');
      }
      releaseWakeLock();
    } else if (status === 'precount') {
      swPlayBtn.classList.add('btn-running', 'bg-amber-400', 'text-black');
      swPlayBtn.innerHTML = SVG_ICONS.pause;
      swLapBtn.disabled = true;
      swLapBtn.classList.add('opacity-50', 'cursor-not-allowed');

      if (swStatusBadge) {
        swStatusBadge.className = 'mb-2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-400';
        swStatusDot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-pulse-dot';
        swStatusText.textContent = t('st.getready');
      }
    } else {
      // Idle / Reset
      swPlayBtn.classList.add('bg-theme', 'text-black');
      swPlayBtn.innerHTML = SVG_ICONS.play;
      swLapBtn.disabled = true;
      swLapBtn.classList.add('opacity-50', 'cursor-not-allowed');

      if (swStatusBadge) {
        swStatusBadge.className = 'mb-2 px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-400';
        swStatusDot.className = 'w-1.5 h-1.5 rounded-full bg-gray-400';
        swStatusText.textContent = t('st.ready');
      }
      releaseWakeLock();
    }
  }

  function renderLaps(laps) {
    if (!swLapsContainer) return;

    if (laps.length === 0) {
      if (swLapsEmpty) swLapsEmpty.classList.remove('hidden');
      if (swLapStats) swLapStats.classList.add('hidden');
      swLapsContainer.innerHTML = '';
      return;
    }

    if (swLapsEmpty) swLapsEmpty.classList.add('hidden');
    if (swLapStats) swLapStats.classList.remove('hidden');

    // Stats
    const fastest = laps.find(l => l.isFastest);
    const slowest = laps.find(l => l.isSlowest);
    if (swFastestLapEl && fastest) swFastestLapEl.textContent = stopwatch.formatMs(fastest.splitMs);
    if (swSlowestLapEl && slowest) swSlowestLapEl.textContent = stopwatch.formatMs(slowest.splitMs);
    if (swTotalLapsEl) swTotalLapsEl.textContent = String(laps.length);

    swLapsContainer.innerHTML = laps.map(lap => {
      let badge = '';
      let borderClass = 'border-white/5';
      if (lap.isFastest) {
        badge = `<span class="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">${t('badge.fastest')}</span>`;
        borderClass = 'border-emerald-500/30 bg-emerald-500/5';
      } else if (lap.isSlowest) {
        badge = `<span class="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30">${t('badge.slowest')}</span>`;
        borderClass = 'border-rose-500/30 bg-rose-500/5';
      }

      return `
        <div class="flex items-center justify-between p-3 rounded-xl glass-panel border ${borderClass} text-sm">
          <div class="flex items-center gap-2">
            <span class="font-mono text-gray-400 text-xs w-8">#${lap.lapNumber}</span>
            ${badge}
          </div>
          <div class="text-right">
            <div class="font-mono font-bold text-base text-gray-100">${stopwatch.formatMs(lap.splitMs)}</div>
            <div class="font-mono text-[11px] text-gray-400">Total: ${stopwatch.formatMs(lap.totalMs)}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  stopwatch.onTick = (comp) => updateStopwatchDisplay(comp);
  stopwatch.onStateChange = (status) => updateStopwatchStateUI(status);
  stopwatch.onLapAdded = (laps) => renderLaps(laps);

  swPlayBtn.addEventListener('click', () => {
    sound.initAudioContext();
    if (stopwatch.status === 'running') {
      stopwatch.pause();
    } else if (stopwatch.status === 'precount') {
      stopwatch.pause();
    } else {
      stopwatch.start();
    }
  });

  swResetBtn.addEventListener('click', () => {
    stopwatch.reset();
  });

  swLapBtn.addEventListener('click', () => {
    stopwatch.lap();
  });

  // Stopwatch Quick Toggles sync
  const swPrecountSelect = document.getElementById('sw-precount-select');
  if (swPrecountSelect) {
    swPrecountSelect.value = String(stopwatch.preCountdownSec);
    swPrecountSelect.addEventListener('change', (e) => {
      stopwatch.preCountdownSec = parseInt(e.target.value, 10);
      localStorage.setItem('sw_precount_sec', String(stopwatch.preCountdownSec));
    });
  }

  if (swIntervalToggle) {
    swIntervalToggle.checked = stopwatch.intervalSpeakingEnabled;
    swIntervalToggle.addEventListener('change', (e) => {
      stopwatch.intervalSpeakingEnabled = e.target.checked;
      localStorage.setItem('sw_interval_enabled', String(e.target.checked));
    });
  }

  if (swIntervalSelect) {
    swIntervalSelect.value = String(stopwatch.intervalSec);
    swIntervalSelect.addEventListener('change', (e) => {
      stopwatch.intervalSec = parseInt(e.target.value, 10);
      localStorage.setItem('sw_interval_sec', String(stopwatch.intervalSec));
    });
  }

  if (swSpeakingToggle) {
    swSpeakingToggle.checked = !sound.isMuted;
    swSpeakingToggle.addEventListener('change', (e) => {
      sound.setMute(!e.target.checked);
      localStorage.setItem('sound_muted', String(sound.isMuted));
      updateMuteButtonUI();
      if (timerSpeakingToggle) timerSpeakingToggle.checked = e.target.checked;
    });
  }

  if (swSpeakLapToggle) {
    swSpeakLapToggle.checked = stopwatch.speakLapTime;
    swSpeakLapToggle.addEventListener('change', (e) => {
      stopwatch.speakLapTime = e.target.checked;
      localStorage.setItem('sw_speak_lap', String(e.target.checked));
    });
  }

  if (swSpeakTotalToggle) {
    swSpeakTotalToggle.checked = stopwatch.speakLapTotal;
    swSpeakTotalToggle.addEventListener('change', (e) => {
      stopwatch.speakLapTotal = e.target.checked;
      localStorage.setItem('sw_speak_total', String(e.target.checked));
    });
  }

  if (swVibrateToggle) {
    swVibrateToggle.checked = stopwatch.vibrateEnabled;
    swVibrateToggle.addEventListener('change', (e) => {
      stopwatch.vibrateEnabled = e.target.checked;
      localStorage.setItem('sw_vibrate_enabled', String(e.target.checked));
    });
  }

  // --- Modals Management ---
  const modals = {
    language: document.getElementById('modal-language'),
    theme: document.getElementById('modal-theme'),
    font: document.getElementById('modal-font'),
    settings: document.getElementById('modal-settings'),
    keypad: document.getElementById('modal-keypad'),
    share: document.getElementById('modal-share'),
  };

  function openModal(name) {
    if (modals[name]) {
      modals[name].classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(name) {
    if (modals[name]) {
      modals[name].classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalName = btn.dataset.openModal;
      if (modalName === 'settings') populateSettingsUI();
      if (modalName === 'share') generateShareContent();
      if (modalName === 'language' && window.AppI18N) updateLanguageUI(AppI18N.lang);
      openModal(modalName);
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalName = btn.dataset.closeModal;
      closeModal(modalName);
    });
  });

  // Close modals on clicking backdrop
  Object.values(modals).forEach(modal => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  });

  // Language option clicks & sync
  function updateLanguageUI(lang) {
    document.querySelectorAll('.language-option').forEach(btn => {
      const isCurrent = btn.dataset.lang === lang;
      const checkIcon = btn.querySelector('.lang-check');
      if (checkIcon) {
        checkIcon.classList.toggle('hidden', !isCurrent);
      }
      btn.classList.toggle('border-theme', isCurrent);
    });
    if (languageSelect) languageSelect.value = lang;
  }

  document.querySelectorAll('.language-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const lang = opt.dataset.lang;
      if (window.AppI18N && AppI18N.setLang(lang)) {
        updateLanguageUI(lang);
        if (sound.soundEnabled) sound.playBeep(1000, 0.05);
        setTimeout(() => {
          window.location.reload();
        }, 120);
      }
    });
  });

  // Theme option clicks
  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const theme = opt.dataset.theme;
      applyTheme(theme);
      if (sound.soundEnabled) sound.playBeep(1000, 0.05);
    });
  });

  // Font option clicks
  document.querySelectorAll('.font-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const font = opt.dataset.font;
      applyFont(font);
      if (sound.soundEnabled) sound.playBeep(1000, 0.05);
    });
  });

  // --- Settings Modal UI & Voices Sync ---
  const voiceSelect = document.getElementById('setting-voice-select');
  const speechRateSlider = document.getElementById('setting-speech-rate');
  const speechRateVal = document.getElementById('setting-speech-rate-val');
  const speechPitchSlider = document.getElementById('setting-speech-pitch');
  const speechPitchVal = document.getElementById('setting-speech-pitch-val');
  const testVoiceBtn = document.getElementById('btn-test-voice');
  const wakeLockToggle = document.getElementById('setting-wakelock');
  const speakEventsToggle = document.getElementById('setting-speak-events');
  const expirySoundSelect = document.getElementById('setting-expiry-sound');
  const expiryTextEl = document.getElementById('setting-expiry-text');
  const metronomeToggle = document.getElementById('setting-metronome');

  function populateVoiceDropdown(voices) {
    if (!voiceSelect) return;
    // If the platform exposes no text-to-speech voices (e.g. some Android webviews),
    // don't leave the dropdown stuck on "Loading device voices..."
    if (!voices || voices.length === 0) {
      voiceSelect.innerHTML = `<option value="">${t('set.voicenone')}</option>`;
      return;
    }
    const currentName = sound.selectedVoice ? sound.selectedVoice.name : null;
    voiceSelect.innerHTML = voices.map((v, i) => {
      const isSelected = currentName && currentName === v.name;
      // Use index as value — most reliable across all browsers/platforms
      return `<option value="${i}" ${isSelected ? 'selected' : ''}>${v.name} (${v.lang})</option>`;
    }).join('');
  }

  // Hook so loadVoices() can refresh the dropdown live if voices load asynchronously
  sound.onVoicesLoaded = (voices) => populateVoiceDropdown(voices);

  function populateSettingsUI() {
    // Always get the freshest voice list available
    if (voiceSelect) {
      if (sound.speechSynthesis) {
        const freshVoices = sound.speechSynthesis.getVoices();
        if (freshVoices.length > 0) sound.voices = freshVoices;
        populateVoiceDropdown(sound.voices);
      } else {
        // speechSynthesis not exposed by this platform/WebView — show a clear note
        populateVoiceDropdown([]);
      }
    }

    if (wakeLockToggle) wakeLockToggle.checked = state.keepScreenOn;
    if (speakEventsToggle) speakEventsToggle.checked = sound.speakEvents;
    if (speechRateSlider) {
      speechRateSlider.value = sound.speechRate;
      if (speechRateVal) speechRateVal.textContent = `${sound.speechRate}x`;
    }
    if (speechPitchSlider) {
      speechPitchSlider.value = sound.speechPitch;
      if (speechPitchVal) speechPitchVal.textContent = `${sound.speechPitch}x`;
    }
    if (expirySoundSelect) expirySoundSelect.value = timer.expirySound;
    if (expiryTextEl) expiryTextEl.value = timer.expirySpeechText;
    if (metronomeToggle) metronomeToggle.checked = timer.metronomeTick;
  }

  if (voiceSelect) {
    voiceSelect.addEventListener('change', (e) => {
      // Index into the current voices array — always reliable
      const idx = parseInt(e.target.value, 10);
      const picked = sound.voices[idx];
      if (picked) {
        sound.selectedVoice = picked;
        sound._userPickedVoice = picked.name;
        sound._userPickedLang = picked.lang; // Store lang for Android lang-based fallback
        // Persist chosen voice + language so it survives app restarts (Android voice reset fix)
        localStorage.setItem('sound_voice_name', picked.name);
        localStorage.setItem('sound_voice_lang', picked.lang);
      }
    });
  }

  // --- Reset Quick Presets to defaults ---
  const resetPresetsBtn = document.getElementById('btn-reset-presets');
  if (resetPresetsBtn) {
    resetPresetsBtn.addEventListener('click', () => {
      if (confirm(t('confirm.resetPresets'))) {
        timer.resetPresets();
        renderPresets();
        if (sound.soundEnabled) sound.playBeep(900, 0.08);
      }
    });
  }

  // --- App & Voice Language Selector ---
  const languageSelect = document.getElementById('setting-language');
  if (languageSelect && window.AppI18N) {
    languageSelect.value = AppI18N.lang;
    updateLanguageUI(AppI18N.lang);
    languageSelect.addEventListener('change', (e) => {
      if (AppI18N.setLang(e.target.value)) {
        updateLanguageUI(e.target.value);
        if (sound.soundEnabled) sound.playBeep(1000, 0.05);
        setTimeout(() => {
          window.location.reload();
        }, 120);
      }
    });
  }

  if (speechRateSlider) {
    speechRateSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      sound.speechRate = val;
      localStorage.setItem('sound_rate', String(val));
      if (speechRateVal) speechRateVal.textContent = `${val.toFixed(1)}x`;
    });
  }

  if (speechPitchSlider) {
    speechPitchSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      sound.speechPitch = val;
      localStorage.setItem('sound_pitch', String(val));
      if (speechPitchVal) speechPitchVal.textContent = `${val.toFixed(1)}x`;
    });
  }

  if (testVoiceBtn) {
    testVoiceBtn.addEventListener('click', () => {
      sound.initAudioContext();
      sound.speak(t('sp.test'), true);
    });
  }

  if (wakeLockToggle) {
    wakeLockToggle.addEventListener('change', (e) => {
      state.keepScreenOn = e.target.checked;
      localStorage.setItem('app_wakelock', JSON.stringify(e.target.checked));
      if (!state.keepScreenOn) {
        releaseWakeLock();
      } else if (timer.status === 'running' || stopwatch.status === 'running') {
        requestWakeLock();
      }
    });
  }

  if (speakEventsToggle) {
    speakEventsToggle.addEventListener('change', (e) => {
      sound.speakEvents = e.target.checked;
      localStorage.setItem('sound_speak_events', String(e.target.checked));
    });
  }

  if (expirySoundSelect) {
    expirySoundSelect.addEventListener('change', (e) => {
      timer.expirySound = e.target.value;
      localStorage.setItem('timer_expiry_sound', timer.expirySound);
      if (e.target.value === 'whistle') sound.playWhistle();
      else if (e.target.value === 'bell') sound.playBell();
      else if (e.target.value === 'alarm') sound.playAlarmPattern();
      else if (e.target.value === 'chime') sound.playChime();
    });
  }

  if (expiryTextEl) {
    expiryTextEl.addEventListener('input', (e) => {
      timer.expirySpeechText = e.target.value.trim();
      localStorage.setItem('timer_expiry_text', timer.expirySpeechText);
    });
  }

  if (metronomeToggle) {
    metronomeToggle.addEventListener('change', (e) => {
      timer.metronomeTick = e.target.checked;
      stopwatch.metronomeTick = e.target.checked;
      localStorage.setItem('timer_metronome', String(e.target.checked));
    });
  }

  // --- Keypad Modal for Custom Timer Input ---
  let keypadBuffer = ''; // e.g. "013000" -> 01h 30m 00s

  const keypadDigitsEl = document.getElementById('keypad-display-digits');

  function updateKeypadDisplay() {
    const padded = keypadBuffer.padStart(6, '0');
    const hh = padded.slice(0, 2);
    const mm = padded.slice(2, 4);
    const ss = padded.slice(4, 6);
    if (keypadDigitsEl) {
      keypadDigitsEl.innerHTML = `
        <span class="${hh !== '00' ? 'text-theme' : 'text-gray-500'}">${hh}</span><span class="text-xs text-gray-500 font-sans">${t('digits.h')}</span>
        <span class="${mm !== '00' || hh !== '00' ? 'text-theme' : 'text-gray-500'}">${mm}</span><span class="text-xs text-gray-500 font-sans">${t('digits.m')}</span>
        <span class="${ss !== '00' || mm !== '00' || hh !== '00' ? 'text-theme' : 'text-gray-500'}">${ss}</span><span class="text-xs text-gray-500 font-sans">${t('digits.s')}</span>
      `;
    }
  }

  document.querySelectorAll('[data-keypad-val]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.keypadVal;
      if (keypadBuffer.length < 6) {
        if (keypadBuffer === '' && val === '0') return; // no leading zero
        keypadBuffer += val;
        updateKeypadDisplay();
        if (sound.soundEnabled) sound.playBeep(1200, 0.04);
      }
    });
  });

  document.getElementById('keypad-backspace-btn')?.addEventListener('click', () => {
    keypadBuffer = keypadBuffer.slice(0, -1);
    updateKeypadDisplay();
    if (sound.soundEnabled) sound.playBeep(800, 0.04);
  });

  document.getElementById('keypad-clear-btn')?.addEventListener('click', () => {
    keypadBuffer = '';
    updateKeypadDisplay();
  });

  document.getElementById('keypad-set-btn')?.addEventListener('click', () => {
    const padded = keypadBuffer.padStart(6, '0');
    const hh = parseInt(padded.slice(0, 2), 10);
    const mm = parseInt(padded.slice(2, 4), 10);
    const ss = parseInt(padded.slice(4, 6), 10);
    timer.setTime(hh, mm, ss);
    keypadBuffer = '';
    closeModal('keypad');
  });

  document.getElementById('open-keypad-btn')?.addEventListener('click', () => {
    keypadBuffer = '';
    updateKeypadDisplay();
    openModal('keypad');
  });

  // --- Share & QR Code Modal ---
  function generateShareContent() {
    const shareTextEl = document.getElementById('share-text-area');
    const isStopwatch = state.activeTab === 'stopwatch';
    const text = isStopwatch ? stopwatch.getShareSummary() : `⏳ Timer set for ${timer.getTimeComponents().totalSec} seconds on Speaking Timer`;
    if (shareTextEl) shareTextEl.value = text;

    // Generate QR code for current URL (works seamlessly when opened locally or hosted)
    const qrContainer = document.getElementById('qr-code-box');
    if (qrContainer) {
      const url = window.location.href;
      qrContainer.innerHTML = `
        <div class="p-3 bg-white rounded-xl inline-block shadow-lg">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000" 
               alt="QR Code" 
               class="w-36 h-36 mx-auto rounded"
               onerror="this.parentElement.innerHTML='<div class=\\'text-xs text-black p-4\\'>${url}</div>'" />
        </div>
        <p class="text-xs text-gray-400 mt-2 font-mono break-all">${url}</p>
      `;
    }
  }

  document.getElementById('btn-copy-share')?.addEventListener('click', () => {
    const shareTextEl = document.getElementById('share-text-area');
    if (shareTextEl) {
      navigator.clipboard.writeText(shareTextEl.value).then(() => {
        alert(t('alert.copied'));
      });
    }
  });

  document.getElementById('btn-native-share')?.addEventListener('click', () => {
    const shareTextEl = document.getElementById('share-text-area');
    if (navigator.share && shareTextEl) {
      navigator.share({
        title: 'Speaking Timer & Stopwatch',
        text: shareTextEl.value,
      }).catch(() => {});
    } else {
      document.getElementById('btn-copy-share')?.click();
    }
  });

  // Live Date & Time in Header
  const headerDateTimeEl = document.getElementById('header-datetime');
  function updateHeaderDateTime() {
    if (!headerDateTimeEl) return;
    const now = new Date();
    const lang = (window.AppI18N && AppI18N.lang) ? AppI18N.lang : 'en';
    const weekday = now.toLocaleDateString(lang, { weekday: 'long' });
    const day = now.toLocaleDateString(lang, { day: 'numeric', month: 'short' });
    const time = now.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', hour12: false });
    const capWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    headerDateTimeEl.textContent = `${capWeekday}, ${day} · ${time}`;
  }
  updateHeaderDateTime();
  setInterval(updateHeaderDateTime, 1000);

  // Fullscreen & Landscape Scoreboard Mode
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnExitLandscape = document.getElementById('btn-exit-landscape');

  async function enterLandscapeFullscreen() {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape').catch(() => {});
      }
    } catch (e) {
      console.log('Fullscreen/orientation lock not supported or denied:', e);
    }
    document.body.classList.add('landscape-mode');
  }

  async function exitLandscapeFullscreen() {
    try {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }
    } catch (e) {
      console.log('Exit fullscreen error:', e);
    }
    document.body.classList.remove('landscape-mode');
  }

  btnFullscreen?.addEventListener('click', () => {
    if (document.body.classList.contains('landscape-mode') || document.fullscreenElement) {
      exitLandscapeFullscreen();
    } else {
      enterLandscapeFullscreen();
    }
  });

  btnExitLandscape?.addEventListener('click', () => {
    exitLandscapeFullscreen();
  });

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      document.body.classList.remove('landscape-mode');
    }
  });

  // Physical Gyro / Device orientation changes
  function syncOrientationState() {
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;
    if (!isLandscape && !document.fullscreenElement) {
      document.body.classList.remove('landscape-mode');
    }
  }

  window.addEventListener('resize', syncOrientationState);
  window.addEventListener('orientationchange', syncOrientationState);
  if (screen.orientation) {
    screen.orientation.addEventListener('change', syncOrientationState);
  }

  // Global Mute Toggle in Header
  const headerMuteBtn = document.getElementById('btn-header-mute');
  const headerMuteIcon = document.getElementById('header-mute-icon');

  function updateMuteButtonUI() {
    if (sound.isMuted) {
      headerMuteIcon.setAttribute('data-lucide', 'volume-x');
      headerMuteBtn.classList.add('text-rose-400');
    } else {
      headerMuteIcon.setAttribute('data-lucide', 'volume-2');
      headerMuteBtn.classList.remove('text-rose-400');
    }
    lucide.createIcons();
  }

  updateMuteButtonUI(); // Reflect persisted mute state on startup

  headerMuteBtn?.addEventListener('click', () => {
    sound.setMute(!sound.isMuted);
    localStorage.setItem('sound_muted', String(sound.isMuted));
    updateMuteButtonUI();
    if (timerSpeakingToggle) timerSpeakingToggle.checked = !sound.isMuted;
    if (swSpeakingToggle) swSpeakingToggle.checked = !sound.isMuted;
  });

  // Register PWA Service Worker (only over http/https — skip file:// and blob://)
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        // Proactively check for newer versions on startup
        reg.update().catch(() => {});
      }).catch((err) => {
        console.log('Service Worker registration skipped or unavailable:', err);
      });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }

  // Initialize Lucide icons
  lucide.createIcons();
});
