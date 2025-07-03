import { Layout } from '@/components/layout/Layout';
import { createClient } from '@/lib/supabase/server';
import { AllFeedbackTabsView } from '@/components/feedback/AllFeedbackTabsView';

export default async function BrowseAllPage() {
  const supabase = await createClient();
  
  // Fetch feedback items
  const { data: feedbackItems } = await supabase
    .from('feedback_items_with_data')
    .select('id, title, description, created_at, updated_at, slug, product_area_names, entry_count, current_arr_sum, open_opp_arr_sum, status')
    .order('updated_at', { ascending: false });

  // Fetch customer entries
  const { data: customerEntries, error: entriesError } = await supabase
    .from('entries_with_data')
    .select('*')
    .order('created_at', { ascending: false });

  // Debug logging
  console.log('Customer entries count:', customerEntries?.length || 0);
  console.log('Customer entries error:', entriesError);
  if (customerEntries && customerEntries.length > 0) {
    console.log('First customer entry:', customerEntries[0]);
  }

  return (
    <Layout fullWidth={true}>
      <div className="py-8 text-white w-full max-w-full min-w-0">
        <h1 className="px-12 text-3xl font-bold mb-6">Browse All Feedback</h1>
        <p className="px-12 mb-8 text-gray-200">
          Interactive tables for exploring both product feedback items and specific customer entries. Use the search filters to find exactly what you&apos;re looking for.
        </p>
        
        <AllFeedbackTabsView 
          feedbackItems={feedbackItems || []} 
          customerEntries={customerEntries || []} 
        />
      </div>
    </Layout>
  );
} 