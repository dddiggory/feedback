import { Layout } from '@/components/layout/Layout';
import { createClient } from '@/lib/supabase/server';
import { ChartBarIcon, ArrowTrendingUpIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const { data: feedbackItems } = await supabase
    .from('feedback_items_with_data')
    .select('*');

  const { data: productAreas } = await supabase
    .from('product_areas')
    .select('*');

  // Calculate metrics
  const totalFeedback = feedbackItems?.length || 0;
  const totalRevenueOpportunity = feedbackItems?.reduce((sum, item) => sum + (item.current_arr_sum || 0) + (item.open_opp_arr_sum || 0), 0) || 0;
  const avgEntriesPerFeedback = feedbackItems?.reduce((sum, item) => sum + (item.entry_count || 0), 0) / totalFeedback || 0;

  // Get feedback by status
  const feedbackByStatus = feedbackItems?.reduce((acc: Record<string, number>, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {}) || {};

  // Get top product areas by feedback count
  const productAreaCounts = feedbackItems?.reduce((acc: Record<string, number>, item) => {
    item.product_area_names?.forEach((area: string) => {
      acc[area] = (acc[area] || 0) + 1;
    });
    return acc;
  }, {}) || {};

  const topProductAreas = Object.entries(productAreaCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reporting</h1>
          <p className="mt-2 text-gray-600">
            Insights and metrics about your product feedback
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Feedback Items
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {totalFeedback}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowTrendingUpIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Revenue Opportunity
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0
                      }).format(totalRevenueOpportunity)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg Entries per Feedback
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {avgEntriesPerFeedback.toFixed(1)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Product Areas
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {productAreas?.length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Feedback by Status */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Feedback by Status
              </h3>
              <div className="space-y-3">
                {Object.entries(feedbackByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {status}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Product Areas */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Top Product Areas
              </h3>
              <div className="space-y-3">
                {topProductAreas.map(([area, count]) => (
                  <div key={area} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {area}
                    </span>
                    <div className="flex items-center">
                      <div 
                        className="bg-blue-500 h-2 rounded mr-3"
                        style={{ width: `${(count / topProductAreas[0][1]) * 100}px` }}
                      ></div>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Recent Feedback Items
            </h3>
            <div className="flow-root">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                        Title
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Entries
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Revenue Impact
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {feedbackItems?.slice(0, 10).map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          <Link
                            href={`/feedback/${item.slug}`}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {item.title}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {item.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {item.entry_count}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                          }).format((item.current_arr_sum || 0) + (item.open_opp_arr_sum || 0))}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
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
    </Layout>
  );
} 