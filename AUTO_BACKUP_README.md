# 🔄 Automatic Hourly Backup System

This system automatically backs up your ShiftManager2 project to GitHub every hour, ensuring you always have a recent backup in case of any issues.

## 🎯 **What It Does**

- **Hourly Backups**: Automatically commits and pushes changes every hour
- **Smart Detection**: Only commits when there are actual changes
- **Error Handling**: Comprehensive error checking and logging
- **Windows Integration**: Uses Windows Task Scheduler for reliability
- **Network Aware**: Only runs when network is available

## 🚀 **Quick Setup**

### **Option 1: Easy Setup (Recommended)**
1. **Right-click** `setup-auto-backup.bat`
2. **Select** "Run as Administrator"
3. **Follow** the prompts
4. **Done!** Your project will be backed up every hour

### **Option 2: Manual Setup**
1. **Open PowerShell as Administrator**
2. **Navigate** to your project folder
3. **Run**: `.\setup-auto-backup.ps1`
4. **Follow** the prompts

## 📁 **Files Created**

- `auto-backup.ps1` - Main backup script
- `setup-auto-backup.ps1` - Task Scheduler setup script
- `setup-auto-backup.bat` - Easy setup batch file
- `backup.log` - Backup history log file
- `ShiftManager2-AutoBackup` - Windows Task Scheduler task

## ⚙️ **How It Works**

### **1. Automatic Execution**
- Windows Task Scheduler runs the backup script every hour
- Script checks for changes in your project
- If changes exist, commits and pushes to GitHub
- If no changes, ensures remote is up to date

### **2. Smart Backup Logic**
```powershell
# Check if repository has changes
if (Test-GitClean) {
    # No changes - just push to ensure sync
    git push origin main
} else {
    # Changes found - commit and push
    git add .
    git commit -m "Auto-backup: Hourly backup $(Get-Date)"
    git push origin main
}
```

### **3. Error Handling**
- Checks if Git repository exists
- Verifies remote access
- Logs all operations
- Continues working even if some backups fail

## 📊 **Monitoring & Logs**

### **Backup Log File**
Location: `backup.log` in your project folder
```
[2024-12-19 14:00:00] [SUCCESS] Auto-backup completed successfully
[2024-12-19 15:00:00] [SUCCESS] Auto-backup completed successfully
[2024-12-19 16:00:00] [INFO] No changes to commit - repository is clean
```

### **Task Scheduler Status**
```powershell
# Check task status
Get-ScheduledTask -TaskName "ShiftManager2-AutoBackup"

# View task details
Get-ScheduledTask -TaskName "ShiftManager2-AutoBackup" | Get-ScheduledTaskInfo

# Run task manually
Start-ScheduledTask -TaskName "ShiftManager2-AutoBackup"
```

### **GitHub Repository**
- Check for hourly commits: [https://github.com/designbyarionix/ShiftManager3](https://github.com/designbyarionix/ShiftManager3)
- Each backup creates a commit with timestamp
- Commit messages: "Auto-backup: Hourly backup YYYY-MM-DD HH:MM"

## 🔧 **Configuration Options**

### **Customize Backup Schedule**
Edit `setup-auto-backup.ps1` and modify:
```powershell
# Change from hourly to different interval
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 30) -RepetitionDuration (New-TimeSpan -Days 3650)
```

### **Customize Commit Messages**
Edit `auto-backup.ps1` and modify:
```powershell
[string]$CommitMessage = "Custom backup message $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
```

### **Change Project Path**
Edit both scripts and modify:
```powershell
[string]$ProjectPath = "C:\Your\Custom\Path\To\Project"
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Task Not Running**
```powershell
# Check task status
Get-ScheduledTask -TaskName "ShiftManager2-AutoBackup"

# Check Windows Event Viewer for errors
eventvwr.msc
```

#### **2. Git Authentication Issues**
```bash
# Configure Git credentials
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Use Personal Access Token or SSH key
```

#### **3. PowerShell Execution Policy**
```powershell
# Check execution policy
Get-ExecutionPolicy

# Set execution policy (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### **4. Network Issues**
- Task is configured to only run when network is available
- Check internet connection
- Verify GitHub access

### **Manual Testing**
```powershell
# Test backup script manually
.\auto-backup.ps1 -ProjectPath "C:\Users\arion\OneDrive\Документи\GitHubs\shiftmanager2"

# Check backup log
Get-Content backup.log -Tail 10
```

## 📋 **Task Scheduler Details**

### **Task Properties**
- **Name**: `ShiftManager2-AutoBackup`
- **Trigger**: Every hour, indefinitely
- **Action**: PowerShell script execution
- **User**: Current user (with highest privileges)
- **Network**: Only runs when network available

### **Advanced Settings**
- **Start when available**: Yes
- **Run only if network available**: Yes
- **Allow start on batteries**: Yes
- **Don't stop if going on batteries**: Yes

## 🔒 **Security Considerations**

### **What It Does**
- Runs with your user privileges
- Accesses your Git repository
- Pushes to your GitHub account
- Logs operations locally

### **What It Doesn't Do**
- Never stores passwords in plain text
- Doesn't access system files outside project
- Doesn't run arbitrary code
- Doesn't modify system settings

## 📈 **Performance Impact**

### **Resource Usage**
- **CPU**: Minimal (runs for ~5-10 seconds per hour)
- **Memory**: Low (PowerShell process)
- **Network**: Small (Git operations)
- **Disk**: Minimal (log file growth)

### **Optimization**
- Only commits when changes exist
- Efficient Git operations
- Automatic log rotation (keeps last 1000 entries)
- Network-aware execution

## 🎉 **Benefits**

### **Data Safety**
- **Hourly backups**: Never lose more than 1 hour of work
- **Git history**: Complete change history preserved
- **Remote storage**: GitHub as backup location
- **Automatic**: No manual intervention required

### **Peace of Mind**
- **Always running**: Works even when you're away
- **Error handling**: Continues working despite issues
- **Monitoring**: Easy to check backup status
- **Recovery**: Quick restore from any backup point

## 📞 **Support**

### **If Something Goes Wrong**
1. **Check backup.log** for error messages
2. **Verify Task Scheduler** task is running
3. **Test manual backup** with `.\auto-backup.ps1`
4. **Check GitHub repository** for recent commits

### **Reset System**
```powershell
# Remove existing task
Unregister-ScheduledTask -TaskName "ShiftManager2-AutoBackup" -Confirm:$false

# Re-run setup
.\setup-auto-backup.ps1
```

---

**Your ShiftManager2 project is now protected with automatic hourly backups!** 🛡️✨
