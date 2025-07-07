"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProductFeedbackItemsTable } from "./ProductFeedbackItemsTable";
import { BrowseAllCustomerEntriesTable } from "./BrowseAllCustomerEntriesTable";

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
  updated_at: string;
}

interface BrowseAllCustomerEntry {
  id: string;
  feedback_item_id: string;
  feedback_item_title?: string;
  feedback_item_slug?: string;
  account_name: string;
  entry_description: string;
  severity: string;
  current_arr: number;
  open_opp_arr: number;
  impacted_arr: number;
  total_arr: number;
  created_by_user_id: string;
  created_at: string;
  submitter_name?: string;
  submitter_email?: string;
  sfdc_account?: string | null;
  company_website?: string | null;
  entry_key?: string;
  external_links?: string | null;
}

interface AllFeedbackTabsViewProps {
  feedbackItems: FeedbackItem[];
  customerEntries: BrowseAllCustomerEntry[];
}

export function AllFeedbackTabsView({ feedbackItems, customerEntries }: AllFeedbackTabsViewProps) {
  return (
    <div className="w-full max-w-full min-w-0">
      <Tabs defaultValue="feedback-items" className="w-full min-w-0">
        <TabsList className="w-full gap-2 bg-gray-200 h-12 p-1 rounded-lg mb-2">
          <TabsTrigger 
            value="feedback-items" 
            className="text-sm font-medium cursor-pointer data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-800 transition-all duration-200"
          >
            Product Feedback Items
            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              {feedbackItems.length}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="customer-entries" 
            className="text-sm font-medium cursor-pointer data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-800 transition-all duration-200"
          >
            Specific Customer Entries
            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              {customerEntries.length}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="feedback-items" className="space-y-4 min-w-0">
          <div className="bg-white rounded-xl p-6 shadow-sm w-full max-w-full min-w-0">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Product Feedback Items</h3>
              <p className="text-sm text-gray-600">
                Browse all product feedback items with summary data including entry counts and ARR impact.
              </p>
            </div>
            <div className="overflow-x-auto w-full max-w-full min-w-0">
              <ProductFeedbackItemsTable data={feedbackItems} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="customer-entries" className="space-y-4 min-w-0">
          <div className="bg-white rounded-xl p-6 shadow-sm w-full max-w-full min-w-0">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Specific Customer Entries</h3>
              <p className="text-sm text-gray-600">
                Browse all individual customer feedback entries with detailed information about each submission.
              </p>
            </div>
            <div className="overflow-x-auto w-full max-w-full min-w-0">
              <BrowseAllCustomerEntriesTable data={customerEntries} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 