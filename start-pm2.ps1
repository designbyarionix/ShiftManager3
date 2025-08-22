# Start PM2 and ShiftManager2
Write-Host "🚀 Starting PM2 and ShiftManager2..." -ForegroundColor Green

# Change to the project directory
Set-Location "C:\Users\arion\OneDrive\Документи\GitHubs\shiftmanager2"

# Start PM2 if not running
if (-not (Get-Process -Name "pm2" -ErrorAction SilentlyContinue)) {
    Write-Host "📊 Starting PM2..." -ForegroundColor Yellow
    pm2 start ecosystem.config.js
} else {
    Write-Host "✅ PM2 is already running" -ForegroundColor Green
}

# Save PM2 configuration
pm2 save

Write-Host "✅ ShiftManager2 should now be running on http://localhost:3000" -ForegroundColor Green
Write-Host "📊 Use 'pm2 status' to check status" -ForegroundColor Cyan
Write-Host "📝 Use 'pm2 logs shiftmanager2' to view logs" -ForegroundColor Cyan
