@echo off
title RCEE RIMS - Package Installer
color 0B

echo.
echo  =============================================================
echo  ║                                                           ║
echo  ║      RCEE RIMS - Installing Required Packages             ║
echo  ║              Ramachandra College of Engineering           ║
echo  ║                                                           ║
echo  =============================================================
echo.

REM --- Install Backend packages ---
echo  [1/2] Installing Backend packages...
echo  -----------------------------------------------
cd /d "%~dp0backend"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  [ERROR] Backend installation failed!
    pause
    exit /b 1
)
echo.
echo  [OK] Backend packages installed successfully!
echo.

REM --- Install Frontend packages ---
echo  [2/2] Installing Frontend packages...
echo  -----------------------------------------------
cd /d "%~dp0frontend"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  [ERROR] Frontend installation failed!
    pause
    exit /b 1
)
echo.
echo  [OK] Frontend packages installed successfully!
echo.

echo  =============================================================
echo  All packages installed! You can now run start.bat to launch.
echo  =============================================================
echo.
pause
