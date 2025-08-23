export interface VercelStorageData {
  employees: any[]
  assignments: any[]
  holidays: any[]
  vacations: any[]
  monthInfos: any[]
  dayNotes: any[]
  lastSaved: number
  dataHash: string
}

class VercelStorageService {
  private baseUrl: string

  constructor() {
    // Use relative URL for same-origin requests
    this.baseUrl = '/api/schedule'
  }

  async saveSchedule(month: number, year: number, data: VercelStorageData): Promise<{ success: boolean; message: string; key?: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ month, year, data }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Vercel KV save successful:', result)
      return result
    } catch (error) {
      console.error('❌ Vercel KV save failed:', error)
      throw error
    }
  }

  async loadSchedule(month: number, year: number): Promise<VercelStorageData | null> {
    try {
      const response = await fetch(`${this.baseUrl}?month=${month}&year=${year}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        console.log('✅ Vercel KV load successful:', result.message)
        return result.data
      } else {
        console.log('ℹ️ No data found in Vercel KV:', result.message)
        return null
      }
    } catch (error) {
      console.error('❌ Vercel KV load failed:', error)
      throw error
    }
  }

  async deleteSchedule(month: number, year: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}?month=${month}&year=${year}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Vercel KV delete successful:', result)
      return result
    } catch (error) {
      console.error('❌ Vercel KV delete failed:', error)
      throw error
    }
  }

  // Check if Vercel KV is available
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return response.ok
    } catch (error) {
      console.warn('Vercel KV not available:', error)
      return false
    }
  }
}

export const vercelStorage = new VercelStorageService()
