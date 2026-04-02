@echo off
title AGENTIQ AI - Launcher
color 0A

echo.
echo ==========================================
echo   AGENTIQ AI Platform - Starting Up
echo ==========================================
echo.

:: ─────────────────────────────────────────
:: Step 1: Start Backend Server
:: ─────────────────────────────────────────
echo [1/2] Starting Backend Server (Port 8000)...
start "AGENTIQ Backend" cmd /k "cd /d %~dp0backend && set PYTHONPATH=. && python app/main.py"

:: Wait for backend to become ready by polling port 8000
echo       Waiting for backend to be ready...
set RETRIES=0

:WAIT_BACKEND
timeout /t 2 /nobreak >nul
set /a RETRIES+=1

:: Try to connect to the backend health endpoint
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8000/' -TimeoutSec 2 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo       Backend is READY! (took ~%RETRIES% checks)
    goto BACKEND_READY
)

if %RETRIES% GEQ 30 (
    echo.
    echo  [ERROR] Backend failed to start after 60 seconds.
    echo  Check the Backend window for errors.
    echo.
    pause
    exit /b 1
)

echo       Still waiting... (attempt %RETRIES%/30)
goto WAIT_BACKEND

:BACKEND_READY
echo.

:: ─────────────────────────────────────────
:: Step 2: Start Frontend Server
:: ─────────────────────────────────────────
echo [2/2] Starting Frontend Server (Port 3000)...
start "AGENTIQ Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ==========================================
echo   AGENTIQ AI is running!
echo.
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo.
echo   (Frontend may take a few seconds to compile)
echo ==========================================
echo.
pause
