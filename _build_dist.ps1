$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

$html    = [System.IO.File]::ReadAllText("$root\index.html",      [System.Text.Encoding]::UTF8)
$css     = [System.IO.File]::ReadAllText("$root\css\style.css",   [System.Text.Encoding]::UTF8)
$jsAudio = [System.IO.File]::ReadAllText("$root\js\audio.js",     [System.Text.Encoding]::UTF8)
$jsTmr   = [System.IO.File]::ReadAllText("$root\js\timer.js",     [System.Text.Encoding]::UTF8)
$jsSw    = [System.IO.File]::ReadAllText("$root\js\stopwatch.js", [System.Text.Encoding]::UTF8)
$jsApp   = [System.IO.File]::ReadAllText("$root\js\app.js",       [System.Text.Encoding]::UTF8)
$jsI18n  = [System.IO.File]::ReadAllText("$root\js\i18n.js",      [System.Text.Encoding]::UTF8)

# strip external source refs
$html = $html -replace '<link\s+rel="stylesheet"\s+href="css/style\.css"[^>]*/?\s*>', ''
$html = $html -replace '<script\s+src="js/i18n\.js"\s*></script>', ''
$html = $html -replace '<script\s+src="js/audio\.js"\s*></script>', ''
$html = $html -replace '<script\s+src="js/timer\.js"\s*></script>', ''
$html = $html -replace '<script\s+src="js/stopwatch\.js"\s*></script>', ''
$html = $html -replace '<script\s+src="js/app\.js"\s*></script>', ''
$html = $html -replace '<link\s+rel="manifest"\s+href="manifest\.webmanifest"[^>]*/?>', ''

# bundle CDN assets
function Read-Vendor([string]$name) {
    $p = "$root\vendor\$name"
    if (Test-Path $p) { return [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8) }
    throw "Missing vendor/$name - run fetch-vendor.ps1"
}
$twJs    = Read-Vendor 'tailwind.js'
$luJs    = Read-Vendor 'lucide.js'
$fontsCss= Read-Vendor 'fonts.css'

$html = $html.Replace('<script src="https://cdn.tailwindcss.com"></script>', ("<script>" + $twJs + "</script>"))
$html = $html.Replace('<script src="https://unpkg.com/lucide@latest"></script>', ("<script>" + $luJs + "</script>"))
$html = $html -replace '<link[^>]*fonts\.googleapis\.com[^>]*/?>', ''
$html = $html -replace '<link\s+rel="preconnect"\s+href="https://fonts\.(googleapis|gstatic)\.com"[^>]*/?\s*>', ''

# manifest data uri
$manifestRaw = [System.IO.File]::ReadAllText("$root\manifest.webmanifest", [System.Text.Encoding]::UTF8)
$manifestCompact = ($manifestRaw -replace "`r?`n", "" -replace "\s+", " ").Trim()
$manifestLink = '<link rel="manifest" href="data:application/manifest+json,' + [System.Uri]::EscapeDataString($manifestCompact) + '">'

$cssBlock = "<style>`n" + $css + "`n</style>"
$fontsBlock = "<style>`n" + $fontsCss + "`n</style>"

# Assemble head: fonts style + main css + manifest, before </head>
$headSuffix = $fontsBlock + "`n" + $cssBlock + "`n" + $manifestLink + "`n</head>"
$html = $html.Replace('</head>', $headSuffix)

# inline js before body
$jsBlock = "<script>`n" +
           "/* === i18n.js === */`n" + $jsI18n + "`n" +
           "/* === audio.js === */`n" + $jsAudio + "`n" +
           "/* === timer.js === */`n" + $jsTmr   + "`n" +
           "/* === stopwatch.js === */`n" + $jsSw + "`n" +
           "/* === app.js === */`n" + $jsApp  + "`n" +
           "</script>"
$html = $html.Replace('</body>', "`n" + $jsBlock + "`n</body>")

$distDir = "$root\dist"
if (!(Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir | Out-Null }
$outFile = "$distDir\voice-timer.html"
[System.IO.File]::WriteAllText($outFile, $html, (New-Object System.Text.UTF8Encoding($false)))

foreach ($f in @('sw.js', 'manifest.webmanifest')) {
    if (Test-Path "$root\$f") { Copy-Item "$root\$f" "$distDir\$f" -Force }
}
if (Test-Path "$root\icons") {
    if (!(Test-Path "$distDir\icons")) { New-Item -ItemType Directory -Path "$distDir\icons" | Out-Null }
    Copy-Item "$root\icons\*" "$distDir\icons\" -Force -Recurse
}
Write-Host ("[OK] Built " + (Get-Item $outFile).Length + " bytes")