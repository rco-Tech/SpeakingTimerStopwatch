# ============================================================
# fetch-vendor.ps1 — Download & embed CDN assets so the build
# can produce a single, fully offline-capable HTML file.
# Run ONCE (or whenever you update the CDN versions).
# Writes into: vendor/
#   - vendor/tailwind.js     (runtime Tailwind engine)
#   - vendor/lucide.js       (search/replace icon library)
#   - vendor/fonts.css       (Google Fonts CSS with woff2 embedded as data URIs)
# ============================================================
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$vendor = Join-Path $root 'vendor'
New-Item -ItemType Directory -Path $vendor -Force | Out-Null

function Invoke-Or-Die {
    param([scriptblock]$Script, [string]$What)
    Write-Host "Downloading $What ..." -ForegroundColor Cyan
    & $Script
    if ($LASTEXITCODE -ne 0) { throw "Failed: $What" }
}

# 1) Tailwind Play CDN (runtime compiler)
$tw = Join-Path $vendor 'tailwind.js'
Invoke-Or-Die -What 'Tailwind CDN' -Script {
    curl.exe -sL -o $tw --max-time 180 https://cdn.tailwindcss.com
}
Write-Host "[OK] tailwind.js $((Get-Item $tw).Length) bytes" -ForegroundColor Green

# 2) Lucide icons (UMD build exposes global `lucide`)
$lu = Join-Path $vendor 'lucide.js'
Invoke-Or-Die -What 'Lucide' -Script {
    curl.exe -sL -o $lu --max-time 180 https://unpkg.com/lucide@latest
}
Write-Host "[OK] lucide.js $((Get-Item $lu).Length) bytes" -ForegroundColor Green

# 3) Google Fonts CSS
$fontsCss = Join-Path $vendor 'fonts.css'
$fontUrl = 'https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Chakra+Petch:ital,wght@0,600;0,700;1,700&family=Inter:wght@400;500;600;700&family=Montserrat:wght@800;900&family=Orbitron:wght@600;800;900&family=Permanent+Marker&family=Share+Tech+Mono&family=Bebas+Neue&family=VT323&display=swap'
Invoke-Or-Die -What 'Google Fonts CSS' -Script {
    curl.exe -s -o $fontsCss --max-time 120 -A 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36' $fontUrl
}
Write-Host "[OK] raw fonts.css $((Get-Item $fontsCss).Length) bytes" -ForegroundColor Green

# 4) Download every woff2 and replace the URL with a data URI
$css = [System.IO.File]::ReadAllText($fontsCss)
$urls = [regex]::Matches($css, 'url\((https://[^)]+\.woff2)\)') |
        ForEach-Object { $_.Groups[1].Value } |
        Sort-Object -Unique

Write-Host "Embedding $($urls.Count) woff2 font files ..." -ForegroundColor Cyan
$tried = 0; $ok = 0
foreach ($u in $urls) {
    $tried++
    $file = Join-Path $vendor ("font_tmp_" + $tried + ".woff2")
    curl.exe -sL -o $file --max-time 60 $u
    if ((Test-Path $file) -and ((Get-Item $file).Length -gt 0)) {
        $b64 = [Convert]::ToBase64String([System.IO.File]::ReadAllBytes($file))
        $dataUri = 'data:font/woff2;charset=utf-8;base64,' + $b64
        $escaped = [regex]::Escape($u)
        $css = $css -replace $escaped, $dataUri
        $ok++
    } else {
        Write-Warning "Failed to fetch: $u"
    }
    Remove-Item $file -ErrorAction SilentlyContinue
}

[System.IO.File]::WriteAllText($fontsCss, $css, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "[OK] fonts.css embedded: $ok / $tried fonts, now $((Get-Item $fontsCss).Length) bytes" -ForegroundColor Green
Write-Host "Vendor fetch complete." -ForegroundColor Green