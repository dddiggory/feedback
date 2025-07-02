import { Layout } from '@/components/layout/Layout';
import { createClient } from '@/lib/supabase/server';
import { ChartBarIcon, ArrowTrendingUpIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { TopItemsBarChart } from '@/components/analytics/TopItemsBarChart';

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
          <h1 className="text-3xl font-bold text-white">Analytics & Reporting</h1>
          <p className="mt-2 text-white">
            High-level reporting on feedback items, measurable by raw count or revenue. Try filtering by Product Area or grouping by New vs. Existing.<br />What other reports would you like to see, and why? Do you want SQL querying? Come ask in <Link href="https://vercel.slack.com/archives/C094FVBAVLH" target="_blank" className="text-green-400 font-bold hover:underline">#project-gtmfeedback-app</Link> on Slack.
          </p>
        </div>

        {/* Top Items Bar Chart */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <TopItemsBarChart />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="hidden grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

          <div className="hidden overflow-hidden rounded-lg bg-white shadow">
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

          <div className="hidden overflow-hidden rounded-lg bg-white shadow">
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

          <div className="hidden overflow-hidden rounded-lg bg-white shadow">
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
        <div className="hidden grid grid-cols-1 gap-8 lg:grid-cols-2">
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
        
      </div>
    </Layout>
  );
} 