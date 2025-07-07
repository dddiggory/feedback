import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Layout } from '@/components/layout/Layout'
import { FeedbackEntriesTable } from '@/components/feedback/FeedbackEntriesTable'
import { getRandomColor } from '@/lib/colors'
import { getInitials } from '@/lib/utils'



export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params
  
  // Get current user to check if viewing own profile
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  
  // If the ID matches the current user, redirect to /user
  if (currentUser && currentUser.id === id) {
    redirect('/user')
  }
  
  // Look up entries by user ID to derive user info
  const { data: entriesData } = await supabase
    .from('entries_with_data')
    .select('*')
    .eq('created_by_user_id', id)
    .order('created_at', { ascending: false })
  
  if (!entriesData || entriesData.length === 0) {
    notFound()
  }
  
  const userEntries = entriesData
  
  // Create a user object from the entries data
  const firstEntry = entriesData[0]
  const user = {
    id: firstEntry.created_by_user_id || 'unknown',
    email: firstEntry.submitter_email || 'Unknown',
    user_metadata: {
      full_name: firstEntry.submitter_name,
      avatar_url: firstEntry.submitter_avatar,
    }
  }
  
  // Calculate user stats
  const totalEntries = userEntries.length
  const uniqueFeedbackItems = new Set(userEntries.map(entry => entry.feedback_item_id)).size
  
  const userStats = {
    totalEntries,
    uniqueFeedbackItems
  }
  
  // Get user display info
  const displayName = user.user_metadata?.full_name || 
                      user.email?.split('@')[0] || 
                      'Unknown User'
  
  const avatarUrl = user.user_metadata?.avatar_url || null
  
  const userEmail = user.email || id
  
  return (
    <Layout>
      <div className="space-y-8">
        {/* User Profile Header */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={`${displayName}'s avatar`}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className={`w-20 h-20 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-2xl font-bold ${getRandomColor()}`}>
                    {getInitials(displayName)}
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-white">{displayName}</h1>
                  <p className="text-blue-100 text-lg">{userEmail}</p>
                </div>
              </div>
              
              {/* User Stats */}
              <div className="flex space-x-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 text-center shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">{userStats.totalEntries}</div>
                  <div className="text-xs text-gray-600">Total Entries</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 text-center shadow-sm">
                  <div className="text-2xl font-bold text-gray-900">{userStats.uniqueFeedbackItems}</div>
                  <div className="text-xs text-gray-600">Feedback Items</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* User's Feedback Submissions */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-medium text-gray-800">Feedback Submissions</h2>
            <p className="text-gray-600 mt-1">
              All feedback entries submitted by {displayName}
            </p>
          </div>
          
          <div className="p-6">
            {userEntries.length > 0 ? (
              <FeedbackEntriesTable data={userEntries} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No feedback submissions found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
} 