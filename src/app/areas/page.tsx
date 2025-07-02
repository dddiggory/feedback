import { Layout } from '@/components/layout/Layout';
import { createClient } from '@/lib/supabase/server';
import { ProductAreasTable } from '@/components/areas/ProductAreasTable';

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
  status: string;
  [key: string]: unknown;
}

interface ProductAreaWithStats extends ProductArea {
  feedbackCount: number;
  shippedCount: number;
  totalRevenue: number;
  totalEntries: number;
  avgRevenuePerFeedback: number;
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

    // Separate open and shipped items
    const openItems = areaFeedback.filter((item: FeedbackItem) => 
      item.status === 'open'
    );
    const shippedItems = areaFeedback.filter((item: FeedbackItem) => 
      item.status === 'shipped'
    );

    // Calculate metrics only for open items
    const totalRevenue = openItems.reduce((sum: number, item: FeedbackItem) => 
      sum + (item.current_arr_sum || 0) + (item.open_opp_arr_sum || 0), 0
    );

    const totalEntries = openItems.reduce((sum: number, item: FeedbackItem) => 
      sum + (item.entry_count || 0), 0
    );

    return {
      ...area,
      feedbackCount: openItems.length,
      shippedCount: shippedItems.length,
      totalRevenue,
      totalEntries,
      avgRevenuePerFeedback: openItems.length > 0 ? totalRevenue / openItems.length : 0
    };
  }).sort((a: ProductAreaWithStats, b: ProductAreaWithStats) => b.feedbackCount - a.feedbackCount) || [];

  // Calculate overall metrics (using open items only)
  const totalFeedbackItems = productAreaStats.reduce((sum, area) => sum + area.feedbackCount, 0);
  const totalRevenue = productAreaStats.reduce((sum: number, area: ProductAreaWithStats) => sum + area.totalRevenue, 0);
  const totalEntries = productAreaStats.reduce((sum: number, area: ProductAreaWithStats) => sum + area.totalEntries, 0);
  const avgRevenuePerArea = productAreaStats.length > 0 ? totalRevenue / productAreaStats.length : 0;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Product Areas</h1>
          <p className="mt-2 text-white">
            Explore feedback organized by product areas and teams
          </p>
        </div>

        {/* Product Areas Table */}
        <ProductAreasTable data={productAreaStats} />
        
      </div>
    </Layout>
  );
} 