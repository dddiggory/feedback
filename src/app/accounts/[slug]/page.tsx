import { Layout } from '@/components/layout/Layout'

export default async function AccountPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="bg-white rounded-xl p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Account Details
          </h1>
          <div className="text-gray-600">
            <p>Account slug: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{slug}</span></p>
            <p className="mt-2 text-sm">This page is in development. It will show detailed account information and related feedback.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
} 