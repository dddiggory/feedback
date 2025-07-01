import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Layout } from '@/components/layout/Layout'
import { EntryDetailModal } from '@/components/feedback/EntryDetailModal'

export default async function EntryPage({
  params,
}: {
  params: Promise<{ slug: string; entryKey: string }>
}) {
  const supabase = await createClient()
  const { slug, entryKey } = await params
  
  // Fetch the entry details
  const { data: entry } = await supabase
    .from('entries_with_data')
    .select('*')
    .eq('entry_key', entryKey)
    .single()

  if (!entry) {
    notFound()
  }

  // Fetch the feedback item details for context
  const { data: feedbackItem } = await supabase
    .from('feedback_items_with_data')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!feedbackItem) {
    notFound()
  }

  return (
    <Layout>
      <EntryDetailModal 
        entry={entry} 
        feedbackItem={feedbackItem}
        isIntercepted={false}
      />
    </Layout>
  )
} 