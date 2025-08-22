# ShiftManager2 - Employee Shift Management System

A comprehensive web application for managing employee shifts, vacations, holidays, and work schedules. Built with Next.js, React, TypeScript, and Tailwind CSS.

## 🚀 **Live Application**

**URL**: http://localhost:3001 (when running locally with PM2)

## 🏗️ **Project Architecture**

### **Frontend Framework**
- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives

### **Data Storage**
- **Primary**: IndexedDB (client-side database)
- **Fallback**: localStorage (emergency backup)
- **Migration**: Automatic data migration from localStorage to IndexedDB
- **Caching**: In-memory cache layer for performance

### **Process Management**
- **PM2** - Production process manager for Windows
- **Auto-restart**: Keeps app running continuously
- **Port**: 3001 (configured to avoid conflicts)

## 📁 **Project Structure**

```
shiftmanager2/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── loading.tsx        # Loading component
│   └── page.tsx           # Main application (2,600+ lines)
├── components/            # Reusable UI components
│   ├── ui/               # Radix UI components
│   ├── theme-provider.tsx # Theme management
│   └── ...               # 40+ UI components
├── lib/                   # Utility libraries
│   ├── indexedDB-storage.ts    # IndexedDB implementation
│   ├── storage-wrapper.ts      # Storage abstraction layer
│   ├── migrate-data.ts         # Data migration utilities
│   ├── storage-utils.ts        # Storage helper functions
│   └── utils.ts               # General utilities
├── hooks/                 # Custom React hooks
├── public/                # Static assets
├── ecosystem.config.js    # PM2 configuration
├── start.js               # PM2 startup script
├── start.bat              # Windows batch startup
├── start-pm2.ps1         # PowerShell startup script
└── PM2_SETUP.md          # PM2 setup documentation
```

## 🛠️ **Setup & Installation**

### **Prerequisites**
- **Node.js 18+** (required for Next.js 14)
- **pnpm** (package manager)
- **Windows 10/11** (PM2 configuration is Windows-specific)

### **Installation Steps**

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd shiftmanager2
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Install PM2 Globally**
   ```bash
   npm install -g pm2
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```
   **Note**: App runs on port 3001 (not default 3000)

## 🚀 **Running the Application**

### **Option 1: Development Mode (Manual)**
```bash
pnpm dev
```
- **Port**: 3001
- **URL**: http://localhost:3001
- **Auto-reload**: Yes (for code changes)

### **Option 2: Production Mode with PM2 (Recommended)**
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Save configuration
pm2 save

# Check status
pm2 status
```

### **Option 3: Windows Batch File**
```bash
# Double-click or run:
start.bat
```

### **Option 4: PowerShell Script**
```powershell
# Run as Administrator:
.\start-pm2.ps1
```

## ⚙️ **Configuration Files**

### **ecosystem.config.js**
```javascript
module.exports = {
  apps: [{
    name: 'shiftmanager2',
    script: 'start.js',        // Custom startup script
    cwd: __dirname,
    watch: false,
    instances: 1,
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3001              // Custom port
    },
    min_uptime: '10s',
    max_restarts: 5
  }]
}
```

### **package.json Scripts**
```json
{
  "scripts": {
    "dev": "next dev -p 3001",    // Custom port
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## 🔧 **Key Features**

### **Employee Management**
- Add/remove employees
- Color-coded employee identification
- Hour tracking and editing
- Role-based assignments

### **Shift Scheduling**
- Drag-and-drop shift assignment
- Multiple shift types (day, night, etc.)
- Conflict detection
- Undo/redo functionality

### **Vacation & Holiday Management**
- Vacation request tracking
- Holiday calendar integration
- Visual highlighting in calendar
- Backend report generation

### **Data Persistence**
- **IndexedDB**: Primary storage (larger capacity, better performance)
- **localStorage**: Fallback storage
- **Automatic migration**: Seamless data transfer
- **Caching**: Instant data access

### **Export & Sharing**
- Print-friendly layouts
- Backend reports
- Image export (PNG)
- Shareable URLs

## 🗄️ **Data Storage Details**

### **Storage Migration**
- **Automatic**: Runs on app startup
- **Backward Compatible**: Preserves all existing data
- **Fallback**: Continues working if IndexedDB fails
- **Verification**: Confirms migration success

### **Data Structure**
```typescript
interface ScheduleData {
  employees: Employee[]
  assignments: Assignment[]
  holidays: Holiday[]
  vacations: Vacation[]
  monthInfos: MonthInfo[]
  dayNotes: DayNote[]
  lastSaved: number
}
```

### **Storage Keys**
- Format: `schedule-{month}-{year}`
- Example: `schedule-7-2025` (August 2025)

## 🐛 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. Port Already in Use (EADDRINUSE)**
```bash
# Kill conflicting processes
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use custom port (already configured)
# App runs on port 3001
```

#### **2. PM2 Process Stopping**
```bash
# Check PM2 logs
pm2 logs shiftmanager2

# Restart if needed
pm2 restart shiftmanager2

# Check configuration
pm2 show shiftmanager2
```

#### **3. Data Not Saving/Loading**
```bash
# Check browser console for errors
# Verify IndexedDB support
# Check storage wrapper logs
```

#### **4. PowerShell Syntax Issues**
```powershell
# Use semicolons instead of && in PowerShell
cd C:\path\to\project; pnpm dev

# Or use separate commands
cd C:\path\to\project
pnpm dev
```

### **Debug Commands**
```bash
# PM2 Status
pm2 status

# PM2 Logs
pm2 logs shiftmanager2

# PM2 Info
pm2 show shiftmanager2

# Restart App
pm2 restart shiftmanager2

# Stop App
pm2 stop shiftmanager2

# Delete App
pm2 delete shiftmanager2
```

## 🔄 **Development Workflow**

### **Making Code Changes**
1. **Edit files** (no PM2 restart needed)
2. **Save changes** (Next.js auto-reloads)
3. **Test in browser** (instant updates)
4. **Only restart PM2 for config changes**

### **When PM2 Restart IS Needed**
- `ecosystem.config.js` changes
- `package.json` script changes
- Environment variable changes
- Port configuration changes
- New dependencies installed

### **When PM2 Restart is NOT Needed**
- Component code changes
- Styling updates
- Logic modifications
- File edits in `app/` or `lib/`

## 📱 **Browser Compatibility**

### **Required Features**
- **IndexedDB**: For primary data storage
- **ES6+**: For modern JavaScript features
- **CSS Grid/Flexbox**: For responsive layouts

### **Supported Browsers**
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🚨 **Important Notes**

### **Windows-Specific Configuration**
- **PM2**: Configured for Windows environment
- **Port**: Set to 3001 to avoid conflicts
- **Startup**: Windows Task Scheduler or Startup folder for auto-start
- **PowerShell**: Use semicolons, not `&&` operator

### **Data Persistence**
- **Client-side only**: No server database required
- **Browser storage**: Data stored locally
- **No data loss**: Automatic backup and migration
- **Cross-tab sync**: Real-time updates

### **Performance**
- **Caching**: In-memory cache for instant access
- **Lazy loading**: Components load on demand
- **Optimized rendering**: Efficient React updates

## 📚 **Additional Resources**

### **Documentation Files**
- `PM2_SETUP.md` - Detailed PM2 configuration
- `ecosystem.config.js` - PM2 process configuration
- `start.js` - Custom startup script

### **Startup Scripts**
- `start.bat` - Windows batch file
- `start-pm2.ps1` - PowerShell script

### **Log Files**
- `logs/err.log` - Error logs
- `logs/out.log` - Output logs
- `logs/combined.log` - Combined logs

## 🤝 **Support & Maintenance**

### **Regular Maintenance**
- **PM2**: Monitor process health
- **Logs**: Check for errors regularly
- **Updates**: Keep dependencies current
- **Backup**: Export data periodically

### **Monitoring Commands**
```bash
# Check app health
pm2 status
pm2 logs shiftmanager2 --lines 50

# Monitor resources
pm2 monit

# Check system resources
pm2 show shiftmanager2
```

---

**Last Updated**: December 2024  
**Project Status**: Production Ready with PM2  
**Environment**: Windows 10/11, Node.js 18+, PM2  
**Port**: 3001 (custom configured)
