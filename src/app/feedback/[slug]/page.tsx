import Link from 'next/link'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FeedbackPageLogFeedbackDialog } from '@/components/feedback/FeedbackPageLogFeedbackDialog'
import { Layout } from '@/components/layout/Layout'
import { FeedbackEntriesTable } from '@/components/feedback/FeedbackEntriesTable'
import { Comments } from '@/components/feedback/Comments'
import { getComments } from '@/lib/actions/comments'
import { EditableFeedbackItem } from '@/components/feedback/EditableFeedbackItem'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ImageLightbox } from './ImageLightbox'
import { ImagesManagerModal } from './ImagesManagerModal'
import { getRandomColor, getRandomGradient } from "@/lib/colors";
import { getInitials } from "@/lib/utils";



interface TopSubmitter {
  submitter_name: string;
  submitter_avatar?: string;
  id: string;
  entry_count: number;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params
  
  const { data: feedbackItem } = await supabase
    .from('feedback_items_with_data')
    .select('title, description, entry_count, current_arr_sum')
    .eq('slug', slug)
    .single()

  if (!feedbackItem) {
    return {
      title: "▲ vercel/Feedback"
    }
  }

  const title = `▲ ${feedbackItem.title}`
  const description = feedbackItem.description 
    ? `${feedbackItem.description.slice(0, 160)}${feedbackItem.description.length > 160 ? '...' : ''}`
    : `${feedbackItem.entry_count || 0} customer requests • Product feedback from Vercel customers`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      siteName: "Vercel Feedback",
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
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

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch comments for this feedback item
  const comments = await getComments(feedbackItem.id)

  // Fetch top 6 submitters by count for this feedback item
  const { data: topSubmitters } = await supabase
    .from('entries_with_data')
    .select('submitter_name, submitter_avatar, created_by_user_id')
    .eq('feedback_item_id', feedbackItem.id)
    .not('submitter_name', 'is', null)
    .not('created_by_user_id', 'is', null)
    .then(async (result) => {
      if (!result.data) return { data: [] }
      
      // Group by submitter and count entries
      const submitterCounts: Record<string, TopSubmitter> = {}
      result.data.forEach(entry => {
        const name = entry.submitter_name

        if (entry.created_by_user_id == null) {
          return
        }
        
        if (submitterCounts[name]) {
          submitterCounts[name].entry_count++
        } else {
          submitterCounts[name] = {
            submitter_name: name,
            submitter_avatar: entry.submitter_avatar,
            id: entry.created_by_user_id,
            entry_count: 1
          }
        }
      })
      
      // Sort by count and take top 6
      const sorted = Object.values(submitterCounts)
        .sort((a, b) => b.entry_count - a.entry_count)
        .slice(0, 6)
      
      return { data: sorted }
    })

  return (
    <Layout>
      {/* Client lightbox portal */}
      <ImageLightbox />
      {/* Shipped Status Banner */}
      {feedbackItem.status === 'shipped' && (
        <div className="rounded-md bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 mb-6 shadow-lg">
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
        {/* Grid Layout - 3 explicit rows */}
        <div className="grid grid-cols-[1fr_auto] gap-x-1 gap-y-4 mb-3">
          {/* Row 1: Product Areas */}
          <div className="flex flex-wrap gap-2 h-[2.5rem] overflow-hidden">
            {feedbackItem.product_area_names?.map((area: string, index: number) => (
              <Link
                key={area}
                href={`/areas/${feedbackItem.product_area_slugs?.[index]}`}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRandomGradient()} text-gray-800 hover:opacity-80 transition-opacity h-[2.5rem]`}
              >
                {area}
              </Link>
            ))}
          </div>
          
          {/* Row 1: Add Customer Button */}
          <div className="min-w-[30vh] w-fit">
            <FeedbackPageLogFeedbackDialog
              feedbackItemTitle={feedbackItem.title}
              feedbackItemDescription={feedbackItem.description}
              feedbackItemId={feedbackItem.id}
              trigger={
                <button
                  autoFocus
                  type="button"
                  className="inline-flex items-center gap-x-2.5 rounded-xl bg-gradient-to-r from-teal-200 to-teal-500 px-6 py-3.5 text-lg font-semibold text-slate-800 shadow-[0_4px_24px_0_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.16)] focus-visible:ring-4 focus-visible:ring-teal-400 focus-visible:ring-offset-4 focus-visible:outline-offset-2 focus-visible:shadow-lg focus-visible:outline-black transition-all duration-200 hover:scale-[1.03] cursor-pointer h-[3.5rem] whitespace-nowrap min-w-[30vh] w-fit"
                >
                  <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                  Add Customer +1
                </button>
              }
            />
          </div>

          {/* Row 2: Title + Description */}
          {(() => {
            // Fetch images for this item
            // Note: We prefer doing this near render to keep the page cohesive
            return null
          })()}

          {await (async () => {
            const { data: images } = await supabase
              .from('images')
              .select('*')
              .eq('feedback_item_id', feedbackItem.id)
              .is('deleted_at', null)
              .order('order_index', { ascending: true })
              .order('created_at', { ascending: true })

            return (
              <EditableFeedbackItem 
                feedbackItem={{
                  id: feedbackItem.id,
                  title: feedbackItem.title,
                  description: feedbackItem.description,
                  slug: feedbackItem.slug,
                  status: feedbackItem.status,
                  shipped_notes: feedbackItem.shipped_notes
                }}
                images={images || []}
              />
            )
          })()}
          
          {/* Row 2: Metrics */}
          <div className="min-w-[30vh] w-fit">
            <div className="grid grid-cols-1 gap-y-2 py-5 rounded-md bg-teal-200/50 text-slate-800 min-w-[30vh] w-fit h-full">
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

          {/* Row 3: Comments */}
          <div className="pr-4 h-full max-h-[200px]">
            <Comments feedbackItemId={feedbackItem.id} initialComments={comments} currentUserId={user?.id} />
          </div>
          
          {/* Row 3: Top Advocates */}
          {topSubmitters && topSubmitters.length > 0 && (
            <div className="p-4 bg-slate-50/90 rounded-lg border-l-4 border-teal-400 min-w-[30vh] w-fit max-w-[30vh] h-full max-h-[200px] flex flex-col">
              <h4 className="text-slate-800 font-semibold text-sm mb-3">Top Vercelian Advocates:</h4>
              <div className="flex flex-wrap gap-x-1 gap-y-1 overflow-y-auto items-start">
                {topSubmitters.map((submitter, index) => (
                  <div
                    key={`${submitter.submitter_name}-${index}`}
                    className="flex items-center gap-1 px-2 py-1 bg-white rounded-full border border-gray-200 shadow-sm h-7 leading-none"
                  >
                    {submitter.submitter_avatar ? (
                      <Image
                        src={submitter.submitter_avatar} 
                        alt={`${submitter.submitter_name}&apos;s avatar`}
                        width={16}
                        height={16}
                        className="w-4 h-4 rounded-full"
                      />
                    ) : (
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-medium ${getRandomColor()}`}>
                        {getInitials(submitter.submitter_name)}
                      </div>
                    )}
                    <Link
                      href={`/user/${submitter.id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {submitter.submitter_name}
                    </Link>
                    <span className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded-full">
                      {submitter.entry_count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Client-side modal for managing images */}
        <ImagesManagerModal feedbackItemId={feedbackItem.id} initialImages={[]} />
        
        <div className="pt-2 prose">
            <h3 className="text-white text-shadow-lg text-2xl font-medium">Customer Feedback Entries</h3>
          <div className="w-full space-y-4 bg-white rounded-xl p-6">
              <FeedbackEntriesTable data={entries || []} />
            </div>
        </div>
      </div>
    </Layout>
  )
} 