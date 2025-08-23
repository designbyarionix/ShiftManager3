import { storageWrapper } from './storage-wrapper'

export const getStorageStats = async () => {
  try {
    // Get all keys from IndexedDB
    const indexedDBKeys = await storageWrapper.indexedDB?.getAllKeys() || []
    
    // Get all keys from localStorage
    const localStorageKeys = Object.keys(localStorage)
    
    // Calculate sizes
    const localStorageSize = localStorageKeys.reduce((total, key) => {
      const value = localStorage.getItem(key)
      return total + (value ? new Blob([value]).size : 0)
    }, 0)
    
    return {
      indexedDB: {
        keys: indexedDBKeys.length,
        keysList: indexedDBKeys
      },
      localStorage: {
        keys: localStorageKeys.length,
        keysList: localStorageKeys,
        totalSize: localStorageSize
      },
      totalKeys: indexedDBKeys.length + localStorageKeys.length
    }
  } catch (error) {
    console.error('Failed to get storage stats:', error)
    return null
  }
}

export const clearAllData = async () => {
  try {
    await storageWrapper.clear()
    return { success: true, message: 'All data cleared successfully' }
  } catch (error) {
    console.error('Failed to clear data:', error)
    return { success: false, message: `Failed to clear data: ${error}` }
  }
}

export const exportAllData = async () => {
  try {
    const stats = await getStorageStats()
    if (!stats) return null
    
    const exportData: any = {}
    
    // Export IndexedDB data
    for (const key of stats.indexedDB.keysList) {
      const value = await storageWrapper.getItem(key)
      if (value) {
        exportData[key] = value
      }
    }
    
    // Export localStorage data
    for (const key of stats.localStorage.keysList) {
      const value = localStorage.getItem(key)
      if (value) {
        exportData[key] = value
      }
    }
    
    return {
      timestamp: new Date().toISOString(),
      totalKeys: stats.totalKeys,
      data: exportData
    }
  } catch (error) {
    console.error('Failed to export data:', error)
    return null
  }
}

