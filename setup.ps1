# ============================================
# FEDGE 2.O -- Dev Setup Script
# Run from repo root: .\setup.ps1
# ============================================

$ErrorActionPreference = "Stop"
$repoRoot = $PWD

function Write-Step { param($n, $msg) Write-Host "`n[$n] $msg" -ForegroundColor Cyan }
function Write-OK   { param($msg) Write-Host "  OK $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "  WARN $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "  FAIL $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "==========================================" -ForegroundColor DarkYellow
Write-Host "     FEDGE 2.O  --  DEV SETUP            " -ForegroundColor DarkYellow
Write-Host "     Eclat Universe                       " -ForegroundColor DarkYellow
Write-Host "==========================================" -ForegroundColor DarkYellow
Write-Host ""

Write-Step 1 "Checking prerequisites"

$missing = @()
foreach ($cmd in @("git", "docker", "pnpm", "openssl", "node")) {
    if (Get-Command $cmd -ErrorAction SilentlyContinue) {
        Write-OK "$cmd found"
    } else {
        Write-Fail "$cmd NOT found"
        $missing += $cmd
    }
}

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "Missing tools: $($missing -join ', ')" -ForegroundColor Red
    Write-Host "Install pnpm:    npm install -g pnpm" -ForegroundColor Yellow
    Write-Host "Install Docker:  https://docs.docker.com/desktop/windows/" -ForegroundColor Yellow
    Write-Host "Install OpenSSL: winget install ShiningLight.OpenSSL" -ForegroundColor Yellow
    exit 1
}

Write-Step 2 "Installing dependencies (pnpm install)"
pnpm install
Write-OK "Dependencies installed"

Write-Step 3 "Generating JWT RS256 keypair"

$keysDir = Join-Path $repoRoot "apps\api\keys"
New-Item -ItemType Directory -Force -Path $keysDir | Out-Null

$privatePem = Join-Path $keysDir "private.pem"
$publicPem  = Join-Path $keysDir "public.pem"

if (Test-Path $privatePem) {
    Write-Warn "keys/private.pem already exists -- skipping keygen"
} else {
    openssl genrsa -out $privatePem 2048 2>$null
    openssl rsa -in $privatePem -pubout -out $publicPem 2>$null
    Write-OK "JWT keypair generated at apps/api/keys/"
}

Write-Step 4 "Setting up .env"

$envExample = Join-Path $repoRoot ".env.example"
$envFile    = Join-Path $repoRoot ".env"

if (Test-Path $envFile) {
    Write-Warn ".env already exists -- skipping (edit manually if needed)"
} else {
    if (-not (Test-Path $envExample)) {
        Write-Fail ".env.example not found"
        exit 1
    }

    Copy-Item $envExample $envFile

    $content    = Get-Content $envFile -Raw
    $winPrivate = ($privatePem -replace "\\", "/")
    $winPublic  = ($publicPem  -replace "\\", "/")
    $content    = $content -replace "JWT_PRIVATE_KEY_PATH=.*", "JWT_PRIVATE_KEY_PATH=$winPrivate"
    $content    = $content -replace "JWT_PUBLIC_KEY_PATH=.*",  "JWT_PUBLIC_KEY_PATH=$winPublic"
    Set-Content $envFile $content

    Write-OK ".env created"
    Write-Warn "ACTION REQUIRED: open .env and fill in:"
    Write-Host "    ALPACA_API_KEY     -> https://app.alpaca.markets/paper-trading" -ForegroundColor Yellow
    Write-Host "    ALPACA_API_SECRET  -> (same page)" -ForegroundColor Yellow
    Write-Host "    ANTHROPIC_API_KEY  -> https://console.anthropic.com" -ForegroundColor Yellow
}

Write-Step 5 "Checking .gitignore"

$gitignore = Join-Path $repoRoot ".gitignore"
$entries   = @(".env", "apps/api/keys/", "node_modules/", "dist/")
$existing  = ""

if (Test-Path $gitignore) {
    $existing = Get-Content $gitignore -Raw
}

$added = @()
foreach ($entry in $entries) {
    if ($existing -notmatch [regex]::Escape($entry)) {
        Add-Content $gitignore "`n$entry"
        $added += $entry
    }
}

if ($added.Count -gt 0) {
    Write-OK "Added to .gitignore: $($added -join ', ')"
} else {
    Write-OK ".gitignore already up to date"
}

Write-Step 6 "Starting Docker (Postgres + Redis)"

$dockerInfo = docker info 2>$null
if (-not $dockerInfo) {
    Write-Fail "Docker Desktop is not running. Start it then re-run this script."
    exit 1
}

docker compose up -d 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Fail "docker compose up failed. Check Docker Desktop."
    exit 1
}

Write-OK "Postgres + Redis containers started"
Write-Host "  Waiting for Postgres to be ready..." -ForegroundColor Gray

$attempts = 0
$health   = ""

while ($health -ne "healthy" -and $attempts -lt 15) {
    Start-Sleep -Seconds 2
    $attempts++
    $health = docker inspect --format "{{.State.Health.Status}}" fedge_postgres 2>$null
}

if ($health -eq "healthy") {
    Write-OK "Postgres is healthy"
} else {
    Write-Warn "Postgres health check timed out -- it may still be starting up"
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor DarkYellow
Write-Host "  FEDGE 2.O -- SETUP COMPLETE                   " -ForegroundColor DarkYellow
Write-Host "=================================================" -ForegroundColor DarkYellow
Write-Host ""
Write-Host "  1. Fill in .env with your API keys (Alpaca + Anthropic)" -ForegroundColor White
Write-Host "  2. pnpm --filter @tradestreet/api dev" -ForegroundColor Cyan
Write-Host "  3. pnpm --filter @tradestreet/mobile start" -ForegroundColor Cyan
Write-Host ""
