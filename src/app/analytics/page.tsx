"use client";

import { Layout } from '@/components/layout/Layout';
import { createClient } from '@/lib/supabase/client';
import { ChartBarIcon, ArrowTrendingUpIcon, UsersIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { TopItemsBarChart } from '@/components/analytics/TopItemsBarChart';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker";
import { DateRange } from "react-day-picker";
import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth } from "date-fns";

export default function AnalyticsPage() {
  const supabase = createClient();
  
  // State for date range filtering - default to "All Time" (undefined)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  // State for data
  const [feedbackItems, setFeedbackItems] = useState<any[]>([]);
  const [entriesData, setEntriesData] = useState<any[]>([]);
  const [productAreas, setProductAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data based on date range
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch feedback items (for general stats)
        const { data: feedbackItemsData } = await supabase
          .from('feedback_items_with_data')
          .select('*');

        // Fetch entries with date filtering
        let entriesQuery = supabase
          .from('entries_with_data')
          .select('*');
        
        if (dateRange?.from) {
          entriesQuery = entriesQuery.gte('created_at', dateRange.from.toISOString());
        }
        if (dateRange?.to) {
          entriesQuery = entriesQuery.lte('created_at', dateRange.to.toISOString());
        }
        
        const { data: entriesData } = await entriesQuery;

        // Fetch product areas
        const { data: productAreasData } = await supabase
          .from('product_areas')
          .select('*');

        setFeedbackItems(feedbackItemsData || []);
        setEntriesData(entriesData || []);
        setProductAreas(productAreasData || []);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, supabase]);

  // Calculate metrics based on filtered entries
  const totalEntries = entriesData?.length || 0;
  const totalRevenueOpportunity = entriesData?.reduce((sum, entry) => sum + (entry.current_arr || 0) + (entry.open_opp_arr || 0), 0) || 0;
  
  // Get feedback items that have entries in the date range
  const feedbackItemsWithEntries = feedbackItems?.filter(item => 
    entriesData?.some(entry => entry.feedback_item_id === item.id)
  ) || [];
  
  const totalFeedback = feedbackItemsWithEntries.length;
  const avgEntriesPerFeedback = totalFeedback > 0 ? totalEntries / totalFeedback : 0;

  // Get feedback by status (from filtered feedback items)
  const feedbackByStatus = feedbackItemsWithEntries?.reduce((acc: Record<string, number>, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {}) || {};

  // Get top product areas by entry count (from filtered entries)
  const productAreaCounts = entriesData?.reduce((acc: Record<string, number>, entry) => {
    entry.product_area_names?.forEach((area: string) => {
      acc[area] = (acc[area] || 0) + 1;
    });
    return acc;
  }, {}) || {};

  const topProductAreas = Object.entries(productAreaCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics & Reporting</h1>
          <p className="mt-2 text-white">
            High-level reporting on feedback entries, filterable by date range. Metrics show entries created within the selected date range.<br />What other reports would you like to see, and why? Do you want SQL querying? Come ask in <Link href="https://vercel.slack.com/archives/C094FVBAVLH" target="_blank" className="text-green-400 font-bold hover:underline">#project-gtmfeedback-app</Link> on Slack.
          </p>
        </div>

        {/* Top Items Bar Chart */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <TopItemsBarChart />
          </div>
        </div>

        {/* Feedback Over Time Chart - Coming Soon */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Feedback Over Time</h3>
              <h4 className="text-sm text-gray-500 mb-4">
                Track feedback volume and revenue impact trends over time.
              </h4>
              <Tabs defaultValue="count" className="w-full">
                <div className="flex items-center justify-between mb-4 gap-4">
                  <TabsList className="bg-muted p-1 rounded-lg">
                    <TabsTrigger
                      value="count"
                      className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow data-[state=inactive]:text-muted-foreground data-[state=inactive]:opacity-70 font-semibold px-6 py-2 rounded-md transition"
                    >
                      By Request Count
                    </TabsTrigger>
                    <TabsTrigger
                      value="revenue"
                      className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow data-[state=inactive]:text-muted-foreground data-[state=inactive]:opacity-70 font-semibold px-6 py-2 rounded-md transition"
                    >
                      By Revenue Impact
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-3">
                    <Select disabled>
                      <SelectTrigger className="min-w-[200px] cursor-not-allowed">
                        <SelectValue placeholder={<span className="text-gray-400">All Product Areas</span>} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="cursor-not-allowed">All Product Areas</SelectItem>
                        <SelectItem value="placeholder1" className="cursor-not-allowed">Sample Product Area 1</SelectItem>
                        <SelectItem value="placeholder2" className="cursor-not-allowed">Sample Product Area 2</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select disabled>
                      <SelectTrigger className="min-w-[180px] cursor-not-allowed">
                        <SelectValue placeholder="Group By..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="cursor-not-allowed">GroupBy: None</SelectItem>
                        <SelectItem value="customer-type" className="cursor-not-allowed">New/Existing</SelectItem>
                        <SelectItem value="severity" className="cursor-not-allowed">Severity Level</SelectItem>
                      </SelectContent>
                    </Select>
                    <CalendarDatePicker
                      date={dateRange}
                      onDateSelect={setDateRange}
                      numberOfMonths={2}
                      className="min-w-[280px]"
                    />
                  </div>
                </div>
                <TabsContent value="count">
                  <div className="relative h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    {/* Coming Soon Overlay for Count Tab */}
                    <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-600 mb-2">Coming Soon</h3>
                        <p className="text-gray-500">Feedback trends over time</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="revenue">
                  <div className="relative h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    {/* Coming Soon Overlay for Revenue Tab */}
                    <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-600 mb-2">Coming Soon</h3>
                        <p className="text-gray-500">Feedback trends over time</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
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