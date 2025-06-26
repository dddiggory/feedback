import { Opportunity } from '@/lib/services/opportunity'
import { formatARR, middleTruncate } from '@/lib/format'

interface Props {
  opportunities: Opportunity[]
  selectedId: string | null
  setSelectedId: (id: string) => void
  loading?: boolean
}

const ExternalLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="w-3 h-3 text-gray-600 hover:text-blue-700 transition-colors"
    aria-hidden="true"
  >
    <path d="M13.5 2a.5.5 0 0 0 0 1h2.793l-6.147 6.146a.5.5 0 1 0 .708.708L17 3.707V6.5a.5.5 0 0 0 1 0v-4A.5.5 0 0 0 17.5 2h-4ZM4 5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-3a.5.5 0 0 0-1 0v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a.5.5 0 0 0 0-1H4Z" />
  </svg>
)

export function ImpactedOpportunityPills({ opportunities, selectedId, setSelectedId, loading }: Props) {
  return (
    <div className="w-full">
      <div className="font-semibold text-xs text-gray-700 mb-1 pl-1">Main Impacted Opportunity (default: opp with next close date)</div>
      {loading ? (
        <div className="flex flex-wrap gap-2 text-xs text-gray-400">Loading opportunities...</div>
      ) : !opportunities.length ? (
        <div className="flex flex-wrap gap-2 text-xs text-gray-400">Select an account to see open opportunities</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {[...opportunities].sort((a, b) => new Date(a.CLOSE_ON).getTime() - new Date(b.CLOSE_ON).getTime()).map(opp => (
            <div
              key={opp.SFDC_OPPORTUNITY_ID}
              className={`relative px-3 py-2 rounded-xl border text-xs flex flex-col items-stretch max-w-xs min-w-[200px] truncate transition-all
                ${selectedId === opp.SFDC_OPPORTUNITY_ID ? 'bg-blue-100 border-blue-400 text-blue-900 font-semibold' : 'bg-white border-gray-300 text-gray-700'}`}
              style={{ minWidth: 220, maxWidth: 300 }}
            >
              {/* External link icon */}
              <a
                href={`https://vercel.lightning.force.com/lightning/r/Opportunity/${opp.SFDC_OPPORTUNITY_ID}/view`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-1 right-1 p-0.5 rounded hover:bg-blue-50 focus:bg-blue-100"
                tabIndex={0}
                title="View in Salesforce (new window)"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLinkIcon />
              </a>
              {/* Clickable area for selection */}
              <button
                type="button"
                className="text-left flex-1 focus:outline-none"
                style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
                onClick={() => setSelectedId(opp.SFDC_OPPORTUNITY_ID)}
                tabIndex={-1}
              >
                {/* Line 1: Middle-truncated name, full width */}
                <div className="w-full font-medium text-left truncate" title={opp.OPPORTUNITY_NAME}>
                  {middleTruncate(opp.OPPORTUNITY_NAME, 32)}
                </div>
                {/* Line 2: Stage (left), ARR (center), Date (right) */}
                <div className="flex items-center justify-between w-full mt-0.5 gap-1">
                  <span className="bg-gray-200 text-gray-700 rounded px-1 text-[10px] flex-shrink-0">{opp.OPPORTUNITY_STAGE}</span>
                  <span className="text-gray-500 font-mono tabular-nums text-xs mx-auto">{formatARR(opp.NEW_AND_EXPANSION_ANNUAL_RECURRING_REVENUE)}</span>
                  <span className="text-gray-400 text-[10px] flex-shrink-0 ml-2">{opp.CLOSE_ON ? new Date(opp.CLOSE_ON).toLocaleDateString() : ''}</span>
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 