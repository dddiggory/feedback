import { Layout } from '@/components/layout/Layout'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'

export default function UserProfileLoading() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* User Profile Header Skeleton */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Avatar Skeleton */}
                <Skeleton className="w-20 h-20 rounded-full border-4 border-white shadow-lg bg-gray-300" />
                <div className="space-y-2">
                  {/* Name Skeleton */}
                  <Skeleton className="h-8 w-48 bg-gray-300/60" />
                  {/* Email Skeleton */}
                  <Skeleton className="h-6 w-64 bg-gray-300/40" />
                </div>
              </div>
              
              {/* User Stats Skeleton */}
              <div className="flex space-x-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 text-center shadow-sm">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    <Skeleton className="size-7 mx-auto bg-gray-300" />
                  </div>
                  <div className="text-xs text-gray-600">Total Entries</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-3 text-center shadow-sm">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    <Skeleton className="size-7 mx-auto bg-gray-300" />
                  </div>
                  <div className="text-xs text-gray-600">Feedback Items</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* User's Feedback Submissions Skeleton */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-medium text-gray-800">My Feedback Submissions</h2>
            <p className="text-gray-600 mt-1">
              All feedback entries you&apos;ve submitted
            </p>
          </div>
          
          <div className="p-4">
            {/* Feedback Entries Table Skeleton */}
            <div className="[&_[data-slot=skeleton]]:!bg-gray-300">
              <DataTableSkeleton
                columnCount={6}
                rowCount={8}
                cellWidths={['auto', '200px', '150px', '120px', '100px', '80px']}
                withPagination={true}
                withViewOptions={true}
                filterCount={3}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 