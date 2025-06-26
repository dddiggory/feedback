import { executeQuery } from '../snowflake'

export interface Opportunity {
  SFDC_OPPORTUNITY_ID: string
  OPPORTUNITY_NAME: string
  NEW_AND_EXPANSION_ANNUAL_RECURRING_REVENUE: number
  OPPORTUNITY_STAGE: string
  CLOSE_ON: string // ISO date string
}

export async function getOpportunitiesByAccountId(accountId: string): Promise<Opportunity[]> {
  if (!accountId) return []
  try {
    const sql = `
      SELECT 
        SFDC_OPPORTUNITY_ID,
        OPPORTUNITY_NAME,
        NEW_AND_EXPANSION_ANNUAL_RECURRING_REVENUE,
        OPPORTUNITY_STAGE,
        CLOSE_ON
      FROM DWH_PROD.ANALYTICS.OPPORTUNITIES
      WHERE SFDC_ACCOUNT_ID = ?
        AND CLOSE_ON >= DATEADD(month, -6, CURRENT_DATE())
      ORDER BY NEW_AND_EXPANSION_ANNUAL_RECURRING_REVENUE DESC
      LIMIT 20
    `
    const result = await executeQuery<Opportunity>(sql, [accountId])
    return result
  } catch (error) {
    console.error('Error fetching opportunities:', error)
    return []
  }
} 