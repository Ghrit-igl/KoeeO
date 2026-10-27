# ------------------------------------------------------
# KoeeO Virtual Science Lab - One-Click Launcher
# ------------------------------------------------------
param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$Test
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$PyExe = if (Test-Path "$Root\.venv\Scripts\python.exe") { "$Root\.venv\Scripts\python.exe" } else { "python" }

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   KoeeO - Holographic Virtual Science Lab   " -ForegroundColor Cyan
Write-Host "   AAYU Engine v1.5.0 | RETER AST Firewall   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Run Tests
if ($Test) {
    Write-Host "[TEST] Running backend tests..." -ForegroundColor Yellow
    Push-Location "$Root\packages\backend"
    & $PyExe -m pytest tests/ -v --tb=short
    Pop-Location
    Write-Host "[TEST] All tests completed successfully!" -ForegroundColor Green
    exit 0
}

# Start Backend
$backendJob = $null
if (-not $FrontendOnly) {
    Write-Host "[BOOT] Starting FastAPI backend on http://localhost:8000..." -ForegroundColor Yellow
    $backendJob = Start-Job -ScriptBlock {
        param($py, $dir)
        Set-Location "$dir\packages\backend"
        & $py -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    } -ArgumentList $PyExe, $Root
    Write-Host "[BOOT] Backend Job ID: $($backendJob.Id)" -ForegroundColor Green
}

# Start Frontend
$frontendJob = $null
if (-not $BackendOnly) {
    Start-Sleep -Seconds 2
    Write-Host "[BOOT] Starting Vite frontend on http://localhost:3000..." -ForegroundColor Yellow
    $frontendJob = Start-Job -ScriptBlock {
        param($dir)
        Set-Location "$dir\packages\frontend"
        npm run dev
    } -ArgumentList $Root
    Write-Host "[BOOT] Frontend Job ID: $($frontendJob.Id)" -ForegroundColor Green
}

Write-Host ""
Write-Host "+-------------------------------------------+" -ForegroundColor Cyan
Write-Host "|  Backend:  http://localhost:8000          |" -ForegroundColor Cyan
Write-Host "|  Frontend: http://localhost:3000          |" -ForegroundColor Cyan
Write-Host "|  Press Ctrl+C to terminate services       |" -ForegroundColor Cyan
Write-Host "+-------------------------------------------+" -ForegroundColor Cyan
Write-Host ""

try {
    while ($true) {
        Start-Sleep -Seconds 1
        if ($backendJob -and $backendJob.State -eq "Failed") {
            Write-Host "[ERROR] Backend service encountered an issue:" -ForegroundColor Red
            Receive-Job $backendJob
        }
        if ($frontendJob -and $frontendJob.State -eq "Failed") {
            Write-Host "[ERROR] Frontend service encountered an issue:" -ForegroundColor Red
            Receive-Job $frontendJob
        }
    }
} finally {
    Write-Host "`n[SHUTDOWN] Stopping all KoeeO services..." -ForegroundColor Yellow
    if ($backendJob) { Stop-Job $backendJob -PassThru | Remove-Job -Force }
    if ($frontendJob) { Stop-Job $frontendJob -PassThru | Remove-Job -Force }
    Write-Host "[SHUTDOWN] All services terminated." -ForegroundColor Green
}
