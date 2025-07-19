import { Layout } from '@/components/layout/Layout';
import { createClient } from '@/lib/supabase/server';
import { AllFeedbackTabsView } from '@/components/feedback/AllFeedbackTabsView';

export default async function FeedbackPage() {
  const supabase = await createClient();
  
  // Fetch feedback items
  const { data: feedbackItems } = await supabase
    .from('feedback_items_with_data')
    .select('id, title, description, created_at, updated_at, slug, product_area_names, entry_count, current_arr_sum, open_opp_arr_sum, status')
    .order('updated_at', { ascending: false });

  // Fetch customer entries
  const { data: customerEntries } = await supabase
    .from('entries_with_data')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <Layout>
      <div className="space-y-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Browse All Feedback</h1>
            <p className="mt-2 text-white">
              Interactive tables for exploring both product feedback items and specific customer entries. Use the search filters to find exactly what you&apos;re looking for.
            </p>
          </div>

          <AllFeedbackTabsView
            feedbackItems={feedbackItems || []}
            customerEntries={customerEntries || []}
          />
      </div>
    </Layout>
  );
} 