# ⏱️ Speaking Timer & Stopwatch

> ### 🏁 **TL;DR** — A gorgeous, **mobile-first** speaking timer & stopwatch with live voice callouts, OLED neon themes, customizable LED digital fonts, haptics, and wake-lock. No install required — just open `index.html`.

**Speaking Timer & Stopwatch** is a self-contained web app for workouts, boxing rounds, HIIT, Tabata, Pomodoro focus, and any timed speaking practice. It pairs **real-time TTS voice announcements**, **synthesized alert sounds**, **8 neon themes**, and **8 LED typography styles** into one ultra-sleek OLED dark‑mode interface.

---

## ✨ Key Features

### 🗣️ Voice & Audio Synthesis
- Configurable spoken announcements — every `5s`, `10s`, `15s`, `30s`, `1m`, `2m`, and more.
- **7 interface & voice languages** — English, Español, Deutsch, Français, Русский, 中文 (Mandarin), Română. Switchable in **Settings → App & Voice Language**: it translates the whole UI *and* all spoken announcements (voice auto-selected to match).
- Pre‑start countdown **"3, 2, 1, GO!"** (available on both Timer and Stopwatch) and a final **"5, 4, 3, 2, 1"** countdown.
- Realistic synthesized effects — **Referee Whistle**, **Boxing Ring Bell**, **Digital Alarm**, **Gentle Marimba Chimes**, and **Metronome Ticks**.
- Pick any device TTS voice and tune **rate / pitch** with a live “Test Voice” preview.

### 🎨 8 OLED Neon Color Themes
| Theme | Theme |
| --- | --- |
| ⚡ Electric Cyan | 🟢 Matrix Lime |
| 🟡 Amber Gold | 🟣 Cyberpunk Purple |
| 🔴 Volcanic Crimson | 🟠 Sunset Orange |
| 🌸 Sakura Pink | ⚪ Ice White |

### 🔤 8 Digital Typography Styles
| Style | Font |
| --- | --- |
| Military Stencil | `Black Ops One` |
| 8‑Bit Pixel | `VT323` |
| 7‑Segment LCD | `Share Tech Mono` |
| Orbitron LED | `Orbitron` |
| Chunky Sport | `Chakra Petch` |
| Athletic Timer | `Bebas Neue` |
| Handwritten | `Permanent Marker` |
| Minimalist Heavy | `Montserrat` |

### ⏱️ Millisecond Stopwatch & Lap Analytics
- High‑precision lap timing with automatic **fastest (green) / slowest (red)** lap detection.
- Unified digital font typography across main digits and milliseconds.
- Spoken lap splits and total elapsed times.
- **Copy · Share** workout lap summaries (clipboard + native/share sheet).

### 📱 Phone‑Optimized & PWA Ready
- **Screen Wake Lock** — keeps your phone awake during workouts & practice.
- **Haptic vibration** on every tap, interval, and lap.
- **Touch keypad** for quick digital time entry.
- **Workout presets** — HIIT, Rest Interval, Plank, Boxing, Coffee/Tea, Pomodoro + custom presets.

---

## 🚀 Getting Started

### Option A — Run in your browser (desktop / mobile)
Open **[`index.html`](index.html)** directly in Chrome, Edge, Safari, or Firefox.

### Option B — Use it on your phone over Wi-Fi — ideal for workouts/training
1. In PowerShell, from the project folder:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\serve.ps1
   ```
2. The terminal prints a local network address (e.g. `http://192.168.1.xxx:8080`).
3. Open that link on your phone — or scan the built‑in **QR code**.
4. Tap **“Add to Home Screen”** to install it as a standalone, fullscreen PWA.

### Option C — Deploy to any static host
Upload the whole folder to any static host (GitHub Pages, Netlify, Vercel, etc.). It’s pure HTML/CSS/JS with nothing server‑side required.

---

## 🗂️ Project Structure

```
├── index.html            # Main app (single-page UI)
├── css/style.css         # Themes, typography, animations
├── js/
│   ├── app.js            # App state & orchestration
│   ├── audio.js          # Web Audio synth + effects
│   ├── i18n.js           # UI + voice translations (en/es/de/fr/ru/zh/ro)
│   ├── timer.js          # Countdown & voice scheduling
│   └── stopwatch.js      # Lap stopwatch logic
├── manifest.webmanifest  # PWA manifest (installable app)
├── sw.js                 # PWA service worker
├── vendor/               # Downloaded CDN assets (Tailwind, Lucide, fonts)
├── icons/                # PWA app icons
├── dist/                 # Pre-built snapshot of the app
├── fetch-vendor.ps1      # Downloads CDN assets into vendor/ (run first)
├── build.ps1             # Main build — bundles HTML/CSS/JS into dist/voice-timer.html
├── _build_dist.ps1       # Alternative lightweight build (same output)
├── serve.ps1             # One-command LAN server (phone access)
└── .gitignore
```

> **Note:** Run `fetch-vendor.ps1` once before `build.ps1` so the offline build has the Tailwind, Lucide, and font assets it needs.

## 🛠️ Tech Stack

- **HTML + Tailwind CSS** — responsive, mobile-first UI
- **Google Fonts** — the 8 LED-style font families
- **Web Speech API** — device TTS voice announcements (multi-language)
- **Web Audio API** — synthesized sound effects
- **PWA manifest + service worker** — installable fullscreen app

## 📄 License

Shared for personal & educational use. Built & maintained by **rco-Tech**.