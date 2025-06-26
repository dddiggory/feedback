import snowflake from 'snowflake-sdk'

// Snowflake connection configuration
const snowflakeConfig = {
  account: process.env.SNOWFLAKE_DATA_ACCOUNT,
  username: process.env.SNOWFLAKE_DATA_USER,
  password: process.env.SNOWFLAKE_DATA_PASSWORD,
  role: process.env.SNOWFLAKE_DATA_ROLE,
  warehouse: process.env.SNOWFLAKE_DATA_WAREHOUSE,
}

// Utility function to execute queries
export async function executeQuery<T = unknown>(sql: string, binds: unknown[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const connection = snowflake.createConnection(snowflakeConfig)
    
    connection.connect((err, conn) => {
      if (err) {
        reject(err)
        return
      }
      
      conn.execute({
        sqlText: sql,
        binds: binds,
        complete: (err, stmt, rows) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows || [])
          }
          conn.destroy((err) => {
            if (err) console.error('Error destroying connection:', err)
          })
        }
      })
    })
  })
}

// Test connection function
export async function testConnection(): Promise<boolean> {
  try {
    const result = await executeQuery('SELECT 1 as test')
    return result.length > 0
  } catch (error) {
    console.error('Snowflake connection test failed:', error)
    return false
  }
} 