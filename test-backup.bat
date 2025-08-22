@echo off
echo Testing automatic backup system...
echo.
echo This will run the backup script manually to test if it works.
echo.
powershell -ExecutionPolicy Bypass -File "auto-backup.ps1"
echo.
echo Backup test completed!
pause
