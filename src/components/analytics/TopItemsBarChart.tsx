/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

type TopItemsBarChartProps = object;

interface ProductAreaOption {
  label: string;
  value: string;
}

interface ChartDataItem {
  [key: string]: unknown;
  entry_count?: number;
  entry_count_label?: string;
  combined_arr_impact?: number;
  combined_arr_impact_label?: string;
  current_arr_sum?: number;
  open_opp_arr_sum?: number;
  // Customer type entry counts
  current_customer_entry_count?: number;
  new_opportunity_entry_count?: number;
  // Severity grouping fields
  low_count?: number;
  med_count?: number;
  high_count?: number;
  low_revenue?: number;
  med_revenue?: number;
  high_revenue?: number;
  slug?: string;
  title?: string;
}

const chartConfig = {
  entry_count: {
    label: "Request Count",
    color: "var(--chart-2)",
  },
  combined_arr_impact: {
    label: "Revenue Impact",
    color: "var(--chart-3)",
  },
  current_arr_sum: {
    label: "Current Customers",
    color: "var(--chart-1)",
  },
  open_opp_arr_sum: {
    label: "New Opportunities",
    color: "var(--chart-4)",
  },
  // Customer type entry counts
  current_customer_entry_count: {
    label: "Current Customers",
    color: "var(--chart-1)",
  },
  new_opportunity_entry_count: {
    label: "New Opportunities",
    color: "var(--chart-4)",
  },
  // Severity colors
  low_count: {
    label: "Low Severity",
    color: "var(--chart-2)",
  },
  med_count: {
    label: "Medium Severity", 
    color: "var(--chart-3)",
  },
  high_count: {
    label: "High Severity",
    color: "var(--chart-1)",
  },
  low_revenue: {
    label: "Low Severity",
    color: "var(--chart-2)",
  },
  med_revenue: {
    label: "Medium Severity",
    color: "var(--chart-3)",
  },
  high_revenue: {
    label: "High Severity", 
    color: "var(--chart-1)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig

export function TopItemsBarChart() {
  const [topByEntryCount, setTopByEntryCount] = useState<ChartDataItem[]>([])
  const [topByRevenueImpact, setTopByRevenueImpact] = useState<ChartDataItem[]>([])
  const [productAreas, setProductAreas] = useState<ProductAreaOption[]>([])
  const [selectedProductArea, setSelectedProductArea] = useState<string | undefined>(undefined)
  const [groupBy, setGroupBy] = useState<string>('none')

  // Fetch product areas for dropdown
  useEffect(() => {
    const supabase = createClient()
    async function fetchProductAreas() {
      const { data, error } = await supabase
        .from('product_areas')
        .select('name, slug')
        .order('name')
      if (error) {
        setProductAreas([])
        return
      }
      const options = (data || []).map((area: { name: string; slug: string }) => ({
        label: area.name,
        value: area.slug,
      }))
      setProductAreas(options)
    }
    fetchProductAreas()
  }, [])

  // Helper function to fetch severity data
  async function fetchSeverityData(supabase: any, productAreaFilter?: string) {
    // First get the top 10 feedback items by entry count or revenue
    let topItemsQuery = supabase
      .from('feedback_items_with_data')
      .select('id, title, slug, entry_count, combined_arr_impact')
      .order('entry_count', { ascending: false })
      .limit(10)
    
    let topRevenueQuery = supabase
      .from('feedback_items_with_data')
      .select('id, title, slug, entry_count, combined_arr_impact')
      .order('combined_arr_impact', { ascending: false })
      .limit(10)

    if (productAreaFilter && productAreaFilter !== 'all') {
      topItemsQuery = topItemsQuery.contains('product_area_slugs', [productAreaFilter])
      topRevenueQuery = topRevenueQuery.contains('product_area_slugs', [productAreaFilter])
    }

    const [{ data: topEntryItems }, { data: topRevenueItems }] = await Promise.all([
      topItemsQuery,
      topRevenueQuery
    ])

    // Helper function to aggregate severity data for a set of items
    async function aggregateSeverityData(items: any[]) {
      if (!items?.length) return []
      
      const itemIds = items.map(item => item.id)
      
      // Get all entries for these feedback items with severity data
      const { data: entriesData } = await supabase
        .from('entries_with_data')
        .select('feedback_item_id, severity, total_arr')
        .in('feedback_item_id', itemIds)

      // Aggregate by feedback item
      const aggregated = items.map(item => {
        const itemEntries = entriesData?.filter(entry => entry.feedback_item_id === item.id) || []
        
        const lowEntries = itemEntries.filter(e => e.severity === 'low')
        const medEntries = itemEntries.filter(e => e.severity === 'med')
        const highEntries = itemEntries.filter(e => e.severity === 'high')
        
        return {
          ...item,
          low_count: lowEntries.length,
          med_count: medEntries.length,
          high_count: highEntries.length,
          low_revenue: lowEntries.reduce((sum, e) => sum + (e.total_arr || 0), 0),
          med_revenue: medEntries.reduce((sum, e) => sum + (e.total_arr || 0), 0),
          high_revenue: highEntries.reduce((sum, e) => sum + (e.total_arr || 0), 0),
        }
      })

      return aggregated
    }

    const [entryCountData, revenueData] = await Promise.all([
      aggregateSeverityData(topEntryItems || []),
      aggregateSeverityData(topRevenueItems || [])
    ])

    return { entryCountData, revenueData }
  }

  // Helper function to fetch customer type data for entry counts
  async function fetchCustomerTypeData(supabase: any, productAreaFilter?: string) {
    // First get the top 10 feedback items by entry count
    let topItemsQuery = supabase
      .from('feedback_items_with_data')
      .select('id, title, slug, entry_count, combined_arr_impact, current_arr_sum, open_opp_arr_sum')
      .order('entry_count', { ascending: false })
      .limit(10)

    if (productAreaFilter && productAreaFilter !== 'all') {
      topItemsQuery = topItemsQuery.contains('product_area_slugs', [productAreaFilter])
    }

    const { data: topEntryItems } = await topItemsQuery

    // Helper function to aggregate customer type entry counts
    async function aggregateCustomerTypeEntryData(items: any[]) {
      if (!items?.length) return []
      
      const itemIds = items.map(item => item.id)
      
      // Get all entries for these feedback items with current_arr data
      const { data: entriesData } = await supabase
        .from('entries_with_data')
        .select('feedback_item_id, current_arr')
        .in('feedback_item_id', itemIds)

      // Aggregate by feedback item
      const aggregated = items.map(item => {
        const itemEntries = entriesData?.filter(entry => entry.feedback_item_id === item.id) || []
        
        const currentCustomerEntries = itemEntries.filter(e => e.current_arr && e.current_arr > 0)
        const newOpportunityEntries = itemEntries.filter(e => !e.current_arr || e.current_arr === 0)
        
        return {
          ...item,
          current_customer_entry_count: currentCustomerEntries.length,
          new_opportunity_entry_count: newOpportunityEntries.length,
        }
      })

      return aggregated
    }

    const entryCountData = await aggregateCustomerTypeEntryData(topEntryItems || [])

    return { entryCountData }
  }

  // Fetch chart data, filtered by selected product area
  useEffect(() => {
    const supabase = createClient()
    async function fetchData() {
      if (groupBy === 'severity') {
        // Fetch severity-grouped data
        const { entryCountData, revenueData } = await fetchSeverityData(supabase, selectedProductArea)
        setTopByEntryCount(entryCountData)
        setTopByRevenueImpact(revenueData)
      } else if (groupBy === 'customer-type') {
        // Fetch customer-type grouped data for entry counts
        const { entryCountData } = await fetchCustomerTypeData(supabase, selectedProductArea)
        setTopByEntryCount(entryCountData)
        
        // For revenue, use regular data but keep existing customer-type revenue logic
        let revenueQuery = supabase
          .from('feedback_items_with_data')
          .select('*')
          .order('combined_arr_impact', { ascending: false })
          .limit(10)
        if (selectedProductArea && selectedProductArea !== 'all') {
          revenueQuery = revenueQuery.contains('product_area_slugs', [selectedProductArea])
        }
        const { data: revenueData } = await revenueQuery
        setTopByRevenueImpact(
          (revenueData || []).map((item: ChartDataItem) => ({
            ...item,
            combined_arr_impact_label: typeof item.combined_arr_impact === 'number'
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  notation: 'compact',
                  maximumFractionDigits: 2,
                }).format(item.combined_arr_impact)
              : '',
          }))
        )
      } else {
        // Fetch regular data
        let entryQuery = supabase
          .from('feedback_items_with_data')
          .select('*')
          .order('entry_count', { ascending: false })
          .limit(10)
        let revenueQuery = supabase
          .from('feedback_items_with_data')
          .select('*')
          .order('combined_arr_impact', { ascending: false })
          .limit(10)
        if (selectedProductArea && selectedProductArea !== 'all') {
          entryQuery = entryQuery.contains('product_area_slugs', [selectedProductArea])
          revenueQuery = revenueQuery.contains('product_area_slugs', [selectedProductArea])
        }
        const { data: entryData } = await entryQuery
        setTopByEntryCount(
          (entryData || []).map((item: ChartDataItem) => ({
            ...item,
            entry_count_label: typeof item.entry_count === 'number'
              ? item.entry_count.toLocaleString('en-US', { maximumFractionDigits: 0 })
              : '',
          }))
        )
        const { data: revenueData } = await revenueQuery
        setTopByRevenueImpact(
          (revenueData || []).map((item: ChartDataItem) => ({
            ...item,
            combined_arr_impact_label: typeof item.combined_arr_impact === 'number'
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  notation: 'compact',
                  maximumFractionDigits: 2,
                }).format(item.combined_arr_impact)
              : '',
          }))
        )
      }
    }
    fetchData()
  }, [selectedProductArea, groupBy])

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Top Feedback Items</h3>
      <h4 className="text-sm text-gray-500 mb-4">
        Click any bar for full descriptions and customer-specific reports.
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
            <Select
              value={selectedProductArea}
              onValueChange={v => setSelectedProductArea(v === 'all' ? undefined : v)}
            >
              <SelectTrigger className="min-w-[200px] cursor-pointer">
                <SelectValue placeholder={<span className="text-black">All Product Areas</span>} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">All Product Areas</SelectItem>
                {productAreas.map((area) => (
                  <SelectItem key={area.value} value={area.value} className="cursor-pointer">
                    {area.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={groupBy}
              onValueChange={setGroupBy}
            >
              <SelectTrigger className="min-w-[180px] cursor-pointer">
                <SelectValue placeholder="Group By..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="cursor-pointer">GroupBy: None</SelectItem>
                <SelectItem value="customer-type" className="cursor-pointer">New/Existing</SelectItem>
                <SelectItem value="severity" className="cursor-pointer">Severity Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <TabsContent value="count">
          <Card>
            <CardHeader>
              <CardTitle>Open Requests by Count</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart
                  data={topByEntryCount}
                  layout="vertical"
                  margin={{ right: 40 }}
                  width={600}
                  height={400}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="title"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={200}
                  />
                  <XAxis
                    dataKey={groupBy === 'severity' || groupBy === 'customer-type' ? undefined : 'entry_count'}
                    type="number"
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={true}
                    content={groupBy === 'severity' ? (
                      ((props) => {
                        if (!props.active || !props.payload || props.payload.length === 0) return null;
                        
                        const data = props.payload[0]?.payload;
                        if (!data) return null;
                        
                        const lowCount = typeof data.low_count === 'number' ? data.low_count : 0;
                        const medCount = typeof data.med_count === 'number' ? data.med_count : 0;
                        const highCount = typeof data.high_count === 'number' ? data.high_count : 0;
                        const total = lowCount + medCount + highCount;
                        const lowPercentage = total > 0 ? Math.round((lowCount / total) * 100) : 0;
                        const medPercentage = total > 0 ? Math.round((medCount / total) * 100) : 0;
                        const highPercentage = total > 0 ? Math.round((highCount / total) * 100) : 0;
                        
                        return (
                          <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <div className="font-medium text-gray-900 mb-2">{data.title}</div>
                            <div className="text-lg font-semibold text-gray-900 mb-2">
                              {total} Total Requests
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-[var(--chart-5)]"></div>
                                <span>{lowCount} Low Severity ({lowPercentage}%)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-[var(--chart-2)]"></div>
                                <span>{medCount} Medium Severity ({medPercentage}%)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-[var(--chart-1)]"></div>
                                <span>{highCount} High Severity ({highPercentage}%)</span>
                              </div>
                            </div>
                          </div>
                        );
                      }) as any
                    ) : groupBy === 'customer-type' ? (
                      ((props) => {
                        if (!props.active || !props.payload || props.payload.length === 0) return null;
                        
                        const data = props.payload[0]?.payload;
                        if (!data) return null;
                        
                        const currentCount = typeof data.current_customer_entry_count === 'number' ? data.current_customer_entry_count : 0;
                        const newCount = typeof data.new_opportunity_entry_count === 'number' ? data.new_opportunity_entry_count : 0;
                        const total = currentCount + newCount;
                        const currentPercentage = total > 0 ? Math.round((currentCount / total) * 100) : 0;
                        const newPercentage = total > 0 ? Math.round((newCount / total) * 100) : 0;
                        
                        return (
                          <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <div className="font-medium text-gray-900 mb-2">{data.title}</div>
                            <div className="text-lg font-semibold text-gray-900 mb-2">
                              {total} Total Requests
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-[var(--chart-1)]"></div>
                                <span>{currentCount} Current Customers ({currentPercentage}%)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-[var(--chart-4)]"></div>
                                <span>{newCount} New Opportunities ({newPercentage}%)</span>
                              </div>
                            </div>
                          </div>
                        );
                      }) as any
                    ) : (
                      <ChartTooltipContent indicator="line" />
                    )}
                  />
{groupBy === 'severity' ? (
                    <>
                      <Bar
                        dataKey="low_count"
                        fill="var(--chart-5)"
                        radius={[0, 0, 0, 4]}
                        stackId="count"
                        cursor="pointer"
                        onClick={(_, index) => {
                          const slug = topByEntryCount[index]?.slug;
                          if (slug) window.open(`/feedback/${slug}`, '_blank');
                        }}
                      />
                      <Bar
                        dataKey="med_count"
                        fill="var(--chart-2)"
                        radius={[0, 0, 0, 0]}
                        stackId="count"
                        cursor="pointer"
                        onClick={(_, index) => {
                          const slug = topByEntryCount[index]?.slug;
                          if (slug) window.open(`/feedback/${slug}`, '_blank');
                        }}
                      />
                      <Bar
                        dataKey="high_count"
                        fill="var(--chart-1)"
                        radius={[0, 4, 4, 0]}
                        stackId="count"
                        cursor="pointer"
                        onClick={(_, index) => {
                          const slug = topByEntryCount[index]?.slug;
                          if (slug) window.open(`/feedback/${slug}`, '_blank');
                        }}
                      >
                        <LabelList
                          dataKey="entry_count"
                          position="right"
                          className="font-semibold text-xs"
                          formatter={value =>
                            typeof value === "number"
                              ? value.toLocaleString("en-US", { maximumFractionDigits: 0 })
                              : ""
                          }
                        />
                      </Bar>
                    </>
                  ) : groupBy === 'customer-type' ? (
                    <>
                      <Bar
                        dataKey="current_customer_entry_count"
                        fill="var(--chart-1)"
                        radius={[0, 0, 0, 4]}
                        stackId="count"
                        cursor="pointer"
                        onClick={(_, index) => {
                          const slug = topByEntryCount[index]?.slug;
                          if (slug) window.open(`/feedback/${slug}`, '_blank');
                        }}
                      />
                      <Bar
                        dataKey="new_opportunity_entry_count"
                        fill="var(--chart-4)"
                        radius={[0, 4, 4, 0]}
                        stackId="count"
                        cursor="pointer"
                        onClick={(_, index) => {
                          const slug = topByEntryCount[index]?.slug;
                          if (slug) window.open(`/feedback/${slug}`, '_blank');
                        }}
                      >
                        <LabelList
                          dataKey="entry_count"
                          position="right"
                          className="font-semibold text-xs"
                          formatter={value =>
                            typeof value === "number"
                              ? value.toLocaleString("en-US", { maximumFractionDigits: 0 })
                              : ""
                          }
                        />
                      </Bar>
                    </>
                  ) : (
                    <Bar
                      dataKey="entry_count"
                      fill="var(--chart-2)"
                      radius={4}
                      cursor="pointer"
                      onClick={(_, index) => {
                        const slug = topByEntryCount[index]?.slug;
                        if (slug) window.open(`/feedback/${slug}`, '_blank');
                      }}
                    >
                      <LabelList
                        dataKey="entry_count"
                        position="right"
                        className="font-semibold text-xs"
                        formatter={value =>
                          typeof value === "number"
                            ? value.toLocaleString("en-US", { maximumFractionDigits: 0 })
                            : ""
                        }
                      />
                    </Bar>
                  )}
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Open Requests by Revenue Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <BarChart
                  data={topByRevenueImpact}
                  layout="vertical"
                  margin={{ right: 40 }}
                  width={600}
                  height={400}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="title"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={200}
                  />
                  <XAxis
                    dataKey={groupBy === 'customer-type' || groupBy === 'severity' ? undefined : 'combined_arr_impact'}
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value =>
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        notation: "compact",
                        maximumFractionDigits: 2,
                      }).format(value)
                    }
                  />
                  <ChartTooltip
                    cursor={false}
                    content={groupBy === 'customer-type' ? (
                      ((props) => {
                        if (!props.active || !props.payload || props.payload.length === 0) return null;
                        
                        const data = props.payload[0]?.payload;
                        if (!data) return null;
                        
                        const currentArr = typeof data.current_arr_sum === 'number' ? data.current_arr_sum : 0;
                        const openOpp = typeof data.open_opp_arr_sum === 'number' ? data.open_opp_arr_sum : 0;
                        const total = currentArr + openOpp;
                        const currentPercentage = total > 0 ? Math.round((currentArr / total) * 100) : 0;
                        const openPercentage = total > 0 ? Math.round((openOpp / total) * 100) : 0;
                        
                        const formatCurrency = (value: number) => 
                          new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            notation: "compact",
                            maximumFractionDigits: 2,
                          }).format(value);
                        
                        return (
                          <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <div className="font-medium text-gray-900 mb-2">{data.title}</div>
                            <div className="text-lg font-semibold text-gray-900 mb-2">
                              {formatCurrency(total)} Total
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-[var(--chart-1)]"></div>
                                <span>{formatCurrency(currentArr)} Current Customers ({currentPercentage}%)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-[var(--chart-4)]"></div>
                                <span>{formatCurrency(openOpp)} New Opportunities ({openPercentage}%)</span>
                              </div>
                            </div>
                          </div>
                        );
                      }) as any
                    ) : groupBy === 'severity' ? (
                      ((props) => {
                        if (!props.active || !props.payload || props.payload.length === 0) return null;
                        
                        const data = props.payload[0]?.payload;
                        if (!data) return null;
                        
                        const lowRevenue = typeof data.low_revenue === 'number' ? data.low_revenue : 0;
                        const medRevenue = typeof data.med_revenue === 'number' ? data.med_revenue : 0;
                        const highRevenue = typeof data.high_revenue === 'number' ? data.high_revenue : 0;
                        const total = lowRevenue + medRevenue + highRevenue;
                        const lowPercentage = total > 0 ? Math.round((lowRevenue / total) * 100) : 0;
                        const medPercentage = total > 0 ? Math.round((medRevenue / total) * 100) : 0;
                        const highPercentage = total > 0 ? Math.round((highRevenue / total) * 100) : 0;
                        
                        const formatCurrency = (value: number) => 
                          new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            notation: "compact",
                            maximumFractionDigits: 2,
                          }).format(value);
                        
                        return (
                          <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <div className="font-medium text-gray-900 mb-2">{data.title}</div>
                            <div className="text-lg font-semibold text-gray-900 mb-2">
                              {formatCurrency(total)} Total
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-[var(--chart-5)]"></div>
                                <span>{formatCurrency(lowRevenue)} Low Severity ({lowPercentage}%)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-[var(--chart-2)]"></div>
                                <span>{formatCurrency(medRevenue)} Medium Severity ({medPercentage}%)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-sm bg-[var(--chart-1)]"></div>
                                <span>{formatCurrency(highRevenue)} High Severity ({highPercentage}%)</span>
                              </div>
                            </div>
                          </div>
                        );
                      }) as any
                    ) : (
                      ((props) => (
                        <ChartTooltipContent
                          {...props}
                          indicator="line"
                          className="px-6 py-4 bg-white"
                          labelClassName="grid grid-cols-3 outline outline-red-500"
                          labelKey="title"
                          formatter={(value: unknown) => (
                            <div>
                              <div className="text-xl">
                                {typeof value === 'number'
                                  ? new Intl.NumberFormat("en-US", {
                                      style: "currency",
                                      currency: "USD",
                                      notation: "compact",
                                      maximumFractionDigits: 2,
                                    }).format(value)
                                  : ''}
                              </div>
                            </div>
                          )}
                        />
                      )) as any
                    )}
                  />
                  {groupBy === 'customer-type' ? (
                    <>
                      <Bar
                        dataKey="current_arr_sum"
                        fill="var(--chart-1)"
                        radius={[0, 0, 0, 4]}
                        stackId="revenue"
                        cursor="pointer"
                        onClick={(_, index) => {
                          const slug = topByRevenueImpact[index]?.slug;
                          if (slug) window.open(`/feedback/${slug}`, '_blank');
                        }}
                      />
                      <Bar
                        dataKey="open_opp_arr_sum"
                        fill="var(--chart-4)"
                        radius={[0, 4, 4, 0]}
                        stackId="revenue"
                        cursor="pointer"
                        onClick={(_, index) => {
                          const slug = topByRevenueImpact[index]?.slug;
                          if (slug) window.open(`/feedback/${slug}`, '_blank');
                        }}
                      >
                        <LabelList
                          dataKey="combined_arr_impact"
                          position="right"
                          className="font-semibold text-xs"
                          formatter={value =>
                            typeof value === "number"
                              ? new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                  notation: "compact",
                                  maximumFractionDigits: 2,
                                }).format(value)
                              : ""
                          }
                        />
                      </Bar>
                    </>
                  ) : groupBy === 'severity' ? (
                    <>
                      <Bar
                        dataKey="low_revenue"
                        fill="var(--chart-5)"
                        radius={[0, 0, 0, 4]}
                        stackId="revenue"
                        cursor="pointer"
                        onClick={(_, index) => {
                          const slug = topByRevenueImpact[index]?.slug;
                          if (slug) window.open(`/feedback/${slug}`, '_blank');
                        }}
                      />
                      <Bar
                        dataKey="med_revenue"
                        fill="var(--chart-2)"
                        radius={[0, 0, 0, 0]}
                        stackId="revenue"
                        cursor="pointer"
                        onClick={(_, index) => {
                          const slug = topByRevenueImpact[index]?.slug;
                          if (slug) window.open(`/feedback/${slug}`, '_blank');
                        }}
                      />
                      <Bar
                        dataKey="high_revenue"
                        fill="var(--chart-1)"
                        radius={[0, 4, 4, 0]}
                        stackId="revenue"
                        cursor="pointer"
                        onClick={(_, index) => {
                          const slug = topByRevenueImpact[index]?.slug;
                          if (slug) window.open(`/feedback/${slug}`, '_blank');
                        }}
                      >
                        <LabelList
                          dataKey="combined_arr_impact"
                          position="right"
                          className="font-semibold text-xs"
                          formatter={value =>
                            typeof value === "number"
                              ? new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                  notation: "compact",
                                  maximumFractionDigits: 2,
                                }).format(value)
                              : ""
                          }
                        />
                      </Bar>
                    </>
                  ) : (
                    <Bar
                      dataKey="combined_arr_impact"
                      fill="var(--chart-3)"
                      radius={4}
                      cursor="pointer"
                      onClick={(_, index) => {
                        const slug = topByRevenueImpact[index]?.slug;
                        if (slug) window.open(`/feedback/${slug}`, '_blank');
                      }}
                    >
                      <LabelList
                        dataKey="combined_arr_impact"
                        position="right"
                        className="font-semibold text-xs"
                        formatter={value =>
                          typeof value === "number"
                            ? new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                                notation: "compact",
                                maximumFractionDigits: 2,
                              }).format(value)
                            : ""
                        }
                      />
                    </Bar>
                  )}
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

TopItemsBarChart.displayName = "TopItemsBarChart"; 