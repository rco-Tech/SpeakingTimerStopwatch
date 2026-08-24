# ⏱️ Speaking Timer & Stopwatch `v1.17`

> ### 🏁 **TL;DR** — A gorgeous, **mobile-first** speaking timer & stopwatch with live voice callouts, live date & time clock, 8 OLED neon themes, 8 customizable LED digital fonts, haptics, wake-lock, and offline PWA capability. No install required — open [`index.html`](index.html) or run standalone!

**Speaking Timer & Stopwatch** is a professional, self-contained web and progressive web application (PWA) designed for fitness training, HIIT, boxing rounds, Tabata intervals, sprint laps, cooking, presentations, and Pomodoro productivity. It combines **real-time text-to-speech voice announcements**, **synthesized audio effects**, **8 OLED neon color palettes**, and **8 digital typography styles** into one ultra-sleek, battery-friendly dark-mode interface.

---

## ✨ Key Features

### 🗣️ Voice & Speech Engine (7 Languages)
- **Periodic Spoken Time Announcements**: Spoken countdown callouts at intervals of `5s`, `10s`, `15s`, `30s`, `1m`, `2m`, `5m`.
- **7 Supported Interface & Voice Languages**:
  - 🇬🇧 English
  - 🇪🇸 Español
  - 🇩🇪 Deutsch
  - 🇫🇷 Français
  - 🇷🇺 Русский
  - 🇨🇳 中文 (Mandarin)
  - 🇷🇴 Română
- **Seamless Language Switching**: Instant 1-tap switching via the header 🌐 Globe icon or Settings. All UI text, tooltips, presets, and voice engines re-target automatically.
- **Pre-Start Countdown**: Spoken *"3, 2, 1, GO!"* with visual overlay on both Timer and Stopwatch.
- **Final Countdown**: Spoken & audible *"5, 4, 3, 2, 1"* before expiration.
- **Synthesized Audio Effects**: Referee Whistle, Boxing Ring Bell, Digital Sports Alarm, Gentle Marimba Chimes, and continuous 1-second Metronome Ticks.
- **Custom Speech Rate & Pitch**: Fine-tune voice speed and pitch with a live "Test Voice" preview.

### 📅 Live Header Clock & Status Bar
- Dynamic live clock displaying current localized **Day of week, Date, and Time** (e.g. `Monday, 24 Aug · 06:24`).
- Prominent header navigation bar with quick toggles for Mute, Language, Color Themes, Fonts, Fullscreen, and Settings.

### 🎨 8 OLED Neon Color Themes
| Theme | Accent Color |
| :--- | :--- |
| ⚡ **Electric Cyan** | `#00e5ff` (Cyberpunk Aqua) |
| 🟢 **Matrix Lime** | `#39ff14` (High-visibility Green) |
| 🟡 **Amber Gold** | `#ffb703` (Warm OLED Gold) |
| 🟣 **Cyberpunk Purple** | `#d946ef` (Deep Neon Violet) |
| 🔴 **Volcanic Crimson** | `#ff0055` (Intense Sport Red) |
| 🟠 **Sunset Orange** | `#ff6b00` (Energetic Orange) |
| 🌸 **Sakura Pink** | `#ff2a85` (Vibrant Magenta) |
| ⚪ **Ice White** | `#ffffff` (Crisp Clean Monochrome) |

### 🔤 8 Digital Typography Styles
| Style | Font Family | Character |
| :--- | :--- | :--- |
| **Military Stencil** | `Black Ops One` | Bold, rugged tactical look |
| **8-Bit Pixel** | `VT323` | Retro arcade scoreboard |
| **7-Segment LCD** | `Share Tech Mono` | Classic digital stopwatch |
| **Orbitron LED** | `Orbitron` | Sci-Fi futuristic HUD |
| **Chunky Sport** | `Chakra Petch` | Modern athletic gym timer |
| **Athletic Timer** | `Bebas Neue` | Heavy condensed stadium digits |
| **Handwritten Marker** | `Permanent Marker` | Casual whiteboard timer |
| **Modern Minimalist** | `Montserrat` | Clean, bold contemporary aesthetic |

*Note: Main digits and millisecond units share the identical font style for a cohesive display.*

### ⏱️ Millisecond Stopwatch & Lap Analytics
- Centisecond & millisecond precision with continuous 1-second metronome ticking option.
- Automatic **fastest (green badge)** and **slowest (red badge)** lap detection.
- Spoken lap splits and cumulative elapsed time announcements.
- One-tap **Copy & Share** formatted lap breakdown (clipboard & native share sheet).

### 📱 Mobile-First, Touch & PWA Ready
- **Screen Wake Lock**: Prevents phone screens from sleeping during active workouts.
- **Haptic Vibration**: Tactile feedback on button presses, intervals, and lap splits.
- **Digital Touch Keypad**: Fast, intuitive time entry modal.
- **Safeguarded Quick Presets**: Built-in presets (HIIT, Rest, Plank, Boxing, Coffee/Tea, Pomodoro) + custom presets with safe delete confirmation.
- **Offline Service Worker (`v15`)**: Automatic cache updates on launch.

---

## 🚀 Getting Started

### Option A — Instant Browser Launch (Zero Install)
Open **[`index.html`](index.html)** in any modern browser (Chrome, Edge, Safari, Firefox).

### Option B — Run on Mobile over Wi-Fi
1. In PowerShell from the project folder:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\serve.ps1
   ```
2. Open the printed LAN URL on your phone or scan the QR code.
3. Tap **"Add to Home Screen"** to install as a fullscreen, offline PWA.

### Option C — Standalone Single-File Bundle
Run `build.ps1` to produce [`dist/voice-timer.html`](dist/voice-timer.html) (self-contained with inlined fonts, CSS, Lucide icons, Tailwind, and JS).

---

## 🏬 App Store Packaging & Publishing Guide

This application is built according to Progressive Web App (PWA) best practices, making it directly packageable for major app stores:

### 1. Google Play Store (Android)
- **Method**: Trusted Web Activity (TWA) via [PWABuilder](https://www.pwabuilder.com/) or Google's [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap).
- **Steps**:
  1. Deploy the repository to a secure HTTPS domain (e.g. GitHub Pages).
  2. Enter the URL into [PWABuilder](https://www.pwabuilder.com/) or run:
     ```bash
     npx @bubblewrap/cli init --manifest=https://<your-domain>/manifest.webmanifest
     npx @bubblewrap/cli build
     ```
  3. Sign the generated `.aab` (Android App Bundle) with your Google Play release key and upload to Google Play Console.
- **Required Permissions**: VIBRATE, WAKE_LOCK (declared automatically in `manifest.webmanifest`).

### 2. Microsoft Store (Windows 10 / 11)
- **Method**: Windows App Package (MSIX) generated via [PWABuilder](https://www.pwabuilder.com/).
- **Steps**:
  1. Generate the Windows package on PWABuilder.
  2. Submit the resulting `.msixbundle` to the Microsoft Partner Center.

### 3. Apple App Store (iOS / iPadOS / macOS)
- **Method**: Wrap in a WebKit container using [Capacitor](https://capacitorjs.com/) or distribute as a Safari Progressive Web App (Add to Home Screen).
- **Capacitor command**:
  ```bash
  npx @capacitor/cli create
  npx cap add ios
  npx cap open ios
  ```

---

## 📋 Store Listing Metadata

| Field | Content |
| :--- | :--- |
| **App Title** | Speaking Voice Timer & Stopwatch |
| **Short Description** | Voice-guided interval timer & stopwatch with spoken countdowns, OLED themes & LED fonts. |
| **Category** | Health & Fitness / Sports / Productivity |
| **Age Rating** | Everyone (4+) |
| **Keywords** | voice timer, speaking timer, interval timer, workout timer, HIIT, tabata, boxing timer, stopwatch, lap timer, pomodoro, metronome, fitness timer |

---

## 🔒 Privacy Policy

**Effective Date:** August 2026

**Speaking Timer & Stopwatch** is designed with a strict **privacy-first** architecture:
1. **Zero Data Collection**: The application does not collect, transmit, store, or sell any personal data, usage analytics, or device identifiers.
2. **100% Local Execution**: All timers, stopwatches, speech synthesis, sound effects, and user preferences (language, theme, font, custom presets) are processed and stored exclusively on your device using local browser storage (`localStorage`).
3. **No Third-Party Trackers or Cookies**: There are no tracking scripts, advertising SDKs, or analytics cookies integrated into this application.
4. **Offline Capability**: The application operates completely offline without requiring an active internet connection after initial download.

---

## ⚠️ Disclaimer

1. **Health & Fitness**: This application is provided as a utility tool for timing, sports training, and interval management. Users should consult a qualified physician before undertaking strenuous physical training or workout routines. Use at your own discretion and physical capacity.
2. **Speech Synthesis Compatibility**: Voice pronunciation and naturalness depend on the text-to-speech (TTS) engines and voice packs installed on your operating system or browser.
3. **Trademarks & Attribution**: PayPal and the PayPal logo are registered trademarks of PayPal, Inc. All other product names, trademarks, and registered trademarks are property of their respective owners.

---

## 🗂️ Project Structure

```
├── index.html            # Main single-page web app
├── css/style.css         # OLED themes, typography styles, animations
├── js/
│   ├── app.js            # App state, DOM wiring, live clock, PWA lifecycle
│   ├── audio.js          # Web Audio synth + Web Speech voice engine
│   ├── i18n.js           # 7-language translation dictionaries & pluralization
│   ├── timer.js          # Countdown logic, voice scheduling & presets
│   └── stopwatch.js      # Centisecond stopwatch, lap analytics & metronome
├── manifest.webmanifest  # PWA manifest with theme colors & icons
├── sw.js                 # Offline Service Worker (Cache v15)
├── icons/                # High-res PWA app icons & assets
├── vendor/               # Offline CDN bundles (Tailwind, Lucide, Google Fonts)
├── dist/                 # Production-ready distribution folder
├── build.ps1             # Main build script (inlines all code into standalone bundle)
├── _build_dist.ps1       # Lightweight distribution builder
├── serve.ps1             # Local LAN HTTP server for testing on mobile devices
└── README.md             # Documentation, store packaging guide & disclaimers
```

---

## ☕ Support & Maintainer

- **Developer & Maintainer**: **rcoTech**
- **Support / Buy Me a Coffee**: [PayPal Support Link](https://www.paypal.com/qrcodes/p2pqrc/ESZLVV5QEGCAY)
- **License**: Open for personal, educational, and fitness use.