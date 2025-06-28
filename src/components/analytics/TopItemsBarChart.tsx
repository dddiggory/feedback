"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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

interface TopItemsBarChartProps {}

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

export function TopItemsBarChart(props: TopItemsBarChartProps) {
  const [topByEntryCount, setTopByEntryCount] = useState<any[]>([])
  const [topByRevenueImpact, setTopByRevenueImpact] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    async function fetchData() {
      setLoading(true)
      const { data: entryData } = await supabase
        .from('feedback_items_with_data')
        .select('*')
        .order('entry_count', { ascending: false })
        .limit(10)
      setTopByEntryCount(entryData || [])

      const { data: revenueData } = await supabase
        .from('feedback_items_with_data')
        .select('*')
        .order('combined_arr_impact', { ascending: false })
        .limit(10)
      setTopByRevenueImpact(revenueData || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Top Items Bar Chart</h3>
      <Tabs defaultValue="count" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="count">Top Request Count</TabsTrigger>
          <TabsTrigger value="revenue">Top Revenue Impact</TabsTrigger>
        </TabsList>
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
                  margin={{ right: 16 }}
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
                  />
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
                  margin={{ right: 16 }}
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
                    content={
                      <ChartTooltipContent
                        indicator="line"
                        className="px-6 py-4 bg-white"
                        labelClassName="grid grid-cols-3 outline outline-red-500" // Add margin below label
                        labelKey="title"
                        formatter={(value, name, entry, index, payload) => (
                          <div>
                            <div className="">{payload?.title}</div>
                            <div className="text-xl">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                                notation: "compact",
                                maximumFractionDigits: 2,
                              }).format(value)}
                            </div>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar
                    dataKey="combined_arr_impact"
                    fill="var(--chart-3)"
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 