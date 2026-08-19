# ⏱️ Speaking Timer & Stopwatch

A beautiful, high-performance, mobile-first **Speaking Timer & Stopwatch** web application. Designed with an ultra-sleek OLED dark mode aesthetic, real-time voice announcements, custom interval alerts, 8 LED typography styles, 8 neon color themes, haptic vibration, and Screen Wake Lock.

---

## 🌟 Key Features

1. **🗣️ Voice & Audio Synthesis (Web Speech + Web Audio API)**:
   - Voice announcements on configurable intervals (every 5s, 10s, 15s, 30s, 1m, 2m, etc.).
   - Pre-start countdown ("3, 2, 1, GO!").
   - Final 5-second countdown ("5, 4, 3, 2, 1").
   - Realistic synthesized sound effects: **Referee Whistle**, **Boxing Ring Bell**, **Digital Alarm**, **Gentle Marimba Chimes**, and **Metronome Ticks**.
   - Select device TTS voice, adjust speech rate / pitch with a live "Test Voice" preview.

2. **🎨 8 OLED Neon Color Themes**:
   - ⚡ Electric Cyan
   - 🟡 Vibrant Amber Gold
   - 🟢 Neon Matrix Lime
   - 🟣 Cyberpunk Purple
   - 🔴 Volcanic Crimson
   - 🟠 Sunset Orange
   - 🌸 Sakura Pink
   - ⚪ Monolith Ice White

3. **🔤 8 Digital Typography Styles**:
   - Military Stencil (`Black Ops One`)
   - 8-Bit Pixel Matrix (`VT323`)
   - 7-Segment Monospace LCD (`Share Tech Mono`)
   - Sci-Fi Orbitron LED (`Orbitron`)
   - Sport Chunky Display (`Chakra Petch`)
   - Athletic Bold Timer (`Bebas Neue`)
   - Handwritten Marker (`Permanent Marker`)
   - Modern Minimalist Heavy (`Montserrat`)

4. **📱 Phone-Optimized & PWA Ready**:
   - **Screen Wake Lock**: Prevents your phone screen from sleeping during workouts.
   - **Haptic Vibration**: Physical feedback on every tap, interval, and lap.
   - **Installable PWA**: Tap "Add to Home Screen" in Safari (iOS) or Chrome (Android) to use it as a standalone app.
   - **Touch Keypad**: Tap the digits to open a custom numeric keypad.
   - **Workout Presets**: Quick buttons for HIIT, Tabata, Plank, Boxing, Tea, and Pomodoro focus + custom preset creation.

5. **⏱️ Millisecond Stopwatch & Lap Analytics**:
   - High precision lap timing.
   - Automatic fastest lap (green) & slowest lap (red) detection.
   - Speak lap split times and total elapsed times.
   - Export / Copy / Share workout lap summaries.

---

## 🚀 How to Run & Use on Your Phone

### Option A: Open directly in your browser
Simply double-click [`index.html`](file:///C:/Projects/Antigravity/speaking-timer-stopwatch/index.html) or open it in Chrome, Edge, Safari, or Firefox.

### Option B: Open on your Phone over Wi-Fi
1. Open PowerShell and run:
   ```powershell
   cd C:\Projects\Antigravity\speaking-timer-stopwatch
   powershell -ExecutionPolicy Bypass -File .\serve.ps1
   ```
2. The terminal will display your phone access link (e.g. `http://192.168.1.xxx:8080`).
3. Open that URL on your phone's browser, or scan the built-in QR code!
4. Tap **"Add to Home Screen"** in your phone's browser to install it as a standalone fullscreen app.
