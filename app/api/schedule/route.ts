import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { month, year, data } = body
    
    if (!month || !year || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: month, year, data' },
        { status: 400 }
      )
    }

    const key = `schedule:${month}:${year}`
    
    // Save data to Vercel KV
    await kv.set(key, JSON.stringify(data))
    
    console.log(`✅ Data saved to Vercel KV: ${key}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Schedule saved successfully',
      key 
    })
  } catch (error) {
    console.error('❌ Error saving schedule:', error)
    return NextResponse.json(
      { error: 'Failed to save schedule' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    
    if (!month || !year) {
      return NextResponse.json(
        { error: 'Missing required parameters: month, year' },
        { status: 400 }
      )
    }

    const key = `schedule:${month}:${year}`
    
    // Get data from Vercel KV
    const data = await kv.get(key)
    
    if (!data) {
      return NextResponse.json({ 
        success: false, 
        message: 'No data found for this month/year',
        data: null 
      })
    }
    
    console.log(`✅ Data retrieved from Vercel KV: ${key}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Schedule loaded successfully',
      data: JSON.parse(data as string)
    })
  } catch (error) {
    console.error('❌ Error loading schedule:', error)
    return NextResponse.json(
      { error: 'Failed to load schedule' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    
    if (!month || !year) {
      return NextResponse.json(
        { error: 'Missing required parameters: month, year' },
        { status: 400 }
      )
    }

    const key = `schedule:${month}:${year}`
    
    // Delete data from Vercel KV
    await kv.del(key)
    
    console.log(`✅ Data deleted from Vercel KV: ${key}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Schedule deleted successfully' 
    })
  } catch (error) {
    console.error('❌ Error deleting schedule:', error)
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}
