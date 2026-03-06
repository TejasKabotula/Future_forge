@echo off
echo ==========================================
echo    FutureForge - Quick Setup (Windows)
echo ==========================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! 
    echo Please download it from https://nodejs.org/
    pause
    exit /b
)

:: Run the PowerShell Setup Script
echo [INFO] Starting Automated Setup...
powershell -NoProfile -ExecutionPolicy Bypass -File "./install_requirements.ps1"

echo.
echo ==========================================
echo    SETUP COMPLETE!
echo ==========================================
echo.
echo To run the Backend:
echo 1. Open a new terminal in /backend
echo 2. Run: npm start
echo.
echo To run the Frontend:
echo 1. Open a new terminal in /frontend
echo 2. Run: npm run dev
echo.
pause
