import { Layout } from '@/components/layout/Layout';
import { createClient } from '@/lib/supabase/server';
import { FeedbackSearchBox } from '@/components/feedback/FeedbackSearchBox';
import Link from 'next/link';

// Utility function to format ARR values
function formatARR(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${Math.round(value / 1000)}k`;
  } else {
    return `$${value.toLocaleString()}`;
  }
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: feedbackItems } = await supabase
    .from('product_feedback_items_with_entry_metrics')
    .select('*');

  // Fetch recent feedback entries
  const { data: recentEntries } = await supabase
    .from('entries_with_data')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch top submitters
  const { data: topSubmitters } = await supabase
    .from('top_submitters_30d')
    .select('*')
    .order('total_entries', { ascending: false })
    .limit(10);

  // Generate a random color for fallback avatars
  function getRandomColor() {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Get initials from name for fallback avatar
  function getInitials(name: string) {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <Layout>
      

      {/* Search Box */}
      <div className="mt-8">
        <div className="animated-gradient-bg">
          <div className="p-4">
            <FeedbackSearchBox />
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="flex gap-8">
          {/* Recent Feedback Entries */}
          <div className="flex-grow">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Recent Feedback Entries</h2>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feedback Item
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitter & Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentEntries?.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate align-middle">
                        <div className="flex flex-col">
                          <Link 
                            href={`/feedback/${entry.feedback_item_slug}`}
                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline max-w-xs truncate"
                          >
                            {entry.feedback_item_title}
                          </Link>
                          <span className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {entry.account_name
                              ? `${entry.account_name.length > 10 ? entry.account_name.slice(0, 10) + '…' : entry.account_name}`
                              : ''}
                            {entry.sum_impacted_arr ? ` • ${formatARR(entry.sum_impacted_arr)}` : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {entry.submitter_avatar && (
                            <img 
                              src={entry.submitter_avatar} 
                              alt={`${entry.submitter_name}'s avatar`}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                          )}
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-900">{entry.submitter_name}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(entry.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submitter Leaderboard */}
          <div className="w-2/6">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden pb-5">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Top Submitters</h2>
                <h3 className="text-sm text-gray-500 mt-1">Past 30 Days</h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitter
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topSubmitters?.map((submitter, index) => (
                    <tr key={submitter.submitter_email || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          {submitter.submitter_avatar ? (
                            <img 
                              src={submitter.submitter_avatar} 
                              alt={`${submitter.submitter_name || 'User'}'s avatar`}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                          ) : submitter.submitter_name ? (
                            <div className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center text-white text-xs font-medium ${getRandomColor()}`}>
                              {getInitials(submitter.submitter_name)}
                            </div>
                          ) : (
                            <div className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center text-white text-xs font-medium ${getRandomColor()}`}>
                              ?
                            </div>
                          )}
                          <div>
                            <div className="font-medium">
                              {submitter.submitter_name || 'Unknown User'}
                            </div>
                            {submitter.submitter_email && (
                              <div className="text-xs text-gray-500">
                                {submitter.submitter_email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {submitter.total_entries}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
