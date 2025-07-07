import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Layout } from '@/components/layout/Layout'
import { FeedbackEntriesTable } from '@/components/feedback/FeedbackEntriesTable'
import { getRandomColor } from '@/lib/colors'
import Link from "next/link";

function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default async function UserProfilePage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }
  
  // Get user profile from profiles table
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()
  
  // Get user's feedback entries
  const { data: userEntries } = await supabase
    .from('entries_with_data')
    .select('*')
    .eq('created_by_user_id', user.id)
    .order('created_at', { ascending: false })
  
  // Calculate user stats
  const totalEntries = userEntries?.length || 0
  const uniqueFeedbackItems = new Set(userEntries?.map(entry => entry.feedback_item_id) || []).size
  
  const userStats = {
    totalEntries,
    uniqueFeedbackItems
  }
  
  // Get user display info
  const displayName = userProfile?.full_name || 
                      user.user_metadata?.full_name || 
                      user.email?.split('@')[0] || 
                      'Unknown User'
  
  const avatarUrl = user.user_metadata?.avatar_url || 
                   user.user_metadata?.picture || 
                   userProfile?.avatar_url || 
                   null
  
  const userEmail = user.email || 'No email'
  
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
            <h2 className="text-2xl font-medium text-gray-800">My Feedback Submissions</h2>
            <p className="text-gray-600 mt-1">
              All feedback entries you&apos;ve submitted
            </p>
          </div>
          
          <div className="p-6">
            {userEntries && userEntries.length > 0 ? (
              <FeedbackEntriesTable data={userEntries} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>You haven&apos;t submitted any feedback yet.</p>
                <p className="mt-2">
                  <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
                    Start by submitting your first feedback
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
} 