import { Layout } from '@/components/layout/Layout'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
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
                    Product Area
                  </th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Description
                  </th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Open Items
                  </th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Shipped Items
                  </th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Customer Entries
                  </th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Revenue Impact
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {Array.from({ length: 12 }, (_, i) => `area-${i}`).map((key) => (
                  <tr key={key} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-8 w-8">
                          <Skeleton className="h-8 w-8 rounded-md bg-gray-300" />
                        </div>
                        <Skeleton className="h-4 w-32 bg-gray-300" />
                      </div>
                    </td>
                    <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0 whitespace-normal">
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-full bg-gray-300" />
                        <Skeleton className="h-3 w-3/4 bg-gray-300" />
                        <Skeleton className="h-3 w-1/2 bg-gray-300" />
                      </div>
                    </td>
                    <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
                      <div className="text-center">
                        <Skeleton className="h-4 w-8 bg-gray-300 mx-auto" />
                      </div>
                    </td>
                    <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
                      <div className="text-center">
                        <Skeleton className="h-4 w-8 bg-gray-300 mx-auto" />
                      </div>
                    </td>
                    <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
                      <div className="text-center">
                        <Skeleton className="h-4 w-12 bg-gray-300 mx-auto" />
                      </div>
                    </td>
                    <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0">
                      <div className="text-right">
                        <Skeleton className="h-4 w-16 bg-gray-300 ml-auto" />
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
    </Layout>
  )
} 