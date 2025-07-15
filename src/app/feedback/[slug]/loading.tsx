import { Layout } from '@/components/layout/Layout'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <Layout>
      <div className="container mx-auto pb-8 pt-1">
        {/* Grid Layout - 3 explicit rows */}
        <div className="grid grid-cols-[1fr_auto] gap-x-1 gap-y-4 mb-3">
          {/* Row 1: Product Areas */}
          <div className="flex flex-wrap gap-2 h-[2.5rem] overflow-hidden">
            {Array.from({ length: 3 }, (_, i) => `area-${i}`).map((key) => (
              <Skeleton key={key} className="h-[2.5rem] w-24 bg-gray-300 rounded-full" />
            ))}
          </div>
          
          {/* Row 1: Add Customer Button */}
          <div className="min-w-[30vh] w-fit">
            <Skeleton className="h-[3.5rem] w-full bg-gray-300 rounded-xl" />
          </div>

          {/* Row 2: Title + Description */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 bg-gray-300" />
            <Skeleton className="h-4 w-full bg-gray-300" />
            <Skeleton className="h-4 w-5/6 bg-gray-300" />
            <Skeleton className="h-4 w-2/3 bg-gray-300" />
          </div>
          
          {/* Row 2: Metrics */}
          <div className="min-w-[30vh] w-fit">
            <div className="grid grid-cols-1 gap-y-2 py-5 rounded-md bg-teal-200/50 text-slate-800 min-w-[30vh] w-fit h-full">
              <div className="text-left col-span-1 ml-4">
                <Skeleton className="h-8 w-12 bg-gray-300 mb-1" />
                <div className="text-sm">Customer Requests</div>
              </div>
              <div className="text-left col-span-1 ml-4">
                <Skeleton className="h-8 w-16 bg-gray-300 mb-1" />
                <div className="text-sm">Current Customer Demand</div>
              </div>
              <div className="text-left col-span-1 ml-4">
                <Skeleton className="h-8 w-16 bg-gray-300 mb-1" />
                <div className="text-sm">Open Opportunity Impact</div>
              </div>
            </div>
          </div>

          {/* Row 3: Comments */}
          <div className="pr-4 h-full max-h-[200px]">
            <div className="space-y-3">
              <Skeleton className="h-6 w-24 bg-gray-300" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-gray-300" />
                <Skeleton className="h-4 w-3/4 bg-gray-300" />
              </div>
              <Skeleton className="h-8 w-32 bg-gray-300 rounded" />
            </div>
          </div>
          
          {/* Row 3: Top Advocates */}
          <div className="p-4 bg-slate-50/90 rounded-lg border-l-4 border-teal-400 min-w-[30vh] w-fit max-w-[30vh] h-full max-h-[200px] flex flex-col">
            <h4 className="text-slate-800 font-semibold text-sm mb-3">Top Vercelian Advocates:</h4>
            <div className="flex flex-wrap gap-x-1 gap-y-1 overflow-y-auto items-start">
              {Array.from({ length: 5 }, (_, i) => `advocate-${i}`).map((key) => (
                <div key={key} className="flex items-center gap-1 px-2 py-1 bg-white rounded-full border border-gray-200 shadow-sm h-7 leading-none">
                  <Skeleton className="w-4 h-4 bg-gray-300 rounded-full" />
                  <Skeleton className="h-3 w-16 bg-gray-300" />
                  <Skeleton className="h-3 w-4 bg-gray-300 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="pt-2 prose">
          <h3 className="text-white text-shadow-lg text-2xl font-medium">Customer Feedback Entries</h3>
          <div className="w-full space-y-4 bg-white rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-64 bg-gray-300" />
                <Skeleton className="h-10 w-24 bg-gray-300" />
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-6 gap-4">
                  <Skeleton className="h-4 bg-gray-300" />
                  <Skeleton className="h-4 bg-gray-300" />
                  <Skeleton className="h-4 bg-gray-300" />
                  <Skeleton className="h-4 bg-gray-300" />
                  <Skeleton className="h-4 bg-gray-300" />
                  <Skeleton className="h-4 bg-gray-300" />
                </div>
                {Array.from({ length: 8 }, (_, i) => `entry-${i}`).map((key) => (
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
              
              <div className="flex items-center justify-end space-x-2">
                <Skeleton className="h-8 w-32 bg-gray-300" />
                <Skeleton className="h-8 w-16 bg-gray-300" />
                <Skeleton className="h-8 w-16 bg-gray-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 