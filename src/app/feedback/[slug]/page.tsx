import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { FeedbackPageLogFeedbackDialog } from '@/components/feedback/FeedbackPageLogFeedbackDialog'
import { Layout } from '@/components/layout/Layout'
import { FeedbackEntryTable } from '@/components/feedback/FeedbackEntryTable'
import Link from 'next/link'

const GRADIENTS = [
  'bg-gradient-to-r from-slate-50 to-emerald-200',
  'bg-gradient-to-r from-slate-50 to-teal-200',
  'bg-gradient-to-r from-slate-50 to-pink-200',
  'bg-gradient-to-r from-slate-50 to-violet-200',
] as const

function getRandomGradient() {
  return GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]
}

export default async function FeedbackItemPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const supabase = await createClient()
  
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
    .from('entries')
    .select('*')
    .eq('feedback_item_id', feedbackItem.id)
    .order('created_at', { ascending: false })

  return (
    <Layout>
      <div className="container mx-auto pb-8 pt-1">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2 h-[2.5rem] overflow-hidden">
              {feedbackItem.product_area_names?.map((area: string, index: number) => (
                <Link
                  key={area}
                  href={`/product_areas/${feedbackItem.product_area_slugs?.[index]}`}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRandomGradient()} text-gray-800 hover:opacity-80 transition-opacity h-[2.5rem]`}
                >
                  {area}
                </Link>
              ))}
            </div>
            
            <h1 className="text-5xl font-bold text-slate-100 text-shadow-sky-950 max-w-[70vw]">{feedbackItem.title}</h1>
            <div>
            <p className="text-slate-100">{feedbackItem.description}</p>
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
                    className="inline-flex items-center gap-x-2.5 rounded-xl bg-gradient-to-r from-teal-200 to-teal-500 px-6 py-3.5 text-lg font-semibold text-slate-800 shadow-[0_4px_24px_0_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-all duration-200 hover:scale-[1.03] cursor-pointer h-[3.5rem] whitespace-nowrap min-w-[30vh] w-fit"
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
              <div className="grid grid-cols-1 gap-y-2 py-3 rounded-md bg-emerald-50 text-slate-800 outline-1 outline-slate-600 min-w-[30vh] w-fit">
                <div className="text-center col-span-1">
                  <div className="text-3xl font-bold">{feedbackItem.entry_count || 0}</div>
                  <div>Customer Requests</div>
                </div>
                <div className="text-center">
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
                <div className="text-center">
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
        

        
        <div className="grid grid-cols-2 gap-4">
          <div className="prose">
            <h3 className="text-2xl font-medium">Description <span className="text-sm text-gray-500 pl-3 align-middle cursor-not-allowed underline">edit</span></h3>
            <div className="bg-white p-4 rounded-lg shadow-md h-[9.5em] overflow-y-auto relative">
              <p>{feedbackItem.description}</p>
            </div>
          </div>
          <div className="prose">
            <h3 className="text-2xl font-medium">EPD Commentary</h3>
            <p className="bg-white p-4 rounded-lg shadow-md h-[9.5em]">
              (Placeholder, product-editable, last updated date, editor)
              </p>
              
          </div>
          
        </div>
        <div className="pt-8 prose">
            <h3 className="text-2xl font-medium">Customer Feedback Entries</h3>
            <FeedbackEntryTable data={entries || []} />
          </div>
      </div>
    </Layout>
  )
} 