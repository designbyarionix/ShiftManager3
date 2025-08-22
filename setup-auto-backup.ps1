# Setup Auto-Backup Task Scheduler Script
# This script creates a Windows Task Scheduler task to run auto-backup every hour
# Run this script as Administrator

param(
    [string]$ProjectPath = "C:\Users\arion\OneDrive\Documents\GitHubs\shiftmanager2",
    [string]$TaskName = "ShiftManager2-AutoBackup",
    [string]$BackupScript = "auto-backup.ps1"
)

# Function to write colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Color
}

# Function to check if running as Administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Function to create the scheduled task
function New-AutoBackupTask {
    Write-ColorOutput "🔧 Creating Windows Task Scheduler task..." "Cyan"
    
    # Full path to the backup script
    $scriptPath = Join-Path $ProjectPath $BackupScript
    
    # Check if script exists
    if (-not (Test-Path $scriptPath)) {
        Write-ColorOutput "❌ Backup script not found: $scriptPath" "Red"
        exit 1
    }
    
    # PowerShell execution policy command
    $executionPolicy = "Bypass"
    
    # Create the task action
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy $executionPolicy -File `"$scriptPath`" -ProjectPath `"$ProjectPath`""
    
    # Create the trigger (every hour)
    $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration (New-TimeSpan -Days 3650)
    
    # Create the task settings
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable
    
    # Create the task principal (run as current user)
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest
    
    # Create the task
    try {
        $task = New-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "Automatic hourly backup of ShiftManager2 project to GitHub"
        
        # Register the task
        Register-ScheduledTask -TaskName $TaskName -InputObject $task -Force
        
        Write-ColorOutput "✅ Task created successfully: $TaskName" "Green"
        return $true
    }
    catch {
        Write-ColorOutput "❌ Failed to create task: $($_.Exception.Message)" "Red"
        return $false
    }
}

# Function to test the backup script
function Test-BackupScript {
    Write-ColorOutput "🧪 Testing backup script..." "Cyan"
    
    $scriptPath = Join-Path $ProjectPath $BackupScript
    
    try {
        # Test run the script
        $result = & "PowerShell.exe" -ExecutionPolicy Bypass -File $scriptPath -ProjectPath $ProjectPath
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Backup script test successful!" "Green"
            return $true
        } else {
            Write-ColorOutput "❌ Backup script test failed!" "Red"
            return $false
        }
    }
    catch {
        Write-ColorOutput "❌ Backup script test failed: $($_.Exception.Message)" "Red"
        return $false
    }
}

# Function to show task information
function Show-TaskInfo {
    Write-ColorOutput "📋 Task Information:" "Yellow"
    Write-ColorOutput "   Task Name: $TaskName" "White"
    Write-ColorOutput "   Script: $BackupScript" "White"
    Write-ColorOutput "   Project Path: $ProjectPath" "White"
    Write-ColorOutput "   Schedule: Every hour" "White"
    Write-ColorOutput "   Repository: https://github.com/designbyarionix/ShiftManager3" "White"
    
    Write-ColorOutput "`n📚 Useful Commands:" "Yellow"
    Write-ColorOutput "   Check task status: Get-ScheduledTask -TaskName '$TaskName'" "White"
    Write-ColorOutput "   Run task manually: Start-ScheduledTask -TaskName '$TaskName'" "White"
    Write-ColorOutput "   Stop task: Stop-ScheduledTask -TaskName '$TaskName'" "White"
    Write-ColorOutput "   Delete task: Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:$false" "White"
    Write-ColorOutput "   View task details: Get-ScheduledTask -TaskName '$TaskName' | Get-ScheduledTaskInfo" "White"
}

# Main execution
try {
    Write-ColorOutput "🚀 Setting up automatic hourly backup for ShiftManager2..." "Magenta"
    
    # Check if running as Administrator
    if (-not (Test-Administrator)) {
        Write-ColorOutput "❌ This script must be run as Administrator!" "Red"
        Write-ColorOutput "💡 Right-click PowerShell and select 'Run as Administrator'" "Yellow"
        exit 1
    }
    
    Write-ColorOutput "✅ Running as Administrator" "Green"
    
    # Check if project path exists
    if (-not (Test-Path $ProjectPath)) {
        Write-ColorOutput "❌ Project path not found: $ProjectPath" "Red"
        Write-ColorOutput "💡 Please update the ProjectPath parameter in this script" "Yellow"
        exit 1
    }
    
    Write-ColorOutput "✅ Project path verified: $ProjectPath" "Green"
    
    # Test the backup script first
    if (-not (Test-BackupScript)) {
        Write-ColorOutput "❌ Backup script test failed. Please fix issues before continuing." "Red"
        exit 1
    }
    
    # Create the scheduled task
    if (New-AutoBackupTask) {
        Write-ColorOutput "`n🎉 Auto-backup setup completed successfully!" "Green"
        Write-ColorOutput "🕐 Your project will now be backed up to GitHub every hour automatically!" "Green"
        
        # Show task information
        Show-TaskInfo
        
        Write-ColorOutput "`n📝 Next steps:" "Yellow"
        Write-ColorOutput "   1. The task will start automatically" "White"
        Write-ColorOutput "   2. Check backup.log in your project folder for backup history" "White"
        Write-ColorOutput "   3. Monitor GitHub repository for hourly commits" "White"
        Write-ColorOutput "   4. Task will run even when you're not logged in" "White"
        
    } else {
        Write-ColorOutput "❌ Failed to create scheduled task!" "Red"
        exit 1
    }
}
catch {
    Write-ColorOutput "❌ Setup failed: $($_.Exception.Message)" "Red"
    exit 1
}
finally {
    Write-ColorOutput "`n🏁 Setup process finished" "Magenta"
}
