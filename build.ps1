param()
# ============================================================
# Speaking Timer & Stopwatch - Build Script
# ============================================================
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

Write-Host ""
Write-Host "Building standalone bundle..." -ForegroundColor Cyan

# --- Read source files ---
$html    = [System.IO.File]::ReadAllText("$root\index.html",     [System.Text.Encoding]::UTF8)
$css     = [System.IO.File]::ReadAllText("$root\css\style.css",  [System.Text.Encoding]::UTF8)
$jsAudio = [System.IO.File]::ReadAllText("$root\js\audio.js",    [System.Text.Encoding]::UTF8)
$jsTmr   = [System.IO.File]::ReadAllText("$root\js\timer.js",    [System.Text.Encoding]::UTF8)
$jsSw    = [System.IO.File]::ReadAllText("$root\js\stopwatch.js",[System.Text.Encoding]::UTF8)
$jsApp   = [System.IO.File]::ReadAllText("$root\js\app.js",      [System.Text.Encoding]::UTF8)

# --- Strip external file references ---
$html = $html -replace '<link\s+rel="stylesheet"\s+href="css/style\.css"[^>]*/?\s*>', ''
$html = $html -replace '<script\s+src="js/audio\.js"\s*></script>', ''
$html = $html -replace '<script\s+src="js/timer\.js"\s*></script>', ''
$html = $html -replace '<script\s+src="js/stopwatch\.js"\s*></script>', ''
$html = $html -replace '<script\s+src="js/app\.js"\s*></script>', ''
# (the source <link rel="manifest"> is replaced by an inline data-URI manifest later)

# --- Inline CSS before </head> ---
$cssBlock = "<style>`n" + $css + "`n</style>"

# Inline PWA manifest (data URI) so the standalone file is a self-contained installable PWA
$manifestRaw = [System.IO.File]::ReadAllText("$root\manifest.webmanifest", [System.Text.Encoding]::UTF8)
$manifestCompact = ($manifestRaw -replace "`r?`n", "" -replace "\s+", " ").Trim()
$manifestLink = '<link rel="manifest" href="data:application/manifest+json,' + [System.Uri]::EscapeDataString($manifestCompact) + '">'

$html = $html.Replace('</head>', $cssBlock + "`n" + $manifestLink + "`n</head>")

# --- Inline JS before </body> ---
$jsBlock = "<script>`n" +
           "/* === audio.js === */`n" + $jsAudio + "`n" +
           "/* === timer.js === */`n" + $jsTmr   + "`n" +
           "/* === stopwatch.js === */`n" + $jsSw + "`n" +
           "/* === app.js === */`n" + $jsApp  + "`n" +
           "</script>"
$html = $html.Replace('</body>', $jsBlock + "`n</body>")

# --- Write output ---
$distDir = "$root\dist"
if (!(Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir | Out-Null }
$outFile = "$distDir\voice-timer.html"
[System.IO.File]::WriteAllText($outFile, $html, [System.Text.Encoding]::UTF8)
$sizeKB = [math]::Round((Get-Item $outFile).Length / 1KB, 1)

Write-Host "[OK] Standalone file: dist\voice-timer.html ($sizeKB KB)" -ForegroundColor Green
Write-Host "     Copy to Android phone, open in Chrome - works offline!" -ForegroundColor DarkGray

# --- Deploy companion PWA files so the dist folder is a complete, offline-capable deployment ---
foreach ($f in @("sw.js", "manifest.webmanifest")) {
    if (Test-Path "$root\$f") { Copy-Item "$root\$f" "$distDir\$f" -Force }
}
$iconsSrc = "$root\icons"
if (Test-Path $iconsSrc) {
    if (!(Test-Path "$distDir\icons")) { New-Item -ItemType Directory -Path "$distDir\icons" | Out-Null }
    Copy-Item "$iconsSrc\*" "$distDir\icons\" -Force -Recurse
}
Write-Host "[OK] Deployed sw.js, manifest.webmanifest and icons into $distDir" -ForegroundColor Green

# ============================================================
# Git / GitHub Setup
# ============================================================
Write-Host ""
Write-Host "Setting up Git repository..." -ForegroundColor Cyan

$gitPath = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitPath) {
    Write-Host ""
    Write-Host "[!] Git not found. Install from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "    Then re-run this script." -ForegroundColor DarkGray
    exit 0
}

Push-Location $root

if (!(Test-Path ".git")) {
    git init -b main
    Write-Host "[OK] Git repo initialised (branch: main)" -ForegroundColor Green
} else {
    Write-Host "[INFO] Git repo already exists" -ForegroundColor DarkGray
}

# .gitignore
$gitignore = "# Local server`n*.log`n`n# Editors`n.vscode/`n.idea/`n`n# Windows`nThumbs.db`ndesktop.ini`n"
[System.IO.File]::WriteAllText("$root\.gitignore", $gitignore, [System.Text.Encoding]::UTF8)

# Update manifest for GitHub Pages subdirectory
$manifestPath = "$root\manifest.webmanifest"
$manifest = [System.IO.File]::ReadAllText($manifestPath) | ConvertFrom-Json
$manifest | Add-Member -MemberType NoteProperty -Name 'scope'    -Value '/SpeakingTimerStopwatch/' -Force
$manifest | Add-Member -MemberType NoteProperty -Name 'start_url'-Value '/SpeakingTimerStopwatch/' -Force
$manifestJson = $manifest | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText($manifestPath, $manifestJson, [System.Text.Encoding]::UTF8)
Write-Host "[OK] manifest.webmanifest updated for GitHub Pages" -ForegroundColor Green

# Bump service worker cache version
$swContent = [System.IO.File]::ReadAllText("$root\sw.js")
$swContent = $swContent -replace "speaking-timer-v\d+", "speaking-timer-v2"
[System.IO.File]::WriteAllText("$root\sw.js", $swContent, [System.Text.Encoding]::UTF8)
Write-Host "[OK] Service worker cache version bumped" -ForegroundColor Green

# Commit everything
git add -A
$commitMsg = "Initial release - Speaking Timer & Stopwatch v1.0"
git commit -m $commitMsg
Write-Host "[OK] Initial commit created" -ForegroundColor Green

# Set remote
$remoteExists = (git remote 2>$null) -contains 'origin'
if (-not $remoteExists) {
    git remote add origin "https://github.com/rco-Tech/SpeakingTimerStopwatch.git"
    Write-Host "[OK] Remote 'origin' added: rco-Tech/SpeakingTimerStopwatch" -ForegroundColor Green
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host " Next Steps - Push to GitHub and Enable Pages" -ForegroundColor White
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " 1. Create repo at https://github.com/new" -ForegroundColor Yellow
Write-Host "    Name:   SpeakingTimerStopwatch" -ForegroundColor White
Write-Host "    Owner:  rco-Tech" -ForegroundColor White
Write-Host "    Visibility: Public" -ForegroundColor White
Write-Host "    (do NOT add README, .gitignore, or license)" -ForegroundColor DarkGray
Write-Host ""
Write-Host " 2. Push the code:" -ForegroundColor Yellow
Write-Host "    git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host " 3. Enable GitHub Pages:" -ForegroundColor Yellow
Write-Host "    Repo -> Settings -> Pages -> Source: main / (root) -> Save" -ForegroundColor White
Write-Host ""
Write-Host " 4. Your live PWA URL (ready in ~60s):" -ForegroundColor Yellow
Write-Host "    https://rco-tech.github.io/SpeakingTimerStopwatch/" -ForegroundColor Cyan
Write-Host ""
Write-Host " 5. On Android: open that URL in Chrome, menu -> Add to Home Screen" -ForegroundColor Yellow
Write-Host "    The app installs and works FULLY OFFLINE!" -ForegroundColor Green
Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan

Pop-Location
