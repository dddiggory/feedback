import { useState, useEffect } from 'react'
import { Opportunity } from '@/lib/services/opportunity'

export function useOpportunitiesByAccount(accountId: string) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accountId) {
      setOpportunities([])
      setSelectedId(null)
      return
    }
    setLoading(true)
    fetch(`/api/opportunities/by-account?accountId=${encodeURIComponent(accountId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOpportunities(data.opportunities)
          if (data.opportunities.length > 0) {
            // Find the one with the closest future CLOSE_ON date (today or later)
            const today = new Date()
            const future = data.opportunities
              .filter((opp: Opportunity) => opp.CLOSE_ON && new Date(opp.CLOSE_ON) >= today)
              .sort((a: Opportunity, b: Opportunity) => new Date(a.CLOSE_ON).getTime() - new Date(b.CLOSE_ON).getTime())
            if (future.length > 0) {
              setSelectedId(future[0].SFDC_OPPORTUNITY_ID)
            } else {
              setSelectedId(data.opportunities[0].SFDC_OPPORTUNITY_ID)
            }
          } else {
            setSelectedId(null)
          }
          setError(null)
        } else {
          setError(data.message || 'Failed to fetch opportunities')
        }
      })
      .catch(err => {
        setError('Failed to fetch opportunities')
      })
      .finally(() => setLoading(false))
  }, [accountId])

  return {
    opportunities,
    selectedId,
    setSelectedId,
    loading,
    error,
  }
} 