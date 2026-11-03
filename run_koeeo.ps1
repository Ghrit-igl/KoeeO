# ------------------------------------------------------------------------------
# KoeeO // Universal Rust & AAYU Holographic Virtual Science Lab
# Architecture: Pure Native Rust Multi-Physics & Reality Engine + TypeScript WebGL
# ------------------------------------------------------------------------------
param(
    [switch]$Test,
    [switch]$Release
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$CargoToml = "$Root\crates\koeeo_engine\Cargo.toml"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   KOEEO // RUST & AAYU UNIVERSAL REALITY ENGINE          " -ForegroundColor Cyan
Write-Host "   Physics, Chemistry, Materials & Autonomous Holograms   " -ForegroundColor Cyan
Write-Host "   Author: Minato95-ayu (Ayush Ghrit Kaushik)            " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

if ($Test) {
    Write-Host "[TEST] Running Rust first-principles unit tests..." -ForegroundColor Yellow
    cargo test --manifest-path $CargoToml
    exit 0
}

Write-Host "[BOOT] Starting KoeeO High-Speed Native Rust Engine on http://localhost:8080..." -ForegroundColor Green
Write-Host "[INFO] Zero Python (.venv removed) | Zero Bloated Node Daemons" -ForegroundColor DarkGray
Write-Host "[INFO] Enforcing Thermodynamics Pyrolysis, Mechanics & ISO 10993" -ForegroundColor DarkGray
Write-Host ""

if ($Release) {
    cargo run --release --manifest-path $CargoToml
} else {
    cargo run --manifest-path $CargoToml
}
