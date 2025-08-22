@echo off
echo 🚀 Starting ShiftManager2 with PM2...
echo.

REM Change to project directory
cd /d "%~dp0"

REM Start PM2 if not running
pm2 start ecosystem.config.js

REM Save PM2 configuration
pm2 save

echo.
echo ✅ ShiftManager2 is now running with PM2!
echo 🌐 Open http://localhost:3001 in your browser
echo.
echo 📊 Useful PM2 commands:
echo    pm2 status          - Check app status
echo    pm2 logs shiftmanager2 - View logs
echo    pm2 restart shiftmanager2 - Restart app
echo    pm2 stop shiftmanager2 - Stop app
echo.
pause
