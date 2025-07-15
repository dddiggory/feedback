import { Layout } from '@/components/layout/Layout'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <Skeleton className="h-8 w-64 bg-gray-300/60 mb-2" />
          <Skeleton className="h-6 w-96 bg-gray-300/40" />
        </div>

        {/* Accounts Table Skeleton */}
        <div className="w-full space-y-4 bg-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64 bg-gray-300" />
            <Skeleton className="h-10 w-24 bg-gray-300" />
          </div>
          
          <div className="rounded-md border">
            <div className="p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-6 gap-4">
                  <Skeleton className="h-4 bg-gray-300" />
                  <Skeleton className="h-4 bg-gray-300" />
                  <Skeleton className="h-4 bg-gray-300" />
                  <Skeleton className="h-4 bg-gray-300" />
                  <Skeleton className="h-4 bg-gray-300" />
                  <Skeleton className="h-4 bg-gray-300" />
                </div>
                {Array.from({ length: 8 }, (_, i) => `row-${i}`).map((key) => (
                  <div key={key} className="grid grid-cols-6 gap-4">
                    <Skeleton className="h-4 bg-gray-300" />
                    <Skeleton className="h-4 bg-gray-300" />
                    <Skeleton className="h-4 bg-gray-300" />
                    <Skeleton className="h-4 bg-gray-300" />
                    <Skeleton className="h-4 bg-gray-300" />
                    <Skeleton className="h-4 bg-gray-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-2">
            <Skeleton className="h-8 w-16 bg-gray-300" />
            <Skeleton className="h-8 w-16 bg-gray-300" />
          </div>
        </div>
      </div>
    </Layout>
  )
} 