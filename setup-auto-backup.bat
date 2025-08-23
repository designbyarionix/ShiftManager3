@echo off
echo 🚀 Setting up automatic hourly backup for ShiftManager2...
echo.
echo This will create a Windows Task Scheduler task that backs up your project
echo to GitHub every hour automatically.
echo.
echo Requirements:
echo - Run as Administrator
echo - PowerShell execution policy must allow scripts
echo - Git must be configured with your GitHub credentials
echo.
echo Press any key to continue...
pause >nul

echo.
echo 🔧 Starting setup process...
echo.

REM Run PowerShell script as Administrator
powershell -ExecutionPolicy Bypass -File "setup-auto-backup.ps1"

echo.
echo 🏁 Setup process completed!
echo.
echo If successful, your project will now be backed up every hour.
echo Check the backup.log file in your project folder for backup history.
echo.
pause

