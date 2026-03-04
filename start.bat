@echo off
title RDMS Launcher
color 1F

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║       RDMS - Research ^& Department Management       ║
echo  ║              Ramachandra College of Engineering      ║
echo  ╚══════════════════════════════════════════════════════╝
echo.
echo  Starting Backend Server  (http://localhost:5000)
echo  Starting Frontend Server (http://localhost:5173)
echo.

REM --- Start Backend in a new window ---
start "RDMS Backend" cmd /k "cd /d "%~dp0backend" && echo [BACKEND] Starting... && npm run dev"

REM --- Wait a moment for backend to initialise ---
timeout /t 3 /nobreak >nul

REM --- Start Frontend in a new window ---
start "RDMS Frontend" cmd /k "cd /d "%~dp0frontend" && echo [FRONTEND] Starting... && npm run dev"

REM --- Wait for Vite to be ready, then open browser ---
timeout /t 3 /nobreak >nul
echo  Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo  Both servers are running in separate windows.
echo  Close those windows to stop the servers.
echo.
pause
