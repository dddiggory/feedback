import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

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
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{feedbackItem.title}</h1>
      <div className="prose max-w-none">
        <p>{feedbackItem.description}</p>
      </div>
    </div>
  )
} 