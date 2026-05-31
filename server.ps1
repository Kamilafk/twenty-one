param([int]$Port = 8081)

Add-Type -AssemblyName System.Web
$root = Split-Path -Parent $PSCommandPath

$s = New-Object System.Net.HttpListener
$s.Prefixes.Add("http://localhost:$Port/")

try {
  $s.Start()
  Write-Host "======================================" -ForegroundColor Green
  Write-Host "  Twenty One 1.0 - Demo Server" -ForegroundColor Cyan
  Write-Host "======================================" -ForegroundColor Green
  Write-Host ""
  Write-Host "  Open in your browser:" -ForegroundColor Yellow
  Write-Host "  http://localhost:$Port/" -ForegroundColor White
  Write-Host ""
  Write-Host "  Press Ctrl+C to stop" -ForegroundColor DarkGray
  Write-Host ""

  while ($s.IsListening) {
    $c = $s.GetContext()
    $p = $c.Request.Url.AbsolutePath
    if ($p -eq "/") { $p = "/index.html" }
    $fp = $root + ($p -replace "/", "\")
    if (Test-Path $fp) {
      $bytes = [System.IO.File]::ReadAllBytes($fp)
      $ext = [System.IO.Path]::GetExtension($fp)
      $mime = switch ($ext) {
        ".html" { "text/html; charset=utf-8" }
        ".css"  { "text/css; charset=utf-8" }
        ".js"   { "application/javascript; charset=utf-8" }
        ".png"  { "image/png" }
        ".ico"  { "image/x-icon" }
        ".json" { "application/json" }
        default { "application/octet-stream" }
      }
      $c.Response.ContentType = $mime
      $c.Response.ContentLength64 = $bytes.Length
      $c.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      $c.Response.OutputStream.Close()
      Write-Host "  [200] $p" -ForegroundColor Green
    } else {
      $c.Response.StatusCode = 404
      $c.Response.Close()
      Write-Host "  [404] $p" -ForegroundColor Red
    }
  }
} catch {
  if ($_.Exception.InnerException -match "conflict|Access Denied") {
    Write-Host ""
    Write-Host "  ERROR: Port $Port is already in use!" -ForegroundColor Red
    Write-Host "  Try a different port:" -ForegroundColor Yellow
    Write-Host "  powershell -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Port 8082" -ForegroundColor White
    Write-Host ""
    Write-Host "  Or free the port with:" -ForegroundColor Yellow
    Write-Host "  netsh http delete urlacl url=http://localhost:$Port/" -ForegroundColor White
    Write-Host "  (run as Administrator)" -ForegroundColor DarkGray
  } else {
    throw
  }
} finally {
  if ($s.IsListening) { $s.Stop() }
}
