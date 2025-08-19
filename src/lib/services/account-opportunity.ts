import { executeQuery } from '../snowflake'
import { AccountOpportunity } from '@/types/snowflake'

// Interface for account data from Snowflake
export interface Account {
  SFDC_ACCOUNT_ID: string
  ACCOUNT_NAME: string
  ACCOUNT_TYPE: string
  REGION_NAME?: string
  ANNUAL_RECURRING_REVENUE?: number
  IS_ACTIVE_ENTERPRISE_CUSTOMER?: boolean
  UPDATED_AT?: string
  ACCOUNT_LINK?: string
  WEBSITE?: string
}

// Search accounts by name
export async function searchAccounts(searchTerm: string): Promise<Account[]> {
  try {
    const sql = `
      SELECT 
        SFDC_ACCOUNT_ID,
        ACCOUNT_NAME,
        ACCOUNT_TYPE,
        REGION_NAME,
        ANNUAL_RECURRING_REVENUE,
        IS_ACTIVE_ENTERPRISE_CUSTOMER,
        UPDATED_AT,
        ACCOUNT_LINK,
        WEBSITE,
        SUMBLE_ORG_ID
      FROM DWH_PROD.ANALYTICS.ACCOUNTS
      WHERE ACCOUNT_NAME ILIKE ?
      AND (
        (REGION_NAME IS NOT NULL AND REGION_NAME NOT ILIKE '%Not Enough Info%')
        OR WEBSITE IS NOT NULL
        OR SUMBLE_ORG_ID IS NOT NULL
      )
      AND UPDATED_AT >= DATEADD(year, -1, CURRENT_DATE())
      ORDER BY ANNUAL_RECURRING_REVENUE DESC NULLS LAST, UPDATED_AT DESC
      LIMIT 20
    `
    
    const result = await executeQuery<Account>(sql, [`%${searchTerm}%`])
    return result
  } catch (error) {
    console.error('Error searching accounts:', error)
    return []
  }
}

// Get initial accounts (for when search is empty)
export async function getInitialAccounts(): Promise<Account[]> {
  try {
    const sql = `
      SELECT 
        SFDC_ACCOUNT_ID,
        ACCOUNT_NAME,
        ACCOUNT_TYPE,
        REGION_NAME,
        ANNUAL_RECURRING_REVENUE,
        IS_ACTIVE_ENTERPRISE_CUSTOMER,
        UPDATED_AT,
        ACCOUNT_LINK,
        SUMBLE_ORG_ID,
        WEBSITE
      FROM DWH_PROD.ANALYTICS.ACCOUNTS
      WHERE (REGION_NAME IS NOT NULL AND REGION_NAME NOT ILIKE '%Not Enough Info%')
        AND UPDATED_AT >= DATEADD(year, -1, CURRENT_DATE())
      ORDER BY ANNUAL_RECURRING_REVENUE DESC NULLS LAST, UPDATED_AT DESC
      LIMIT 20
    `
    
    const result = await executeQuery<Account>(sql)
    return result
  } catch (error) {
    console.error('Error fetching initial accounts:', error)
    return []
  }
}

// Search accounts and opportunities by name
export async function searchAccountsOpportunities(searchTerm: string): Promise<AccountOpportunity[]> {
  try {
    // TODO: Replace with actual table names and column names
    // This is a placeholder query - we'll update it with the correct table structure
    const sql = `
      SELECT 
        id,
        name,
        type,
        parent_id,
        parent_name
      FROM your_accounts_opportunities_table
      WHERE name ILIKE ?
      ORDER BY name
      LIMIT 50
    `
    
    const result = await executeQuery<AccountOpportunity>(sql, [`%${searchTerm}%`])
    return result
  } catch (error) {
    console.error('Error searching accounts/opportunities:', error)
    return []
  }
}

// Get all accounts and opportunities (for initial load)
export async function getAllAccountsOpportunities(): Promise<AccountOpportunity[]> {
  try {
    // TODO: Replace with actual table names and column names
    const sql = `
      SELECT 
        id,
        name,
        type,
        parent_id,
        parent_name
      FROM your_accounts_opportunities_table
      ORDER BY name
      LIMIT 100
    `
    
    const result = await executeQuery<AccountOpportunity>(sql)
    return result
  } catch (error) {
    console.error('Error fetching all accounts/opportunities:', error)
    return []
  }
} 