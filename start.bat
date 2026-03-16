@echo off
title RCEE RIMS Launcher
color 0B

echo.
echo  =============================================================
echo  ║                                                           ║
echo  ║      RCEE RIMS - Research Information Management System   ║
echo  ║              Ramachandra College of Engineering           ║
echo  ║                                                           ║
echo  =============================================================
echo.
echo  [ WAIT ] Initializing RCEE RIMS Environments...
echo.
echo  ▶ Starting Backend Server:  http://localhost:5000
echo  ▶ Starting Frontend Server: http://localhost:5173
echo.

REM --- Start Backend in a new window ---
start "RCEE RIMS - Backend Server" cmd /k "color 0A && cd /d "%~dp0backend" && echo ======================================== && echo  [ RCEE RIMS BACKEND ] Starting... && echo ======================================== && npm run dev"

REM --- Wait a moment for backend to initialize ---
timeout /t 3 /nobreak >nul

REM --- Start Frontend in a new window ---
start "RCEE RIMS - Frontend Server" cmd /k "color 0E && cd /d "%~dp0frontend" && echo ======================================== && echo  [ RCEE RIMS FRONTEND ] Starting... && echo ======================================== && npm run dev"

REM --- Wait for Vite to be ready, then open browser ---
timeout /t 3 /nobreak >nul
echo  [ OK ] Services started successfully.
echo.
echo  Opening RCEE RIMS in your default browser...
start http://localhost:5173

echo.
echo  -------------------------------------------------------------
echo  Both backend and frontend servers are now running.
echo  (Note: You can close their respective windows to stop them)
echo  -------------------------------------------------------------
echo.
pause
