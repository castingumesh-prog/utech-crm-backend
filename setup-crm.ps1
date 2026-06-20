param(
    [string]$EnvFile = ".env"
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "=================================================="
    Write-Host $Message
    Write-Host "=================================================="
}

function Fail {
    param([string]$Message)
    Write-Host ""
    Write-Host "ERROR: $Message" -ForegroundColor Red
    Write-Host ""
    exit 1
}

function Warn {
    param([string]$Message)
    Write-Host "WARNING: $Message" -ForegroundColor Yellow
}

Set-Location $PSScriptRoot

Write-Step "U TECH CRM - AUTOMATED SETUP & VALIDATION (PowerShell)"

if (-not (Test-Path $EnvFile)) {
    Warn "Environment file '$EnvFile' was not found. The script will continue using defaults if present."
}

Write-Step "[1/8] Checking Node.js"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Fail "Node.js is not installed or not available on PATH."
}
node -v

Write-Step "[2/8] Checking npm"
if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    Fail "npm is not installed or not available on PATH."
}
npm.cmd -v

Write-Step "[3/8] Installing dependencies"
& npm.cmd install
if ($LASTEXITCODE -ne 0) {
    Fail "npm install failed."
}

Write-Step "[4/8] Checking MySQL port 3306"
$portCheck = netstat -ano | Select-String ":3306"
if ($portCheck) {
    Write-Host $portCheck
} else {
    Warn "No listener was found on port 3306. MySQL may not be running."
}

Write-Step "[5/8] Running DB diagnostic"
& npm.cmd run db:check
if ($LASTEXITCODE -ne 0) {
    Fail "Database diagnostic failed. Verify MySQL service, host, port, credentials, and database name."
}

Write-Step "[6/8] Importing schema if available"
if (Test-Path "database\schema.sql") {
    if (Get-Command mysql -ErrorAction SilentlyContinue) {
        Write-Host "Schema file found. Running schema import..."
        & mysql --help | Out-Null
        # PowerShell does not support < for stdin redirection; use Get-Content piped to mysql
        Get-Content "database\schema.sql" | & mysql -u root -p
        if ($LASTEXITCODE -ne 0) {
            Fail "Schema import failed. Check the MySQL credentials and schema file."
        }
    } else {
        Warn "mysql CLI was not found, so schema import was skipped."
    }
} else {
    Warn "No schema.sql file found under database/."
}

Write-Step "[7/8] Running tests"
& npm.cmd test -- --runInBand
if ($LASTEXITCODE -ne 0) {
    Fail "Tests failed."
}

Write-Step "[8/8] Starting backend"
$backendCommand = "Set-Location '$PSScriptRoot'; npm.cmd start"
Start-Process powershell -ArgumentList @('-NoExit', '-Command', $backendCommand)

Write-Host ""
Write-Host "Setup completed successfully."
Write-Host "The backend has been started in a new PowerShell window."
Write-Host ""
