# 🔄 Development Workflow - ALWAYS CHECK FIRST!

## ⚠️ **MANDATORY: Check This File Before Any Development Work**

This file contains the **ONLY** approved development workflow. Deviating from this will cause version conflicts and deployment issues.

---

## 🎯 **Session Start Checklist (REQUIRED)**

Before writing ANY code or making ANY changes, you MUST complete these steps:

### 1. **Sync with GitHub**
```bash
git pull origin main
git status
```
**Expected Result**: "Your branch is up to date with 'origin/main'" and "working tree clean"

### 2. **Verify Current State**
- ✅ Local code matches GitHub exactly
- ✅ No uncommitted changes
- ✅ Working tree is clean
- ✅ All files are tracked

---

## 🚫 **NEVER DO THESE THINGS**

- ❌ **NEVER** start coding without pulling from GitHub
- ❌ **NEVER** make changes without checking git status
- ❌ **NEVER** leave changes uncommitted
- ❌ **NEVER** push without testing locally first
- ❌ **NEVER** work on outdated local code

---

## ✅ **APPROVED Development Process**

### **Phase 1: Preparation (ALWAYS FIRST)**
```bash
git pull origin main
git status
# Verify: "working tree clean" and "up to date"
```

### **Phase 2: Development**
- Make changes to files
- Test changes thoroughly
- Ensure no build errors (`npm run build`)
- Test locally (`npm run dev`)

### **Phase 3: Commit & Push**
```bash
git add .
git commit -m "Clear description of changes"
git push origin main
```

### **Phase 4: Verify Deployment**
- Check Vercel deployment status
- Test live application
- Confirm changes are working

---

## 🔍 **Current Project Status**

- **Repository**: `designbyarionix/ShiftManager3`
- **Main Branch**: `main`
- **Deployment**: Vercel (automatic on push)
- **Live URL**: https://shiftmanager2-hclnsgaxd-designbyarionixs-projects.vercel.app

---

## 📋 **File Locations to Check**

- **Main App**: `app/page.tsx` (2,600+ lines)
- **Components**: `components/ui/` (40+ components)
- **Storage**: `lib/` (IndexedDB + localStorage)
- **Config**: `vercel.json`, `ecosystem.config.js`

---

## 🚨 **Emergency Procedures**

### **If Working Tree is NOT Clean:**
```bash
git stash  # Save changes temporarily
git pull origin main  # Get latest
git stash pop  # Reapply your changes
```

### **If Merge Conflicts Occur:**
```bash
git status  # See conflicted files
# Resolve conflicts manually
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

---

## 📝 **Session Log Template**

**Date**: [Current Date]
**Session Start**: ✅ Pulled from GitHub, working tree clean
**Changes Made**: [List of changes]
**Session End**: ✅ Committed and pushed to GitHub

---

## 🎯 **Remember**

**This workflow is NOT optional - it's MANDATORY for every development session.**

**Following this workflow ensures:**
- ✅ No version conflicts
- ✅ Consistent deployments
- ✅ Clean git history
- ✅ Reliable Vercel updates
- ✅ Team collaboration works

**Breaking this workflow will result in:**
- ❌ Lost work
- ❌ Deployment failures
- ❌ Version conflicts
- ❌ Broken builds

---

**Last Updated**: August 23, 2025
**Next Review**: Before next development session
