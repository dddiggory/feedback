import { Layout } from '@/components/layout/Layout'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-lg bg-gray-300" />
            <div>
              <Skeleton className="h-8 w-48 bg-gray-300 mb-2" />
              <Skeleton className="h-5 w-32 bg-gray-300" />
            </div>
          </div>
          <Skeleton className="h-10 w-44 bg-gray-300" />
        </div>

        {/* Description */}
        <div className="bg-white rounded-lg shadow p-6">
          <Skeleton className="h-4 w-full bg-gray-300 mb-2" />
          <Skeleton className="h-4 w-3/4 bg-gray-300" />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {['feedback-items', 'customer-entries', 'revenue-impact', 'avg-revenue'].map((key) => (
            <div key={key} className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Skeleton className="h-8 w-8 bg-gray-300" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate mb-1">
                        <Skeleton className="h-4 w-24 bg-gray-300" />
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        <Skeleton className="h-6 w-16 bg-gray-300" />
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback Items */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <Skeleton className="h-6 w-32 bg-gray-300 mb-6" />
            
            {/* Table skeleton */}
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 bg-white rounded-md w-1/3">
                  <Skeleton className="h-10 w-full bg-gray-300" />
                </div>
                <Skeleton className="h-10 w-24 bg-gray-300" />
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
                        Entries
                      </th>
                      <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                        Revenue Impact
                      </th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {Array.from({ length: 8 }, (_, i) => `item-${i}`).map((key) => (
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
                          <Skeleton className="h-6 w-16 bg-gray-300" />
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
              
              <div className="flex items-center justify-end space-x-2">
                <div className="flex-1 text-sm text-black">
                  <Skeleton className="h-4 w-40 bg-gray-300" />
                </div>
                <div className="space-x-2">
                  <Skeleton className="h-9 w-20 bg-gray-300" />
                  <Skeleton className="h-9 w-16 bg-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 