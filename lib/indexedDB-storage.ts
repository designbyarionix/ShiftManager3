export class IndexedDBStorage {
  private dbName = 'EmployeeSchedulerDB'
  private storeName = 'schedules'
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' })
        }
      }
    })
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.db) {
      console.log('🔄 IndexedDB: Initializing database...')
      await this.init()
    }
    
    console.log(`🔄 IndexedDB: Setting item ${key} (${value.length} chars)`)
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put({ key, value, timestamp: Date.now() })
      
      request.onsuccess = () => {
        console.log('✅ IndexedDB: Item saved successfully')
        resolve()
      }
      request.onerror = () => {
        console.error('❌ IndexedDB: Failed to save item:', request.error)
        reject(request.error)
      }
    })
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.db) {
      console.log('🔄 IndexedDB: Initializing database for getItem...')
      await this.init()
    }
    
    console.log(`🔄 IndexedDB: Getting item ${key}`)
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)
      
      request.onsuccess = () => {
        const result = request.result?.value || null
        console.log(`✅ IndexedDB: Retrieved item ${key}: ${result ? result.length + ' chars' : 'null'}`)
        resolve(result)
      }
      request.onerror = () => {
        console.error('❌ IndexedDB: Failed to get item:', request.error)
        reject(request.error)
      }
    })
  }

  async removeItem(key: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getAllKeys(): Promise<string[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAllKeys()
      
      request.onsuccess = () => resolve(request.result as string[])
      request.onerror = () => reject(request.error)
    })
  }
}
