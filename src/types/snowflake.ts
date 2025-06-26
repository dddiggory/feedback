// Types for Snowflake account/opportunity data
export interface AccountOpportunity {
  id: string
  name: string
  type: 'account' | 'opportunity'
  parent_id?: string
  parent_name?: string
}

// Generic Snowflake query result
export interface SnowflakeQueryResult<T> {
  data: T[]
  error?: string
} 