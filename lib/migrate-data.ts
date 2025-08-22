import { storageWrapper } from './storage-wrapper'

export interface MigrationResult {
  success: boolean
  migratedKeys: string[]
  totalKeys: number
  errors: string[]
}

export async function migrateFromLocalStorage(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    migratedKeys: [],
    totalKeys: 0,
    errors: []
  }

  try {
    // Get all keys from localStorage
    const keys = Object.keys(localStorage)
    const schedulerKeys = keys.filter(key => 
      key.startsWith('schedule-') || 
      key.includes('employee') || 
      key.includes('vacation') ||
      key.includes('holiday') ||
      key.includes('note')
    )
    
    result.totalKeys = schedulerKeys.length
    
    if (schedulerKeys.length === 0) {
      result.success = true
      return result
    }

    console.log(`Found ${schedulerKeys.length} keys to migrate from localStorage`)

    // Migrate each key
    for (const key of schedulerKeys) {
      try {
        const value = localStorage.getItem(key)
        if (value) {
          await storageWrapper.setItem(key, value)
          result.migratedKeys.push(key)
          console.log(`✅ Migrated: ${key}`)
        }
      } catch (error) {
        const errorMsg = `Failed to migrate ${key}: ${error}`
        result.errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    result.success = result.errors.length === 0
    console.log(`Migration completed: ${result.migratedKeys.length}/${result.totalKeys} keys migrated successfully`)
    
    return result

  } catch (error) {
    result.errors.push(`Migration failed: ${error}`)
    console.error('Migration failed:', error)
    return result
  }
}

export async function verifyMigration(): Promise<boolean> {
  try {
    // Check if we can access IndexedDB
    const testKey = 'migration-test'
    const testValue = 'test-value'
    
    await storageWrapper.setItem(testKey, testValue)
    const retrievedValue = await storageWrapper.getItem(testKey)
    await storageWrapper.removeItem(testKey)
    
    return retrievedValue === testValue
  } catch (error) {
    console.error('Migration verification failed:', error)
    return false
  }
}

export async function getStorageInfo(): Promise<{
  localStorageKeys: string[]
  indexedDBKeys: string[]
  totalLocalStorageSize: number
}> {
  try {
    // Get localStorage info
    const localStorageKeys = Object.keys(localStorage)
    const totalLocalStorageSize = localStorageKeys.reduce((total, key) => {
      const value = localStorage.getItem(key)
      return total + (value ? new Blob([value]).size : 0)
    }, 0)

    // Get IndexedDB info
    const indexedDBKeys = await storageWrapper.indexedDB?.getAllKeys() || []

    return {
      localStorageKeys,
      indexedDBKeys,
      totalLocalStorageSize
    }
  } catch (error) {
    console.error('Failed to get storage info:', error)
    return {
      localStorageKeys: [],
      indexedDBKeys: [],
      totalLocalStorageSize: 0
    }
  }
}
