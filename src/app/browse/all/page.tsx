import { Layout } from '@/components/layout/Layout';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatARR } from '@/lib/format';

export default async function BrowseAllPage() {
  const supabase = await createClient();
  
  const { data: feedbackItems } = await supabase
    .from('feedback_items_with_data')
    .select('id, title, description, created_at, updated_at, slug, product_area_names, entry_count, current_arr_sum, open_opp_arr_sum')
    .order('updated_at', { ascending: false });

  // More detailed debug logging
  console.log('First feedback item:', feedbackItems?.[0]);
  console.log('Product area names type:', typeof feedbackItems?.[0]?.product_area_names);
  console.log('Product area names value:', feedbackItems?.[0]?.product_area_names);
  console.log('Is array?', Array.isArray(feedbackItems?.[0]?.product_area_names));

  return (
    <Layout>
      <div className="container mx-auto py-8 text-white">
        <h1 className="text-3xl font-bold mb-6">All Feedback Items</h1>
        <p className="mb-8">
          This is just a list of every current feedback item on a single page, for easy browsing for cmd+F enjoyers. You can click on any item to view its full details.
        </p>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="w-[25%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="w-[8%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Count
                </th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Customer ARR
                </th>
                <th scope="col" className="w-[12%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open Opp ARR
                </th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="w-[3%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Areas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {feedbackItems?.map((item) => {
                // Debug log for each item
                console.log('Item product areas:', item.product_area_names);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <Link href={`/feedback/${item.slug}`} className="hover:text-blue-600 block break-words">
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="break-words">
                        {item.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.entry_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatARR(item.current_arr_sum || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatARR(item.open_opp_arr_sum || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(item.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.updated_at ? format(new Date(item.updated_at), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {item.product_area_names?.map((area, index) => (
                          <span 
                            key={area} 
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
} 