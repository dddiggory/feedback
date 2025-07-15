import { Layout } from '@/components/layout/Layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Loading() {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Browse All Feedback</h1>
          <p className="mt-2 text-white">
            Interactive tables for exploring both product feedback items and specific customer entries. Use the search filters to find exactly what you&apos;re looking for.
          </p>
        </div>

        <div className="w-full max-w-full min-w-0">
          <Tabs defaultValue="feedback-items" className="w-full min-w-0">
            <TabsList className="w-full gap-2 bg-gray-200 h-12 p-1 rounded-lg mb-2">
              <TabsTrigger 
                value="feedback-items" 
                className="text-sm font-medium cursor-pointer data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-800 transition-all duration-200"
              >
                Product Feedback Items
                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                  <Skeleton className="size-3 bg-gray-300" />
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="customer-entries" 
                className="text-sm font-medium cursor-pointer data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-800 transition-all duration-200"
              >
                Specific Customer Entries
                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                  <Skeleton className="size-3 bg-gray-300" />
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
                  {/* Product Feedback Items Table Skeleton */}
                  <div className="w-full space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 bg-white rounded-md w-1/3">
                        <Skeleton className="h-8 w-full bg-gray-200" />
                      </div>
                      <Skeleton className="h-8 w-24 bg-gray-200" />
                    </div>
                    
                    <div className="rounded-md border bg-white">
                      <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                              Title
                            </th>
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                              Description
                            </th>
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                              Status
                            </th>
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                              Product Areas
                            </th>
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                              Entries
                            </th>
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                              Revenue Impact
                            </th>
                          </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                          {Array.from({ length: 10 }, (_, i) => `feedback-item-${i}`).map((key) => (
                            <tr key={key} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
                                <Skeleton className="h-4 w-48 bg-gray-300" />
                              </td>
                              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0 whitespace-normal">
                                <div className="space-y-1">
                                  <Skeleton className="h-3 w-full bg-gray-300" />
                                  <Skeleton className="h-3 w-3/4 bg-gray-300" />
                                </div>
                              </td>
                              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
                                <Skeleton className="h-6 w-16 bg-gray-300 rounded-full" />
                              </td>
                              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
                                <div className="flex flex-wrap gap-1">
                                  <Skeleton className="h-5 w-16 bg-gray-300 rounded-full" />
                                  <Skeleton className="h-5 w-12 bg-gray-300 rounded-full" />
                                </div>
                              </td>
                              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
                                <div className="text-center">
                                  <Skeleton className="h-4 w-8 bg-gray-300 mx-auto" />
                                </div>
                              </td>
                              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
                                <div className="text-right">
                                  <Skeleton className="h-4 w-20 bg-gray-300 ml-auto" />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
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
                  {/* Customer Entries Table Skeleton */}
                  <div className="w-full space-y-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 bg-white rounded-md w-1/3">
                        <Skeleton className="h-8 w-full bg-gray-200" />
                      </div>
                      <Skeleton className="h-8 w-24 bg-gray-200" />
                    </div>
                    
                    <div className="rounded-md border bg-white">
                      <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                          <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                              Feedback Item
                            </th>
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                              Account
                            </th>
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                              Description
                            </th>
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                              Severity
                            </th>
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                              ARR Impact
                            </th>
                            <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                              Submitter
                            </th>
                          </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                          {Array.from({ length: 10 }, (_, i) => `customer-entry-${i}`).map((key) => (
                            <tr key={key} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
                                <Skeleton className="h-4 w-40 bg-gray-300" />
                              </td>
                              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
                                <div className="flex items-center gap-2">
                                  <Skeleton className="h-5 w-5 bg-gray-300 rounded-full" />
                                  <Skeleton className="h-4 w-32 bg-gray-300" />
                                </div>
                              </td>
                              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0 whitespace-normal">
                                <div className="space-y-1">
                                  <Skeleton className="h-3 w-full bg-gray-300" />
                                  <Skeleton className="h-3 w-2/3 bg-gray-300" />
                                </div>
                              </td>
                              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
                                <Skeleton className="h-6 w-16 bg-gray-300 rounded-full" />
                              </td>
                              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
                                <div className="text-right">
                                  <Skeleton className="h-4 w-20 bg-gray-300 ml-auto" />
                                </div>
                              </td>
                              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
                                <div className="flex items-center gap-2">
                                  <Skeleton className="h-6 w-6 bg-gray-300 rounded-full" />
                                  <Skeleton className="h-4 w-24 bg-gray-300" />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
} 