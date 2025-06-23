import { Layout } from '@/components/layout/Layout';
import { createClient } from '@/lib/supabase/server';
import { FeedbackSearchBox } from '@/components/feedback/FeedbackSearchBox';
import { FeedbackSearchBoxExperimental } from '@/components/feedback/FeedbackSearchBoxExperimental';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: feedbackItems } = await supabase
    .from('product_feedback_items_with_entry_metrics')
    .select('*');

  return (
    <Layout>
      <div className="hidden grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stats Cards */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-black flex items-center justify-center">
                  <span className="text-white text-xl"></span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Feedback</dt>
                  <dd className="text-lg font-semibold text-gray-900">{feedbackItems?.length || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-green-700 flex items-center justify-center">
                  <span className="text-white text-xl"></span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Revenue Opportunity</dt>
                  <dd className="text-lg font-semibold text-gray-900">$2.5M</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-purple-800 flex items-center justify-center">
                  <span className="text-white text-xl"></span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Top Product Area</dt>
                  <dd className="text-lg font-semibold text-gray-900">v0</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="mt-8">
        <div className="animated-gradient-bg">
          <div className="p-4">
            <FeedbackSearchBox />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="animated-gradient-bg">
          <div className="p-4">
            <FeedbackSearchBoxExperimental />
          </div>
        </div>
      </div>

      {/* Popular Feedback Items This Month Section */}
      <div className="mt-8 hidden">
        <div className="overflow-hidden rounded-lg bg-white shadow p-4 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Popular Feedback Items (Past 30 Days)</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 rounded-xl border border-gray-200 bg-gray-50 shadow-sm flex items-center justify-center"
              >
                {/* Placeholder for future content */}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Feedback Section */}
      <div className="mt-8 hidden">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Feedback (temporary, will remove)</h2>
            <div className="mt-6 flow-root">
              <div className="overflow-x-auto">
                <div className="inline-block w-full py-2 align-middle">
                  <table className="w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Title</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Entries</th>
                        <th className="hidden lg:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Product Areas</th>
                        <th className="hidden lg:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Customer ARR</th>
                        <th className="hidden lg:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Open Opp ARR</th>
                        <th className="hidden md:table-cell px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {feedbackItems?.map((item) => (
                        <tr key={item.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                            {item.title}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            <div className="relative max-h-[4rem] pr-2">
                              <div className="overflow-y-auto max-h-[3.8rem]">
                                {item.description}
                              </div>
                              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent"></div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              {item.status}
                            </span>
                          </td>
                          <td className="hidden md:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {item.entry_count}
                          </td>
                          <td className="hidden lg:table-cell px-3 py-4 text-sm text-gray-500">
                            {item.product_area_names?.join(', ')}
                          </td>
                          <td className="hidden lg:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.current_arr_sum || 0)}
                          </td>
                          <td className="hidden lg:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.open_opp_arr_sum || 0)}
                          </td>
                          <td className="hidden md:table-cell whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
