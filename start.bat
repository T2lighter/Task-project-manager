@echo off
title Task Manager - Starting

echo ========================================
echo    Task Manager - Quick Start
echo ========================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found
    pause
    exit /b 1
)

:: Go to script directory
cd /d "%~dp0"

:: Check backend dependencies
if not exist "backend\node_modules" (
    echo [INFO] Installing backend dependencies...
    cd backend
    call npm install >nul 2>nul
    cd ..
)

:: Check frontend dependencies
if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd frontend
    call npm install >nul 2>nul
    cd ..
)

:: Start backend as independent process (hidden window)
echo [START] Backend service...
start "" /min cmd /c "cd /d "%~dp0backend" && npm run dev"
timeout /t 2 /nobreak >nul

:: Start frontend as independent process (hidden window)
echo [START] Frontend service...
start "" /min cmd /c "cd /d "%~dp0frontend" && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    Started Successfully!
echo ========================================
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo ========================================
echo.
echo Services running independently.
echo Run stop.bat to stop services.
echo.
echo This window will close in 3 seconds...
timeout /t 3 >nul
exit
