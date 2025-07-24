@echo off
title CTI Dashboard Startup
cls
echo.
echo ========================================
echo    ??? CTI Dashboard - Windows Edition
echo ========================================
echo.

echo [1/4] Installing Python dependencies...
cd backend
pip install -r requirements.txt
if %0% neq 0 (
    echo ? Failed to install Python dependencies
    pause
    exit /b 1
)
echo ? Backend dependencies installed!
echo.

echo [2/4] Installing Node.js dependencies...
cd ..\frontend
npm install
if %0% neq 0 (
    echo ? Failed to install Node.js dependencies
    pause
    exit /b 1
)
echo ? Frontend dependencies installed!
echo.

echo [3/4] Starting Backend Server...
start "Backend Server" cmd /k "cd /d %C:\Users\supro\Documents\Internship\cti-dashboard%\..\backend && python app.py"

echo [4/4] Starting Frontend Server...
timeout /t 3 /nobreak >nul
start "Frontend Server" cmd /k "cd /d %C:\Users\supro\Documents\Internship\cti-dashboard% && npm start"

echo ? Services are starting...
echo.
echo ?? Frontend: http://localhost:3000
echo ?? Backend:  http://localhost:5000
echo.
echo Press any key to exit...
pause >nul
