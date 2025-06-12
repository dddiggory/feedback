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
    .from('entries')
    .select('*')
    .eq('feedback_item_id', feedbackItem.id)
    .order('created_at', { ascending: false })

  return (
    <Layout>
      <div className="container mx-auto pb-8 pt-1">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold">{feedbackItem.title}</h1>
            <div className="flex flex-wrap gap-2">
              {feedbackItem.product_area_names?.map((area: string, index: number) => (
                <Link
                  key={area}
                  href={`/product_areas/${feedbackItem.product_area_slugs?.[index]}`}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRandomGradient()} text-gray-800 hover:opacity-80 transition-opacity`}
                >
                  {area}
                </Link>
              ))}
            </div>
          </div>
          <FeedbackPageLogFeedbackDialog
            feedbackItemTitle={feedbackItem.title}
            trigger={
              <button
                type="button"
                className="inline-flex items-center gap-x-2.5 rounded-xl bg-black px-6 py-3.5 text-lg font-semibold text-white shadow-[0_4px_24px_0_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-all duration-200 hover:scale-[1.03] cursor-pointer"
              >
                <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Add Customer +1
              </button>
            }
          />
        </div>
        {/* Customer Demand Metrics */}
        <div> 
        <div className="grid grid-cols-3 gap-6 mb-8 max-w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-gray-900">
              {feedbackItem.entry_count || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Customer Requests
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0
              }).format(feedbackItem.current_arr_sum || 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Current Account Demand
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0
              }).format(feedbackItem.open_opp_arr_sum || 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Open Opportunity Impact
            </div>
          </div>
        </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="prose">
            <h3 className="text-2xl font-medium">Description</h3>
            <div className="bg-white p-4 rounded-lg shadow-md h-[9.5em] overflow-y-auto relative">
              <p>{feedbackItem.description}</p>
              <button className="absolute bottom-2 right-2 text-blue-700 hover:text-blue-600 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
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