import { Layout } from '@/components/layout/Layout'

export default function Loading() {
  return (
    <Layout>
      <div className="container mx-auto py-8 animate-pulse">
        {/* Title skeleton */}
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        
        {/* Description skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </Layout>
  )
} 