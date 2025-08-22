import { IndexedDBStorage } from './indexedDB-storage'

class StorageWrapper {
  private indexedDB: IndexedDBStorage
  private fallbackToLocalStorage = false
  private isInitialized = false
  private cache = new Map<string, string>()

  constructor() {
    this.indexedDB = new IndexedDBStorage()
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      try {
        await this.indexedDB.init()
        this.isInitialized = true
      } catch (error) {
        console.warn('IndexedDB initialization failed, using localStorage fallback:', error)
        this.fallbackToLocalStorage = true
        this.isInitialized = true
      }
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.ensureInitialized()
    
    // Update cache immediately for faster access
    this.cache.set(key, value)
    
    console.log(`🔄 StorageWrapper: Saving ${key} (${value.length} chars)`)
    
    try {
      if (!this.fallbackToLocalStorage) {
        console.log('📊 Attempting to save to IndexedDB...')
        await this.indexedDB.setItem(key, value)
        console.log('✅ Successfully saved to IndexedDB')
      } else {
        console.log('⚠️ Using localStorage fallback mode')
      }
      // Always save to localStorage as backup
      localStorage.setItem(key, value)
      console.log('✅ Saved to localStorage as backup')
    } catch (error) {
      console.warn('❌ IndexedDB failed, falling back to localStorage:', error)
      localStorage.setItem(key, value)
      console.log('✅ Saved to localStorage as fallback')
      this.fallbackToLocalStorage = true
    }
  }

  async getItem(key: string): Promise<string | null> {
    // Check cache first for instant access
    if (this.cache.has(key)) {
      console.log(`⚡ Cache hit for ${key}`)
      return this.cache.get(key)!
    }

    await this.ensureInitialized()
    
    console.log(`🔄 StorageWrapper: Getting item ${key}`)
    
    try {
      if (this.fallbackToLocalStorage) {
        console.log('⚠️ Using localStorage fallback mode for getItem')
        const value = localStorage.getItem(key)
        if (value) {
          this.cache.set(key, value) // Cache the result
        }
        console.log(`📥 Retrieved from localStorage: ${value ? value.length + ' chars' : 'null'}`)
        return value
      }
      
      console.log('📊 Attempting to get from IndexedDB...')
      const value = await this.indexedDB.getItem(key)
      if (value === null) {
        console.log('⚠️ No data in IndexedDB, trying localStorage fallback...')
        // Try localStorage as fallback
        const fallbackValue = localStorage.getItem(key)
        if (fallbackValue) {
          this.cache.set(key, fallbackValue) // Cache the result
        }
        console.log(`📥 Retrieved from localStorage fallback: ${fallbackValue ? fallbackValue.length + ' chars' : 'null'}`)
        return fallbackValue
      }
      this.cache.set(key, value) // Cache the result
      console.log(`✅ Retrieved from IndexedDB: ${value.length} chars`)
      return value
    } catch (error) {
      console.warn('❌ IndexedDB failed, falling back to localStorage:', error)
      const fallbackValue = localStorage.getItem(key)
      if (fallbackValue) {
        this.cache.set(key, fallbackValue) // Cache the result
      }
      console.log(`📥 Retrieved from localStorage after error: ${fallbackValue ? fallbackValue.length + ' chars' : 'null'}`)
      return fallbackValue
    }
  }

  async removeItem(key: string): Promise<void> {
    await this.ensureInitialized()
    
    // Remove from cache
    this.cache.delete(key)
    
    try {
      if (!this.fallbackToLocalStorage) {
        await this.indexedDB.removeItem(key)
      }
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error)
      localStorage.removeItem(key)
    }
  }

  async clear(): Promise<void> {
    await this.ensureInitialized()
    
    // Clear cache
    this.cache.clear()
    
    try {
      if (!this.fallbackToLocalStorage) {
        await this.indexedDB.clear()
      }
      localStorage.clear()
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error)
      localStorage.clear()
    }
  }

  // Synchronous methods for compatibility
  setItemSync(key: string, value: string): void {
    // Update cache immediately
    this.cache.set(key, value)
    localStorage.setItem(key, value)
    // Queue async IndexedDB save
    this.setItem(key, value).catch(console.error)
  }

  getItemSync(key: string): string | null {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key)!
    }
    // Fallback to localStorage
    const value = localStorage.getItem(key)
    if (value) {
      this.cache.set(key, value)
    }
    return value
  }

  removeItemSync(key: string): void {
    this.cache.delete(key)
    localStorage.removeItem(key)
    // Queue async IndexedDB delete
    this.removeItem(key).catch(console.error)
  }

  clearSync(): void {
    this.cache.clear()
    localStorage.clear()
    // Queue async IndexedDB clear
    this.clear().catch(console.error)
  }
}

export const storageWrapper = new StorageWrapper()
