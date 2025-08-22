# Auto-Backup Script for ShiftManager2
# This script automatically commits and pushes changes to GitHub every hour
# Run this script with Windows Task Scheduler for automated backups

param(
    [string]$ProjectPath = ".",
    [string]$CommitMessage = "Auto-backup: Hourly backup $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

# Function to write colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $Message" -ForegroundColor $Color
}

# Function to check if Git repository is clean
function Test-GitClean {
    try {
        $status = git status --porcelain 2>$null
        return [string]::IsNullOrEmpty($status)
    }
    catch {
        return $false
    }
}

# Function to check if remote is accessible
function Test-RemoteAccess {
    try {
        git ls-remote --exit-code origin >$null 2>&1
        return $LASTEXITCODE -eq 0
    }
    catch {
        return $false
    }
}

# Main backup function
function Start-AutoBackup {
    Write-ColorOutput "Starting automatic backup process..." "Green"
    
    # Change to project directory
    if (-not (Test-Path $ProjectPath)) {
        Write-ColorOutput "Project path not found: $ProjectPath" "Red"
        exit 1
    }
    
    Set-Location $ProjectPath
    Write-ColorOutput "Changed to project directory: $ProjectPath" "Cyan"
    
    # Check if this is a Git repository
    if (-not (Test-Path ".git")) {
        Write-ColorOutput "Not a Git repository!" "Red"
        exit 1
    }
    
    # Check remote access
    if (-not (Test-RemoteAccess)) {
        Write-ColorOutput "Cannot access remote repository!" "Red"
        exit 1
    }
    
    Write-ColorOutput "Remote repository accessible" "Green"
    
    # Check if there are changes to commit
    if (Test-GitClean) {
        Write-ColorOutput "No changes to commit - repository is clean" "Yellow"
        
        # Still push to ensure remote is up to date
        Write-ColorOutput "Pushing to ensure remote is up to date..." "Cyan"
        git push origin main 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "Push successful - remote is up to date" "Green"
        } else {
            Write-ColorOutput "Push failed, but no changes to lose" "Yellow"
        }
        
        return
    }
    
    # Add all changes
    Write-ColorOutput "Adding all changes to Git..." "Cyan"
    git add . 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "Failed to add changes!" "Red"
        exit 1
    }
    
    # Commit changes
    Write-ColorOutput "Committing changes..." "Cyan"
    git commit -m $CommitMessage 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "Failed to commit changes!" "Red"
        exit 1
    }
    
    Write-ColorOutput "Changes committed successfully" "Green"
    
    # Push to remote
    Write-ColorOutput "Pushing to GitHub..." "Cyan"
    git push origin main 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "Backup completed successfully!" "Green"
        Write-ColorOutput "Backup time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Cyan"
        Write-ColorOutput "Repository: https://github.com/designbyarionix/ShiftManager3" "Cyan"
    } else {
        Write-ColorOutput "Failed to push to GitHub!" "Red"
        exit 1
    }
}

# Function to create log entry
function Write-BackupLog {
    param(
        [string]$Message,
        [string]$Status = "INFO"
    )
    
    $logPath = Join-Path $ProjectPath "backup.log"
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Status] $Message"
    
    Add-Content -Path $logPath -Value $logEntry
    
    # Keep only last 1000 log entries
    $lines = Get-Content $logPath
    if ($lines.Count -gt 1000) {
        $lines | Select-Object -Last 1000 | Set-Content $logPath
    }
}

# Main execution
try {
    Write-ColorOutput "Auto-backup started at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Magenta"
    
    # Start backup process
    Start-AutoBackup
    
    # Log successful backup
    Write-BackupLog "Auto-backup completed successfully" "SUCCESS"
    
    Write-ColorOutput "Auto-backup process completed successfully!" "Green"
}
catch {
    $errorMessage = $_.Exception.Message
    Write-ColorOutput "Auto-backup failed: $errorMessage" "Red"
    
    # Log error
    Write-BackupLog "Auto-backup failed: $errorMessage" "ERROR"
    
    exit 1
}
finally {
    Write-ColorOutput "Auto-backup process finished" "Magenta"
}
