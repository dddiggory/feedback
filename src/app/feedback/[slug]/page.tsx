import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { FeedbackPageLogFeedbackDialog } from '@/components/feedback/FeedbackPageLogFeedbackDialog'
import { Layout } from '@/components/layout/Layout'
import { FeedbackEntryTable } from '@/components/feedback/FeedbackEntryTable'
import Link from 'next/link'

const GRADIENTS = [
  'bg-linear-to-r from-slate-50 to-emerald-200',
  'bg-linear-to-r from-slate-50 to-teal-200',
  'bg-linear-to-r from-slate-50 to-pink-200',
  'bg-linear-to-r from-slate-50 to-violet-200',
] as const

function getRandomGradient() {
  return GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]
}

export default async function FeedbackItemPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const supabase = await createClient()
  const { slug } = await params
  
  const { data: feedbackItem } = await supabase
    .from('feedback_items_with_data')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!feedbackItem) {
    notFound()
  }

  // Fetch entries for this feedback item
  const { data: entries } = await supabase
    .from('entries_with_data')
    .select('*')
    .eq('feedback_item_id', feedbackItem.id)
    .order('created_at', { ascending: false })

  return (
    <Layout>
      {/* Shipped Status Banner */}
      {feedbackItem.status === 'shipped' && (
        <div className="rounded-md bg-linear-to-r from-green-500 to-emerald-600 text-white p-6 mb-6 shadow-lg">
          <div className="container mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🚢</span>
              <h2 className="text-2xl font-bold">SHIPPED!</h2>
            </div>
            <p className="text-lg mb-3">This product feedback item has been resolved.</p>
            {feedbackItem.shipped_notes && (
              <div className="bg-white/20 rounded-lg p-4">
                <p className="font-semibold mb-1">Notes:</p>
                <p className="text-white/90">{feedbackItem.shipped_notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto pb-8 pt-1">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2 h-10 overflow-hidden">
              {feedbackItem.product_area_names?.map((area: string, index: number) => (
                <Link
                  key={area}
                  href={`/areas/${feedbackItem.product_area_slugs?.[index]}`}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRandomGradient()} text-gray-800 hover:opacity-80 transition-opacity h-10`}
                >
                  {area}
                </Link>
              ))}
            </div>
            
            <h1 className={`font-bold text-slate-100 text-shadow-sky-950 max-w-[70vw] pr-2 ${feedbackItem.title.length > 50 ? 'text-4xl' : 'text-5xl'}`}>{feedbackItem.title}</h1>
            <div>
            <p className="text-slate-950 min-h-[150px] max-h-[150px] overflow-y-scroll mr-12 p-4 wrap-normal bg-slate-100/80 rounded-lg">{feedbackItem.description}</p>
            </div>
          </div>
          <div className="flex flex-col gap-y-3 min-w-[30vh] w-fit">
            <div>
              <FeedbackPageLogFeedbackDialog
                feedbackItemTitle={feedbackItem.title}
                feedbackItemDescription={feedbackItem.description}
                feedbackItemId={feedbackItem.id}
                trigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-x-2.5 rounded-xl bg-linear-to-r from-teal-200 to-teal-500 px-6 py-3.5 text-lg font-semibold text-slate-800 shadow-[0_4px_24px_0_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-all duration-200 hover:scale-[1.03] cursor-pointer h-14 whitespace-nowrap min-w-[30vh] w-fit"
                  >
                    <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    Add Customer +1
                  </button>
                }
              />
            </div>
            <div className="">
              <div className="grid grid-cols-1 gap-y-2 py-5 rounded-md bg-teal-200/50 text-slate-800 min-w-[30vh] w-fit">
                <div className="text-left col-span-1 ml-4">
                  <div className="text-3xl font-bold">{feedbackItem.entry_count || 0}</div>
                  <div>Customer Requests</div>
                </div>
                <div className="text-left col-span-1 ml-4">
                  <div className="text-3xl font-bold">
                    {(() => {
                      const value = feedbackItem.current_arr_sum || 0;
                      if (value >= 1000000) {
                        return `$${(value / 1000000).toFixed(2)}M`;
                      } else if (value >= 1000) {
                        return `$${Math.floor(value / 1000)}k`;
                      }
                      return `$${value}`;
                    })()}
                  </div>
                  <div>Current Customer Demand</div>
                </div>
                <div className="text-left col-span-1 ml-4">
                  <div className="text-3xl font-bold">
                    {(() => {
                      const value = feedbackItem.open_opp_arr_sum || 0;
                      if (value >= 1000000) {
                        return `$${(value / 1000000).toFixed(2)}M`;
                      } else if (value >= 1000) {
                        return `$${Math.floor(value / 1000)}k`;
                      }
                      return `$${value}`;
                    })()}
                  </div>
                  <div>Open Opportunity Impact</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-2 prose">
            <h3 className="text-white text-2xl font-medium">Customer Feedback Entries (WIP)</h3>
            <FeedbackEntryTable data={entries || []} />
        </div>
      </div>
    </Layout>
  )
} 