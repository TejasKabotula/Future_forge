# FutureForge - Automated Setup Script
# This script installs project dependencies, Deno, and downloads yt-dlp.exe

$ErrorActionPreference = "Stop"

Write-Host "--- FutureForge Setup Started ---" -ForegroundColor Cyan

# 1. Check for Node.js
Write-Host "[1/6] Checking Node.js installation..."
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed. Please install it from https://nodejs.org/"
}
Write-Host "Done." -ForegroundColor Green

# 2. Check/Install Deno
Write-Host "[2/6] Checking Deno installation..."
if (!(Get-Command deno -ErrorAction SilentlyContinue)) {
    Write-Host "Deno not found. Installing Deno..." -ForegroundColor Yellow
    Invoke-RestMethod https://deno.land/install.ps1 | Invoke-Expression
    Write-Host "Deno installed. You may need to restart your terminal later." -ForegroundColor Cyan
}
else {
    Write-Host "Deno is already installed." -ForegroundColor Green
}

# 3. Install Backend Dependencies
Write-Host "[3/6] Installing Backend dependencies..."
if (Test-Path "backend") {
    Push-Location backend
    npm install
    Pop-Location
}
else {
    Write-Warning "Backend folder not found!"
}
Write-Host "Done." -ForegroundColor Green

# 4. Install Frontend Dependencies
Write-Host "[4/6] Installing Frontend dependencies..."
if (Test-Path "frontend") {
    Push-Location frontend
    npm install
    Pop-Location
}
else {
    Write-Warning "Frontend folder not found!"
}
Write-Host "Done." -ForegroundColor Green

# 5. Download yt-dlp.exe
Write-Host "[5/6] Ensuring yt-dlp.exe is available..."
$binDir = Join-Path $PWD "bin"
if (!(Test-Path $binDir)) {
    New-Item -ItemType Directory -Path $binDir | Out-Null
}

$ytdlpPath = Join-Path $binDir "yt-dlp.exe"
if (!(Test-Path $ytdlpPath)) {
    Write-Host "Downloading yt-dlp.exe..." -ForegroundColor Yellow
    $url = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
    Invoke-WebRequest -Uri $url -OutFile $ytdlpPath
}
else {
    Write-Host "yt-dlp.exe already exists in bin folder." -ForegroundColor Green
}

# 6. Final Steps
Write-Host "[6/6] Final Steps Reminder:" -ForegroundColor Yellow
Write-Host "1. Create a .env file in the 'backend' folder."
Write-Host "2. Add your GROQ_API_KEY and MONGO_URI to .env."
Write-Host "3. For Android builds, ensure Android Studio is installed."

Write-Host "`n--- Setup Complete! ---" -ForegroundColor Cyan
Write-Host "To run backend: cd backend; npm start"
Write-Host "To run frontend: cd frontend; npm run dev"
