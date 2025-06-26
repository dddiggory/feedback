import { NextResponse } from 'next/server'
import { testSnowflakeConnection } from '@/lib/test-snowflake'

export async function GET() {
  try {
    const result = await testSnowflakeConnection()
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Snowflake connection and query successful',
        accountsCount: result.accountsCount,
        sampleData: result.sampleData
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Snowflake connection or query failed',
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 