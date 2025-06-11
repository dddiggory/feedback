import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LogFeedbackDialog } from '@/components/feedback/LogFeedbackDialog'
import { Layout } from '@/components/layout/Layout'

export default async function FeedbackItemPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()
  
  const { data: feedbackItem } = await supabase
    .from('feedback_items_with_data')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!feedbackItem) {
    notFound()
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">{feedbackItem.title}</h1>
          <LogFeedbackDialog
            trigger={
              <button
                type="button"
                className="inline-flex items-center gap-x-2.5 rounded-xl bg-black px-6 py-3.5 text-lg font-semibold text-white shadow-[0_4px_24px_0_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-all duration-200 hover:scale-[1.03] cursor-pointer"
              >
                <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Log Feedback
              </button>
            }
          />
        </div>
        <div className="prose max-w-none">
          <p>{feedbackItem.description}</p>
        </div>
      </div>
    </Layout>
  )
} 