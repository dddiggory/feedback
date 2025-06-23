import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import Link from 'next/link';
import { FolderIcon, ChartBarIcon } from '@heroicons/react/24/outline';

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
  description: string;
  status: string;
  product_area_names: string[] | null;
  current_arr_sum: number | null;
  open_opp_arr_sum: number | null;
  entry_count: number | null;
  created_at: string;
  [key: string]: unknown;
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const supabase = await createClient();
  const { slug } = await params;
  
  const { data: productArea } = await supabase
    .from('product_areas')
    .select('*')
    .eq('slug', slug)
    .single() as { data: ProductArea | null };

  if (!productArea) {
    notFound();
  }

  // Fetch feedback items for this product area
  const { data: feedbackItems } = await supabase
    .from('feedback_items_with_data')
    .select('*') as { data: FeedbackItem[] | null };

  // Filter feedback items that include this product area
  const areaFeedbackItems: FeedbackItem[] = feedbackItems?.filter((item: FeedbackItem) =>
    item.product_area_names?.includes(productArea.name)
  ) || [];

  // Calculate metrics
  const totalRevenue = areaFeedbackItems.reduce((sum: number, item: FeedbackItem) =>
    sum + (item.current_arr_sum || 0) + (item.open_opp_arr_sum || 0), 0
  );

  const totalEntries = areaFeedbackItems.reduce((sum: number, item: FeedbackItem) =>
    sum + (item.entry_count || 0), 0
  );

  const feedbackByStatus = areaFeedbackItems.reduce((acc: Record<string, number>, item: FeedbackItem) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <FolderIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{productArea.name}</h1>
              <p className="mt-1 text-gray-600">
                {areaFeedbackItems.length} feedback items
              </p>
            </div>
          </div>
          <Link
            href="/areas"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            ← Back to Product Areas
          </Link>
        </div>

        {/* Description */}
        {productArea.description && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600">{productArea.description}</p>
          </div>
        )}

        {/* Metrics */}
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
                      Feedback Items
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {areaFeedbackItems.length}
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
                  <ChartBarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Customer Entries
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
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
                  <ChartBarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Revenue Impact
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0
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
                  <ChartBarIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg Revenue per Item
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0
                      }).format(areaFeedbackItems.length > 0 ? totalRevenue / areaFeedbackItems.length : 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback by Status */}
        {Object.keys(feedbackByStatus).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Feedback by Status</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(feedbackByStatus).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-500 capitalize">{status}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Items */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Feedback Items</h2>
            {areaFeedbackItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                        Title
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Description
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
                    {areaFeedbackItems.map((item: FeedbackItem) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                          <Link
                            href={`/feedback/${item.slug}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {item.title}
                          </Link>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <div className="max-w-xs truncate">
                            {item.description}
                          </div>
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
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback items</h3>
                <p className="mt-1 text-sm text-gray-500">
                  This product area doesn&apos;t have any feedback items yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 