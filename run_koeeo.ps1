# ──────────────────────────────────────────────────────
# KoeeO Virtual Science Lab — One-Click Launcher
# ──────────────────────────────────────────────────────
param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$Test
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$PyExe = if (Test-Path "$Root\.venv\Scripts\python.exe") { "$Root\.venv\Scripts\python.exe" } else { "python" }

Write-Host ""
Write-Host "  ╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║   KoeeO — Holographic Virtual Science Lab ║" -ForegroundColor Cyan
Write-Host "  ║   AAYU Engine v1.5.0 | RETER Firewall     ║" -ForegroundColor Cyan
Write-Host "  ╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── Run Tests ──
if ($Test) {
    Write-Host "[TEST] Running backend tests..." -ForegroundColor Yellow
    Push-Location "$Root\packages\backend"
    & $PyExe -m pytest tests/ -v --tb=short
    Pop-Location
    Write-Host "[TEST] Tests complete." -ForegroundColor Green
    exit 0
}

# ── Start Backend ──
if (-not $FrontendOnly) {
    Write-Host "[BOOT] Starting FastAPI backend on :8000..." -ForegroundColor Yellow
    $backendJob = Start-Job -ScriptBlock {
        Set-Location $using:Root\packages\backend
        & $using:PyExe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    }
    Write-Host "[BOOT] Backend PID: $($backendJob.Id)" -ForegroundColor Green
}

# ── Start Frontend ──
if (-not $BackendOnly) {
    Start-Sleep -Seconds 2
    Write-Host "[BOOT] Starting Vite frontend on :3000..." -ForegroundColor Yellow
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location $using:Root\packages\frontend
        npm run dev
    }
    Write-Host "[BOOT] Frontend PID: $($frontendJob.Id)" -ForegroundColor Green
}

Write-Host ""
Write-Host "  ┌─────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "  │  Backend:  http://localhost:8000         │" -ForegroundColor Cyan
Write-Host "  │  Frontend: http://localhost:3000         │" -ForegroundColor Cyan
Write-Host "  │  Press Ctrl+C to stop all services      │" -ForegroundColor Cyan
Write-Host "  └─────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""

# ── Wait for Ctrl+C ──
try {
    while ($true) {
        Start-Sleep -Seconds 1
        if ($backendJob -and $backendJob.State -eq "Failed") {
            Write-Host "[ERROR] Backend crashed!" -ForegroundColor Red
            Receive-Job $backendJob
        }
        if ($frontendJob -and $frontendJob.State -eq "Failed") {
            Write-Host "[ERROR] Frontend crashed!" -ForegroundColor Red
            Receive-Job $frontendJob
        }
    }
} finally {
    Write-Host "`n[SHUTDOWN] Stopping services..." -ForegroundColor Yellow
    if ($backendJob) { Stop-Job $backendJob -PassThru | Remove-Job -Force }
    if ($frontendJob) { Stop-Job $frontendJob -PassThru | Remove-Job -Force }
    Write-Host "[SHUTDOWN] All services stopped." -ForegroundColor Green
}
