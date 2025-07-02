import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { FeedbackItemsTable } from '@/components/areas/FeedbackItemsTable';
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
              <h1 className="text-3xl font-bold text-white">{productArea.name}</h1>
              <p className="mt-1 text-white">
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
            {/* <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2> */}
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

        {/* Feedback Items */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Feedback Items</h2>
            <FeedbackItemsTable data={areaFeedbackItems} />
          </div>
        </div>
      </div>
    </Layout>
  );
} 