# 🚀 PM2 Setup for ShiftManager2

Your ShiftManager2 app is now configured to run continuously with PM2 on Windows!

## ✨ **What's Been Set Up:**

- ✅ **PM2 installed globally** - Process manager for Node.js
- ✅ **Ecosystem configuration** - PM2 knows how to run your app
- ✅ **Auto-restart** - App restarts if it crashes
- ✅ **Logging** - All output saved to `logs/` folder
- ✅ **Easy startup scripts** - Simple ways to start/stop the app
- ✅ **Port 3001** - Running on port 3001 to avoid conflicts

## 🎯 **How to Use:**

### **Start the App:**
```bash
# Option 1: Use the batch file (easiest)
start-app.bat

# Option 2: Use PM2 directly
pm2 start ecosystem.config.js

# Option 3: Use PowerShell script
.\start-pm2.ps1
```

### **Check App Status:**
```bash
pm2 status
```

### **View Logs:**
```bash
# View real-time logs
pm2 logs shiftmanager2

# View last 100 lines
pm2 logs shiftmanager2 --lines 100
```

### **Manage the App:**
```bash
# Restart the app
pm2 restart shiftmanager2

# Stop the app
pm2 stop shiftmanager2

# Delete the app from PM2
pm2 delete shiftmanager2

# Reload the app (zero-downtime restart)
pm2 reload shiftmanager2
```

## 🔄 **Auto-Start on Windows Boot:**

Since PM2's `startup` command doesn't work on Windows, you have these options:

### **Option 1: Manual Start (Recommended)**
- Double-click `start-app.bat` when you want to start the app
- Or run `pm2 start ecosystem.config.js` in PowerShell

### **Option 2: Windows Task Scheduler**
1. Open "Task Scheduler" (search in Start menu)
2. Create Basic Task
3. Set trigger to "At startup"
4. Set action to start `start-app.bat`
5. Set to run whether user is logged in or not

### **Option 3: Startup Folder**
1. Press `Win + R`, type `shell:startup`
2. Copy `start-app.bat` to this folder
3. App will start automatically when you log in

## 📁 **File Structure:**
```
shiftmanager2/
├── ecosystem.config.js    # PM2 configuration
├── start.js              # PM2 startup script
├── start-app.bat         # Easy Windows startup
├── start-pm2.ps1         # PowerShell startup script
├── logs/                 # PM2 log files
│   ├── err.log          # Error logs
│   ├── out.log          # Output logs
│   └── combined.log     # Combined logs
└── PM2_SETUP.md         # This file
```

## 🚨 **Troubleshooting:**

### **App Won't Start:**
```bash
# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs shiftmanager2

# Restart PM2 completely
pm2 kill
pm2 start ecosystem.config.js
```

### **Port Already in Use:**
```bash
# Find what's using port 3001
netstat -ano | findstr :3001

# Kill the process or change port in ecosystem.config.js
```

### **PM2 Not Found:**
```bash
# Reinstall PM2 globally
npm install -g pm2
```

## 🌐 **Access Your App:**

Once running, your app will be available at:
- **Local**: http://localhost:3001
- **Network**: http://your-ip-address:3001

## 📊 **Monitoring:**

PM2 provides a web-based monitoring interface:
```bash
pm2 web
```
Then open http://localhost:9615 in your browser.

## 🎉 **You're All Set!**

Your ShiftManager2 app will now:
- ✅ Run continuously with PM2
- ✅ Auto-restart if it crashes
- ✅ Keep logs for debugging
- ✅ Be easy to start/stop/restart
- ✅ Survive terminal closures
- ✅ Run on port 3001 (avoiding conflicts)

**Happy scheduling! 🗓️**
