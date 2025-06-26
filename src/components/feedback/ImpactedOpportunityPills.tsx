import { Opportunity } from '@/lib/services/opportunity'
import { formatARR, middleTruncate } from '@/lib/format'

interface Props {
  opportunities: Opportunity[]
  selectedId: string | null
  setSelectedId: (id: string) => void
  loading?: boolean
}

export function ImpactedOpportunityPills({ opportunities, selectedId, setSelectedId, loading }: Props) {
  if (loading) {
    return <div className="flex flex-wrap gap-2 text-xs text-gray-400">Loading opportunities...</div>
  }
  if (!opportunities.length) {
    return <div className="flex flex-wrap gap-2 text-xs text-gray-400">No open opportunities for this account.</div>
  }
  // Sort by CLOSE_ON ascending (soonest first)
  const sorted = [...opportunities].sort((a, b) => new Date(a.CLOSE_ON).getTime() - new Date(b.CLOSE_ON).getTime())
  return (
    <div className="flex flex-wrap gap-2">
      {sorted.map(opp => (
        <button
          key={opp.SFDC_OPPORTUNITY_ID}
          type="button"
          className={`px-3 py-2 rounded-xl border text-xs flex flex-col items-stretch max-w-xs min-w-[200px] truncate transition-all
            ${selectedId === opp.SFDC_OPPORTUNITY_ID ? 'bg-blue-100 border-blue-400 text-blue-900 font-semibold' : 'bg-white border-gray-300 text-gray-700'}`}
          onClick={() => setSelectedId(opp.SFDC_OPPORTUNITY_ID)}
          title={opp.OPPORTUNITY_NAME}
          style={{ minWidth: 220, maxWidth: 300 }}
        >
          <div className="w-full font-medium text-left truncate" title={opp.OPPORTUNITY_NAME}>
            {middleTruncate(opp.OPPORTUNITY_NAME, 32)}
          </div>
          <div className="flex items-center justify-between w-full mt-0.5 gap-1">
            <span className="bg-gray-200 text-gray-700 rounded px-1 text-[10px] flex-shrink-0">{opp.OPPORTUNITY_STAGE}</span>
            <span className="text-gray-500 font-mono tabular-nums text-xs mx-auto">{formatARR(opp.NEW_AND_EXPANSION_ANNUAL_RECURRING_REVENUE)}</span>
            <span className="text-gray-400 text-[10px] flex-shrink-0 ml-2">{opp.CLOSE_ON ? new Date(opp.CLOSE_ON).toLocaleDateString() : ''}</span>
          </div>
        </button>
      ))}
    </div>
  )
} 