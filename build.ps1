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
$jsI18n  = [System.IO.File]::ReadAllText("$root\js\i18n.js",     [System.Text.Encoding]::UTF8)

# --- Strip external file references ---
$html = $html -replace '<link\s+rel="stylesheet"\s+href="css/style\.css"[^>]*/?\s*>', ''
$html = $html -replace '<script\s+src="js/i18n\.js"\s*></script>', ''
$html = $html -replace '<script\s+src="js/audio\.js"\s*></script>', ''
$html = $html -replace '<script\s+src="js/timer\.js"\s*></script>', ''
$html = $html -replace '<script\s+src="js/stopwatch\.js"\s*></script>', ''
$html = $html -replace '<script\s+src="js/app\.js"\s*></script>', ''
# Strip the source manifest link; a self-contained data-URI manifest is inserted later
$html = $html -replace '<link\s+rel="manifest"\s+href="manifest\.webmanifest"[^>]*/?>', ''

# --- Bundle CDN assets (vendor/) so the output is fully offline-capable ---
$vendorDir = "$root\vendor"
if (Test-Path "$vendorDir\tailwind.js") {
    $twJs = [System.IO.File]::ReadAllText("$vendorDir\tailwind.js", [System.Text.Encoding]::UTF8)
    # Use literal String.Replace — PowerShell -replace would interpret the '$' sequences
    # inside the minified JS as regex backreferences and corrupt/duplicate the doc.
    $html = $html.Replace('<script src="https://cdn.tailwindcss.com"></script>', ("<script>" + $twJs + "</script>"))
    Write-Host "[OK] Inlined Tailwind CDN" -ForegroundColor Green
} else {
    Write-Warning "vendor\tailwind.js not found - Tailwind will NOT be bundled (run fetch-vendor.ps1)."
}

if (Test-Path "$vendorDir\lucide.js") {
    $luJs = [System.IO.File]::ReadAllText("$vendorDir\lucide.js", [System.Text.Encoding]::UTF8)
    $html = $html.Replace('<script src="https://unpkg.com/lucide@latest"></script>', ("<script>" + $luJs + "</script>"))
    Write-Host "[OK] Inlined Lucide CDN" -ForegroundColor Green
} else {
    Write-Warning "vendor\lucide.js not found - Lucide will NOT be bundled (run fetch-vendor.ps1)."
}

if (Test-Path "$vendorDir\fonts.css") {
    $fontsCss = [System.IO.File]::ReadAllText("$vendorDir\fonts.css", [System.Text.Encoding]::UTF8)
    # Remove Google Fonts <link> and its <link rel="preconnect"> entries (replacement has no '$', safe with -replace)
    $html = $html -replace '<link[^>]*fonts\.googleapis\.com[^>]*/?>', ''
    $html = $html -replace '<link\s+rel="preconnect"\s+href="https://fonts\.(googleapis|gstatic)\.com"[^>]*/?\s*>', ''
    # Inline fonts as <style> right before </head> (collected with the main CSS below)
    $html = $html.Replace('</head>', "`n<style>`n" + $fontsCss + "`n</style>`n</head>")
    Write-Host "[OK] Inlined Google Fonts (embedded woff2)" -ForegroundColor Green
} else {
    Write-Warning "vendor\fonts.css not found - fonts will NOT be bundled (run fetch-vendor.ps1)."
}

# --- Inline CSS before </head> ---
$cssBlock = "<style>`n" + $css + "`n</style>"

# Inline PWA manifest (data URI) so the standalone file is a self-contained installable PWA
$manifestRaw = [System.IO.File]::ReadAllText("$root\manifest.webmanifest", [System.Text.Encoding]::UTF8)
$manifestCompact = ($manifestRaw -replace "`r?`n", "" -replace "\s+", " ").Trim()
$manifestLink = '<link rel="manifest" href="data:application/manifest+json,' + [System.Uri]::EscapeDataString($manifestCompact) + '">'

$html = $html.Replace('</head>', $cssBlock + "`n" + $manifestLink + "`n</head>")

# --- Inline JS before </body> ---
$jsBlock = "<script>`n" +
           "/* === i18n.js === */`n" + $jsI18n + "`n" +
           "/* === audio.js === */`n" + $jsAudio + "`n" +
           "/* === timer.js === */`n" + $jsTmr   + "`n" +
           "/* === stopwatch.js === */`n" + $jsSw + "`n" +
           "/* === app.js === */`n" + $jsApp  + "`n" +
           "</script>"
$html = $html.Replace('</body>', $jsBlock + "`n</body>")

# --- Inline images for standalone bundle ---
if (Test-Path "$root\icons\paypal-qr.png") {
    $qrBytes = [System.IO.File]::ReadAllBytes("$root\icons\paypal-qr.png")
    $qrBase64 = [System.Convert]::ToBase64String($qrBytes)
    $html = $html.Replace('src="icons/paypal-qr.png"', "src=""data:image/png;base64,$qrBase64""")
}

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

# Build complete summary
Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host " Build Complete - Distribution Ready" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host " Standalone file : dist\voice-timer.html ($sizeKB KB)" -ForegroundColor Yellow
Write-Host " PWA directory   : dist\ (includes icons, manifest, sw.js)" -ForegroundColor White
Write-Host ""
Write-Host " To test locally : powershell -ExecutionPolicy Bypass -File .\serve.ps1" -ForegroundColor DarkGray
Write-Host "=======================================================" -ForegroundColor Cyan

