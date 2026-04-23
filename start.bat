@echo off
echo ===================================
echo   Financio - Starting Application
echo ===================================
echo.

echo [1/2] Starting Backend (Port 5000)...
start "Financio Backend" cmd /k "cd /d c:\Users\VICTUS\OneDrive\Desktop\Financio\backend && node server.js"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend (Port 5173)...
start "Financio Frontend" cmd /k "cd /d c:\Users\VICTUS\OneDrive\Desktop\Financio\frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ===================================
echo  App running at http://localhost:5173
echo  API running at http://localhost:5000
echo ===================================
start http://localhost:5173
