# Speaking Timer & Stopwatch — Local Web Server for Mobile Testing
# Uses TcpListener (Zero admin permissions required, works on standard non-admin accounts)

$port = 8080
$folder = $PSScriptRoot

# Get local Wi-Fi and Tailscale IP addresses
$wifiIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.InterfaceAlias -notlike "*Loopback*" -and 
    $_.InterfaceAlias -notlike "*Tailscale*" -and 
    $_.IPAddress -notlike "169.254.*" 
} | Select-Object -First 1).IPAddress

$tailscaleIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.InterfaceAlias -like "*Tailscale*" -or 
    $_.IPAddress -like "100.*" 
} | Select-Object -First 1).IPAddress

if (-not $wifiIp) { $wifiIp = "localhost" }

try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
    $listener.Start()
} catch {
    # If 8080 is occupied, try 8081
    $port = 8081
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
    $listener.Start()
}

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   Speaking Timer & Stopwatch is Live!                 " -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host " PC Browser       : http://localhost:$port" -ForegroundColor Yellow
if ($wifiIp -and $wifiIp -ne "localhost") {
    Write-Host " Local Wi-Fi      : http://$($wifiIp):$port" -ForegroundColor Yellow
}
if ($tailscaleIp) {
    Write-Host " Tailscale Access : http://$($tailscaleIp):$port" -ForegroundColor Magenta
    Write-Host " (Works anywhere via Tailscale app or MagicDNS)" -ForegroundColor DarkGray
}
Write-Host " Press Ctrl+C to stop the server." -ForegroundColor DarkGray
Write-Host "=======================================================" -ForegroundColor Cyan

# Open local browser
Start-Process "http://localhost:$port"

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $buffer = New-Object byte[] 4096
            $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
            
            if ($bytesRead -gt 0) {
                $requestText = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $bytesRead)
                $firstLine = ($requestText -split "`r`n")[0]
                $tokens = $firstLine -split " "

                if ($tokens.Length -ge 2) {
                    $reqPath = $tokens[1].TrimStart('/')
                    if ([string]::IsNullOrWhiteSpace($reqPath) -or $reqPath -eq "") {
                        $reqPath = "index.html"
                    }
                    if ($reqPath.Contains("?")) {
                        $reqPath = $reqPath.Substring(0, $reqPath.IndexOf("?"))
                    }

                    $filePath = Join-Path $folder $reqPath
                    if (Test-Path $filePath -PathType Leaf) {
                        $bytes = [System.IO.File]::ReadAllBytes($filePath)
                        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                        $mime = switch ($ext) {
                            ".html" { "text/html; charset=utf-8" }
                            ".css"  { "text/css; charset=utf-8" }
                            ".js"   { "application/javascript; charset=utf-8" }
                            ".json" { "application/json; charset=utf-8" }
                            ".webmanifest" { "application/manifest+json; charset=utf-8" }
                            ".svg"  { "image/svg+xml" }
                            ".png"  { "image/png" }
                            default { "application/octet-stream" }
                        }

                        $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
                        $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                        $stream.Write($headerBytes, 0, $headerBytes.Length)
                        $stream.Write($bytes, 0, $bytes.Length)
                    } else {
                        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                        $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($msg.Length)`r`nConnection: close`r`n`r`n"
                        $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                        $stream.Write($headerBytes, 0, $headerBytes.Length)
                        $stream.Write($msg, 0, $msg.Length)
                    }
                    $stream.Flush()
                }
            }
        } catch {
            # Ignore client disconnect / socket reset errors and keep running
        } finally {
            if ($client) {
                $client.Close()
            }
        }
    }
} finally {
    $listener.Stop()
}
