import { Layout } from '@/components/layout/Layout'
import { AccountDetailContent } from '@/components/accounts/AccountDetailContent'

export default async function AccountPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <Layout>
      <AccountDetailContent slug={slug} />
    </Layout>
  )
} 