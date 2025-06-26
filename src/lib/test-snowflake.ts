import { executeQuery } from './snowflake'

interface TestResult {
  success: boolean
  accountsCount?: number
  sampleData?: any[]
  error?: string
}

// Test function to verify Snowflake connection and query the ACCOUNTS table
export async function testSnowflakeConnection(): Promise<TestResult> {
  console.log('Testing Snowflake connection...')
  
  try {
    // First test basic connection
    const isConnected = await executeQuery('SELECT 1 as test')
    if (isConnected.length === 0) {
      console.log('❌ Basic Snowflake connection failed!')
      return { success: false, error: 'Basic connection test failed' }
    }
    
    console.log('✅ Basic Snowflake connection successful!')
    
    // Now test querying the ACCOUNTS table
    console.log('Querying DWH_PROD.ANALYTICS.ACCOUNTS...')
    const accountsResult = await executeQuery(`
      SELECT * 
      FROM DWH_PROD.ANALYTICS.ACCOUNTS 
      LIMIT 10
    `)
    
    console.log('✅ ACCOUNTS table query successful!')
    console.log('📊 Sample data:', accountsResult)
    
    return {
      success: true,
      accountsCount: accountsResult.length,
      sampleData: accountsResult
    }
  } catch (error) {
    console.error('❌ Snowflake connection/query error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
} 