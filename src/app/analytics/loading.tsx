import { Layout } from '@/components/layout/Layout'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <Skeleton className="h-8 w-80 bg-gray-300/60 mb-2" />
          <Skeleton className="h-6 w-full bg-gray-300/40 mb-1" />
          <Skeleton className="h-6 w-96 bg-gray-300/40" />
        </div>

        {/* Top Items Bar Chart Skeleton */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <Skeleton className="h-64 w-full bg-gray-300 rounded-lg" />
          </div>
        </div>

        {/* Feedback Over Time Chart Skeleton */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48 bg-gray-300" />
                <Skeleton className="h-4 w-96 bg-gray-300" />
              </div>
              
              <div className="flex items-center justify-between mb-4 gap-4">
                <div className="flex space-x-2">
                  <Skeleton className="h-10 w-40 bg-gray-300 rounded-lg" />
                  <Skeleton className="h-10 w-48 bg-gray-300 rounded-lg" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-48 bg-gray-300 rounded" />
                  <Skeleton className="h-10 w-44 bg-gray-300 rounded" />
                  <Skeleton className="h-10 w-44 bg-gray-300 rounded" />
                </div>
              </div>
              
              <div className="relative h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-600 mb-2">Coming Soon</h3>
                    <p className="text-gray-500">Feedback trends over time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </Layout>
  )
} 