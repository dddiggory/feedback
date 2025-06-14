import { Layout } from '@/components/layout/Layout'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reports',
  description: 'View and analyze feedback reports',
}

export default function ReportsPage() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold">Reports</h1>
      </div>
    </Layout>
  )
} 