/**
 * Speaking Timer & Stopwatch — i18n / Language Engine
 * Localizes BOTH the app interface (data-i18n attributes in index.html)
 * AND the spoken voice announcements (Web Speech phrases).
 *
 * Supported languages: en, es, de, fr, ru, zh, ro
 * The selected language is persisted in localStorage('app_lang').
 *
 * This file must be loaded BEFORE audio.js / timer.js / stopwatch.js,
 * because those engines read AppI18N at construction time.
 */
(function () {
  'use strict';

  const DICTS = {};

  /* ============================ ENGLISH ============================ */
  DICTS.en = {
    // Header & tooltips
    "app.title": "Voice Timer",
    "tt.mute": "Mute/Unmute Speech & Audio",
    "tt.language": "App & Voice Language",
    "tt.themes": "Color Themes",
    "tt.fonts": "Display Fonts",
    "tt.fullscreen": "Fullscreen Mode",
    "tt.settings": "Settings",
    "tt.sharelaps": "Share Laps",
    // Tabs
    "tab.timer": "Timer",
    "tab.stopwatch": "Stopwatch",
    // Status badges
    "st.ready": "READY",
    "st.running": "RUNNING",
    "st.paused": "PAUSED",
    "st.getready": "GET READY",
    "st.timesup": "TIME'S UP!",
    "overlay.getready": "Get Ready",
    // Buttons
    "btn.reset": "Reset",
    "btn.clear": "Clear",
    "btn.lap": "Lap",
    "hint.tapset": "Tap digits to customize duration",
    // Quick option rows
    "lbl.countdownBefore": "Countdown before starting:",
    "lbl.countdown5s": "5s Countdown",
    "lbl.interval": "Interval",
    "lbl.speaking": "Speaking",
    "lbl.vibration": "Vibration",
    // Pre-countdown select
    "pre.off": "Off (0s)", "pre.3": "3s", "pre.5": "5s", "pre.10": "10s",
    // Interval selects
    "int.5": "5s", "int.10": "10s", "int.15": "15s", "int.30": "30s", "int.60": "1m", "int.120": "2m", "int.300": "5m",
    // Presets
    "presets.title": "Quick Presets",
    "presets.save": "Save Current",
    "p1": "⚡ HIIT Work", "p2": "🧘 Rest Interval", "p3": "💪 Core Plank",
    "p4": "🥊 Boxing Round", "p5": "☕ Coffee / Tea", "p6": "🍅 Pomodoro Focus",
    // Stopwatch
    "sw.unitsline": "MINUTES : SECONDS . CENTISECONDS",
    "sw.speakLapTime": "Speak Lap Time",
    "sw.speakLapTotal": "Speak Lap Total",
    "sw.vibrateLaps": "Vibrate on Lap & Interval",
    "stats.fastest": "Fastest",
    "stats.slowest": "Slowest",
    "stats.totalLaps": "Total Laps",
    "laps.empty": "No laps recorded yet",
    "badge.fastest": "Fastest",
    "badge.slowest": "Slowest",
    // Modals
    "modal.language.title": "App & Voice Language",
    "modal.language.desc": "Select language for interface text and spoken announcements:",
    "modal.fonts.title": "Digit Font Style",
    "modal.themes.title": "OLED Color Themes",
    "modal.settings.title": "Settings",
    "font.stencil": "Military Stencil", "font.pixel": "8-Bit Pixel Matrix",
    "font.segment": "7-Segment Monospace LCD", "font.orbitron": "Sci-Fi Orbitron LED",
    "font.sport": "Sport Chunky Display", "font.bebas": "Athletic Bold Timer",
    "font.marker": "Handwritten Marker", "font.modern": "Modern Minimalist Heavy",
    "theme.cyan": "Cyan", "theme.amber": "Amber", "theme.lime": "Lime", "theme.purple": "Purple",
    "theme.crimson": "Crimson", "theme.orange": "Orange", "theme.pink": "Pink", "theme.white": "White",
    // Settings sections
    "set.sectionTimer": "Timer Running",
    "set.wakelock": "Keep the screen on",
    "set.wakelockDesc": "Keep screen awake while timer is running",
    "set.speakEvents": "Speak Events",
    "set.speakEventsDesc": "Announce start, pause, resume, and reset",
    "set.metronome": "Metronome Tick",
    "set.metronomeDesc": "Subtle click sound every second",
    "set.sectionVoice": "Speech & Voice Engine",
    "set.voiceOutput": "Voice Audio Output",
    "set.voiceloading": "Loading device voices...",
    "set.voicenone": "No voice found on this device (text-to-speech unavailable)",
    "set.language": "App & Voice Language",
    "set.languageDesc": "Used for interface text and spoken announcements",
    "set.rate": "Speaking Rate / Speed",
    "set.pitch": "Voice Pitch",
    "set.testvoice": "Test Voice Output",
    "set.sectionExpired": "Timer Expired",
    "set.completeSound": "Completion Sound",
    "snd.whistle": "Referee Whistle 📢", "snd.bell": "Boxing Ring Bell 🥊",
    "snd.alarm": "Digital Sports Alarm 🚨", "snd.chime": "Gentle Marimba Chime ✨",
    "snd.none": "Mute / Voice Only 🔇",
    "set.speakText": "Speaking Text",
    "set.openQR": "Open on Phone via QR Code",
    // Keypad
    "kp.title": "Set Timer Duration",
    "kp.set": "Set Timer",
    // Share modal
    "modal.share.title": "Open on Phone / Share",
    "sh.desc": "Scan this QR code with your phone camera to open and use instantly:",
    "sh.copy": "Copy Text",
    "sh.sheet": "Share Sheet",
    // Dynamic dialogs
    "alert.needDuration": "Please set a timer duration first before saving as a preset.",
    "prompt.presetName": "Enter a name for this preset:",
    "prompt.presetDefault": "Workout",
    "alert.copied": "Copied to clipboard!",
    "confirm.deletePreset": "Are you sure you want to delete the preset \"{name}\"?",
    // Digit unit letters under displays
    "digits.h": "h", "digits.m": "m", "digits.s": "s",
    // ---- Spoken announcement phrases ----
    "sp.go": "Go!",
    "sp.timerPaused": "Timer paused",
    "sp.paused": "Paused",
    "sp.resumed": "Resumed",
    "sp.swStarted": "Stopwatch started",
    "sp.timeupDefault": "Timer has expired!",
    "sp.remainingTpl": "{phrase} remaining",
    "sp.elapsedTpl": "{phrase} elapsed",
    "u.hour": ["hour", "hours"],
    "u.minute": ["minute", "minutes"],
    "u.second": ["second", "seconds"],
    "sp.lapTpl": "Lap {n}, {sec} seconds",
    "sp.totalTpl": "Total time {phrase}",
    "sp.test": "This is a test of your speaking timer voice. Ready, set, go!"
  };

  /* ============================ SPANISH ============================ */
  DICTS.es = {
    "app.title": "Temporizador de Voz",
    "tt.mute": "Silenciar/activar voz y sonido",
    "tt.language": "Idioma de la app y la voz",
    "tt.themes": "Temas de color",
    "tt.fonts": "Fuentes de pantalla",
    "tt.fullscreen": "Pantalla completa",
    "tt.settings": "Ajustes",
    "tt.sharelaps": "Compartir vueltas",
    "tab.timer": "Temporizador",
    "tab.stopwatch": "Cronómetro",
    "st.ready": "LISTO", "st.running": "EN MARCHA", "st.paused": "PAUSA",
    "st.getready": "PREPÁRATE", "st.timesup": "¡TIEMPO!",
    "overlay.getready": "Prepárate",
    "btn.reset": "Reiniciar", "btn.clear": "Borrar", "btn.lap": "Vuelta",
    "hint.tapset": "Toca los dígitos para ajustar la duración",
    "lbl.countdownBefore": "Cuenta atrás antes de iniciar:",
    "lbl.countdown5s": "Cuenta atrás de 5 s",
    "lbl.interval": "Intervalo",
    "lbl.speaking": "Voz",
    "lbl.vibration": "Vibración",
    "pre.off": "Desactivado (0 s)", "pre.3": "3 s", "pre.5": "5 s", "pre.10": "10 s",
    "int.5": "5 s", "int.10": "10 s", "int.15": "15 s", "int.30": "30 s", "int.60": "1 min", "int.120": "2 min", "int.300": "5 min",
    "presets.title": "Presets rápidos",
    "presets.save": "Guardar actual",
    "p1": "⚡ Trabajo HIIT", "p2": "🧘 Descanso", "p3": "💪 Plancha",
    "p4": "🥊 Asalto de boxeo", "p5": "☕ Café / Té", "p6": "🍅 Enfoque Pomodoro",
    "sw.unitsline": "MINUTOS : SEGUNDOS . CENTÉSIMAS",
    "sw.speakLapTime": "Anunciar tiempo de vuelta",
    "sw.speakLapTotal": "Anunciar total acumulado",
    "sw.vibrateLaps": "Vibrar en vuelta e intervalo",
    "stats.fastest": "Más rápida", "stats.slowest": "Más lenta", "stats.totalLaps": "Vueltas totales",
    "laps.empty": "Aún no hay vueltas registradas",
    "badge.fastest": "La más rápida", "badge.slowest": "La más lenta",
    "modal.language.title": "Idioma de la app y la voz",
    "modal.language.desc": "Selecciona el idioma para los textos y los anuncios hablados:",
    "modal.fonts.title": "Estilo de fuente de dígitos",
    "modal.themes.title": "Temas de color OLED",
    "modal.settings.title": "Ajustes",
    "font.stencil": "Plantilla militar", "font.pixel": "Píxel 8 bits",
    "font.segment": "LCD monoespaciada", "font.orbitron": "Orbitron futurista",
    "font.sport": "Deporte robusto", "font.bebas": "Temporizador atlético",
    "font.marker": "Rotulador manuscrito", "font.modern": "Moderno minimalista",
    "theme.cyan": "Cian", "theme.amber": "Ámbar", "theme.lime": "Lima", "theme.purple": "Morado",
    "theme.crimson": "Carmesí", "theme.orange": "Naranja", "theme.pink": "Rosa", "theme.white": "Blanco",
    "set.sectionTimer": "Temporizador en marcha",
    "set.wakelock": "Mantener la pantalla encendida",
    "set.wakelockDesc": "Pantalla activa mientras corre el temporizador",
    "set.speakEvents": "Anunciar eventos",
    "set.speakEventsDesc": "Avisa inicio, pausa, reanudación y reinicio",
    "set.metronome": "Clic de metrónomo",
    "set.metronomeDesc": "Sonido sutil cada segundo",
    "set.sectionVoice": "Voz y síntesis de habla",
    "set.voiceOutput": "Salida de voz",
    "set.voiceloading": "Cargando voces del dispositivo...",
    "set.voicenone": "No se encontró ninguna voz en este dispositivo (síntesis de voz no disponible)",
    "set.language": "Idioma de la app y la voz",
    "set.languageDesc": "Se usa para los textos y los anuncios hablados",
    "set.rate": "Velocidad de la voz",
    "set.pitch": "Tono de voz",
    "set.testvoice": "Probar la voz",
    "set.sectionExpired": "Fin del temporizador",
    "set.completeSound": "Sonido de finalización",
    "snd.whistle": "Silbato de árbitro 📢", "snd.bell": "Campana de boxeo 🥊",
    "snd.alarm": "Alarma deportiva digital 🚨", "snd.chime": "Timbre suave de marimba ✨",
    "snd.none": "Silencio / solo voz 🔇",
    "set.speakText": "Texto hablado",
    "set.openQR": "Abrir en el móvil mediante QR",
    "kp.title": "Fijar duración",
    "kp.set": "Fijar temporizador",
    "modal.share.title": "Abrir en el móvil / Compartir",
    "sh.desc": "Escanea este código QR con la cámara de tu teléfono para abrirlo al instante:",
    "sh.copy": "Copiar texto",
    "sh.sheet": "Compartir",
    "alert.needDuration": "Primero fija una duración antes de guardar un preset.",
    "prompt.presetName": "Nombre del preset:",
    "prompt.presetDefault": "Entrenamiento",
    "alert.copied": "¡Copiado al portapapeles!",
    "confirm.deletePreset": "¿Seguro que deseas eliminar el preset «{name}»?",
    "digits.h": "h", "digits.m": "m", "digits.s": "s",
    "sp.go": "¡Vamos!",
    "sp.timerPaused": "Temporizador en pausa",
    "sp.paused": "En pausa",
    "sp.resumed": "Reanudado",
    "sp.swStarted": "Cronómetro iniciado",
    "sp.timeupDefault": "¡Se acabó el tiempo!",
    "sp.remainingTpl": "Quedan {phrase}",
    "sp.elapsedTpl": "Han pasado {phrase}",
    "u.hour": ["hora", "horas"],
    "u.minute": ["minuto", "minutos"],
    "u.second": ["segundo", "segundos"],
    "sp.lapTpl": "Vuelta {n}, {sec} segundos",
    "sp.totalTpl": "Tiempo total {phrase}",
    "sp.test": "Esta es una prueba de la voz de tu temporizador. ¡A sus puestos, listos, ya!"
  };

  /* ============================ GERMAN ============================ */
  DICTS.de = {
    "app.title": "Sprach-Timer",
    "tt.mute": "Sprache & Audio stummschalten",
    "tt.language": "Sprache für App & Stimme",
    "tt.themes": "Farbthemen",
    "tt.fonts": "Anzeigeschriften",
    "tt.fullscreen": "Vollbildmodus",
    "tt.settings": "Einstellungen",
    "tt.sharelaps": "Runden teilen",
    "tab.timer": "Timer",
    "tab.stopwatch": "Stoppuhr",
    "st.ready": "BEREIT", "st.running": "LÄUFT", "st.paused": "PAUSIERT",
    "st.getready": "BEREIT MACHEN", "st.timesup": "ZEIT ABGELAUFEN!",
    "overlay.getready": "Bereit machen",
    "btn.reset": "Zurücksetzen", "btn.clear": "Löschen", "btn.lap": "Runde",
    "hint.tapset": "Zahlen antippen, um die Dauer anzupassen",
    "lbl.countdownBefore": "Countdown vor dem Start:",
    "lbl.countdown5s": "5-s-Countdown",
    "lbl.interval": "Intervall",
    "lbl.speaking": "Sprache",
    "lbl.vibration": "Vibration",
    "pre.off": "Aus (0 Sek.)", "pre.3": "3 Sek.", "pre.5": "5 Sek.", "pre.10": "10 Sek.",
    "int.5": "5 Sek.", "int.10": "10 Sek.", "int.15": "15 Sek.", "int.30": "30 Sek.", "int.60": "1 Min.", "int.120": "2 Min.", "int.300": "5 Min.",
    "presets.title": "Schnellvorlagen",
    "presets.save": "Aktuelle speichern",
    "p1": "⚡ HIIT-Training", "p2": "🧘 Pause", "p3": "💪 Plank",
    "p4": "🥊 Boxrunde", "p5": "☕ Kaffee / Tee", "p6": "🍅 Pomodoro-Fokus",
    "sw.unitsline": "MINUTEN : SEKUNDEN . HUNDERTSTEL",
    "sw.speakLapTime": "Rundenzeit ansagen",
    "sw.speakLapTotal": "Gesamtzeit ansagen",
    "sw.vibrateLaps": "Bei Runde & Intervall vibrieren",
    "stats.fastest": "Schnellste", "stats.slowest": "Langsamste", "stats.totalLaps": "Runden gesamt",
    "laps.empty": "Noch keine Runden aufgezeichnet",
    "badge.fastest": "Schnellste", "badge.slowest": "Langsamste",
    "modal.language.title": "Sprache für App & Stimme",
    "modal.language.desc": "Wähle die Sprache für Oberfläche und Sprachansagen:",
    "modal.fonts.title": "Ziffern-Schriftstil",
    "modal.themes.title": "OLED-Farbthemen",
    "modal.settings.title": "Einstellungen",
    "font.stencil": "Military-Schablone", "font.pixel": "8-Bit-Pixel",
    "font.segment": "Monospace-LCD", "font.orbitron": "Sci-Fi-Orbitron-LED",
    "font.sport": "Sport-Blockschrift", "font.bebas": "Athletischer Timer",
    "font.marker": "Handschrift-Marker", "font.modern": "Modern minimalistisch",
    "theme.cyan": "Cyan", "theme.amber": "Bernstein", "theme.lime": "Limette", "theme.purple": "Violett",
    "theme.crimson": "Purpurrot", "theme.orange": "Orange", "theme.pink": "Pink", "theme.white": "Weiß",
    "set.sectionTimer": "Timer-Ablauf",
    "set.wakelock": "Bildschirm anlassen",
    "set.wakelockDesc": "Verhindert das Ausschalten des Displays während der Timer läuft",
    "set.speakEvents": "Ereignisse ansagen",
    "set.speakEventsDesc": "Start, Pause, Fortsetzen und Zurücksetzen ansagen",
    "set.metronome": "Metronom-Klick",
    "set.metronomeDesc": "Dezenter Klick jede Sekunde",
    "set.sectionVoice": "Sprache & Sprachausgabe",
    "set.voiceOutput": "Sprachausgabe",
    "set.voiceloading": "Gerätestimmen werden geladen...",
    "set.voicenone": "Keine Stimme auf diesem Gerät gefunden (Sprachausgabe nicht verfügbar)",
    "set.language": "Sprache für App & Stimme",
    "set.languageDesc": "Gilt für Oberflächentexte und Ansagen",
    "set.rate": "Sprechgeschwindigkeit",
    "set.pitch": "Stimmlage",
    "set.testvoice": "Stimme testen",
    "set.sectionExpired": "Timer abgelaufen",
    "set.completeSound": "Endsignal",
    "snd.whistle": "Schiedsrichter-Pfeife 📢", "snd.bell": "Boxgong 🥊",
    "snd.alarm": "Digitaler Sportalarm 🚨", "snd.chime": "Sanftes Marimba-Signal ✨",
    "snd.none": "Stumm / nur Sprache 🔇",
    "set.speakText": "Gesprochener Text",
    "set.openQR": "Per QR-Code aufs Handy",
    "kp.title": "Dauer festlegen",
    "kp.set": "Timer setzen",
    "modal.share.title": "Auf Handy öffnen / Teilen",
    "sh.desc": "Scanne diesen QR-Code mit deiner Handykamera, um ihn sofort zu öffnen:",
    "sh.copy": "Text kopieren",
    "sh.sheet": "Teilen",
    "alert.needDuration": "Bitte zuerst eine Dauer festlegen, bevor du eine Vorlage speicherst.",
    "prompt.presetName": "Name der Vorlage:",
    "prompt.presetDefault": "Workout",
    "alert.copied": "In die Zwischenablage kopiert!",
    "confirm.deletePreset": "Möchtest du die Vorlage „{name}“ wirklich löschen?",
    "digits.h": "h", "digits.m": "m", "digits.s": "s",
    "sp.go": "Los!",
    "sp.timerPaused": "Timer pausiert",
    "sp.paused": "Pausiert",
    "sp.resumed": "Fortgesetzt",
    "sp.swStarted": "Stoppuhr gestartet",
    "sp.timeupDefault": "Die Zeit ist um!",
    "sp.remainingTpl": "Noch {phrase}",
    "sp.elapsedTpl": "{phrase} vergangen",
    "u.hour": ["Stunde", "Stunden"],
    "u.minute": ["Minute", "Minuten"],
    "u.second": ["Sekunde", "Sekunden"],
    "sp.lapTpl": "Runde {n}, {sec} Sekunden",
    "sp.totalTpl": "Gesamtzeit {phrase}",
    "sp.test": "Dies ist ein Test der Sprachausgabe deines Timers. Auf die Plätze, fertig, los!"
  };

  /* ============================ FRENCH ============================ */
  DICTS.fr = {
    "app.title": "Minuteur Vocal",
    "tt.mute": "Couper/activer la voix et le son",
    "tt.language": "Langue de l'application et de la voix",
    "tt.themes": "Thèmes de couleur",
    "tt.fonts": "Polices d'affichage",
    "tt.fullscreen": "Mode plein écran",
    "tt.settings": "Paramètres",
    "tt.sharelaps": "Partager les tours",
    "tab.timer": "Minuteur",
    "tab.stopwatch": "Chronomètre",
    "st.ready": "PRÊT", "st.running": "EN COURS", "st.paused": "PAUSE",
    "st.getready": "PRÉPAREZ-VOUS", "st.timesup": "TEMPS ÉCOULÉ !",
    "overlay.getready": "Préparez-vous",
    "btn.reset": "Réinitialiser", "btn.clear": "Effacer", "btn.lap": "Tour",
    "hint.tapset": "Touchez les chiffres pour régler la durée",
    "lbl.countdownBefore": "Compte à rebours avant le départ :",
    "lbl.countdown5s": "Compte à rebours de 5 s",
    "lbl.interval": "Intervalle",
    "lbl.speaking": "Voix",
    "lbl.vibration": "Vibration",
    "pre.off": "Désactivé (0 s)", "pre.3": "3 s", "pre.5": "5 s", "pre.10": "10 s",
    "int.5": "5 s", "int.10": "10 s", "int.15": "15 s", "int.30": "30 s", "int.60": "1 min", "int.120": "2 min", "int.300": "5 min",
    "presets.title": "Raccourcis",
    "presets.save": "Enregistrer l'actuel",
    "p1": "⚡ Séance HIIT", "p2": "🧘 Récupération", "p3": "💪 Gainage",
    "p4": "🥊 Round de boxe", "p5": "☕ Café / Thé", "p6": "🍅 Focus Pomodoro",
    "sw.unitsline": "MINUTES : SECONDES . CENTIÈMES",
    "sw.speakLapTime": "Annoncer le temps au tour",
    "sw.speakLapTotal": "Annoncer le temps total",
    "sw.vibrateLaps": "Vibrer aux tours et intervalles",
    "stats.fastest": "Le plus rapide", "stats.slowest": "Le plus lent", "stats.totalLaps": "Tours au total",
    "laps.empty": "Aucun tour enregistré pour l'instant",
    "badge.fastest": "Le plus rapide", "badge.slowest": "Le plus lent",
    "modal.language.title": "Langue de l'application et de la voix",
    "modal.language.desc": "Sélectionnez la langue pour l'interface et les annonces vocales :",
    "modal.fonts.title": "Style de police des chiffres",
    "modal.themes.title": "Thèmes OLED",
    "modal.settings.title": "Paramètres",
    "font.stencil": "Pochoir militaire", "font.pixel": "Pixel 8 bits",
    "font.segment": "LCD monospace", "font.orbitron": "Orbitron science-fiction",
    "font.sport": "Sport massif", "font.bebas": "Minuteur athlétique",
    "font.marker": "Marqueur manuscrit", "font.modern": "Moderne minimaliste",
    "theme.cyan": "Cyan", "theme.amber": "Ambre", "theme.lime": "Vert lime", "theme.purple": "Violet",
    "theme.crimson": "Cramoisi", "theme.orange": "Orange", "theme.pink": "Rose", "theme.white": "Blanc",
    "set.sectionTimer": "Minuteur en cours",
    "set.wakelock": "Garder l'écran allumé",
    "set.wakelockDesc": "L'écran reste allumé pendant que le minuteur tourne",
    "set.speakEvents": "Annoncer les événements",
    "set.speakEventsDesc": "Annonce le départ, la pause, la reprise et la remise à zéro",
    "set.metronome": "Tic de métronome",
    "set.metronomeDesc": "Clic discret chaque seconde",
    "set.sectionVoice": "Synthèse vocale",
    "set.voiceOutput": "Sortie vocale",
    "set.voiceloading": "Chargement des voix de l'appareil...",
    "set.voicenone": "Aucune voix trouvée sur cet appareil (synthèse vocale indisponible)",
    "set.language": "Langue de l'application et de la voix",
    "set.languageDesc": "Utilisée pour les textes et les annonces vocales",
    "set.rate": "Débit de parole",
    "set.pitch": "Hauteur de la voix",
    "set.testvoice": "Tester la voix",
    "set.sectionExpired": "Fin du minuteur",
    "set.completeSound": "Son de fin",
    "snd.whistle": "Coup de sifflet 📢", "snd.bell": "Cloche de boxe 🥊",
    "snd.alarm": "Alarme sportive digitale 🚨", "snd.chime": "Carillon marimba doux ✨",
    "snd.none": "Muet / voix seule 🔇",
    "set.speakText": "Texte prononcé",
    "set.openQR": "Ouvrir sur mobile via QR",
    "kp.title": "Définir la durée",
    "kp.set": "Définir le minuteur",
    "modal.share.title": "Ouvrir sur mobile / Partager",
    "sh.desc": "Scannez ce QR code avec l'appareil photo de votre téléphone pour l'ouvrir instantanément :",
    "sh.copy": "Copier le texte",
    "sh.sheet": "Partager",
    "alert.needDuration": "Définissez d'abord une durée avant d'enregistrer un raccourci.",
    "prompt.presetName": "Nom du raccourci :",
    "prompt.presetDefault": "Séance",
    "alert.copied": "Copié dans le presse-papiers !",
    "confirm.deletePreset": "Voulez-vous vraiment supprimer le raccourci « {name} » ?",
    "digits.h": "h", "digits.m": "m", "digits.s": "s",
    "sp.go": "C'est parti !",
    "sp.timerPaused": "Minuteur en pause",
    "sp.paused": "En pause",
    "sp.resumed": "Repris",
    "sp.swStarted": "Chronomètre démarré",
    "sp.timeupDefault": "Le temps est écoulé !",
    "sp.remainingTpl": "Il reste {phrase}",
    "sp.elapsedTpl": "Temps écoulé : {phrase}",
    "u.hour": ["heure", "heures"],
    "u.minute": ["minute", "minutes"],
    "u.second": ["seconde", "secondes"],
    "sp.lapTpl": "Tour {n}, {sec} secondes",
    "sp.totalTpl": "Temps total {phrase}",
    "sp.test": "Ceci est un test de la voix de votre minuteur. À vos marques, prêts, partez !"
  };

  /* ============================ RUSSIAN ============================ */
  DICTS.ru = {
    "app.title": "Голосовой таймер",
    "tt.mute": "Вкл./выкл. звук и голос",
    "tt.language": "Язык приложения и голоса",
    "tt.themes": "Цветовые темы",
    "tt.fonts": "Шрифты дисплея",
    "tt.fullscreen": "Полноэкранный режим",
    "tt.settings": "Настройки",
    "tt.sharelaps": "Поделиться кругами",
    "tab.timer": "Таймер",
    "tab.stopwatch": "Секундомер",
    "st.ready": "ГОТОВ", "st.running": "ИДЁТ", "st.paused": "ПАУЗА",
    "st.getready": "ПРИГОТОВЬТЕСЬ", "st.timesup": "ВРЕМЯ ВЫШЛО!",
    "overlay.getready": "Приготовьтесь",
    "btn.reset": "Сброс", "btn.clear": "Очистить", "btn.lap": "Круг",
    "hint.tapset": "Нажимайте на цифры, чтобы задать длительность",
    "lbl.countdownBefore": "Отсчёт перед стартом:",
    "lbl.countdown5s": "Отсчёт 5 с",
    "lbl.interval": "Интервал",
    "lbl.speaking": "Голос",
    "lbl.vibration": "Вибрация",
    "pre.off": "Выкл. (0 с)", "pre.3": "3 с", "pre.5": "5 с", "pre.10": "10 с",
    "int.5": "5 с", "int.10": "10 с", "int.15": "15 с", "int.30": "30 с", "int.60": "1 мин", "int.120": "2 мин", "int.300": "5 мин",
    "presets.title": "Быстрые наборы",
    "presets.save": "Сохранить текущий",
    "p1": "⚡ HIIT тренировка", "p2": "🧘 Отдых", "p3": "💪 Планка",
    "p4": "🥊 Боксёрский раунд", "p5": "☕ Кофе / Чай", "p6": "🍅 Помодоро",
    "sw.unitsline": "МИНУТЫ : СЕКУНДЫ . СОТЫЕ",
    "sw.speakLapTime": "Озвучивать время круга",
    "sw.speakLapTotal": "Озвучивать общее время",
    "sw.vibrateLaps": "Вибрация на круге и интервале",
    "stats.fastest": "Быстрейший", "stats.slowest": "Медленнейший", "stats.totalLaps": "Всего кругов",
    "laps.empty": "Круги пока не записаны",
    "badge.fastest": "Быстрый", "badge.slowest": "Медленный",
    "modal.language.title": "Язык приложения и голоса",
    "modal.language.desc": "Выберите язык для интерфейса и голосовых объявлений:",
    "modal.fonts.title": "Стиль шрифта цифр",
    "modal.themes.title": "OLED-темы",
    "modal.settings.title": "Настройки",
    "font.stencil": "Военный трафарет", "font.pixel": "8-битный пиксель",
    "font.segment": "Моноширинный LCD", "font.orbitron": "Футуристичный Orbitron",
    "font.sport": "Спортивный жирный", "font.bebas": "Атлетичный таймер",
    "font.marker": "Рукописный маркер", "font.modern": "Современный минимализм",
    "theme.cyan": "Бирюзовый", "theme.amber": "Янтарь", "theme.lime": "Лаймовый", "theme.purple": "Фиолетовый",
    "theme.crimson": "Багровый", "theme.orange": "Оранжевый", "theme.pink": "Розовый", "theme.white": "Белый",
    "set.sectionTimer": "Работа таймера",
    "set.wakelock": "Не гасить экран",
    "set.wakelockDesc": "Экран остаётся включённым во время работы таймера",
    "set.speakEvents": "Озвучивать события",
    "set.speakEventsDesc": "Старт, пауза, продолжение и сброс",
    "set.metronome": "Тик метронома",
    "set.metronomeDesc": "Тихий щелчок каждую секунду",
    "set.sectionVoice": "Речь и голосовой движок",
    "set.voiceOutput": "Голосовой вывод",
    "set.voiceloading": "Загрузка голосов устройства...",
    "set.voicenone": "На устройстве не найдено ни одного голоса (синтез речи недоступен)",
    "set.language": "Язык приложения и голоса",
    "set.languageDesc": "Используется для интерфейса и голосовых объявлений",
    "set.rate": "Скорость речи",
    "set.pitch": "Высота тона",
    "set.testvoice": "Проверить голос",
    "set.sectionExpired": "Истечение времени",
    "set.completeSound": "Звук окончания",
    "snd.whistle": "Судейский свисток 📢", "snd.bell": "Боксёрский гонг 🥊",
    "snd.alarm": "Электронная сирена 🚨", "snd.chime": "Нежная маримба ✨",
    "snd.none": "Без звука / только голос 🔇",
    "set.speakText": "Текст оповещения",
    "set.openQR": "Открыть на телефоне по QR-коду",
    "kp.title": "Установить длительность",
    "kp.set": "Установить",
    "modal.share.title": "Открыть на телефоне / Поделиться",
    "sh.desc": "Отсканируйте этот QR-код камерой телефона, чтобы мгновенно открыть приложение:",
    "sh.copy": "Копировать текст",
    "sh.sheet": "Поделиться",
    "alert.needDuration": "Сначала задайте длительность таймера, чтобы сохранить набор.",
    "prompt.presetName": "Название набора:",
    "prompt.presetDefault": "Тренировка",
    "alert.copied": "Скопировано в буфер обмена!",
    "confirm.deletePreset": "Вы уверены, что хотите удалить набор «{name}»?",
    "digits.h": "ч", "digits.m": "м", "digits.s": "с",
    "sp.go": "Старт!",
    "sp.timerPaused": "Таймер на паузе",
    "sp.paused": "Пауза",
    "sp.resumed": "Продолжаем",
    "sp.swStarted": "Секундомер запущен",
    "sp.timeupDefault": "Время вышло!",
    "sp.remainingTpl": "Осталось {phrase}",
    "sp.elapsedTpl": "Прошло {phrase}",
    "u.hour": ["час", "часа", "часов"],
    "u.minute": ["минута", "минуты", "минут"],
    "u.second": ["секунда", "секунды", "секунд"],
    "sp.lapTpl": "Круг {n}, {sec} сек",
    "sp.totalTpl": "Общее время {phrase}",
    "sp.test": "Это проверка голоса таймера. На старт, внимание, марш!"
  };

  /* ============================ MANDARIN CHINESE ============================ */
  DICTS.zh = {
    "app.title": "语音计时器",
    "tt.mute": "静音/开启语音与音效",
    "tt.language": "应用与语音语言",
    "tt.themes": "主题配色",
    "tt.fonts": "显示字体",
    "tt.fullscreen": "全屏模式",
    "tt.settings": "设置",
    "tt.sharelaps": "分享计次",
    "tab.timer": "计时器",
    "tab.stopwatch": "秒表",
    "st.ready": "准备就绪", "st.running": "计时中", "st.paused": "已暂停",
    "st.getready": "准备开始", "st.timesup": "时间到！",
    "overlay.getready": "准备开始",
    "btn.reset": "重置", "btn.clear": "清空", "btn.lap": "计次",
    "hint.tapset": "点击数字自定义时长",
    "lbl.countdownBefore": "开始前倒计时：",
    "lbl.countdown5s": "5 秒倒计时",
    "lbl.interval": "间隔提示",
    "lbl.speaking": "语音播报",
    "lbl.vibration": "震动反馈",
    "pre.off": "关闭 (0秒)", "pre.3": "3秒", "pre.5": "5秒", "pre.10": "10秒",
    "int.5": "5秒", "int.10": "10秒", "int.15": "15秒", "int.30": "30秒", "int.60": "1分钟", "int.120": "2分钟", "int.300": "5分钟",
    "presets.title": "快速预设",
    "presets.save": "保存当前",
    "p1": "⚡ HIIT 训练", "p2": "🧘 间歇休息", "p3": "💪 核心平板支撑",
    "p4": "🥊 拳击回合", "p5": "☕ 咖啡 / 冲茶", "p6": "🍅 番茄钟专注",
    "sw.unitsline": "分 : 秒 . 百分之一秒",
    "sw.speakLapTime": "播报单圈时间",
    "sw.speakLapTotal": "播报累计时间",
    "sw.vibrateLaps": "计次与间隔时震动",
    "stats.fastest": "最快圈", "stats.slowest": "最慢圈", "stats.totalLaps": "总圈数",
    "laps.empty": "暂无记录",
    "badge.fastest": "最快", "badge.slowest": "最慢",
    "modal.language.title": "应用与语音语言",
    "modal.language.desc": "选择界面与语音播报的语言：",
    "modal.fonts.title": "数字字体样式",
    "modal.themes.title": "OLED 颜色主题",
    "modal.settings.title": "设置",
    "font.stencil": "军事模板体", "font.pixel": "8 位像素体",
    "font.segment": "等宽液晶体", "font.orbitron": "科幻 Orbitron",
    "font.sport": "粗壮运动体", "font.bebas": "竞技计时体",
    "font.marker": "手写马克笔", "font.modern": "现代极简粗体",
    "theme.cyan": "青色", "theme.amber": "琥珀", "theme.lime": "青柠", "theme.purple": "紫色",
    "theme.crimson": "绯红", "theme.orange": "橙色", "theme.pink": "粉色", "theme.white": "白色",
    "set.sectionTimer": "计时运行设置",
    "set.wakelock": "保持屏幕常亮",
    "set.wakelockDesc": "计时器运行时防止屏幕休眠",
    "set.speakEvents": "播报事件提示",
    "set.speakEventsDesc": "在开始、暂停、继续和重置时语音提示",
    "set.metronome": "节拍器滴答声",
    "set.metronomeDesc": "每秒发出微弱滴答声",
    "set.sectionVoice": "语音合成引擎",
    "set.voiceOutput": "语音输出设备",
    "set.voiceloading": "正在加载设备语音...",
    "set.voicenone": "此设备未找到可用语音（不支持文字转语音）",
    "set.language": "应用与语音语言",
    "set.languageDesc": "用于界面文本和语音播报",
    "set.rate": "语速调节",
    "set.pitch": "音调调节",
    "set.testvoice": "试听语音",
    "set.sectionExpired": "计时结束提醒",
    "set.completeSound": "结束提示音",
    "snd.whistle": "裁判哨声 📢", "snd.bell": "拳击台铃 🥊",
    "snd.alarm": "电子运动警报 🚨", "snd.chime": "清脆马林巴铃声 ✨",
    "snd.none": "静音 / 仅语音 🔇",
    "set.speakText": "结束播报文本",
    "set.openQR": "扫码在手机上打开",
    "kp.title": "设置计时时长",
    "kp.set": "设定",
    "modal.share.title": "在手机上打开 / 分享",
    "sh.desc": "用手机相机扫描此二维码即可立即打开使用：",
    "sh.copy": "复制文本",
    "sh.sheet": "分享",
    "alert.needDuration": "请先设置计时时长，再保存预设。",
    "prompt.presetName": "预设名称：",
    "prompt.presetDefault": "锻炼",
    "alert.copied": "已复制到剪贴板！",
    "confirm.deletePreset": "确定要删除预设「{name}」吗？",
    "digits.h": "时", "digits.m": "分", "digits.s": "秒",
    "sp.go": "开始！",
    "sp.timerPaused": "计时已暂停",
    "sp.paused": "已暂停",
    "sp.resumed": "已继续",
    "sp.swStarted": "秒表已启动",
    "sp.timeupDefault": "时间到！",
    "sp.remainingTpl": "剩余 {phrase}",
    "sp.elapsedTpl": "已过 {phrase}",
    "u.hour": ["小时"],
    "u.minute": ["分钟"],
    "u.second": ["秒"],
    "sp.lapTpl": "第 {n} 圈，{sec} 秒",
    "sp.totalTpl": "总时间 {phrase}",
    "sp.test": "这是计时器语音测试。各就各位，预备，跑！"
  };

  /* ============================ ROMANIAN ============================ */
  DICTS.ro = {
    "app.title": "Temporizator vocal",
    "tt.mute": "Activează/dezactivează sunetul și vocea",
    "tt.language": "Limba aplicației și a vocii",
    "tt.themes": "Teme de culori",
    "tt.fonts": "Fonturi de afișare",
    "tt.fullscreen": "Mod ecran complet",
    "tt.settings": "Setări",
    "tt.sharelaps": "Distribuie tururile",
    "tab.timer": "Temporizator",
    "tab.stopwatch": "Cronometru",
    "st.ready": "PREGĂTIT", "st.running": "ÎN DERULARE", "st.paused": "PAUZĂ",
    "st.getready": "PREGĂTEȘTE-TE", "st.timesup": "TIMPUL A EXPIRAT!",
    "overlay.getready": "Pregătește-te",
    "btn.reset": "Resetează", "btn.clear": "Golește", "btn.lap": "Tur",
    "hint.tapset": "Apasă pe cifre pentru a personaliza durata",
    "lbl.countdownBefore": "Numărătoare inversă înainte de start:",
    "lbl.countdown5s": "Numărătoare de 5 s",
    "lbl.interval": "Interval",
    "lbl.speaking": "Voce",
    "lbl.vibration": "Vibrație",
    "pre.off": "Dezactivat (0 s)", "pre.3": "3 s", "pre.5": "5 s", "pre.10": "10 s",
    "int.5": "5 s", "int.10": "10 s", "int.15": "15 s", "int.30": "30 s", "int.60": "1 min", "int.120": "2 min", "int.300": "5 min",
    "presets.title": "Presetări rapide",
    "presets.save": "Salvează curentul",
    "p1": "⚡ Antrenament HIIT", "p2": "🧘 Pauză de recuperare", "p3": "💪 Plank abdomen",
    "p4": "🥊 Rundă de box", "p5": "☕ Cafea / Ceai", "p6": "🍅 Focus Pomodoro",
    "sw.unitsline": "MINUTE : SECUNDE . SUTIMI",
    "sw.speakLapTime": "Anunță timpul pe tur",
    "sw.speakLapTotal": "Anunță timpul total",
    "sw.vibrateLaps": "Vibrează la tur și interval",
    "stats.fastest": "Cel mai rapid", "stats.slowest": "Cel mai lent", "stats.totalLaps": "Total ture",
    "laps.empty": "Nu există ture înregistrate încă",
    "badge.fastest": "Cel mai rapid", "badge.slowest": "Cel mai lent",
    "modal.language.title": "Limba aplicației și a vocii",
    "modal.language.desc": "Selectează limba pentru interfață și anunțurile vocale:",
    "modal.fonts.title": "Stilul fontului cifrelor",
    "modal.themes.title": "Teme OLED",
    "modal.settings.title": "Setări",
    "font.stencil": "Șablon militar", "font.pixel": "Pixel 8 biți",
    "font.segment": "LCD monospațiat", "font.orbitron": "Orbitron sci-fi",
    "font.sport": "Sport îndrăzneț", "font.bebas": "Temporizator atletic",
    "font.marker": "Marker scris de mână", "font.modern": "Modern minimalist",
    "theme.cyan": "Turcoaz", "theme.amber": "Chihlimbar", "theme.lime": "Verde lime", "theme.purple": "Mov",
    "theme.crimson": "Roșu aprins", "theme.orange": "Portocaliu", "theme.pink": "Roz", "theme.white": "Alb",
    "set.sectionTimer": "Funcționare temporizator",
    "set.wakelock": "Menține ecranul aprins",
    "set.wakelockDesc": "Previne stingerea ecranului în timpul funcționării",
    "set.speakEvents": "Anunță evenimentele",
    "set.speakEventsDesc": "Anunță pornirea, pauza, reluarea și resetarea",
    "set.metronome": "Tic de metronom",
    "set.metronomeDesc": "Sunet discret în fiecare secundă",
    "set.sectionVoice": "Motor de sinteză vocală",
    "set.voiceOutput": "Ieșire audio pentru voce",
    "set.voiceloading": "Se încarcă vocile dispozitivului...",
    "set.voicenone": "Nu s-a găsit nicio voce pe acest dispozitiv (sinteza vocală nu este disponibilă)",
    "set.language": "Limba aplicației și a vocii",
    "set.languageDesc": "Folosită pentru textele din interfață și anunțurile vocale",
    "set.rate": "Viteza vorbirii",
    "set.pitch": "Înălțimea vocii",
    "set.testvoice": "Testează vocea",
    "set.sectionExpired": "Expirarea timpului",
    "set.completeSound": "Sunet de finalizare",
    "snd.whistle": "Fluier de arbitru 📢", "snd.bell": "Gong de box 🥊",
    "snd.alarm": "Alarmă sportivă digitală 🚨", "snd.chime": "Carillon marimba delicat ✨",
    "snd.none": "Mut / doar voce 🔇",
    "set.speakText": "Text rostit la final",
    "set.openQR": "Deschide pe telefon prin cod QR",
    "kp.title": "Setează durata",
    "kp.set": "Setează temporizatorul",
    "modal.share.title": "Deschide pe telefon / Distribuie",
    "sh.desc": "Scanează acest cod QR cu camera telefonului pentru a-l deschide instantaneu:",
    "sh.copy": "Copiază textul",
    "sh.sheet": "Distribuie",
    "alert.needDuration": "Setează mai întâi o durată înainte de a salva un preset.",
    "prompt.presetName": "Numele presetului:",
    "prompt.presetDefault": "Antrenament",
    "alert.copied": "Copiat în clipboard!",
    "confirm.deletePreset": "Sigur dorești să ștergi presetul „{name}”?",
    "digits.h": "h", "digits.m": "m", "digits.s": "s",
    "sp.go": "Start!",
    "sp.timerPaused": "Temporizator în pauză",
    "sp.paused": "În pauză",
    "sp.resumed": "Reluat",
    "sp.swStarted": "Cronometrul a pornit",
    "sp.timeupDefault": "Timpul s-a scurs!",
    "sp.remainingTpl": "Mai rămân {phrase}",
    "sp.elapsedTpl": "Au trecut {phrase}",
    "u.hour": ["oră", "ore"],
    "u.minute": ["minut", "minute"],
    "u.second": ["secundă", "secunde"],
    "sp.lapTpl": "Turul {n}, {sec} secunde",
    "sp.totalTpl": "Timp total {phrase}",
    "sp.test": "Aceasta este o probă audio pentru vocea temporizatorului. Pe locuri, fiți gata, start!"
  };

  /* ================================================================
   * Public API
   * ============================================================== */
  const SUPPORTED = ['en', 'es', 'de', 'fr', 'ru', 'zh', 'ro'];

  // Language names shown in the selector — always in their own language.
  const NAMES = {
    en: 'English', es: 'Español', de: 'Deutsch',
    fr: 'Français', ru: 'Русский', zh: '中文 (Mandarin)', ro: 'Română'
  };

  function primarySubtag(tag) {
    return String(tag || '').trim().split(/[-_]/)[0].toLowerCase();
  }

  window.AppI18N = {
    lang: 'en',
    SUPPORTED,
    NAMES,

    /** Detect & apply initial language (localStorage > stored voice > navigator) */
    init() {
      let stored = null;
      try { stored = localStorage.getItem('app_lang'); } catch (e) { /* ignore */ }

      if (stored && SUPPORTED.includes(stored)) {
        this.lang = stored;
      } else {
        // If the user already picked a specific TTS voice, follow that voice's
        // language so speech behaviour stays consistent after this upgrade.
        let voiceLang = null;
        try { voiceLang = localStorage.getItem('sound_voice_lang'); } catch (e) { /* ignore */ }
        if (voiceLang && SUPPORTED.includes(primarySubtag(voiceLang))) {
          this.lang = primarySubtag(voiceLang);
        } else {
          const nav = primarySubtag(navigator.language || 'en');
          this.lang = SUPPORTED.includes(nav) ? nav : 'en';
        }
      }

      document.documentElement.setAttribute('lang', this.lang);
      this.applyDOM();
    },

    /**
     * Translate a key, with optional "{param}" substitution.
     * Falls back to English, then to the raw key.
     */
    t(key, params) {
      const dict = DICTS[this.lang] || DICTS.en;
      let s = Object.prototype.hasOwnProperty.call(dict, key)
        ? dict[key]
        : DICTS.en[key];
      if (s === undefined || s === null) return key;
      if (params) {
        for (const k in params) {
          s = String(s).split('{' + k + '}').join(String(params[k]));
        }
      }
      return s;
    },

    /**
     * Pluralized time unit word: AppI18N.unit(3, 'u.minute') -> "minutes"
     * Handles Russian 3-form plurals and Chinese (no plural forms).
     */
    unit(n, key) {
      const dict = DICTS[this.lang] || DICTS.en;
      const forms = Object.prototype.hasOwnProperty.call(dict, key)
        ? dict[key]
        : DICTS.en[key];
      if (!Array.isArray(forms)) return '';
      if (forms.length === 1) return forms[0];
      if (this.lang === 'ru') {
        const m = n % 10;
        const h = Math.floor(n / 10) % 10;
        if (m === 1 && h !== 1) return forms[0];
        if (m >= 2 && m <= 4 && h !== 1) return forms[1];
        return forms[2];
      }
      return n === 1 ? forms[0] : forms[forms.length - 1];
    },

    /**
     * Change app + voice language at runtime:
     * persists it, re-translates the DOM and retargets the speech engine.
     */
    setLang(lang) {
      if (!SUPPORTED.includes(lang)) return false;
      this.lang = lang;
      try { localStorage.setItem('app_lang', lang); } catch (e) { /* ignore */ }
      document.documentElement.setAttribute('lang', lang);
      this.applyDOM();
      // Retarget voice announcements to the new language
      if (window.soundEngine && typeof window.soundEngine.setPreferredLang === 'function') {
        window.soundEngine.setPreferredLang(lang);
      }
      return true;
    },

    /** Re-apply translations to all tagged DOM elements */
    applyDOM() {
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        el.textContent = this.t(el.getAttribute('data-i18n'));
      });
      document.querySelectorAll('[data-i18n-title]').forEach((el) => {
        el.setAttribute('title', this.t(el.getAttribute('data-i18n-title')));
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        el.setAttribute('placeholder', this.t(el.getAttribute('data-i18n-placeholder')));
      });
    },

    /**
     * Returns true if `text` equals a default "time is up" phrase in ANY
     * supported language (or the legacy hard-coded default). Used so that a
     * user who never customized the expiry phrase automatically gets it in
     * the selected language.
     */
    isGenericExpiry(text) {
      if (!text) return false;
      const t = String(text).trim().toLowerCase();
      if (t === 'timer has expired!') return true; // legacy default
      for (const code of Object.keys(DICTS)) {
        const d = DICTS[code]['sp.timeupDefault'];
        if (d && String(d).toLowerCase() === t) return true;
      }
      return false;
    },

    /** Resolve the expiry text to speak, localizing generic defaults */
    resolveExpiry(text) {
      if (!text) return text;
      return this.isGenericExpiry(text) ? this.t('sp.timeupDefault') : text;
    }
  };

  // Auto-initialize (script sits at end of <body>, so the DOM is ready)
  window.AppI18N.init();
})();
