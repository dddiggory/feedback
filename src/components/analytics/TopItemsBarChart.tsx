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
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig

export function TopItemsBarChart() {
  const [topByEntryCount, setTopByEntryCount] = useState<ChartDataItem[]>([])
  const [topByRevenueImpact, setTopByRevenueImpact] = useState<ChartDataItem[]>([])
  const [productAreas, setProductAreas] = useState<ProductAreaOption[]>([])
  const [selectedProductArea, setSelectedProductArea] = useState<string | undefined>(undefined)

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

  // Fetch chart data, filtered by selected product area
  useEffect(() => {
    const supabase = createClient()
    async function fetchData() {
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
    fetchData()
  }, [selectedProductArea])

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
          <div>
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
                    dataKey="entry_count"
                    type="number"
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={true}
                    content={<ChartTooltipContent indicator="line" />}
                  />
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
                    dataKey="combined_arr_impact"
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
                    content={((props) => (
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
                    )) as any}
                  />
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