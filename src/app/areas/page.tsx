import { Layout } from '@/components/layout/Layout';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { FolderIcon, ChartBarIcon, CurrencyDollarIcon, UsersIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface ProductArea {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  [key: string]: unknown;
}

interface FeedbackItem {
  id: string;
  title: string;
  slug: string;
  product_area_names: string[] | null;
  current_arr_sum: number | null;
  open_opp_arr_sum: number | null;
  entry_count: number | null;
  [key: string]: unknown;
}

interface ProductAreaWithStats extends ProductArea {
  feedbackCount: number;
  totalRevenue: number;
  totalEntries: number;
  avgRevenuePerFeedback: number;
}

const GRADIENTS = [
  'bg-gradient-to-r from-slate-50 to-emerald-200',
  'bg-gradient-to-r from-slate-50 to-teal-200',
  'bg-gradient-to-r from-slate-50 to-pink-200',
  'bg-gradient-to-r from-slate-50 to-violet-200',
] as const

function getRandomGradient() {
  return GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]
}

export default async function AreasPage() {
  const supabase = await createClient();

  // Fetch product areas with feedback counts
  const { data: productAreas } = await supabase
    .from('product_areas')
    .select('*') as { data: ProductArea[] | null };

  const { data: feedbackItems } = await supabase
    .from('feedback_items_with_data')
    .select('*') as { data: FeedbackItem[] | null };

  // Calculate feedback counts and metrics per product area
  const productAreaStats: ProductAreaWithStats[] = productAreas?.map((area: ProductArea) => {
    const areaFeedback = feedbackItems?.filter((item: FeedbackItem) => 
      item.product_area_names?.includes(area.name)
    ) || [];

    const totalRevenue = areaFeedback.reduce((sum: number, item: FeedbackItem) => 
      sum + (item.current_arr_sum || 0) + (item.open_opp_arr_sum || 0), 0
    );

    const totalEntries = areaFeedback.reduce((sum: number, item: FeedbackItem) => 
      sum + (item.entry_count || 0), 0
    );

    return {
      ...area,
      feedbackCount: areaFeedback.length,
      totalRevenue,
      totalEntries,
      avgRevenuePerFeedback: areaFeedback.length > 0 ? totalRevenue / areaFeedback.length : 0
    };
  }).sort((a: ProductAreaWithStats, b: ProductAreaWithStats) => b.feedbackCount - a.feedbackCount) || [];

  // Calculate overall metrics
  const totalFeedbackItems = feedbackItems?.length || 0;
  const totalRevenue = productAreaStats.reduce((sum: number, area: ProductAreaWithStats) => sum + area.totalRevenue, 0);
  const totalEntries = productAreaStats.reduce((sum: number, area: ProductAreaWithStats) => sum + area.totalEntries, 0);
  const avgRevenuePerArea = productAreaStats.length > 0 ? totalRevenue / productAreaStats.length : 0;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Areas</h1>
          <p className="mt-2 text-gray-600">
            Explore feedback organized by product areas and teams
          </p>
        </div>

        {/* Enhanced Summary Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-md bg-blue-500 flex items-center justify-center">
                    <FolderIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Product Areas
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {productAreas?.length || 0}
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
                  <div className="h-10 w-10 rounded-md bg-green-500 flex items-center justify-center">
                    <ChartBarIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Feedback Items
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {totalFeedbackItems}
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
                  <div className="h-10 w-10 rounded-md bg-purple-500 flex items-center justify-center">
                    <UsersIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Entries
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {totalEntries}
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
                  <div className="h-10 w-10 rounded-md bg-yellow-500 flex items-center justify-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Revenue
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        notation: 'compact',
                        maximumFractionDigits: 1
                      }).format(totalRevenue)}
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
                  <div className="h-10 w-10 rounded-md bg-indigo-500 flex items-center justify-center">
                    <SparklesIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Most Active
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900 truncate">
                      {productAreaStats[0]?.name || 'N/A'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Areas Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Product Areas</h2>
            <p className="mt-1 text-sm text-gray-600">
              Complete overview of all product areas with their performance metrics
            </p>
          </div>
          
          {productAreaStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Area
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feedback Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Entries
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue Impact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Revenue/Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productAreaStats.map((area: ProductAreaWithStats, index: number) => (
                    <tr key={area.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                              <FolderIcon className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/areas/${area.slug}`}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRandomGradient()} text-gray-800 hover:opacity-80 transition-opacity`}
                              >
                                {area.name}
                              </Link>
                            </div>
                            {area.description && (
                              <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                                {area.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                                             <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm text-gray-900 font-medium">
                           {area.feedbackCount}
                         </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {area.totalEntries}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                          }).format(area.totalRevenue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                          }).format(area.avgRevenuePerFeedback)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/areas/${area.slug}`}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No product areas</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first product area.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 